import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { makeUserAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';

export function AdminPanel() {
  const { user } = useAuth();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMakeAdmin = async () => {
    if (!userId.trim()) {
      toast.error('Por favor, insira um ID de usuário válido');
      return;
    }

    setLoading(true);
    try {
      await makeUserAdmin(userId);
      toast.success('Usuário promovido a administrador com sucesso!');
      setUserId('');
    } catch (error: any) {
      console.error('Error making user admin:', error);
      toast.error('Erro ao promover usuário: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeSelfAdmin = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      await makeUserAdmin(user.id);
      toast.success('Você agora é um administrador!');
      window.location.reload();
    } catch (error: any) {
      console.error('Error making self admin:', error);
      toast.error('Erro ao se tornar admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Painel de Administração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Self Admin */}
          <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-muted">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-sm mb-1">Tornar-se Administrador</h3>
                <p className="text-xs text-muted-foreground">
                  Clique para se tornar administrador do sistema
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  Seu ID: {user?.id?.slice(0, 8)}...
                </Badge>
              </div>
              <Button
                onClick={handleMakeSelfAdmin}
                disabled={loading}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Tornar-se Admin
              </Button>
            </div>
          </div>

          {/* Promote Other User */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="userId" className="text-sm font-medium">
                Promover Outro Usuário
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Insira o ID do usuário que deseja tornar administrador
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="userId"
                  type="text"
                  placeholder="ID do usuário (UUID)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleMakeAdmin}
                disabled={loading || !userId.trim()}
                size="sm"
                variant="outline"
              >
                <Shield className="w-4 h-4 mr-2" />
                Promover
              </Button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Atenção:</strong> Administradores têm acesso total ao sistema, incluindo dados de todos os usuários.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}