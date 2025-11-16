import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ArrowLeft, Loader2, FileUp } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const proposalCategories = [
  "Infrastructure Development",
  "Education & Skill Training",
  "Healthcare Services",
  "Digital Connectivity",
  "Sanitation & Water Supply",
  "Community Development",
  "Livelihood Programs",
  "Women Empowerment",
  "Youth Development",
  "Other"
];

export default function AgencyProposalSubmit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [proposalId, setProposalId] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    documentUrl: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user?.id) {
        toast.error("Please log in to submit a proposal");
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("agency_proposals")
        .insert({
          user_id: userData.user.id,
          title: formData.title,
          category: formData.category,
          description: formData.description,
          document_url: formData.documentUrl || null,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      setProposalId(data.id);
      setSubmitted(true);
      toast.success("Proposal submitted successfully!");
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast.error("Failed to submit proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/agency-dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Submit Proposal</CardTitle>
            <CardDescription>
              Submit your project proposal for review and approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Proposal Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter a clear, descriptive title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select proposal category" />
                    </SelectTrigger>
                    <SelectContent>
                      {proposalCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Proposal Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Provide a comprehensive description of your proposal including objectives, implementation plan, expected outcomes, and budget requirements..."
                    rows={10}
                    required
                    minLength={100}
                  />
                  <p className="text-sm text-gray-500">
                    Minimum 100 characters. Be detailed and specific.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentUrl">Supporting Document URL (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="documentUrl"
                      type="url"
                      value={formData.documentUrl}
                      onChange={(e) => handleInputChange("documentUrl", e.target.value)}
                      placeholder="https://example.com/document.pdf"
                    />
                    <Button type="button" variant="outline" className="gap-2">
                      <FileUp className="h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Provide a link to any supporting documents (PDF, presentations, etc.)
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Before Submitting:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Ensure all information is accurate and complete</li>
                    <li>✓ Review your proposal for clarity and feasibility</li>
                    <li>✓ Include specific timelines and budget estimates if applicable</li>
                    <li>✓ Attach relevant supporting documents</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Submitting..." : "Submit Proposal"}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 className="h-12 w-12 text-green-600 flex-shrink-0" />
                      <div>
                        <h3 className="text-2xl font-bold text-green-900 mb-2">
                          Proposal Submitted Successfully
                        </h3>
                        <p className="text-green-800 mb-4">
                          Your proposal has been submitted for admin review. You will be notified
                          once a decision is made.
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-green-300">
                          <p className="text-sm text-gray-600 mb-1">Proposal ID</p>
                          <p className="text-lg font-mono font-bold text-gray-900">{proposalId}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900">What Happens Next?</h4>
                  <ol className="list-decimal list-inside space-y-2 text-blue-800">
                    <li>Your proposal will be reviewed by the admin team</li>
                    <li>Admin may request additional information or clarification</li>
                    <li>You will receive a notification via email when a decision is made</li>
                    <li>Check "My Proposals" section to track status and view admin response</li>
                    <li>Review typically takes 5-10 business days</li>
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate("/agency/proposals")}
                    className="flex-1"
                  >
                    View My Proposals
                  </Button>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        title: "",
                        category: "",
                        description: "",
                        documentUrl: ""
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Submit Another
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
