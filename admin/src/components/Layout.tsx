import { Link, useLocation, Outlet } from 'react-router-dom';
import { BarChart3, Globe, LogOut, LayoutDashboard, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sites', icon: Globe, label: 'Sites' },
  { to: '/widgets', icon: Code, label: 'Widgets' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0C0F16] border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Analytics</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground truncate">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
