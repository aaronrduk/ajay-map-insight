import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, GraduationCap, Briefcase, Home, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">About PM-AJAY & AJAY-MAP</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Understanding the mission and the monitoring portal
          </p>
        </div>

        {/* PM-AJAY Vision */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">PM-AJAY Vision & Objectives</CardTitle>
            <CardDescription>
              Pradhan Mantri Anusuchit Jaati Abhyuday Yojana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              PM-AJAY is a comprehensive initiative aimed at socio-economic empowerment of Scheduled Caste (SC) 
              communities across India. The scheme focuses on holistic development through infrastructure, 
              education, livelihood, and social upliftment programs.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Economic Empowerment</h4>
                  <p className="text-sm text-muted-foreground">
                    Skill development, livelihood programs, and income generation initiatives
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <GraduationCap className="h-5 w-5 text-secondary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Educational Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Hostels, scholarships, and quality education infrastructure
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Home className="h-5 w-5 text-accent shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Social Infrastructure</h4>
                  <p className="text-sm text-muted-foreground">
                    Community centers, sanitation, and basic amenities
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="h-5 w-5 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Community Development</h4>
                  <p className="text-sm text-muted-foreground">
                    Adarsh Gram development and inclusive growth
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Components Covered */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">PM-AJAY Components</CardTitle>
            <CardDescription>
              Key focus areas and implementation strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: "Adarsh Gram Yojana",
                  icon: Home,
                  description: "Model village development with complete infrastructure",
                },
                {
                  title: "Hostels for SC Students",
                  icon: GraduationCap,
                  description: "Safe and quality residential facilities for education",
                },
                {
                  title: "NGO / Livelihood Projects",
                  icon: Briefcase,
                  description: "Income generation and self-employment initiatives",
                },
                {
                  title: "Skill Development",
                  icon: TrendingUp,
                  description: "Training programs for employability and entrepreneurship",
                },
                {
                  title: "Infrastructure Development",
                  icon: Building2,
                  description: "Roads, sanitation, water supply, and community centers",
                },
                {
                  title: "Social Upliftment",
                  icon: Users,
                  description: "Health, awareness, and social welfare programs",
                },
              ].map((component) => (
                <div key={component.title} className="p-4 rounded-lg border bg-card space-y-2">
                  <component.icon className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold">{component.title}</h3>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Data Sources & Methodology</CardTitle>
            <CardDescription>
              Transparency and authenticity in our data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              AJAY-MAP portal aggregates data from multiple authoritative government sources to ensure accuracy and reliability:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm py-1">Census 2011 Data</Badge>
              <Badge variant="outline" className="text-sm py-1">LGD Portal (Local Government Directory)</Badge>
              <Badge variant="outline" className="text-sm py-1">Ministry of Social Justice & Empowerment</Badge>
              <Badge variant="outline" className="text-sm py-1">State Government Reports</Badge>
              <Badge variant="outline" className="text-sm py-1">District Administration Data</Badge>
              <Badge variant="outline" className="text-sm py-1">OpenStreetMap (Geographic Data)</Badge>
            </div>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> This portal is developed as a demonstration 
                for Smart India Hackathon 2025. Some data points are representative samples for visualization purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team Credit */}
        <Card className="border-accent/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Developed by</p>
              <h3 className="text-2xl font-bold text-accent">Team Insightix</h3>
              <p className="text-sm text-muted-foreground">Smart India Hackathon 2025</p>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Powered by React, Tailwind CSS, Leaflet.js, OpenStreetMap & Lovable AI
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default About;
