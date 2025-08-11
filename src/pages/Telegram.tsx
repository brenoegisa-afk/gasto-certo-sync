import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Bot, Plus, Edit, Trash2, MessageSquare } from 'lucide-react';

interface TelegramConfig {
  id: string;
  telegram_token: string;
  telegram_chat_id?: string;
  bot_username?: string;
  ativo: boolean;
}

interface TelegramForm {
  telegram_token: string;
  telegram_chat_id: string;
  bot_username: string;
  ativo: boolean;
}

export default function Telegram() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<TelegramConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TelegramForm>({
    telegram_token: '',
    telegram_chat_id: '',
    bot_username: '',
    ativo: true
  });

  useEffect(() => {
    if (user) {
      fetchConfig();
    }
  }, [user]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      setConfig(data);
      if (data) {
        setFormData({
          telegram_token: data.telegram_token,
          telegram_chat_id: data.telegram_chat_id || '',
          bot_username: data.bot_username || '',
          ativo: data.ativo
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configuração do Telegram',
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
        telegram_chat_id: formData.telegram_chat_id || null,
        bot_username: formData.bot_username || null
      };

      if (config) {
        const { error } = await supabase
          .from('telegram_config')
          .update(dataToSend)
          .eq('id', config.id);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Configuração atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('telegram_config')
          .insert([dataToSend]);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Configuração criada com sucesso!' });
      }

      setDialogOpen(false);
      fetchConfig();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!config || !confirm('Tem certeza que deseja excluir a configuração do Telegram?')) return;

    try {
      const { error } = await supabase
        .from('telegram_config')
        .delete()
        .eq('id', config.id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Configuração excluída com sucesso!' });
      setConfig(null);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir configuração',
        variant: 'destructive'
      });
    }
  };

  const testConnection = async () => {
    if (!formData.telegram_token) {
      toast({
        title: 'Erro',
        description: 'Token do bot é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Test bot token by getting bot info
      const response = await fetch(`https://api.telegram.org/bot${formData.telegram_token}/getMe`);
      const data = await response.json();

      if (data.ok) {
        setFormData(prev => ({ ...prev, bot_username: data.result.username }));
        toast({
          title: 'Sucesso',
          description: `Bot conectado: @${data.result.username}`
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Token inválido',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao testar conexão',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Integração com Telegram</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              if (config) {
                setFormData({
                  telegram_token: config.telegram_token,
                  telegram_chat_id: config.telegram_chat_id || '',
                  bot_username: config.bot_username || '',
                  ativo: config.ativo
                });
              }
            }}>
              {config ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Configuração
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Configurar Bot
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {config ? 'Editar Configuração' : 'Configurar Bot do Telegram'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="telegram_token">Token do Bot</Label>
                <Input
                  id="telegram_token"
                  value={formData.telegram_token}
                  onChange={(e) => setFormData({...formData, telegram_token: e.target.value})}
                  required
                  placeholder="123456789:ABCDEF..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Obtenha o token com @BotFather no Telegram
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={testConnection} className="flex-1">
                  Testar Conexão
                </Button>
              </div>

              {formData.bot_username && (
                <div>
                  <Label htmlFor="bot_username">Username do Bot</Label>
                  <Input
                    id="bot_username"
                    value={formData.bot_username}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="telegram_chat_id">Chat ID (opcional)</Label>
                <Input
                  id="telegram_chat_id"
                  value={formData.telegram_chat_id}
                  onChange={(e) => setFormData({...formData, telegram_chat_id: e.target.value})}
                  placeholder="123456789"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Envie uma mensagem para o bot e use /start para obter o ID
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
                />
                <Label htmlFor="ativo">Bot Ativo</Label>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {config ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {config ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${config.ativo ? 'bg-green-500' : 'bg-gray-500'} flex items-center justify-center`}>
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Bot Configurado</CardTitle>
                  {config.bot_username && (
                    <p className="text-muted-foreground">@{config.bot_username}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className={`font-medium ${config.ativo ? 'text-green-600' : 'text-gray-600'}`}>
                    {config.ativo ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                {config.telegram_chat_id && (
                  <div>
                    <p className="text-muted-foreground">Chat ID</p>
                    <p className="font-medium">{config.telegram_chat_id}</p>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comandos Disponíveis
                </h3>
                <div className="space-y-1 text-sm">
                  <p><code>/add [valor] [descrição]</code> - Adicionar despesa</p>
                  <p><code>/saldo</code> - Ver saldo das contas</p>
                  <p><code>/relatorio</code> - Relatório mensal</p>
                  <p><code>/help</code> - Ajuda</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum bot configurado</h3>
            <p className="text-muted-foreground mb-4">
              Configure um bot do Telegram para registrar transações rapidamente
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Converse com @BotFather no Telegram</p>
              <p>2. Digite /newbot e siga as instruções</p>
              <p>3. Copie o token e configure aqui</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}