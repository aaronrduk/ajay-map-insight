import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { agencyMappings, districtData } from "@/data/agencies";
import { TrendingUp, Users, Building2, Target, DollarSign, CheckCircle } from "lucide-react";

const ImpactMetrics = () => {
  // Calculate aggregate metrics
  const totalProjects = agencyMappings.length;
  const completedProjects = agencyMappings.filter((m) => m.status === "Completed").length;
  const ongoingProjects = agencyMappings.filter((m) => m.status === "Ongoing").length;
  const totalAllocated = agencyMappings.reduce((sum, m) => sum + m.fundsAllocated, 0);
  const totalUtilized = agencyMappings.reduce((sum, m) => sum + m.fundsUtilized, 0);
  const utilizationRate = ((totalUtilized / totalAllocated) * 100).toFixed(1);
  const totalSCPopulation = districtData.reduce((sum, d) => sum + d.scPopulation, 0);
  const totalVillages = districtData.reduce((sum, d) => sum + d.villages.length, 0);
  const totalAgencies = [...new Set(agencyMappings.flatMap((m) => m.agencies))].length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <Target className="h-10 w-10 text-primary" />
            Impact Metrics Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Measuring the reach and effectiveness of PM-AJAY initiatives
          </p>
        </div>

        {/* Hero Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">SC Population Covered</p>
                  <p className="text-4xl font-bold text-primary">
                    {(totalSCPopulation / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Scheduled Caste Beneficiaries</p>
                </div>
                <Users className="h-12 w-12 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fund Utilization</p>
                  <p className="text-4xl font-bold text-secondary">{utilizationRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{(totalUtilized / 10000000).toFixed(1)} Cr of ₹
                    {(totalAllocated / 10000000).toFixed(1)} Cr
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-secondary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Project Completion</p>
                  <p className="text-4xl font-bold text-accent">
                    {((completedProjects / totalProjects) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {completedProjects} of {totalProjects} projects
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-accent/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalProjects}</p>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                <p>✓ Completed: {completedProjects}</p>
                <p>⟳ Ongoing: {ongoingProjects}</p>
                <p>⊙ Approved: {totalProjects - completedProjects - ongoingProjects}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Villages Reached
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalVillages}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Across {districtData.length} districts in 8 states
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Agencies Involved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalAgencies}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Implementing and executing agencies coordinated
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                Avg. Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{utilizationRate}%</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Average fund utilization rate across all projects
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Component-wise Breakdown */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Component-wise Impact</CardTitle>
            <CardDescription>Project distribution across PM-AJAY components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["Adarsh Gram", "Hostels for SC Students", "NGO Project", "Skill Development", "Infrastructure Development"].map((component) => {
                const componentProjects = agencyMappings.filter((m) => m.component === component);
                const componentAllocated = componentProjects.reduce((sum, m) => sum + m.fundsAllocated, 0);
                const componentUtilized = componentProjects.reduce((sum, m) => sum + m.fundsUtilized, 0);
                const rate = componentAllocated > 0 ? ((componentUtilized / componentAllocated) * 100).toFixed(0) : 0;

                return (
                  <div key={component} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{component}</p>
                      <p className="text-sm text-muted-foreground">
                        {componentProjects.length} projects • ₹{(componentAllocated / 100000).toFixed(1)}L allocated
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{rate}%</p>
                      <p className="text-xs text-muted-foreground">utilized</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="shadow-lg bg-primary/5 border-primary/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">Towards Inclusive Development</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                PM-AJAY is committed to uplifting Scheduled Caste communities through targeted
                interventions, transparent governance, and community participation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ImpactMetrics;
