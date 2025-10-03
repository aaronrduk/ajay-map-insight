import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Target, Award, Shield } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12">
          <div className="flex justify-center mb-6">
            <MapPin className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground">AJAY-MAP Portal</h1>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
            Agency Mapping & Monitoring Portal for PM-AJAY
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bringing transparency, clarity, and accountability to the implementation of PM-AJAY across India
          </p>
        </div>

        {/* Problem Statement */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              The Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              PM-AJAY involves multiple components and numerous implementing agencies across states, districts, and villages. 
              This creates confusion about:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Which agencies are responsible for which components?</li>
              <li>How funds are being allocated and utilized?</li>
              <li>The current status of projects in different regions?</li>
              <li>Lack of transparency for citizens and officials alike</li>
            </ul>
          </CardContent>
        </Card>

        {/* Solution */}
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Award className="h-6 w-6 text-secondary" />
              Our Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              AJAY-MAP provides a comprehensive platform to map, track, and monitor all implementing and executing agencies 
              across PM-AJAY components with complete transparency:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong>Agency Mapping:</strong> Clear visibility of which agencies handle which components</li>
              <li><strong>Interactive Maps:</strong> Visual representation of projects across India</li>
              <li><strong>Proposal Management:</strong> Streamlined process for creating and tracking proposals</li>
              <li><strong>Real-time Dashboards:</strong> Monitor funds, progress, and performance</li>
              <li><strong>Public Transparency:</strong> Citizens can track projects in their area</li>
            </ul>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Explore the Portal
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Agency Mapping</CardTitle>
                <CardDescription>
                  View detailed mapping of agencies, components, and funds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/mapping">View Mapping</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Interactive Map</CardTitle>
                <CardDescription>
                  Explore projects across India by state and district
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/map">View Map</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Create Proposal</CardTitle>
                <CardDescription>
                  Submit new project proposals for review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/proposal">Create Proposal</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>
                  Monitor KPIs, funds, and project performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/dashboard">View Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Public Portal</CardTitle>
                <CardDescription>
                  Citizen-facing transparency and grievance system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="secondary">
                  <Link to="/transparency">Public Portal</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
