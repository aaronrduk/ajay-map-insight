import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Map, Eye, AlertCircle, TrendingUp, Info, IndianRupee, MessageSquare, FileSearch } from "lucide-react";
import { Link } from "react-router-dom";

const CitizenDashboard = () => {
  const menuItems = [
    { icon: Home, label: "Home", path: "/citizen-dashboard", color: "text-primary" },
    { icon: IndianRupee, label: "Grant-in-Aid", path: "/citizen/grant-in-aid", color: "text-emerald-600" },
    { icon: Map, label: "View Map", path: "/map", color: "text-blue-500" },
    { icon: Eye, label: "Transparency Portal", path: "/transparency", color: "text-green-500" },
    { icon: MessageSquare, label: "Submit Grievance", path: "/citizen/grievance", color: "text-orange-500" },
    { icon: FileSearch, label: "View My Grievances", path: "/citizen/grievance/view", color: "text-violet-500" },
    { icon: AlertCircle, label: "File Complaint", path: "/file-complaint", color: "text-red-500" },
    { icon: TrendingUp, label: "Impact Metrics", path: "/impact", color: "text-purple-500" },
    { icon: Info, label: "About", path: "/about", color: "text-gray-500" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Citizen Dashboard</h1>
          <p className="text-muted-foreground">Track local projects, view transparency data, and file complaints</p>
        </div>

        {/* Quick Access Menu */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary/50">
                <CardContent className="pt-6 pb-4 text-center">
                  <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color} group-hover:scale-110 transition-transform`} />
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                Local Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">12</p>
              <p className="text-sm text-muted-foreground">Active projects in your area</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-green-500" />
                My Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">3</p>
              <p className="text-sm text-muted-foreground">2 pending, 1 resolved</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                Transparency Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground mb-1">92%</p>
              <p className="text-sm text-muted-foreground">Excellent transparency</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Project Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Water Supply Project - Phase 2 Completed</p>
                  <p className="text-sm text-muted-foreground">Village: Rampur | Completed on 5th Jan 2025</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Road Construction - 60% Complete</p>
                  <p className="text-sm text-muted-foreground">Village: Laxmipur | Expected: 28th Feb 2025</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2"></div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Healthcare Center - Planning Stage</p>
                  <p className="text-sm text-muted-foreground">Village: Sitapur | Start Date: 15th Mar 2025</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CitizenDashboard;
