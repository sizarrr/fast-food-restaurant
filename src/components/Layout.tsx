import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Menu, 
  ClipboardList, 
  BarChart3, 
  LogOut,
  Store,
  Settings as SettingsIcon
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/theme-toggle';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'POS', href: '/pos', icon: ShoppingCart },
    { name: 'Menu', href: '/menu', icon: Menu },
    { name: 'Orders', href: '/orders', icon: ClipboardList },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  // Filter navigation based on user role
  const filteredNavigation = user?.role === 'cashier' 
    ? navigation.filter(item => ['Dashboard', 'POS', 'Orders'].includes(item.name))
    : [...navigation, { name: 'Settings', href: '/settings', icon: SettingsIcon }];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">FastFood POS</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.role === 'admin' ? 'Administrator' : 'Cashier'}
                </p>
              </div>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => navigate(item.href)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* Settings (admin) + user info and logout */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
              <div className="flex items-center gap-2">
                {user?.role === 'admin' && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;