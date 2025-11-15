import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { checkGrantEligibility, GrantEligibility as GrantEligibilityType } from "@/lib/api";
import { getAllStates } from "@/data/india-geography";
import { CheckCircle, XCircle, FileText, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const GrantEligibility = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    age: "",
    state: "",
    category: "",
    income: "",
    component: "",
  });
  const [result, setResult] = useState<GrantEligibilityType | null>(null);
  const [loading, setLoading] = useState(false);

  const states = getAllStates();
  const categories = ["SC", "ST", "OBC", "General"];
  const components = [
    "Adarsh Gram",
    "Hostels",
    "Skill Development",
    "Livelihood Programs",
    "Infrastructure Development",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.age || !formData.state || !formData.category || !formData.income || !formData.component) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const eligibility = await checkGrantEligibility({
        age: parseInt(formData.age),
        state: formData.state,
        category: formData.category,
        income: parseInt(formData.income),
        component: formData.component,
      });
      setResult(eligibility);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check eligibility",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      age: "",
      state: "",
      category: "",
      income: "",
      component: "",
    });
    setResult(null);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Grant Eligibility Checker
          </h1>
          <p className="text-muted-foreground text-lg">
            Check your eligibility for PM-AJAY scheme grants
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-6">
          {/* Eligibility Form */}
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Form</CardTitle>
              <CardDescription>Enter your details to check eligibility</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Enter your age"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income">Annual Income (₹) *</Label>
                  <Input
                    id="income"
                    type="number"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                    placeholder="Enter annual income"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="component">Scheme Component *</Label>
                  <Select value={formData.component} onValueChange={(value) => setFormData({ ...formData, component: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Component" />
                    </SelectTrigger>
                    <SelectContent>
                      {components.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Checking..." : "Check Eligibility"}
                  </Button>
                  {result && (
                    <Button type="button" variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Result Display */}
          {result && (
            <Card className={result.eligible ? "border-success/50" : "border-destructive/50"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.eligible ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-success" />
                      You are Eligible!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-destructive" />
                      Not Eligible
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {result.eligible
                    ? "You meet the eligibility criteria for this scheme"
                    : "Unfortunately, you do not meet the current eligibility criteria"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {result.eligible && (
                  <>
                    {/* Grant Amount */}
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Grant Amount</p>
                      <p className="text-3xl font-bold text-success">₹{result.amount.toLocaleString()}</p>
                    </div>

                    {/* Required Documents */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Required Documents</h3>
                      </div>
                      <div className="space-y-2">
                        {result.documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Eligible Agencies */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">Eligible Agencies</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.agencies.map((agency, index) => (
                          <Badge key={index} variant="outline">
                            {agency}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Next Steps</h3>
                      <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                        <li>Gather all required documents</li>
                        <li>Visit the nearest eligible agency</li>
                        <li>Submit your application with documents</li>
                        <li>Track your application status</li>
                      </ol>
                    </div>
                  </>
                )}

                {!result.eligible && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Common Reasons</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Age outside the eligible range (18-45 years)</li>
                      <li>Annual income exceeds ₹3,00,000</li>
                      <li>Category requirements not met</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!result && (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Fill in the form to check your eligibility
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GrantEligibility;
