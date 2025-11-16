import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAllStates, getDistrictsByState } from "@/data/india-geography";

const grievanceCategories = [
  "Delayed Fund Disbursement",
  "Incorrect Beneficiary Selection",
  "Poor Quality of Infrastructure",
  "Lack of Proper Monitoring",
  "Corruption or Fraud",
  "Access Denied to Services",
  "Document Verification Issues",
  "Other"
];

const pmAjayComponents = [
  "Education and Skill Development",
  "Digital Connectivity",
  "Health and Wellness",
  "Sanitation and Water",
  "Infrastructure Development",
  "Livelihood and Employment",
  "Other"
];

export default function CitizenGrievance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    district: "",
    component: "",
    grievanceType: "",
    description: ""
  });

  const states = getAllStates();
  const districts = selectedState ? getDistrictsByState(selectedState) : [];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "state") {
      setSelectedState(value);
      setFormData(prev => ({ ...prev, district: "" }));
    }
  };

  const generateReferenceId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GRV-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const refId = generateReferenceId();

      const { error } = await supabase
        .from("grievances")
        .insert({
          reference_id: refId,
          user_id: userData?.user?.id || null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          state: formData.state,
          district: formData.district,
          component: formData.component,
          grievance_type: formData.grievanceType,
          description: formData.description,
          status: "pending"
        });

      if (error) throw error;

      setReferenceId(refId);
      setSubmitted(true);
      toast.success("Grievance submitted successfully!");
    } catch (error) {
      console.error("Error submitting grievance:", error);
      toast.error("Failed to submit grievance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/citizen/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Submit Grievance</CardTitle>
            <CardDescription>
              Report any issues or concerns related to PM AJAY schemes and services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="10-digit mobile number"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => handleInputChange("state", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => handleInputChange("district", value)}
                      required
                      disabled={!selectedState}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="component">PM AJAY Component *</Label>
                  <Select
                    value={formData.component}
                    onValueChange={(value) => handleInputChange("component", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the related component" />
                    </SelectTrigger>
                    <SelectContent>
                      {pmAjayComponents.map((component) => (
                        <SelectItem key={component} value={component}>
                          {component}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grievanceType">Grievance Category *</Label>
                  <Select
                    value={formData.grievanceType}
                    onValueChange={(value) => handleInputChange("grievanceType", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grievance category" />
                    </SelectTrigger>
                    <SelectContent>
                      {grievanceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Please provide a detailed description of your grievance..."
                    rows={6}
                    required
                    minLength={50}
                  />
                  <p className="text-sm text-gray-500">
                    Minimum 50 characters. Please provide as much detail as possible.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Submitting..." : "Submit Grievance"}
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
                          Grievance Submitted Successfully
                        </h3>
                        <p className="text-green-800 mb-4">
                          Your grievance has been registered and is under review. You can track
                          the status using your reference ID.
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-green-300">
                          <p className="text-sm text-gray-600 mb-1">Reference ID</p>
                          <p className="text-2xl font-bold text-gray-900">{referenceId}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900">What Happens Next?</h4>
                  <ol className="list-decimal list-inside space-y-2 text-blue-800">
                    <li>Your grievance will be reviewed by the concerned department</li>
                    <li>You will receive updates via email and SMS</li>
                    <li>The assigned officer will investigate your complaint</li>
                    <li>You can track the status in "View My Grievances" section</li>
                    <li>Resolution typically takes 15-30 working days</li>
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate("/citizen/grievance/view")}
                    className="flex-1"
                  >
                    View My Grievances
                  </Button>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        state: "",
                        district: "",
                        component: "",
                        grievanceType: "",
                        description: ""
                      });
                      setSelectedState("");
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
