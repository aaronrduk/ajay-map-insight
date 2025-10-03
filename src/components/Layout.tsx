import { Link } from "react-router-dom";
import { useState } from "react";
import { Home, Map, MapPin, FileText, BarChart3, Users, ArrowLeftRight, Target, LogOut, User, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AIChatbot from "./AIChatbot";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setLastUpdated(new Date());
    toast({
      title: "Data Refreshed",
      description: "Latest information loaded successfully",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AJAY-MAP</h1>
              <p className="text-sm text-primary-foreground/80">Agency Mapping & Monitoring Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="text-primary-foreground/60">Last updated</p>
                <p className="font-medium">{lastUpdated.toLocaleTimeString()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {user && (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs text-primary-foreground/60">Logged in as</p>
                    <p className="font-medium text-sm">{user.name}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {user.role}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!user && (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4">
          <ul className="flex flex-wrap gap-2 py-3">
            <li>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/mapping"
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Map className="h-4 w-4" />
                Mapping
              </Link>
            </li>
            <li>
              <Link
                to="/map"
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Map View
              </Link>
            </li>
            {(!user || user.role !== "citizen") && (
              <li>
                <Link
                  to="/proposal"
                  className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Proposal
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/transparency"
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Users className="h-4 w-4" />
                Transparency
              </Link>
            </li>
            <li>
              <Link
                to="/comparison"
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Comparison
              </Link>
            </li>
            <li>
              <Link
                to="/impact"
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Target className="h-4 w-4" />
                Impact
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* AI Chatbot */}
      <AIChatbot />

      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">Towards Inclusive Development</p>
            <p>© 2025 PM-AJAY | Ministry of Social Justice & Empowerment</p>
            <p className="mt-1">Transparency for Every Citizen</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
