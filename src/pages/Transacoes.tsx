import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';

interface Transacao {
  id: string;
  tipo: string;
  valor: number;
  descricao: string;
  data_transacao: string;
  status: string;
  contas: { nome: string } | null;
  cartoes: { nome: string } | null;
  categorias: { nome: string } | null;
}

interface Conta {
  id: string;
  nome: string;
}

interface Cartao {
  id: string;
  nome: string;
}

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
}

interface TransacaoForm {
  tipo: 'despesa' | 'receita' | 'transferencia';
  valor: number;
  descricao: string;
  data_transacao: string;
  conta_id?: string;
  conta_destino_id?: string;
  cartao_id?: string;
  categoria_id?: string;
  parcelas_total?: number;
}

export default function Transacoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TransacaoForm>({
    tipo: 'despesa' as const,
    valor: 0,
    descricao: '',
    data_transacao: new Date().toISOString().split('T')[0],
    conta_id: '',
    categoria_id: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [transacoesRes, contasRes, cartoesRes, categoriasRes] = await Promise.all([
        supabase
          .from('transacoes')
          .select(`
            *,
            contas:conta_id(nome),
            cartoes:cartao_id(nome),
            categorias:categoria_id(nome)
          `)
          .order('data_transacao', { ascending: false })
          .limit(50),
        supabase.from('contas').select('id, nome').eq('user_id', user!.id),
        supabase.from('cartoes').select('id, nome').eq('user_id', user!.id).eq('ativo', true),
        supabase.from('categorias').select('id, nome, tipo').eq('user_id', user!.id)
      ]);

      if (transacoesRes.error) throw transacoesRes.error;
      if (contasRes.error) throw contasRes.error;
      if (cartoesRes.error) throw cartoesRes.error;
      if (categoriasRes.error) throw categoriasRes.error;

      setTransacoes((transacoesRes.data as any) || []);
      setContas(contasRes.data || []);
      setCartoes(cartoesRes.data || []);
      setCategorias(categoriasRes.data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const dataToSend = {
        ...formData,
        user_id: user.id,
        conta_id: formData.conta_id || null,
        conta_destino_id: formData.conta_destino_id || null,
        cartao_id: formData.cartao_id || null,
        categoria_id: formData.categoria_id || null,
        parcelas_total: formData.parcelas_total || null
      };

      if (formData.tipo === 'transferencia' && formData.conta_id && formData.conta_destino_id) {
        // Use the transfer function
        const { error } = await supabase.rpc('execute_transfer', {
          p_user_id: user.id,
          p_from_conta: formData.conta_id,
          p_to_conta: formData.conta_destino_id,
          p_valor: formData.valor,
          p_descricao: formData.descricao
        });

        if (error) throw error;
      } else {
        // Regular transaction
        if (formData.parcelas_total && formData.parcelas_total > 1) {
          // Create installments
          const parcelas = [];
          const referencia_id = crypto.randomUUID();
          
          for (let i = 1; i <= formData.parcelas_total; i++) {
            const dataTransacao = new Date(formData.data_transacao);
            dataTransacao.setMonth(dataTransacao.getMonth() + (i - 1));
            
            parcelas.push({
              ...dataToSend,
              parcela_num: i,
              referencia_parcela_id: referencia_id,
              data_transacao: dataTransacao.toISOString().split('T')[0],
              descricao: `${formData.descricao} (${i}/${formData.parcelas_total})`
            });
          }

          const { error } = await supabase.from('transacoes').insert(parcelas);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('transacoes').insert([dataToSend]);
          if (error) throw error;
        }
      }

      toast({ title: 'Sucesso', description: 'Transação criada com sucesso!' });
      setDialogOpen(false);
      setFormData({
        tipo: 'despesa',
        valor: 0,
        descricao: '',
        data_transacao: new Date().toISOString().split('T')[0],
        conta_id: '',
        categoria_id: ''
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar transação',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'receita': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'despesa': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transferencia': return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
      default: return null;
    }
  };

  const filteredCategorias = categorias.filter(cat => cat.tipo === formData.tipo || formData.tipo === 'transferencia');

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transações</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData({
                tipo: 'despesa',
                valor: 0,
                descricao: '',
                data_transacao: new Date().toISOString().split('T')[0],
                conta_id: '',
                categoria_id: ''
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value as 'despesa' | 'receita' | 'transferencia'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  required
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_transacao">Data</Label>
                  <Input
                    id="data_transacao"
                    type="date"
                    value={formData.data_transacao}
                    onChange={(e) => setFormData({...formData, data_transacao: e.target.value})}
                    required
                  />
                </div>
              </div>

              {formData.tipo !== 'transferencia' && (
                <>
                  <div>
                    <Label htmlFor="conta_id">Conta</Label>
                    <Select value={formData.conta_id} onValueChange={(value) => setFormData({...formData, conta_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {contas.map((conta) => (
                          <SelectItem key={conta.id} value={conta.id}>{conta.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cartao_id">Cartão (opcional)</Label>
                    <Select value={formData.cartao_id || ''} onValueChange={(value) => setFormData({...formData, cartao_id: value || undefined})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cartão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {cartoes.map((cartao) => (
                          <SelectItem key={cartao.id} value={cartao.id}>{cartao.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.cartao_id && (
                    <div>
                      <Label htmlFor="parcelas_total">Parcelas</Label>
                      <Input
                        id="parcelas_total"
                        type="number"
                        min="1"
                        max="24"
                        value={formData.parcelas_total || 1}
                        onChange={(e) => setFormData({...formData, parcelas_total: parseInt(e.target.value) || 1})}
                      />
                    </div>
                  )}
                </>
              )}

              {formData.tipo === 'transferencia' && (
                <>
                  <div>
                    <Label htmlFor="conta_origem">Conta Origem</Label>
                    <Select value={formData.conta_id} onValueChange={(value) => setFormData({...formData, conta_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione conta origem" />
                      </SelectTrigger>
                      <SelectContent>
                        {contas.map((conta) => (
                          <SelectItem key={conta.id} value={conta.id}>{conta.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="conta_destino">Conta Destino</Label>
                    <Select value={formData.conta_destino_id} onValueChange={(value) => setFormData({...formData, conta_destino_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione conta destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {contas.filter(c => c.id !== formData.conta_id).map((conta) => (
                          <SelectItem key={conta.id} value={conta.id}>{conta.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {formData.tipo !== 'transferencia' && (
                <div>
                  <Label htmlFor="categoria_id">Categoria</Label>
                  <Select value={formData.categoria_id} onValueChange={(value) => setFormData({...formData, categoria_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>{categoria.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {transacoes.map((transacao) => (
          <Card key={transacao.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(transacao.tipo)}
                  <div>
                    <p className="font-medium">{transacao.descricao}</p>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(transacao.data_transacao)}</span>
                      {transacao.contas && <span>• {transacao.contas.nome}</span>}
                      {transacao.cartoes && <span>• {transacao.cartoes.nome}</span>}
                      {transacao.categorias && <span>• {transacao.categorias.nome}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transacao.tipo === 'receita' ? 'text-green-600' : 
                    transacao.tipo === 'despesa' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {transacao.tipo === 'receita' ? '+' : transacao.tipo === 'despesa' ? '-' : ''}
                    {formatCurrency(transacao.valor)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">{transacao.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transacoes.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Nova Transação" para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}