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

        {/* Program Delivery Structure */}
        <Card className="border-secondary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Program Delivery Structure</CardTitle>
            <CardDescription>
              Four-tier implementation framework ensuring accountability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-6">
              <div className="flex flex-col items-center gap-2 p-6 bg-primary/10 rounded-lg min-w-[150px]">
                <Building2 className="h-12 w-12 text-primary" />
                <h4 className="font-bold text-lg">Centre</h4>
                <p className="text-xs text-center text-muted-foreground">Policy & Funding</p>
              </div>
              <div className="text-4xl text-muted-foreground">→</div>
              <div className="flex flex-col items-center gap-2 p-6 bg-secondary/10 rounded-lg min-w-[150px]">
                <Home className="h-12 w-12 text-secondary" />
                <h4 className="font-bold text-lg">State</h4>
                <p className="text-xs text-center text-muted-foreground">Coordination</p>
              </div>
              <div className="text-4xl text-muted-foreground">→</div>
              <div className="flex flex-col items-center gap-2 p-6 bg-accent/10 rounded-lg min-w-[150px]">
                <Briefcase className="h-12 w-12 text-accent" />
                <h4 className="font-bold text-lg">Agency</h4>
                <p className="text-xs text-center text-muted-foreground">Implementation</p>
              </div>
              <div className="text-4xl text-muted-foreground">→</div>
              <div className="flex flex-col items-center gap-2 p-6 bg-green-500/10 rounded-lg min-w-[150px]">
                <Users className="h-12 w-12 text-green-600" />
                <h4 className="font-bold text-lg">Beneficiary</h4>
                <p className="text-xs text-center text-muted-foreground">Impact</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Flow of Implementation:</strong> Central government allocates funds and sets policy guidelines → State governments coordinate with local agencies → Implementing agencies execute projects on ground → Direct benefits reach SC community members
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Portal Features */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="text-2xl">What This Portal Provides</CardTitle>
            <CardDescription>
              Comprehensive transparency and monitoring tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Fund Tracking
                </h4>
                <p className="text-sm text-muted-foreground">
                  Real-time visualization of fund allocation vs utilization across states, districts, and agencies
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Beneficiary Analytics
                </h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive data on scheme beneficiaries by component, state, and social category
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Agency Performance
                </h4>
                <p className="text-sm text-muted-foreground">
                  Detailed metrics on implementing agency performance, utilization rates, and impact
                </p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Course Registration
                </h4>
                <p className="text-sm text-muted-foreground">
                  Easy access to skill development courses with college listings and online registration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Implementation Mapping */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Why Implementation Mapping is Required</CardTitle>
            <CardDescription>
              Ensuring transparency, accountability, and efficient delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm font-semibold">Transparency</p>
                <p className="text-xs text-muted-foreground mt-1">Complete visibility into fund flow</p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-secondary mb-2">24/7</div>
                <p className="text-sm font-semibold">Real-time Tracking</p>
                <p className="text-xs text-muted-foreground mt-1">Continuous monitoring of projects</p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-accent mb-2">Zero</div>
                <p className="text-sm font-semibold">Leakage</p>
                <p className="text-xs text-muted-foreground mt-1">Minimize fund misappropriation</p>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Key Benefits:</strong> This portal addresses critical challenges in scheme implementation including lack of visibility into fund utilization, difficulty in tracking beneficiary reach, absence of centralized agency performance data, and limited citizen access to scheme information. By providing comprehensive mapping and real-time analytics, it enables data-driven decision making, faster grievance resolution, and ensures benefits reach intended beneficiaries efficiently.
              </p>
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
