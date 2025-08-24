import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { FinancialOverview } from '@/components/dashboard/FinancialOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  BarChart3,
  Grid3X3,
  Shield,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import ResourceOverview from '@/components/dashboard/ResourceOverview';

interface DashboardData {
  contas: any[];
  cartoes: any[];
  saldoTotal: number;
  transacoesRecentes: any[];
  despesasMes: number;
  receitasMes: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [data, setData] = useState<DashboardData>({
    contas: [],
    cartoes: [],
    saldoTotal: 0,
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
          categorias(nome, icone, cor)
        `)
        .eq('user_id', user?.id)
        .order('data_registro', { ascending: false })
        .limit(10);

      if (transacoesError) throw transacoesError;

      // Calculate totals
      const saldoTotal = contas?.reduce((acc, conta) => acc + parseFloat(conta.saldo_atual.toString()), 0) || 0;
      
      // Calculate current month expenses and income
      const currentMonth = new Date().toISOString().slice(0, 7);
      const despesasMes = transacoes?.filter(t => 
        t.tipo === 'despesa' && 
        t.data_transacao.startsWith(currentMonth)
      ).reduce((acc, t) => acc + parseFloat(t.valor.toString()), 0) || 0;
      
      const receitasMes = transacoes?.filter(t => 
        t.tipo === 'receita' && 
        t.data_transacao.startsWith(currentMonth)
      ).reduce((acc, t) => acc + parseFloat(t.valor.toString()), 0) || 0;

      setData({
        contas: contas || [],
        cartoes: cartoes || [],
        saldoTotal,
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-bold gradient-text">
                Dashboard Financeiro
              </h1>
              {!adminLoading && isAdmin && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground">
              Controle inteligente das suas finanças pessoais
            </p>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3 bg-card shadow-card">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Transações
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <FinancialOverview
              accounts={data.contas}
              cards={data.cartoes}
              totalBalance={data.saldoTotal}
              monthlyIncome={data.receitasMes}
              monthlyExpenses={data.despesasMes}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-8">
            {/* Recent Transactions List */}
            <Card className="card-hover shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                  Lançamentos Recentes
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
                          <div className="p-3 bg-finance-orange/10 rounded-xl">
                            <ArrowDownRight className="w-5 h-5 text-finance-orange" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-sm">{transacao.descricao}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {transacao.categorias?.nome || 'Sem categoria'}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(transacao.data_transacao)}
                              </span>
                            </div>
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
                        Adicionar Primeira Transação
                      </Link>
                    </Button>
                  </div>
                )}
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