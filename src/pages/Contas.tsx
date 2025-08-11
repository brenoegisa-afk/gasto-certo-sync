import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Conta {
  id: string;
  nome: string;
  tipo: string;
  saldo_inicial: number;
  saldo_atual: number;
  limite?: number;
  moeda: string;
  compartilhada: boolean;
}

interface ContaForm {
  nome: string;
  tipo: 'corrente' | 'poupanca' | 'carteira' | 'externa';
  saldo_inicial: number;
  limite?: number;
  moeda: string;
  compartilhada: boolean;
}

export default function Contas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<Conta | null>(null);
  const [formData, setFormData] = useState<ContaForm>({
    nome: '',
    tipo: 'corrente' as const,
    saldo_inicial: 0,
    limite: undefined,
    moeda: 'BRL',
    compartilhada: false
  });

  useEffect(() => {
    if (user) {
      fetchContas();
    }
  }, [user]);

  const fetchContas = async () => {
    try {
      const { data, error } = await supabase
        .from('contas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar contas',
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
        saldo_atual: formData.saldo_inicial
      };

      if (editingConta) {
        const { error } = await supabase
          .from('contas')
          .update(dataToSend)
          .eq('id', editingConta.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Conta atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('contas')
          .insert([dataToSend]);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Conta criada com sucesso!' });
      }

      setDialogOpen(false);
      setEditingConta(null);
      setFormData({
        nome: '',
        tipo: 'corrente',
        saldo_inicial: 0,
        limite: undefined,
        moeda: 'BRL',
        compartilhada: false
      });
      fetchContas();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar conta',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (conta: Conta) => {
    setEditingConta(conta);
    setFormData({
      nome: conta.nome,
      tipo: conta.tipo as 'corrente' | 'poupanca' | 'carteira' | 'externa',
      saldo_inicial: conta.saldo_inicial,
      limite: conta.limite,
      moeda: conta.moeda,
      compartilhada: conta.compartilhada
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;

    try {
      const { error } = await supabase
        .from('contas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Conta excluída com sucesso!' });
      fetchContas();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir conta',
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

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contas</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingConta(null);
              setFormData({
                nome: '',
                tipo: 'corrente',
                saldo_inicial: 0,
                limite: undefined,
                moeda: 'BRL',
                compartilhada: false
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingConta ? 'Editar Conta' : 'Nova Conta'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value as 'corrente' | 'poupanca' | 'carteira' | 'externa'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Poupança</SelectItem>
                    <SelectItem value="carteira">Carteira</SelectItem>
                    <SelectItem value="investimento">Investimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="saldo_inicial">Saldo Inicial</Label>
                <Input
                  id="saldo_inicial"
                  type="number"
                  step="0.01"
                  value={formData.saldo_inicial}
                  onChange={(e) => setFormData({...formData, saldo_inicial: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="limite">Limite (opcional)</Label>
                <Input
                  id="limite"
                  type="number"
                  step="0.01"
                  value={formData.limite || ''}
                  onChange={(e) => setFormData({...formData, limite: parseFloat(e.target.value) || undefined})}
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingConta ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contas.map((conta) => (
          <Card key={conta.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{conta.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">{conta.tipo}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(conta)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(conta.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Atual</p>
                  <p className="text-2xl font-bold">{formatCurrency(conta.saldo_atual)}</p>
                </div>
                {conta.limite && (
                  <div>
                    <p className="text-sm text-muted-foreground">Limite</p>
                    <p className="text-sm">{formatCurrency(conta.limite)}</p>
                  </div>
                )}
                {conta.compartilhada && (
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    Compartilhada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contas.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nenhuma conta cadastrada ainda.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Nova Conta" para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}