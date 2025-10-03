import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp, Users } from "lucide-react";
import { agencyMappings } from "@/data/agencies";

const Dashboard = () => {
  // Calculate statistics from dummy data
  const totalProjects = agencyMappings.length;
  const approvedProjects = agencyMappings.filter((m) => m.status === "Approved").length;
  const ongoingProjects = agencyMappings.filter((m) => m.status === "Ongoing").length;
  const completedProjects = agencyMappings.filter((m) => m.status === "Completed").length;
  
  const totalAllocated = agencyMappings.reduce((sum, m) => sum + m.fundsAllocated, 0);
  const totalUtilized = agencyMappings.reduce((sum, m) => sum + m.fundsUtilized, 0);
  const utilizationRate = ((totalUtilized / totalAllocated) * 100).toFixed(1);

  const statePerformance = [
    { state: "Tamil Nadu", projects: 3, utilization: 85 },
    { state: "Maharashtra", projects: 3, utilization: 75 },
    { state: "Kerala", projects: 2, utilization: 70 },
    { state: "Uttar Pradesh", projects: 2, utilization: 90 },
    { state: "Karnataka", projects: 2, utilization: 45 },
  ];

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-10 w-10 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor KPIs, funds allocation, and project performance
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all states</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funds Allocated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatCurrency(totalAllocated)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total allocation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funds Utilized</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatCurrency(totalUtilized)}</div>
              <p className="text-xs text-muted-foreground mt-1">{utilizationRate}% utilization rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{completedProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Project Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Project Status Distribution
              </CardTitle>
              <CardDescription>Current status of all projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Approved</span>
                    <span className="text-sm font-semibold text-accent">{approvedProjects} projects</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${(approvedProjects / totalProjects) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ongoing</span>
                    <span className="text-sm font-semibold text-primary">{ongoingProjects} projects</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(ongoingProjects / totalProjects) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm font-semibold text-secondary">{completedProjects} projects</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary"
                      style={{ width: `${(completedProjects / totalProjects) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funds Allocation vs Utilization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Funds: Allocated vs Utilized
              </CardTitle>
              <CardDescription>Financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Allocated</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalAllocated)}</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Utilized</p>
                    <p className="text-2xl font-bold text-secondary">{formatCurrency(totalUtilized)}</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-secondary" />
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Utilization Rate</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${utilizationRate}%` }}
                      />
                    </div>
                    <span className="text-xl font-bold">{utilizationRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing States */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Top Performing States
            </CardTitle>
            <CardDescription>Based on project count and fund utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statePerformance.map((state, index) => (
                <div key={state.state} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <span className="font-medium">{state.state}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{state.projects} projects</p>
                      <p className="text-xs text-muted-foreground">{state.utilization}% utilized</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${state.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
