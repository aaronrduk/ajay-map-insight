import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle, FileText, Clock, CheckCircle2, XCircle, Edit, Save, X } from "lucide-react";
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

const statusOptions = ["pending", "in-progress", "resolved", "rejected"];
const priorityOptions = ["low", "medium", "high"];

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

export default function AdminGrievanceManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    status: string;
    priority: string;
    assigned_to: string;
    resolution_notes: string;
  }>({
    status: "",
    priority: "",
    assigned_to: "",
    resolution_notes: ""
  });
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const { data, error } = await supabase
        .from("grievances")
        .select("*")
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

  const startEditing = (grievance: Grievance) => {
    setEditingId(grievance.id);
    setEditData({
      status: grievance.status,
      priority: grievance.priority,
      assigned_to: grievance.assigned_to || "",
      resolution_notes: grievance.resolution_notes || ""
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({
      status: "",
      priority: "",
      assigned_to: "",
      resolution_notes: ""
    });
  };

  const saveChanges = async (grievanceId: string) => {
    try {
      const updateData: any = {
        status: editData.status,
        priority: editData.priority,
        assigned_to: editData.assigned_to || null,
        resolution_notes: editData.resolution_notes || null,
        updated_at: new Date().toISOString()
      };

      if (editData.status === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("grievances")
        .update(updateData)
        .eq("id", grievanceId);

      if (error) throw error;

      toast.success("Grievance updated successfully");
      setEditingId(null);
      fetchGrievances();
    } catch (error) {
      console.error("Error updating grievance:", error);
      toast.error("Failed to update grievance");
    }
  };

  const filteredGrievances = grievances.filter((grievance) => {
    if (filterStatus !== "all" && grievance.status !== filterStatus) return false;
    if (filterPriority !== "all" && grievance.priority !== filterPriority) return false;
    return true;
  });

  const stats = {
    total: grievances.length,
    pending: grievances.filter(g => g.status === "pending").length,
    inProgress: grievances.filter(g => g.status === "in-progress").length,
    resolved: grievances.filter(g => g.status === "resolved").length,
    rejected: grievances.filter(g => g.status === "rejected").length
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
            Grievance Management
          </h1>
          <p className="text-lg text-gray-600">
            View and manage all citizen grievances
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
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
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorityOptions.map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : filteredGrievances.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Grievances Found
                </h3>
                <p className="text-gray-600">
                  {filterStatus !== "all" || filterPriority !== "all"
                    ? "Try adjusting your filters"
                    : "No grievances have been submitted yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredGrievances.map((grievance) => (
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
                  {editingId === grievance.id ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Status</Label>
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
                                  {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Priority</Label>
                          <Select
                            value={editData.priority}
                            onValueChange={(value) => setEditData(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {priorityOptions.map(priority => (
                                <SelectItem key={priority} value={priority}>
                                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Assigned To</Label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          value={editData.assigned_to}
                          onChange={(e) => setEditData(prev => ({ ...prev, assigned_to: e.target.value }))}
                          placeholder="Enter officer name"
                        />
                      </div>

                      <div>
                        <Label>Resolution Notes</Label>
                        <Textarea
                          value={editData.resolution_notes}
                          onChange={(e) => setEditData(prev => ({ ...prev, resolution_notes: e.target.value }))}
                          placeholder="Enter resolution notes or action taken..."
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => saveChanges(grievance.id)} className="gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button onClick={cancelEditing} variant="outline" className="gap-2">
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {grievance.description}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Submitted By:</span>
                          <p className="text-gray-900">{grievance.name}</p>
                        </div>
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
                        <div>
                          <span className="font-medium text-gray-600">Contact:</span>
                          <p className="text-gray-900">{grievance.phone}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Email:</span>
                          <p className="text-gray-900">{grievance.email}</p>
                        </div>
                        {grievance.assigned_to && (
                          <div>
                            <span className="font-medium text-gray-600">Assigned To:</span>
                            <p className="text-gray-900">{grievance.assigned_to}</p>
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

                      <div className="pt-2 border-t">
                        <Button
                          onClick={() => startEditing(grievance)}
                          variant="outline"
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Grievance
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
