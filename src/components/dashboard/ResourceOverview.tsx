import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Plus,
  Database,
  Bot,
  CreditCard,
  Wallet,
  ArrowLeftRight,
  Users,
  BarChart3,
  Settings,
  Shield,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResourceItem {
  name: string;
  status: 'completed' | 'partial' | 'missing';
  description: string;
  icon: React.ComponentType<any>;
  route?: string;
  details?: string[];
}

const resources: ResourceItem[] = [
  {
    name: 'Gestão de Contas',
    status: 'completed',
    description: 'CRUD completo para contas bancárias',
    icon: Wallet,
    route: '/contas',
    details: ['Criar conta', 'Editar saldo', 'Ativar/Desativar', 'Listagem completa']
  },
  {
    name: 'Gestão de Cartões',
    status: 'completed',
    description: 'CRUD completo para cartões de crédito',
    icon: CreditCard,
    route: '/cartoes',
    details: ['Adicionar cartão', 'Definir limite', 'Gerenciar status', 'Controle de fechamento']
  },
  {
    name: 'Transações',
    status: 'completed',
    description: 'Sistema completo de transações financeiras',
    icon: ArrowLeftRight,
    route: '/transacoes',
    details: ['Receitas', 'Despesas', 'Transferências', 'Parcelamentos', 'Categorização']
  },
  {
    name: 'Dashboard Financeiro',
    status: 'completed',
    description: 'Visão geral das finanças pessoais',
    icon: BarChart3,
    route: '/',
    details: ['Saldo total', 'Resumo mensal', 'Transações recentes', 'Ações rápidas']
  },
  {
    name: 'Bot Telegram',
    status: 'completed',
    description: 'Integração com Telegram para transações via chat',
    icon: Bot,
    route: '/telegram',
    details: ['Webhook configurado', 'Processamento de linguagem natural', 'Integração por usuário']
  },
  {
    name: 'Sistema de Autenticação',
    status: 'completed',
    description: 'Login seguro com Supabase Auth',
    icon: Shield,
    route: '/auth',
    details: ['Login/Logout', 'Proteção de rotas', 'Gestão de sessão']
  },
  {
    name: 'Banco de Dados',
    status: 'completed',
    description: 'Estrutura completa no Supabase',
    icon: Database,
    details: ['Tabelas: users, contas, cartoes, transacoes, categorias', 'RLS configurado', 'Policies de segurança']
  },
  {
    name: 'Relatórios Avançados',
    status: 'missing',
    description: 'Relatórios detalhados e análises financeiras',
    icon: BarChart3,
    details: ['Gráficos de despesas por categoria', 'Relatórios mensais/anuais', 'Exportação PDF/CSV', 'Comparativos']
  },
  {
    name: 'Metas Financeiras',
    status: 'missing',
    description: 'Sistema de planejamento e metas',
    icon: Clock,
    details: ['Definir metas de economia', 'Acompanhar progresso', 'Alertas de metas', 'Histórico de conquistas']
  },
  {
    name: 'Categorias Personalizadas',
    status: 'partial',
    description: 'Gestão avançada de categorias',
    icon: Settings,
    details: ['CRUD de categorias', 'Ícones personalizados', 'Subcategorias', 'Orçamentos por categoria']
  },
  {
    name: 'Notificações',
    status: 'missing',
    description: 'Sistema de alertas e lembretes',
    icon: Bell,
    details: ['Lembretes de pagamento', 'Alertas de limite', 'Notificações push', 'Email/SMS']
  },
  {
    name: 'Gestão de Usuários',
    status: 'partial',
    description: 'Perfis e configurações de usuário',
    icon: Users,
    details: ['Perfil básico', 'Configurações de conta', 'Backup de dados', 'Compartilhamento familiar']
  }
];

export default function ResourceOverview() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success/10 text-success border-success/20">Completo</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-warning/10 text-warning border-warning/20">Parcial</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Pendente</Badge>;
    }
  };

  const completedCount = resources.filter(r => r.status === 'completed').length;
  const partialCount = resources.filter(r => r.status === 'partial').length;
  const missingCount = resources.filter(r => r.status === 'missing').length;

  return (
    <div className="space-y-8">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover shadow-card border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-xl">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-success">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Recursos Completos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover shadow-card border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-xl">
                <AlertCircle className="w-8 h-8 text-warning" />
              </div>
              <div>
                <p className="text-3xl font-bold text-warning">{partialCount}</p>
                <p className="text-sm text-muted-foreground">Recursos Parciais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover shadow-card border-muted">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted/50 rounded-xl">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold text-muted-foreground">{missingCount}</p>
                <p className="text-sm text-muted-foreground">Recursos Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            Recursos do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resources.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl border bg-gradient-to-br from-card to-muted/20 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{resource.name}</h3>
                        {getStatusBadge(resource.status)}
                      </div>
                    </div>
                    {getStatusIcon(resource.status)}
                  </div>

                  <p className="text-muted-foreground mb-4">{resource.description}</p>

                  {resource.details && (
                    <div className="space-y-2 mb-4">
                      {resource.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-muted-foreground">{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {resource.route && resource.status === 'completed' && (
                    <Button asChild variant="outline" size="sm" className="btn-hover">
                      <Link to={resource.route}>
                        Acessar
                        <Plus className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}

                  {resource.status === 'missing' && (
                    <Button variant="outline" size="sm" disabled className="opacity-50">
                      Em Desenvolvimento
                    </Button>
                  )}

                  {resource.status === 'partial' && resource.route && (
                    <Button asChild variant="outline" size="sm" className="btn-hover">
                      <Link to={resource.route}>
                        Ver Recursos
                        <Plus className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}