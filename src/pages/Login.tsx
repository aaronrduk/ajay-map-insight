import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Shield, ArrowLeft, UserPlus, Mail, Lock, User } from "lucide-react";
import { initiateRegistration, verifyRegistrationOTP, initiateLogin, verifyLoginOTP, resendOTP } from "@/lib/auth-service";

const Login = () => {
  const { setUser, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState("login");
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    userType: searchParams.get("role") || "citizen"
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    userType: searchParams.get("role") || "citizen"
  });

  const [otp, setOtp] = useState("");

  const roleParam = searchParams.get("role") || "citizen";

  const roleConfig = {
    citizen: {
      title: "Citizen Portal",
      value: "citizen" as const
    },
    agency: {
      title: "Agency Portal",
      value: "agency" as const
    },
    administrator: {
      title: "Administrator Portal",
      value: "administrator" as const
    }
  };

  const currentRole = roleConfig[roleParam as keyof typeof roleConfig] || roleConfig.citizen;

  useEffect(() => {
    if (user) {
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
  }, [user, navigate]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await initiateRegistration({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        userType: registerData.userType as 'administrator' | 'agency' | 'citizen'
      });

      if (result.success) {
        setPendingEmail(registerData.email);
        setShowOTP(true);
        toast({
          title: "OTP Sent",
          description: result.message
        });
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await initiateLogin(
        loginData.email,
        loginData.password,
        loginData.userType
      );

      if (result.success) {
        setPendingEmail(loginData.email);
        setShowOTP(true);
        toast({
          title: "OTP Sent",
          description: result.message
        });
      } else {
        toast({
          title: "Login Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const verifyFunc = activeTab === "register" ? verifyRegistrationOTP : verifyLoginOTP;
      const result = await verifyFunc(pendingEmail, otp);

      if (result.success && result.user) {
        setUser({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.userType as 'administrator' | 'agency' | 'citizen'
        });

        toast({
          title: "Success",
          description: result.message
        });

        if (result.redirectTo) {
          navigate(result.redirectTo);
        }
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Verification failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const result = await resendOTP(pendingEmail, activeTab === "register" ? "registration" : "login");

      toast({
        title: result.success ? "OTP Resent" : "Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showOTP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => {
              setShowOTP(false);
              setOtp("");
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Verify OTP
            </h1>
            <p className="text-muted-foreground">Enter the code sent to {pendingEmail}</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>OTP Verification</CardTitle>
              <CardDescription>Please check your email for the verification code</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOTPVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">6-Digit Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>
              </form>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Development Note:</strong> Check browser console for OTP
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="register">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Sign In</h3>
                  <p className="text-sm text-muted-foreground">Enter your credentials to access your dashboard</p>
                </div>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-usertype">User Type</Label>
                    <Select
                      value={loginData.userType}
                      onValueChange={(value) => setLoginData({ ...loginData, userType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                        <SelectItem value="administrator">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Continue with OTP"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Create Account</h3>
                  <p className="text-sm text-muted-foreground">Register to access PM AJAY portal features</p>
                </div>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-usertype">User Type</Label>
                    <Select
                      value={registerData.userType}
                      onValueChange={(value) => setRegisterData({ ...registerData, userType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">Citizen</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                        <SelectItem value="administrator">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a strong password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Register with OTP"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
