import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Account {
  id: string;
  nome: string;
  saldo_atual: number;
  tipo: string;
  moeda: string;
}

interface CreditCard {
  id: string;
  nome: string;
  limite: number;
  utilizado: number;
  bandeira: string;
}

interface FinancialOverviewProps {
  accounts: Account[];
  cards: CreditCard[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  showBalance: boolean;
  onToggleBalance: () => void;
}

export function FinancialOverview({
  accounts,
  cards,
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  showBalance,
  onToggleBalance
}: FinancialOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage > 80) return 'bg-gradient-danger';
    if (percentage > 60) return 'bg-gradient-to-r from-orange-500 to-red-500';
    return 'bg-gradient-primary';
  };

  return (
    <div className="space-y-8">
      {/* Header with balance */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Controle inteligente das suas finanças pessoais</p>
        </div>
        <Button
          onClick={onToggleBalance}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-gradient-primary border-0 text-white relative overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-2">Saldo Total Consolidado</p>
              <p className="text-4xl font-bold">
                {showBalance ? formatCurrency(totalBalance) : '••••••'}
              </p>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 pointer-events-none" />
        </CardContent>
      </Card>

      {/* Accounts and Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accounts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              Minhas Contas
            </h2>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link to="/contas">
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {accounts.map((account) => (
              <Card key={account.id} className="bg-card border border-muted hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{account.nome}</h3>
                      <p className="text-sm text-muted-foreground">{account.tipo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(account.saldo_atual)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {accounts.length === 0 && (
              <Card className="bg-card border border-dashed border-muted">
                <CardContent className="p-8 text-center">
                  <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhuma conta cadastrada</p>
                  <Button asChild variant="outline">
                    <Link to="/contas">Adicionar Primeira Conta</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Credit Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <div className="p-2 bg-finance-orange/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-finance-orange" />
              </div>
              Cartões de Crédito
            </h2>
            <Button asChild size="sm" variant="outline">
              <Link to="/cartoes">Ver Todos</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {cards.map((card) => {
              const utilization = (card.utilizado / card.limite) * 100;
              return (
                <Card key={card.id} className="bg-card border border-muted hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{card.nome}</h3>
                          <p className="text-sm text-muted-foreground">Limite: {formatCurrency(card.limite)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {utilization.toFixed(1)}% utilizado
                          </p>
                          <p className="text-lg font-bold text-finance-orange">
                            {formatCurrency(card.utilizado)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress 
                          value={utilization} 
                          className="h-3"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {cards.length === 0 && (
              <Card className="bg-card border border-dashed border-muted">
                <CardContent className="p-8 text-center">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhum cartão cadastrado</p>
                  <Button asChild variant="outline">
                    <Link to="/cartoes">Adicionar Primeiro Cartão</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-success border-0 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-2">Saldo Líquido</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(monthlyIncome - monthlyExpenses)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">---%</span>
                </div>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-danger border-0 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-2">Despesas do Mês</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(monthlyExpenses)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm">---%</span>
                </div>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}