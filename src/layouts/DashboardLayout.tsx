
import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Building, 
  UtensilsCrossed, 
  Briefcase 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const getBusinessIcon = () => {
    switch (user?.businessType) {
      case "franchise":
        return <Building className="w-6 h-6" />;
      case "restaurant":
        return <UtensilsCrossed className="w-6 h-6" />;
      case "autonomous":
        return <Briefcase className="w-6 h-6" />;
      default:
        return <Building className="w-6 h-6" />;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavItem = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => {
    const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
    
    return (
      <NavLink 
        to={to}
        className={({ isActive }) => cn(
          "flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "text-foreground hover:bg-secondary"
        )}
      >
        {icon}
        <span>{children}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between border-b px-4 bg-card">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="font-semibold text-xl">
            {user?.businessName || "Meu Negócio"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Overlay */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={cn(
            "w-64 border-r bg-card z-30 transition-all duration-300 ease-in-out",
            isMobile ? "fixed h-full" : "relative",
            !sidebarOpen && "transform -translate-x-full md:translate-x-0 md:w-16"
          )}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                {getBusinessIcon()}
              </div>
              {sidebarOpen && (
                <div className="font-semibold truncate">
                  {user?.businessName || "Meu Negócio"}
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="p-2 space-y-1">
            <NavItem to="/dashboard" icon={<Home className="w-5 h-5" />}>
              {sidebarOpen && "Início"}
            </NavItem>
            <NavItem to="/dashboard/products" icon={<Package className="w-5 h-5" />}>
              {sidebarOpen && "Produtos"}
            </NavItem>
            <NavItem to="/dashboard/orders" icon={<ShoppingCart className="w-5 h-5" />}>
              {sidebarOpen && "Pedidos"}
            </NavItem>
            <NavItem to="/dashboard/profile" icon={<User className="w-5 h-5" />}>
              {sidebarOpen && "Perfil"}
            </NavItem>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
