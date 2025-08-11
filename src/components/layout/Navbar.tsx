import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DollarSign, 
  Menu, 
  Home, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  Settings,
  LogOut,
  Plus,
  ArrowLeftRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Contas', href: '/contas', icon: Wallet },
  { name: 'Cartões', href: '/cartoes', icon: CreditCard },
  { name: 'Relatórios', href: '/relatorios', icon: TrendingUp },
];

const quickActions = [
  { name: 'Nova Transação', href: '/transacao', icon: Plus, variant: 'default' as const },
  { name: 'Transferir', href: '/transferencia', icon: ArrowLeftRight, variant: 'outline' as const },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (!user) return null;

  const NavItems = ({ className = "", onClick = () => {} }) => (
    <>
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
              className
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Gasto Certo</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavItems />
          </div>

          {/* Quick Actions & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Quick Actions - Desktop Only */}
            <div className="hidden md:flex items-center gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.name}
                  asChild
                  variant={action.variant}
                  size="sm"
                  className={cn(
                    action.variant === 'default' && "bg-gradient-primary hover:opacity-90"
                  )}
                >
                  <Link to={action.href}>
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.name}
                  </Link>
                </Button>
              ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/perfil">
                  <Settings className="w-4 h-4 mr-2" />
                  Perfil
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-6">
                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                      Ações Rápidas
                    </h3>
                    {quickActions.map((action) => (
                      <Button
                        key={action.name}
                        asChild
                        variant={action.variant}
                        className={cn(
                          "w-full justify-start",
                          action.variant === 'default' && "bg-gradient-primary hover:opacity-90"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Link to={action.href}>
                          <action.icon className="w-4 h-4 mr-2" />
                          {action.name}
                        </Link>
                      </Button>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                      Navegação
                    </h3>
                    <NavItems onClick={() => setIsOpen(false)} />
                  </div>

                  {/* User Actions */}
                  <div className="space-y-2 border-t pt-4">
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/perfil" onClick={() => setIsOpen(false)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Perfil
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}