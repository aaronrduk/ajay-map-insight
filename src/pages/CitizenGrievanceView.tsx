import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, AlertCircle, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Grievance {
  id: string;
  reference_id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  component: string;
  grievance_type: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
    pending: { variant: "secondary", icon: Clock },
    "in-progress": { variant: "default", icon: FileText },
    resolved: { variant: "outline", icon: CheckCircle2 },
    rejected: { variant: "destructive", icon: XCircle }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
    </Badge>
  );
};

const getPriorityBadge = (priority: string) => {
  const colors: Record<string, string> = {
    low: "bg-blue-100 text-blue-800 border-blue-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    high: "bg-red-100 text-red-800 border-red-300"
  };

  return (
    <Badge variant="outline" className={colors[priority] || colors.medium}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </Badge>
  );
};

export default function CitizenGrievanceView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!userData?.user?.id) {
        toast.error("Please log in to view your grievances");
        navigate("/login");
        return;
      }

      const { data: portalUser } = await supabase
        .from("portal_users")
        .select("email")
        .eq("id", userData.user.id)
        .single();

      const email = portalUser?.email || "";
      setUserEmail(email);

      const { data, error } = await supabase
        .from("grievances")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGrievances(data || []);
    } catch (error) {
      console.error("Error fetching grievances:", error);
      toast.error("Failed to load grievances");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/citizen/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate("/citizen/grievance")}>
            Submit New Grievance
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Grievances
          </h1>
          <p className="text-lg text-gray-600">
            Track and manage all your submitted grievances
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : grievances.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Grievances Found
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't submitted any grievances yet.
                </p>
                <Button onClick={() => navigate("/citizen/grievance")}>
                  Submit Your First Grievance
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {grievances.map((grievance) => (
              <Card key={grievance.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">
                          {grievance.grievance_type}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm">
                          {grievance.reference_id}
                        </span>
                        <span>•</span>
                        <span>{grievance.component}</span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(grievance.status)}
                      {getPriorityBadge(grievance.priority)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {grievance.description}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Location:</span>
                        <p className="text-gray-900">
                          {grievance.district}, {grievance.state}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Submitted:</span>
                        <p className="text-gray-900">
                          {format(new Date(grievance.created_at), "PPp")}
                        </p>
                      </div>
                      {grievance.assigned_to && (
                        <div>
                          <span className="font-medium text-gray-600">Assigned To:</span>
                          <p className="text-gray-900">{grievance.assigned_to}</p>
                        </div>
                      )}
                      {grievance.resolved_at && (
                        <div>
                          <span className="font-medium text-gray-600">Resolved:</span>
                          <p className="text-gray-900">
                            {format(new Date(grievance.resolved_at), "PPp")}
                          </p>
                        </div>
                      )}
                    </div>

                    {grievance.resolution_notes && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-900 mb-2">Resolution Notes:</p>
                        <p className="text-green-800 whitespace-pre-wrap">
                          {grievance.resolution_notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t text-sm text-gray-500">
                      <span>Contact: {grievance.phone}</span>
                      <span>•</span>
                      <span>{grievance.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
