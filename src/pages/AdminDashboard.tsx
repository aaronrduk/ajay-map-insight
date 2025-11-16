import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, LayoutDashboard, Building2, Users, Eye, FileText, GitCompare, Settings, MessageSquare, IndianRupee, GraduationCap, Database } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const menuItems = [
    { icon: Home, label: "Home", path: "/admin-dashboard", color: "text-primary" },
    { icon: Database, label: "PM-AJAY Data Sync", path: "/admin/pm-ajay-sync", color: "text-blue-600" },
    { icon: GraduationCap, label: "Courses & Colleges Sync", path: "/admin/courses-sync", color: "text-emerald-600" },
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", color: "text-blue-500" },
    { icon: MessageSquare, label: "Grievance Management", path: "/admin/grievances", color: "text-red-500" },
    { icon: IndianRupee, label: "Grant Reports", path: "/admin/grant-reports", color: "text-emerald-600" },
    { icon: FileText, label: "Proposal Review", path: "/admin/proposals", color: "text-violet-600" },
    { icon: GraduationCap, label: "Registration Review", path: "/admin/registrations", color: "text-cyan-600" },
    { icon: Building2, label: "Manage Agencies", path: "/mapping", color: "text-green-500" },
    { icon: Users, label: "Manage Citizens", path: "/transparency", color: "text-purple-500" },
    { icon: Eye, label: "Transparency Control", path: "/transparency", color: "text-orange-500" },
    { icon: GitCompare, label: "Comparison", path: "/comparison", color: "text-yellow-500" },
    { icon: Settings, label: "System Settings", path: "/about", color: "text-gray-500" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete system oversight, approvals, and analytics</p>
        </div>

        {/* Quick Access Menu */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-accent/50">
                <CardContent className="pt-6 pb-4 text-center">
                  <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color} group-hover:scale-110 transition-transform`} />
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Portal-Wide Analytics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">156</p>
              <p className="text-sm text-muted-foreground">Across all agencies</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-500" />
                Active Agencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">28</p>
              <p className="text-sm text-muted-foreground">Managing 250+ villages</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Registered Citizens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">5,240</p>
              <p className="text-sm text-muted-foreground">+120 this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-500" />
                Avg Transparency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">94%</p>
              <p className="text-sm text-muted-foreground">Excellent score</p>
            </CardContent>
          </Card>
        </div>

        {/* Proposal Approvals & Activity Logs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div>
                    <p className="font-semibold text-foreground">Proposal #2025-045</p>
                    <p className="text-sm text-muted-foreground">Water Supply - Ramgarh District</p>
                  </div>
                  <Link to="/proposal">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                      Review
                    </button>
                  </Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div>
                    <p className="font-semibold text-foreground">Proposal #2025-046</p>
                    <p className="text-sm text-muted-foreground">Healthcare Center - Sitapur</p>
                  </div>
                  <Link to="/proposal">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                      Review
                    </button>
                  </Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div>
                    <p className="font-semibold text-foreground">Proposal #2025-047</p>
                    <p className="text-sm text-muted-foreground">Road Extension - Laxmipur</p>
                  </div>
                  <Link to="/proposal">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                      Review
                    </button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Recent Activity Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Agency "PWD North" created proposal</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Citizen "Ramesh Kumar" filed complaint</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-purple-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Proposal #2025-042 approved</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">New agency "Rural Dev South" registered</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaint Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              Complaint Management Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-muted-foreground">Pending Complaints</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-2xl font-bold text-foreground">156</p>
                <p className="text-sm text-muted-foreground">Resolved This Month</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-2xl font-bold text-foreground">92%</p>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
