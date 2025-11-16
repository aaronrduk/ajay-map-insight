import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { RefreshCw, MapPin, Moon, Sun, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import AIChatbot from "./AIChatbot";
import NotificationsDropdown from "./NotificationsDropdown";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleTimeString());
    toast({
      title: "Data Refreshed",
      description: "Latest information has been loaded",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  // Role-based navigation menus
  const getNavigationItems = () => {
    if (!user) return [];

    const citizenMenu = [
      { path: "/citizen-dashboard", label: "Home" },
      { path: "/map", label: "View Map" },
      { path: "/transparency", label: "Transparency Portal" },
      { path: "/file-complaint", label: "File Complaint" },
      { path: "/impact", label: "Impact Metrics" },
      { path: "/about", label: "About" },
    ];

    const agencyMenu = [
      { path: "/agency-dashboard", label: "Home" },
      { path: "/mapping", label: "Mapping" },
      { path: "/proposal", label: "Create Proposal" },
      { path: "/dashboard", label: "Proposal Status" },
      { path: "/impact", label: "Impact Metrics" },
      { path: "/comparison", label: "Comparison" },
      { path: "/file-complaint", label: "File Complaint" },
    ];

    const adminMenu = [
      { path: "/admin-dashboard", label: "Home" },
      { path: "/dashboard", label: "Dashboard" },
      { path: "/mapping", label: "Manage Agencies" },
      { path: "/transparency", label: "Transparency Control" },
      { path: "/impact", label: "Reports" },
      { path: "/comparison", label: "Comparison" },
      { path: "/about", label: "System Settings" },
    ];

    switch (user.role) {
      case "citizen":
        return citizenMenu;
      case "official":
        return agencyMenu;
      case "admin":
        return adminMenu;
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card/80 border-b border-border sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="relative">
                <MapPin className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 h-10 w-10 text-accent opacity-20 animate-ping" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  PM AJAY MAPPING
                </h1>
                <p className="text-xs text-muted-foreground">Agency Mapping Portal</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground hidden md:block">
                Updated: {lastUpdated}
              </div>
              
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="gap-2 font-semibold border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">Refresh</span>
              </Button>

              <Button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                variant="outline"
                size="sm"
                className="gap-2"
                title="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {user && <NotificationsDropdown />}

              {/* User Info & Logout */}
              {user && (
                <div className="flex items-center gap-2 border-l border-border pl-3">
                  <div className="hidden md:block text-sm">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role === "official" ? "Agency" : user.role}</p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Only show if user is logged in */}
      {user && navigationItems.length > 0 && (
        <nav className="bg-card/80 border-b border-border backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-1 overflow-x-auto py-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* AI Chatbot */}
      <AIChatbot />

      {/* Footer */}
      <footer className="bg-card/80 border-t border-border mt-auto backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">
              PM AJAY MAPPING Portal | Smart India Hackathon 2025
            </p>
            <p>&copy; 2025 Team Insightix. Developed for demonstration purposes.</p>
            <p className="text-xs">
              Powered by React • Tailwind CSS • Leaflet.js • OpenStreetMap •
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
