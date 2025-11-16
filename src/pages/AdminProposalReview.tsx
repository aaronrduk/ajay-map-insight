import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle, Clock, CheckCircle2, XCircle, Edit, Save, X, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Proposal {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  document_url: string | null;
  status: string;
  admin_reply: string | null;
  reviewed_at: string | null;
  created_at: string;
  portal_users: {
    name: string;
    email: string;
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

export default function AdminProposalReview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    status: string;
    admin_reply: string;
  }>({
    status: "",
    admin_reply: ""
  });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from("agency_proposals")
        .select(`
          *,
          portal_users!agency_proposals_user_id_fkey (
            name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProposals(data || []);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (proposal: Proposal) => {
    setEditingId(proposal.id);
    setEditData({
      status: proposal.status,
      admin_reply: proposal.admin_reply || ""
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({
      status: "",
      admin_reply: ""
    });
  };

  const saveChanges = async (proposalId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("agency_proposals")
        .update({
          status: editData.status,
          admin_reply: editData.admin_reply || null,
          admin_user_id: userData?.user?.id || null,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", proposalId);

      if (error) throw error;

      toast.success("Proposal updated successfully");
      setEditingId(null);
      fetchProposals();
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast.error("Failed to update proposal");
    }
  };

  const filteredProposals = proposals.filter((proposal) => {
    if (filterStatus !== "all" && proposal.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === "pending").length,
    accepted: proposals.filter(p => p.status === "accepted").length,
    rejected: proposals.filter(p => p.status === "rejected").length
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
            Agency Proposal Review
          </h1>
          <p className="text-lg text-gray-600">
            Review and respond to agency proposals
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
        ) : filteredProposals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Proposals Found
                </h3>
                <p className="text-gray-600">
                  {filterStatus !== "all" ? "Try adjusting your filters" : "No proposals have been submitted yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">
                          {proposal.title}
                        </CardTitle>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{proposal.category}</Badge>
                        <span>•</span>
                        <span>Agency: {proposal.portal_users?.name || "Unknown"}</span>
                        <span>•</span>
                        <span>Submitted {format(new Date(proposal.created_at), "MMM dd, yyyy")}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === proposal.id ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg mb-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">Proposal Description:</p>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {proposal.description}
                        </p>
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
                        <Label>Admin Reply / Remarks *</Label>
                        <Textarea
                          value={editData.admin_reply}
                          onChange={(e) => setEditData(prev => ({ ...prev, admin_reply: e.target.value }))}
                          placeholder="Provide detailed feedback, reasons for decision, or next steps..."
                          rows={6}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => saveChanges(proposal.id)} className="gap-2">
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
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {proposal.description}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Agency Contact:</span>
                          <p className="text-gray-900">{proposal.portal_users?.email}</p>
                        </div>
                        {proposal.document_url && (
                          <div>
                            <span className="font-medium text-gray-600">Supporting Document:</span>
                            <a
                              href={proposal.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              View Document <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      {proposal.admin_reply && (
                        <div className={`p-4 rounded-lg border ${
                          proposal.status === "accepted"
                            ? "bg-green-50 border-green-200"
                            : proposal.status === "rejected"
                            ? "bg-red-50 border-red-200"
                            : "bg-blue-50 border-blue-200"
                        }`}>
                          <p className={`font-medium mb-2 ${
                            proposal.status === "accepted"
                              ? "text-green-900"
                              : proposal.status === "rejected"
                              ? "text-red-900"
                              : "text-blue-900"
                          }`}>
                            Your Response:
                          </p>
                          <p className={
                            proposal.status === "accepted"
                              ? "text-green-800"
                              : proposal.status === "rejected"
                              ? "text-red-800"
                              : "text-blue-800"
                          }>
                            {proposal.admin_reply}
                          </p>
                          {proposal.reviewed_at && (
                            <p className="text-sm text-gray-600 mt-2">
                              Reviewed on {format(new Date(proposal.reviewed_at), "PPp")}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <Button
                          onClick={() => startEditing(proposal)}
                          variant="outline"
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          {proposal.admin_reply ? "Update Review" : "Review Proposal"}
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
