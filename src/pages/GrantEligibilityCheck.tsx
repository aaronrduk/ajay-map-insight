import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAllStates, getDistrictsByState } from "@/data/india-geography";

const casteOptions = [
  "SC (Scheduled Caste)",
  "ST (Scheduled Tribe)",
  "OBC (Other Backward Class)",
  "General"
];

export default function GrantEligibilityCheck() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ eligible: boolean; message: string } | null>(null);
  const [selectedState, setSelectedState] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    caste: "",
    annualIncome: "",
    state: "",
    district: "",
    village: ""
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

  const checkEligibility = (caste: string, income: number): boolean => {
    if (!caste.startsWith("SC")) {
      return false;
    }
    if (income > 250000) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const income = parseFloat(formData.annualIncome);

      if (isNaN(income) || income < 0) {
        toast.error("Please enter a valid annual income");
        setLoading(false);
        return;
      }

      const isEligible = checkEligibility(formData.caste, income);

      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("eligibility_checks")
        .insert({
          user_id: userData?.user?.id || null,
          full_name: formData.fullName,
          caste: formData.caste,
          annual_income: income,
          state: formData.state,
          district: formData.district,
          village: formData.village,
          is_eligible: isEligible
        });

      if (error) throw error;

      if (isEligible) {
        setResult({
          eligible: true,
          message: "Congratulations! You are eligible for Grant-in-Aid under PM AJAY. You meet all the eligibility criteria and can proceed with the application process."
        });
        toast.success("You are eligible for the grant!");
      } else {
        let reason = "";
        if (!formData.caste.startsWith("SC")) {
          reason = "Only Scheduled Caste (SC) citizens are eligible for this grant.";
        } else if (income > 250000) {
          reason = "Your annual income exceeds the maximum limit of ₹2,50,000.";
        }

        setResult({
          eligible: false,
          message: `Unfortunately, you are not eligible for Grant-in-Aid at this time. ${reason}`
        });
        toast.error("Not eligible for the grant");
      }
    } catch (error) {
      console.error("Error saving eligibility check:", error);
      toast.error("Failed to process eligibility check");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/citizen/grant-in-aid")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Grant-in-Aid
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Check Your Eligibility</CardTitle>
            <CardDescription>
              Fill in your details to check if you qualify for Grant-in-Aid support
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caste">Caste Category *</Label>
                  <Select
                    value={formData.caste}
                    onValueChange={(value) => handleInputChange("caste", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your caste category" />
                    </SelectTrigger>
                    <SelectContent>
                      {casteOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Family Income (₹) *</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => handleInputChange("annualIncome", e.target.value)}
                    placeholder="Enter annual income in rupees"
                    min="0"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Maximum income limit: ₹2,50,000 per annum
                  </p>
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="village">Village/Town *</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => handleInputChange("village", e.target.value)}
                    placeholder="Enter your village or town name"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Checking Eligibility..." : "Check Eligibility"}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <Card className={result.eligible ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {result.eligible ? (
                        <CheckCircle2 className="h-12 w-12 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-12 w-12 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className={`text-2xl font-bold mb-2 ${result.eligible ? "text-green-900" : "text-red-900"}`}>
                          {result.eligible ? "Eligible" : "Not Eligible"}
                        </h3>
                        <p className={result.eligible ? "text-green-800" : "text-red-800"}>
                          {result.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {result.eligible && (
                  <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900">Next Steps:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-blue-800">
                      <li>Gather all required documents (Caste Certificate, Income Certificate, Aadhaar, etc.)</li>
                      <li>Visit your nearest PM AJAY center or apply online through the official portal</li>
                      <li>Fill out the complete application form with accurate details</li>
                      <li>Submit your application along with all supporting documents</li>
                      <li>Wait for verification and approval notification</li>
                    </ol>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setResult(null);
                      setFormData({
                        fullName: "",
                        caste: "",
                        annualIncome: "",
                        state: "",
                        district: "",
                        village: ""
                      });
                      setSelectedState("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Check Another Application
                  </Button>
                  <Button
                    onClick={() => navigate("/citizen/dashboard")}
                    className="flex-1"
                  >
                    Return to Dashboard
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
