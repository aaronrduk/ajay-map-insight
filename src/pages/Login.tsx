import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Shield, ArrowLeft } from "lucide-react";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const roleParam = searchParams.get("role") || "citizen";
  
  const roleConfig = {
    citizen: {
      title: "Citizen Login",
      demo: { username: "citizen_demo", password: "citizen123" },
      redirectPath: "/citizen-dashboard"
    },
    agency: {
      title: "Agency Login",
      demo: { username: "agency_demo", password: "agency123" },
      redirectPath: "/agency-dashboard"
    },
    admin: {
      title: "Admin Login",
      demo: { username: "admin_demo", password: "admin123" },
      redirectPath: "/admin-dashboard"
    }
  };
  
  const currentRole = roleConfig[roleParam as keyof typeof roleConfig] || roleConfig.citizen;

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      switch (user.role) {
        case "citizen":
          navigate("/citizen-dashboard");
          break;
        case "official":
          navigate("/agency-dashboard");
          break;
        case "admin":
          navigate("/admin-dashboard");
          break;
      }
    }
  }, [user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);

    if (success) {
      toast({
        title: "Login Successful",
        description: `Welcome to ${currentRole.title}`,
      });
      // Navigation is handled by useEffect
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {currentRole.title}
          </h1>
          <p className="text-muted-foreground">PM AJAY MAPPING Portal</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-primary" />
              Sign In
            </CardTitle>
            <CardDescription>Enter your credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-semibold mb-2 text-muted-foreground">Demo Credentials:</p>
              <div className="space-y-1">
                <p className="text-sm font-mono text-foreground">Username: {currentRole.demo.username}</p>
                <p className="text-sm font-mono text-foreground">Password: {currentRole.demo.password}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
