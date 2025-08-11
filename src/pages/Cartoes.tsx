import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';

interface Cartao {
  id: string;
  nome: string;
  bandeira: string;
  limite: number;
  dia_fechamento: number;
  dia_vencimento: number;
  fechamento_offset: number;
  ativo: boolean;
}

interface CartaoForm {
  nome: string;
  bandeira: string;
  limite: number;
  dia_fechamento: number;
  dia_vencimento: number;
  fechamento_offset: number;
  ativo: boolean;
}

export default function Cartoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCartao, setEditingCartao] = useState<Cartao | null>(null);
  const [formData, setFormData] = useState<CartaoForm>({
    nome: '',
    bandeira: 'visa',
    limite: 0,
    dia_fechamento: 25,
    dia_vencimento: 10,
    fechamento_offset: 0,
    ativo: true
  });

  useEffect(() => {
    if (user) {
      fetchCartoes();
    }
  }, [user]);

  const fetchCartoes = async () => {
    try {
      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCartoes(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar cartões',
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
        user_id: user.id
      };

      if (editingCartao) {
        const { error } = await supabase
          .from('cartoes')
          .update(dataToSend)
          .eq('id', editingCartao.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Cartão atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('cartoes')
          .insert([dataToSend]);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Cartão criado com sucesso!' });
      }

      setDialogOpen(false);
      setEditingCartao(null);
      setFormData({
        nome: '',
        bandeira: 'visa',
        limite: 0,
        dia_fechamento: 25,
        dia_vencimento: 10,
        fechamento_offset: 0,
        ativo: true
      });
      fetchCartoes();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar cartão',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (cartao: Cartao) => {
    setEditingCartao(cartao);
    setFormData({
      nome: cartao.nome,
      bandeira: cartao.bandeira,
      limite: cartao.limite,
      dia_fechamento: cartao.dia_fechamento,
      dia_vencimento: cartao.dia_vencimento,
      fechamento_offset: cartao.fechamento_offset,
      ativo: cartao.ativo
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cartão?')) return;

    try {
      const { error } = await supabase
        .from('cartoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Cartão excluído com sucesso!' });
      fetchCartoes();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir cartão',
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

  const getBandeiraColor = (bandeira: string) => {
    const colors: { [key: string]: string } = {
      visa: 'bg-blue-500',
      mastercard: 'bg-red-500',
      elo: 'bg-yellow-500',
      amex: 'bg-green-500',
      hipercard: 'bg-orange-500'
    };
    return colors[bandeira] || 'bg-gray-500';
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cartões</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCartao(null);
              setFormData({
                nome: '',
                bandeira: 'visa',
                limite: 0,
                dia_fechamento: 25,
                dia_vencimento: 10,
                fechamento_offset: 0,
                ativo: true
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCartao ? 'Editar Cartão' : 'Novo Cartão'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Cartão</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                  placeholder="Ex: Cartão Principal"
                />
              </div>

              <div>
                <Label htmlFor="bandeira">Bandeira</Label>
                <Select value={formData.bandeira} onValueChange={(value) => setFormData({...formData, bandeira: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="elo">Elo</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="hipercard">Hipercard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="limite">Limite</Label>
                <Input
                  id="limite"
                  type="number"
                  step="0.01"
                  value={formData.limite}
                  onChange={(e) => setFormData({...formData, limite: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dia_fechamento">Dia Fechamento</Label>
                  <Input
                    id="dia_fechamento"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dia_fechamento}
                    onChange={(e) => setFormData({...formData, dia_fechamento: parseInt(e.target.value) || 25})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dia_vencimento">Dia Vencimento</Label>
                  <Input
                    id="dia_vencimento"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dia_vencimento}
                    onChange={(e) => setFormData({...formData, dia_vencimento: parseInt(e.target.value) || 10})}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                />
                <Label htmlFor="ativo">Cartão Ativo</Label>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCartao ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cartoes.map((cartao) => (
          <Card key={cartao.id} className={`relative ${!cartao.ativo ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded ${getBandeiraColor(cartao.bandeira)} flex items-center justify-center`}>
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{cartao.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{cartao.bandeira}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(cartao)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cartao.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Limite</p>
                  <p className="text-xl font-bold">{formatCurrency(cartao.limite)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Fechamento</p>
                    <p className="font-medium">Dia {cartao.dia_fechamento}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vencimento</p>
                    <p className="font-medium">Dia {cartao.dia_vencimento}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    cartao.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {cartao.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cartoes.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nenhum cartão cadastrado ainda.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Novo Cartão" para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}