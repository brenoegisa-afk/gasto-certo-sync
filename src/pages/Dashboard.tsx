import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FinancialCard } from '@/components/ui/financial-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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
    <div className="container mx-auto p-4 space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Olá! 👋</h1>
          <p className="text-muted-foreground">Aqui está um resumo das suas finanças</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-gradient-primary hover:opacity-90">
            <Link to="/transacao">
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Link>
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <FinancialCard variant="gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Saldo Total</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">
                    {showBalance ? formatCurrency(data.saldoTotal) : '••••••'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-white hover:bg-white/20 p-1 h-auto"
                  >
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Wallet className="w-8 h-8 text-white/80" />
            </div>
          </CardContent>
        </FinancialCard>

        {/* Accounts */}
        <FinancialCard>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Contas</p>
                <p className="text-2xl font-bold">{data.totalContas}</p>
              </div>
              <Wallet className="w-8 h-8 text-finance-blue" />
            </div>
          </CardContent>
        </FinancialCard>

        {/* Credit Cards */}
        <FinancialCard>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Cartões</p>
                <p className="text-2xl font-bold">{data.totalCartoes}</p>
              </div>
              <CreditCard className="w-8 h-8 text-finance-purple" />
            </div>
          </CardContent>
        </FinancialCard>

        {/* Monthly Balance */}
        <FinancialCard 
          variant={data.receitasMes - data.despesasMes >= 0 ? "success" : "danger"}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Balanço do Mês</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(data.receitasMes - data.despesasMes)}
                </p>
              </div>
              {data.receitasMes - data.despesasMes >= 0 ? (
                <TrendingUp className="w-8 h-8 text-white/80" />
              ) : (
                <TrendingDown className="w-8 h-8 text-white/80" />
              )}
            </div>
          </CardContent>
        </FinancialCard>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resumo do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
              <div className="flex items-center gap-3">
                <ArrowUpRight className="w-5 h-5 text-success" />
                <span className="font-medium">Receitas</span>
              </div>
              <span className="font-bold text-success">{formatCurrency(data.receitasMes)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-3">
                <ArrowDownRight className="w-5 h-5 text-destructive" />
                <span className="font-medium">Despesas</span>
              </div>
              <span className="font-bold text-destructive">{formatCurrency(data.despesasMes)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/transacoes">Ver Todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.transacoesRecentes.length > 0 ? (
              <div className="space-y-3">
                {data.transacoesRecentes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transacao.tipo)}
                      <div>
                        <p className="font-medium text-sm">{transacao.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          {transacao.categorias?.nome} • {formatDate(transacao.data_transacao)}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${
                      transacao.tipo === 'receita' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(parseFloat(transacao.valor.toString()))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link to="/transacao">Adicionar Primeira Transação</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/contas">
                <Wallet className="w-6 h-6" />
                <span>Gerenciar Contas</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/cartoes">
                <CreditCard className="w-6 h-6" />
                <span>Gerenciar Cartões</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/transferencia">
                <ArrowUpRight className="w-6 h-6" />
                <span>Transferir</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/relatorios">
                <TrendingUp className="w-6 h-6" />
                <span>Relatórios</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}