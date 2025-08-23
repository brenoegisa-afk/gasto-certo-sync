import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FinancialCard } from '@/components/ui/financial-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  BarChart3,
  Settings,
  Grid3X3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import ResourceOverview from '@/components/dashboard/ResourceOverview';

interface DashboardData {
  totalContas: number;
  saldoTotal: number;
  totalCartoes: number;
  transacoesRecentes: any[];
  despesasMes: number;
  receitasMes: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalContas: 0,
    saldoTotal: 0,
    totalCartoes: 0,
    transacoesRecentes: [],
    despesasMes: 0,
    receitasMes: 0
  });
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch contas
      const { data: contas, error: contasError } = await supabase
        .from('contas')
        .select('*')
        .eq('user_id', user?.id);

      if (contasError) throw contasError;

      // Fetch cartões
      const { data: cartoes, error: cartoesError } = await supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', user?.id)
        .eq('ativo', true);

      if (cartoesError) throw cartoesError;

      // Fetch recent transactions
      const { data: transacoes, error: transacoesError } = await supabase
        .from('transacoes')
        .select(`
          *,
          categorias(nome, icone, cor),
          contas(nome),
          cartoes(nome)
        `)
        .eq('user_id', user?.id)
        .order('data_registro', { ascending: false })
        .limit(5);

      if (transacoesError) throw transacoesError;

      // Calculate totals
      const saldoTotal = contas?.reduce((acc, conta) => acc + parseFloat(conta.saldo_atual.toString()), 0) || 0;
      
      // Calculate current month expenses and income
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const despesasMes = transacoes?.filter(t => 
        t.tipo === 'despesa' && 
        t.data_transacao.startsWith(currentMonth)
      ).reduce((acc, t) => acc + parseFloat(t.valor.toString()), 0) || 0;
      
      const receitasMes = transacoes?.filter(t => 
        t.tipo === 'receita' && 
        t.data_transacao.startsWith(currentMonth)
      ).reduce((acc, t) => acc + parseFloat(t.valor.toString()), 0) || 0;

      setData({
        totalContas: contas?.length || 0,
        saldoTotal,
        totalCartoes: cartoes?.length || 0,
        transacoesRecentes: transacoes || [],
        despesasMes,
        receitasMes
      });
    } catch (error: any) {
      toast.error('Erro ao carregar dados do dashboard');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTransactionIcon = (tipo: string) => {
    switch (tipo) {
      case 'receita':
        return <ArrowUpRight className="w-4 h-4 text-success" />;
      case 'despesa':
        return <ArrowDownRight className="w-4 h-4 text-destructive" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto p-4 lg:p-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold gradient-text">
              Gasto Certo 💰
            </h1>
            <p className="text-lg text-muted-foreground">
              Sistema completo de gestão financeira pessoal
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-gradient-primary hover:opacity-90 btn-hover shadow-finance">
              <Link to="/transacoes">
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Link>
            </Button>
            <Button asChild variant="outline" className="btn-hover">
              <Link to="/telegram">
                <TrendingUp className="w-4 h-4 mr-2" />
                Bot Telegram
              </Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:grid-cols-2 bg-card shadow-card">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Recursos do Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Balance */}
          <FinancialCard variant="gradient" className="card-hover">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-white/90 text-sm font-medium">Saldo Total</p>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold text-white">
                      {showBalance ? formatCurrency(data.saldoTotal) : '••••••'}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-white hover:bg-white/20 p-2 h-auto rounded-full transition-fast"
                    >
                      {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </FinancialCard>

          {/* Accounts */}
          <FinancialCard className="card-hover">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">Contas Ativas</p>
                  <p className="text-3xl font-bold">{data.totalContas}</p>
                  <Button asChild variant="ghost" size="sm" className="text-xs p-0 h-auto text-primary hover:no-underline">
                    <Link to="/contas">Gerenciar →</Link>
                  </Button>
                </div>
                <div className="p-3 bg-finance-blue/10 rounded-2xl">
                  <Wallet className="w-8 h-8 text-finance-blue" />
                </div>
              </div>
            </CardContent>
          </FinancialCard>

          {/* Credit Cards */}
          <FinancialCard className="card-hover">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm font-medium">Cartões</p>
                  <p className="text-3xl font-bold">{data.totalCartoes}</p>
                  <Button asChild variant="ghost" size="sm" className="text-xs p-0 h-auto text-primary hover:no-underline">
                    <Link to="/cartoes">Gerenciar →</Link>
                  </Button>
                </div>
                <div className="p-3 bg-finance-purple/10 rounded-2xl">
                  <CreditCard className="w-8 h-8 text-finance-purple" />
                </div>
              </div>
            </CardContent>
          </FinancialCard>

          {/* Monthly Balance */}
          <FinancialCard 
            variant={data.receitasMes - data.despesasMes >= 0 ? "success" : "danger"}
            className="card-hover"
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-white/90 text-sm font-medium">Balanço do Mês</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(data.receitasMes - data.despesasMes)}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl">
                  {data.receitasMes - data.despesasMes >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-white" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </FinancialCard>
      </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income vs Expenses */}
          <Card className="card-hover shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                Resumo do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-success/10 to-success/5 rounded-2xl border border-success/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success/20 rounded-xl">
                    <ArrowUpRight className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <span className="font-semibold text-lg">Receitas</span>
                    <p className="text-sm text-muted-foreground">Este mês</p>
                  </div>
                </div>
                <span className="font-bold text-xl text-success">{formatCurrency(data.receitasMes)}</span>
              </div>
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-destructive/10 to-destructive/5 rounded-2xl border border-destructive/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-destructive/20 rounded-xl">
                    <ArrowDownRight className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <span className="font-semibold text-lg">Despesas</span>
                    <p className="text-sm text-muted-foreground">Este mês</p>
                  </div>
                </div>
                <span className="font-bold text-xl text-destructive">{formatCurrency(data.despesasMes)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="card-hover shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                Transações Recentes
              </CardTitle>
              <Button variant="outline" size="sm" asChild className="btn-hover">
                <Link to="/transacoes">
                  Ver Todas
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.transacoesRecentes.length > 0 ? (
                <div className="space-y-4">
                  {data.transacoesRecentes.map((transacao) => (
                    <div
                      key={transacao.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/20 rounded-xl border border-muted hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-background rounded-lg shadow-sm">
                          {getTransactionIcon(transacao.tipo)}
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{transacao.descricao}</p>
                          <p className="text-xs text-muted-foreground">
                            {transacao.categorias?.nome} • {formatDate(transacao.data_transacao)}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${
                        transacao.tipo === 'receita' ? 'text-success' : 'text-destructive'
                      }`}>
                        {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(parseFloat(transacao.valor.toString()))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">Nenhuma transação encontrada</p>
                  <Button asChild variant="outline" size="sm" className="btn-hover">
                    <Link to="/transacoes">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeira Transação
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
      </div>

        {/* Quick Actions */}
        <Card className="card-hover shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-finance-teal/10 rounded-lg">
                <Plus className="w-5 h-5 text-finance-teal" />
              </div>
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Button asChild variant="outline" className="h-24 flex-col gap-3 btn-hover group">
                <Link to="/contas">
                  <div className="p-3 bg-finance-blue/10 rounded-xl group-hover:bg-finance-blue/20 transition-colors">
                    <Wallet className="w-6 h-6 text-finance-blue" />
                  </div>
                  <span className="font-medium">Gerenciar Contas</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col gap-3 btn-hover group">
                <Link to="/cartoes">
                  <div className="p-3 bg-finance-purple/10 rounded-xl group-hover:bg-finance-purple/20 transition-colors">
                    <CreditCard className="w-6 h-6 text-finance-purple" />
                  </div>
                  <span className="font-medium">Gerenciar Cartões</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col gap-3 btn-hover group">
                <Link to="/transacoes">
                  <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
                    <ArrowUpRight className="w-6 h-6 text-success" />
                  </div>
                  <span className="font-medium">Nova Transação</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col gap-3 btn-hover group">
                <Link to="/telegram">
                  <div className="p-3 bg-finance-teal/10 rounded-xl group-hover:bg-finance-teal/20 transition-colors">
                    <TrendingUp className="w-6 h-6 text-finance-teal" />
                  </div>
                  <span className="font-medium">Telegram Bot</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="resources">
          <ResourceOverview />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}