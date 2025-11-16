import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle, Clock, CheckCircle2, XCircle, Edit, Save, X } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Registration {
  id: string;
  user_id: string;
  full_name: string;
  course_id: string;
  college_id: string;
  reason: string;
  status: string;
  admin_comment: string | null;
  reviewed_at: string | null;
  created_at: string;
  portal_users: {
    name: string;
    email: string;
  } | null;
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

const statusOptions = ["pending", "accepted", "rejected"];

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
    pending: { variant: "secondary", icon: Clock },
    accepted: { variant: "outline", icon: CheckCircle2 },
    rejected: { variant: "destructive", icon: XCircle }
  };

  const { variant, icon: Icon } = config[status] || config.pending;

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function AdminCourseRegistrationReview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    status: string;
    admin_comment: string;
  }>({
    status: "",
    admin_comment: ""
  });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("course_registrations_new")
        .select(`
          *,
          portal_users!course_registrations_new_user_id_fkey (
            name,
            email
          ),
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

  const startEditing = (registration: Registration) => {
    setEditingId(registration.id);
    setEditData({
      status: registration.status,
      admin_comment: registration.admin_comment || ""
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({
      status: "",
      admin_comment: ""
    });
  };

  const saveChanges = async (registrationId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("course_registrations_new")
        .update({
          status: editData.status,
          admin_comment: editData.admin_comment || null,
          admin_user_id: userData?.user?.id || null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", registrationId);

      if (error) throw error;

      toast.success("Registration reviewed successfully");
      setEditingId(null);
      fetchRegistrations();
    } catch (error) {
      console.error("Error updating registration:", error);
      toast.error("Failed to update registration");
    }
  };

  const filteredRegistrations = registrations.filter((registration) => {
    if (filterStatus !== "all" && registration.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === "pending").length,
    accepted: registrations.filter(r => r.status === "accepted").length,
    rejected: registrations.filter(r => r.status === "rejected").length
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Course Registration Review
          </h1>
          <p className="text-lg text-gray-600">
            Review and approve citizen course registrations
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Registrations Found
                </h3>
                <p className="text-gray-600">
                  {filterStatus !== "all" ? "Try adjusting your filters" : "No registrations have been submitted yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((registration) => (
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
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{registration.courses?.component || "Component"}</Badge>
                        <span>•</span>
                        <span>Student: {registration.full_name}</span>
                        <span>•</span>
                        <span>Submitted {format(new Date(registration.created_at), "MMM dd, yyyy")}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === registration.id ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">College</p>
                          <p className="text-gray-900">{registration.colleges?.name}</p>
                          <p className="text-sm text-gray-600">
                            {registration.colleges?.district}, {registration.colleges?.state}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Contact</p>
                          <p className="text-gray-900">{registration.portal_users?.email}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-2">Student's Reason:</p>
                        <p className="text-blue-800 whitespace-pre-wrap">{registration.reason}</p>
                      </div>

                      <div>
                        <Label>Decision *</Label>
                        <Select
                          value={editData.status}
                          onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Admin Comment / Instructions *</Label>
                        <Textarea
                          value={editData.admin_comment}
                          onChange={(e) => setEditData(prev => ({ ...prev, admin_comment: e.target.value }))}
                          placeholder="Provide feedback, reason for decision, or next steps for the student..."
                          rows={6}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => saveChanges(registration.id)} className="gap-2">
                          <Save className="h-4 w-4" />
                          Save Decision
                        </Button>
                        <Button onClick={cancelEditing} variant="outline" className="gap-2">
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-600">College</p>
                          <p className="text-gray-900">{registration.colleges?.name}</p>
                          <p className="text-sm text-gray-600">
                            {registration.colleges?.district}, {registration.colleges?.state}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Contact</p>
                          <p className="text-gray-900">{registration.portal_users?.email}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 mb-2">Student's Reason:</p>
                        <p className="text-blue-800 whitespace-pre-wrap">{registration.reason}</p>
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
                            Your Response:
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

                      <div className="pt-2 border-t">
                        <Button
                          onClick={() => startEditing(registration)}
                          variant="outline"
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          {registration.admin_comment ? "Update Review" : "Review Registration"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
