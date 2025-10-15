import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { RefreshCw, User, MapPin, UserCog, Shield, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import AIChatbot from "./AIChatbot";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginType, setLoginType] = useState<"citizen" | "agency" | "admin">("citizen");

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleTimeString());
    toast({
      title: "Data Refreshed",
      description: "Latest information has been loaded",
    });
  };

  const openLoginDialog = (type: "citizen" | "agency" | "admin") => {
    setLoginType(type);
    setLoginDialogOpen(true);
  };

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

              {/* Demo Login Icons */}
              <div className="flex items-center gap-2 border-l border-border pl-3">
                <Button
                  onClick={() => openLoginDialog("citizen")}
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-primary/10"
                  title="Citizen Login (Demo)"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline text-xs">Citizen</span>
                </Button>
                <Button
                  onClick={() => openLoginDialog("agency")}
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-accent/10"
                  title="Agency Login (Demo)"
                >
                  <UserCog className="h-4 w-4" />
                  <span className="hidden lg:inline text-xs">Agency</span>
                </Button>
                <Button
                  onClick={() => openLoginDialog("admin")}
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:bg-destructive/10"
                  title="Admin Login (Demo)"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden lg:inline text-xs">Admin</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {loginType === "citizen" && <User className="h-5 w-5" />}
              {loginType === "agency" && <UserCog className="h-5 w-5" />}
              {loginType === "admin" && <Shield className="h-5 w-5" />}
              {loginType.charAt(0).toUpperCase() + loginType.slice(1)} Login
            </DialogTitle>
            <DialogDescription>
              This is a demonstration portal for Smart India Hackathon 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
              <p className="text-sm text-foreground font-semibold mb-2">
                🎯 Demo Access Mode
              </p>
              <p className="text-sm text-muted-foreground">
                All features are accessible without authentication for demonstration purposes. 
                No login credentials required.
              </p>
            </div>
            <Button 
              onClick={() => setLoginDialogOpen(false)} 
              className="w-full"
            >
              Continue Exploring
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <nav className="bg-card/80 border-b border-border backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1 overflow-x-auto py-2">
            {[
              { path: "/", label: "Home" },
              { path: "/mapping", label: "Mapping" },
              { path: "/map", label: "Map View" },
              { path: "/proposal", label: "Proposal" },
              { path: "/dashboard", label: "Dashboard" },
              { path: "/transparency", label: "Transparency" },
              { path: "/comparison", label: "Comparison" },
              { path: "/impact", label: "Impact Metrics" },
              { path: "/file-complaint", label: "File Complaint" },
              { path: "/about", label: "About" },
            ].map((item) => (
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
