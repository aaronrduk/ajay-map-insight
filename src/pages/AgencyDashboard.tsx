import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Map, FileText, CheckCircle, TrendingUp, GitCompare, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const AgencyDashboard = () => {
  const menuItems = [
    { icon: Home, label: "Home", path: "/agency-dashboard", color: "text-primary" },
    { icon: Map, label: "Mapping", path: "/mapping", color: "text-blue-500" },
    { icon: FileText, label: "Create Proposal", path: "/proposal", color: "text-green-500" },
    { icon: CheckCircle, label: "Proposal Status", path: "/dashboard", color: "text-purple-500" },
    { icon: TrendingUp, label: "Impact Metrics", path: "/impact", color: "text-orange-500" },
    { icon: GitCompare, label: "Comparison", path: "/comparison", color: "text-pink-500" },
    { icon: AlertCircle, label: "File Complaint", path: "/file-complaint", color: "text-red-500" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Agency Dashboard</h1>
          <p className="text-muted-foreground">Manage projects, submit proposals, and monitor performance</p>
        </div>

        {/* Quick Access Menu */}
        <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-secondary/50">
                <CardContent className="pt-6 pb-4 text-center">
                  <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color} group-hover:scale-110 transition-transform`} />
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                Assigned Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">24</p>
              <p className="text-sm text-muted-foreground">18 active, 6 completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">8</p>
              <p className="text-sm text-muted-foreground">5 approved, 3 pending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">87%</p>
              <p className="text-sm text-muted-foreground">Above average</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">5</p>
              <p className="text-sm text-muted-foreground">3 resolved, 2 pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Map Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                Project Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">Water Supply</span>
                  <span className="font-bold text-blue-500">8 projects</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: "65%" }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">Road Construction</span>
                  <span className="font-bold text-green-500">6 projects</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: "50%" }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">Healthcare</span>
                  <span className="font-bold text-purple-500">10 projects</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: "85%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Recent Proposal Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Proposal #2025-042 Approved</p>
                    <p className="text-sm text-muted-foreground">Healthcare Center - Bhagatpur</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Proposal #2025-043 Under Review</p>
                    <p className="text-sm text-muted-foreground">Water Pipeline Extension</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Proposal #2025-044 Submitted</p>
                    <p className="text-sm text-muted-foreground">Community Hall Construction</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AgencyDashboard;
