import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Shield } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);

    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome to AJAY-MAP Portal",
      });
      navigate("/");
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
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Shield className="h-10 w-10 text-primary" />
            AJAY-MAP Portal
          </h1>
          <p className="text-muted-foreground">Agency Mapping & Monitoring Portal for PM-AJAY</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-primary" />
                Login
              </CardTitle>
              <CardDescription>Access the portal with your credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-muted/30">
            <CardHeader>
              <CardTitle>Demo Credentials</CardTitle>
              <CardDescription>Use these credentials to test different roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-background rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default">Admin</Badge>
                  <span className="text-xs text-muted-foreground">Full Access</span>
                </div>
                <p className="text-sm font-mono">admin@pmajay.gov.in</p>
                <p className="text-sm font-mono">admin123</p>
              </div>

              <div className="p-3 bg-background rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-primary text-primary-foreground">Official</Badge>
                  <span className="text-xs text-muted-foreground">Create Proposals</span>
                </div>
                <p className="text-sm font-mono">official@pmajay.gov.in</p>
                <p className="text-sm font-mono">official123</p>
              </div>

              <div className="p-3 bg-background rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">Citizen</Badge>
                  <span className="text-xs text-muted-foreground">View & Report</span>
                </div>
                <p className="text-sm font-mono">citizen@example.com</p>
                <p className="text-sm font-mono">citizen123</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
