import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { BarChart3, Globe, LogOut, LayoutDashboard, Code, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sites', icon: Globe, label: 'Sites' },
  { to: '/widgets', icon: Code, label: 'Widgets' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0C0F16] border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Analytics</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#0C0F16] border-r border-border flex flex-col transition-transform duration-200 ease-in-out",
        "md:static md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Analytics</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
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
