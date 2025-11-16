import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, AlertCircle, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Registration {
  id: string;
  full_name: string;
  course_id: string;
  college_id: string;
  reason: string;
  status: string;
  admin_comment: string | null;
  reviewed_at: string | null;
  created_at: string;
  courses: {
    course_name: string;
    component: string;
  } | null;
  colleges: {
    name: string;
    district: string;
    state: string;
  } | null;
}

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, color: string }> = {
    pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
    accepted: { variant: "outline", icon: CheckCircle2, color: "text-green-600" },
    rejected: { variant: "destructive", icon: XCircle, color: "text-red-600" }
  };

  const { variant, icon: Icon, color } = config[status] || config.pending;

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className={`h-3 w-3 ${color}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function CitizenMyRegistrations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user?.id) {
        toast.error("Please log in to view registrations");
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("course_registrations_new")
        .select(`
          *,
          courses!course_registrations_new_course_id_fkey (
            course_name,
            component
          ),
          colleges!course_registrations_new_college_id_fkey (
            name,
            district,
            state
          )
        `)
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load registrations");
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
            onClick={() => navigate("/citizen-dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate("/citizen/course-registration")} className="gap-2">
            <Plus className="h-4 w-4" />
            Register for New Course
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Course Registrations
          </h1>
          <p className="text-lg text-gray-600">
            Track and manage all your course registration applications
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : registrations.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Registrations Found
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't registered for any courses yet.
                </p>
                <Button onClick={() => navigate("/citizen/course-registration")}>
                  Register for a Course
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {registration.courses?.course_name || "Course"}
                        </CardTitle>
                        {getStatusBadge(registration.status)}
                      </div>
                      <CardDescription>
                        <Badge variant="outline">{registration.courses?.component || "Component"}</Badge>
                        <span className="ml-2">•</span>
                        <span className="ml-2">
                          Submitted {format(new Date(registration.created_at), "MMM dd, yyyy")}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-600">College</p>
                        <p className="text-gray-900">
                          {registration.colleges?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {registration.colleges?.district}, {registration.colleges?.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Applicant</p>
                        <p className="text-gray-900">{registration.full_name}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-2">Your Reason:</p>
                      <p className="text-blue-800 whitespace-pre-wrap">
                        {registration.reason}
                      </p>
                    </div>

                    {registration.admin_comment && (
                      <div className={`p-4 rounded-lg border ${
                        registration.status === "accepted"
                          ? "bg-green-50 border-green-200"
                          : registration.status === "rejected"
                          ? "bg-red-50 border-red-200"
                          : "bg-blue-50 border-blue-200"
                      }`}>
                        <p className={`font-medium mb-2 ${
                          registration.status === "accepted"
                            ? "text-green-900"
                            : registration.status === "rejected"
                            ? "text-red-900"
                            : "text-blue-900"
                        }`}>
                          Admin Response:
                        </p>
                        <p className={
                          registration.status === "accepted"
                            ? "text-green-800"
                            : registration.status === "rejected"
                            ? "text-red-800"
                            : "text-blue-800"
                        }>
                          {registration.admin_comment}
                        </p>
                        {registration.reviewed_at && (
                          <p className="text-sm text-gray-600 mt-2">
                            Reviewed on {format(new Date(registration.reviewed_at), "PPp")}
                          </p>
                        )}
                      </div>
                    )}

                    {registration.status === "pending" && !registration.admin_comment && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⏳ Your registration is under review. You will be notified once the admin makes a decision.
                        </p>
                      </div>
                    )}

                    {registration.status === "accepted" && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-900 mb-2">✓ Next Steps:</p>
                        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                          <li>Check your email for enrollment instructions</li>
                          <li>Contact the college for admission formalities</li>
                          <li>Prepare required documents for enrollment</li>
                        </ul>
                      </div>
                    )}
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
