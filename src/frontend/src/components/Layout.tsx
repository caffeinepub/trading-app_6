import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardList,
  LayoutDashboard,
  Menu,
  Search,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    ocid: "nav.dashboard.link",
  },
  {
    label: "Watchlist",
    path: "/watchlist",
    icon: Star,
    ocid: "nav.watchlist.link",
  },
  {
    label: "Orders",
    path: "/orders",
    icon: ClipboardList,
    ocid: "nav.orders.link",
  },
];

export function Layout({ children, onSearch, searchQuery = "" }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-56 bg-sidebar border-r border-sidebar-border
          transition-transform duration-200 lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-sidebar-border">
          <img
            src="/assets/uploads/1773628443443-1.png"
            alt="DRAGON FLY"
            className="h-9 w-auto object-contain flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="text-sm font-bold tracking-widest text-sidebar-foreground uppercase">
            DRAGON FLY
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              currentPath === item.path ||
              (item.path !== "/" && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                data-ocid={item.ocid}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
                {item.label}
                {active && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            © {new Date().getFullYear()} Built with{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-background/80 lg:hidden w-full h-full border-0 cursor-default"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 h-16 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Mobile logo in header */}
          <div className="flex items-center gap-2 lg:hidden">
            <img
              src="/assets/uploads/1773628443443-1.png"
              alt="DRAGON FLY"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-sm font-bold tracking-widest text-foreground uppercase">
              DRAGON FLY
            </span>
          </div>

          <div className="relative flex-1 max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              data-ocid="watchlist.search.input"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => onSearch?.(e.target.value)}
              className="pl-9 h-9 bg-muted border-border text-sm"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Portfolio</p>
              <p className="text-sm font-mono font-semibold text-foreground">
                $142,856.34
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">D</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
