import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Users, Building2, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case "citizen":
          navigate("/citizen-dashboard");
          break;
        case "agency":
          navigate("/agency-dashboard");
          break;
        case "administrator":
          navigate("/admin-dashboard");
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginClick = (role: string) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Shield className="h-20 w-20 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            PM AJAY MAPPING
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Agency Mapping & Monitoring Portal
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Bringing transparency, clarity, and accountability to PM-AJAY implementation across India.
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 bg-card/50 backdrop-blur"
            onClick={() => handleLoginClick("citizen")}
          >
            <CardContent className="pt-12 pb-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">Citizen Login</h3>
              <p className="text-muted-foreground mb-6">
                View projects, track complaints, and access transparency data
              </p>
              <div className="inline-flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                <span className="font-semibold">Access Portal</span>
                <UserCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-accent/50 bg-card/50 backdrop-blur"
            onClick={() => handleLoginClick("agency")}
          >
            <CardContent className="pt-12 pb-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Building2 className="h-12 w-12 text-accent" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">Agency Login</h3>
              <p className="text-muted-foreground mb-6">
                Manage projects, submit proposals, and track performance
              </p>
              <div className="inline-flex items-center gap-2 text-secondary group-hover:gap-3 transition-all">
                <span className="font-semibold">Access Portal</span>
                <UserCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-secondary/50 bg-card/50 backdrop-blur"
            onClick={() => handleLoginClick("administrator")}
          >
            <CardContent className="pt-12 pb-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Shield className="h-12 w-12 text-secondary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">Admin Login</h3>
              <p className="text-muted-foreground mb-6">
                Full system control, approvals, and analytics oversight
              </p>
              <div className="inline-flex items-center gap-2 text-accent group-hover:gap-3 transition-all">
                <span className="font-semibold">Access Portal</span>
                <UserCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">250+</div>
              <div className="text-muted-foreground">Villages Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">₹50Cr</div>
              <div className="text-muted-foreground">Funds Allocated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">100%</div>
              <div className="text-muted-foreground">Transparency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">
            © 2025 PM AJAY MAPPING | All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
