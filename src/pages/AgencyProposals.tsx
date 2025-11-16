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

interface Proposal {
  id: string;
  title: string;
  category: string;
  description: string;
  document_url: string | null;
  status: string;
  admin_reply: string | null;
  reviewed_at: string | null;
  created_at: string;
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

export default function AgencyProposals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user?.id) {
        toast.error("Please log in to view proposals");
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("agency_proposals")
        .select("*")
        .eq("user_id", userData.user.id)
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/agency-dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate("/agency/proposals/submit")} className="gap-2">
            <Plus className="h-4 w-4" />
            Submit New Proposal
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Proposals
          </h1>
          <p className="text-lg text-gray-600">
            Track and manage all your submitted proposals
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : proposals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Proposals Found
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't submitted any proposals yet.
                </p>
                <Button onClick={() => navigate("/agency/proposals/submit")}>
                  Submit Your First Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
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
                      <CardDescription>
                        <Badge variant="outline">{proposal.category}</Badge>
                        <span className="ml-2">•</span>
                        <span className="ml-2">
                          Submitted {format(new Date(proposal.created_at), "MMM dd, yyyy")}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {proposal.description}
                      </p>
                    </div>

                    {proposal.document_url && (
                      <div>
                        <a
                          href={proposal.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Supporting Document →
                        </a>
                      </div>
                    )}

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
                          Admin Response:
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

                    {proposal.status === "pending" && !proposal.admin_reply && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⏳ Your proposal is under review. You will be notified once the admin makes a decision.
                        </p>
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
