import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building2, TrendingUp, Users, Briefcase } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-pulse" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(217 91% 55% / 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, hsl(45 95% 60% / 0.1) 0%, transparent 50%)`
        }} />

        <div className="relative container mx-auto px-4 py-12 space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8 py-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <MapPin className="h-24 w-24 text-primary animate-pulse" style={{ filter: 'drop-shadow(0 0 20px hsl(217 91% 55% / 0.6))' }} />
                <div className="absolute inset-0 h-24 w-24 text-accent opacity-30 animate-ping">
                  <MapPin className="h-24 w-24" />
                </div>
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              AJAY-MAP
            </h1>
            <p className="text-3xl font-semibold text-accent">
              Agency Mapping & Monitoring Portal
            </p>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Bringing transparency, clarity, and accountability to PM-AJAY implementation across India
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button asChild size="lg" className="font-semibold">
                <Link to="/map">View Map</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold">
                <Link to="/proposal">Create Proposal</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold">
                <Link to="/transparency">Transparency Portal</Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader className="pb-3">
                <CardDescription>Villages Covered</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-primary">1,247</p>
                    <p className="text-xs text-muted-foreground mt-1">Across 5 states</p>
                  </div>
                  <MapPin className="h-12 w-12 text-primary/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20 hover:border-accent/40 transition-all">
              <CardHeader className="pb-3">
                <CardDescription>Funds Allocated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-accent">₹8.97 Cr</p>
                    <p className="text-xs text-muted-foreground mt-1">Total allocation</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-accent/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-success/20 hover:border-success/40 transition-all">
              <CardHeader className="pb-3">
                <CardDescription>Active Agencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-success">34</p>
                    <p className="text-xs text-muted-foreground mt-1">Implementing partners</p>
                  </div>
                  <Building2 className="h-12 w-12 text-success/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader className="pb-3">
                <CardDescription>Projects Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-primary">87%</p>
                    <p className="text-xs text-muted-foreground mt-1">Completion rate</p>
                  </div>
                  <Briefcase className="h-12 w-12 text-primary/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards */}
          <div>
            <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
              Explore the Portal
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-[0_0_30px_hsl(217_91%_55%/0.3)] transition-all border-primary/20">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Agency Mapping</CardTitle>
                  <CardDescription>
                    Detailed mapping of agencies, components, and fund allocation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/mapping">View Mapping</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[0_0_30px_hsl(217_91%_55%/0.3)] transition-all border-primary/20">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Interactive Map</CardTitle>
                  <CardDescription>
                    Real-time projects mapped across India with OpenStreetMap
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/map">View Map</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[0_0_30px_hsl(45_95%_60%/0.3)] transition-all border-accent/20">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <Briefcase className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>Create Proposal</CardTitle>
                  <CardDescription>
                    Submit project proposals with step-by-step wizard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/proposal">Create Proposal</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[0_0_30px_hsl(217_91%_55%/0.3)] transition-all border-primary/20">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Dashboard</CardTitle>
                  <CardDescription>
                    Interactive analytics with real-time KPIs and performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/dashboard">View Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[0_0_30px_hsl(142_71%_45%/0.3)] transition-all border-success/20">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <CardTitle>Public Portal</CardTitle>
                  <CardDescription>
                    Citizen transparency, grievance tracking, and community impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/transparency">Public Portal</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[0_0_30px_hsl(45_95%_60%/0.3)] transition-all border-accent/20">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>About PM-AJAY</CardTitle>
                  <CardDescription>
                    Learn about components, objectives, and data sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/about">Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
