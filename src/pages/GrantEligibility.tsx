import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGrantEligibility, useAgencies } from "@/hooks/use-api";
import { CheckCircle, XCircle, DollarSign, FileText, Building2 } from "lucide-react";
import { getAllStates } from "@/data/india-geography";
import { components } from "@/data/agencies";
import { Badge } from "@/components/ui/badge";

const GrantEligibility = () => {
  const [formData, setFormData] = useState({
    age: "",
    state: "",
    category: "",
    income: "",
    component: "",
  });
  const [result, setResult] = useState<any>(null);

  const checkEligibility = useGrantEligibility();
  const { data: agencies } = useAgencies();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.age || !formData.state || !formData.category || !formData.income || !formData.component) {
      return;
    }

    try {
      const response = await checkEligibility.mutateAsync({
        age: Number(formData.age),
        state: formData.state,
        category: formData.category,
        income: Number(formData.income),
        component: formData.component,
      });

      setResult(response);
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };

  const handleReset = () => {
    setFormData({ age: "", state: "", category: "", income: "", component: "" });
    setResult(null);
  };

  const eligibleAgencies = agencies?.filter(
    (agency: any) => agency.state === formData.state && agency.is_verified
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
              <DollarSign className="h-10 w-10 text-primary" />
              Grant Eligibility Calculator
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Check your eligibility for PM-AJAY scheme grants and find out the benefits you qualify for
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Enter Your Details</CardTitle>
                  <CardDescription>Fill in the information below to check eligibility</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          type="number"
                          min="1"
                          max="100"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          placeholder="Enter your age"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SC">Scheduled Caste (SC)</SelectItem>
                            <SelectItem value="ST">Scheduled Tribe (ST)</SelectItem>
                            <SelectItem value="OBC">Other Backward Class (OBC)</SelectItem>
                            <SelectItem value="General">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State / UT *</Label>
                      <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })} required>
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select your state" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllStates().map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="income">Annual Family Income (₹) *</Label>
                      <Input
                        id="income"
                        type="number"
                        min="0"
                        value={formData.income}
                        onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                        placeholder="Enter annual income"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Enter your total family income per year</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="component">Scheme Component *</Label>
                      <Select value={formData.component} onValueChange={(value) => setFormData({ ...formData, component: value })} required>
                        <SelectTrigger id="component">
                          <SelectValue placeholder="Select scheme component" />
                        </SelectTrigger>
                        <SelectContent>
                          {components.map((comp) => (
                            <SelectItem key={comp} value={comp}>
                              {comp}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1" disabled={checkEligibility.isPending}>
                        {checkEligibility.isPending ? "Checking..." : "Check Eligibility"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleReset}>
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Information Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      1
                    </div>
                    <p>Enter your personal details and income information</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      2
                    </div>
                    <p>Select the scheme component you're interested in</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      3
                    </div>
                    <p>Get instant eligibility results with grant amounts</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      4
                    </div>
                    <p>View required documents and eligible agencies</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Important Note</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>• Eligibility criteria may vary by state and component</p>
                  <p>• Grant amounts are subject to government approval</p>
                  <p>• Additional verification may be required</p>
                  <p>• Contact local agencies for detailed guidance</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <Card className={`border-2 ${result.eligible ? "border-green-500" : "border-red-500"}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.eligible ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <span className="text-green-600">You are Eligible!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-600" />
                      <span className="text-red-600">Not Eligible</span>
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  Based on the information provided, here are your eligibility results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {result.eligible ? (
                  <>
                    {/* Grant Amount */}
                    <div className="p-6 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-10 w-10 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Grant Amount You Can Receive</p>
                          <p className="text-3xl font-bold text-green-600">
                            ₹{result.grant_amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Required Documents */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Required Documents</h3>
                      </div>
                      {result.required_documents && result.required_documents.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-2">
                          {result.required_documents.map((doc: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                              <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                              <span className="text-sm">{doc}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Standard identity and income proof documents required</p>
                      )}
                    </div>

                    {/* Eligible Agencies */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Eligible Agencies in {formData.state}</h3>
                      </div>
                      {eligibleAgencies && eligibleAgencies.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-3">
                          {eligibleAgencies.slice(0, 6).map((agency: any) => (
                            <Card key={agency.id}>
                              <CardContent className="pt-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold">{agency.name}</h4>
                                    {agency.is_verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{agency.type}</p>
                                  {agency.phone && <p className="text-xs text-muted-foreground">📞 {agency.phone}</p>}
                                  {agency.email && <p className="text-xs text-muted-foreground">✉️ {agency.email}</p>}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Contact your local district collector or social welfare office for assistance
                        </p>
                      )}
                    </div>

                    {/* Next Steps */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h3 className="font-semibold mb-2">Next Steps</h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Gather all required documents</li>
                        <li>Contact one of the eligible agencies listed above</li>
                        <li>Submit your application with supporting documents</li>
                        <li>Wait for verification and approval</li>
                        <li>Receive your grant upon successful approval</li>
                      </ol>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Unfortunately, you don't meet the eligibility criteria for the selected scheme component.
                    </p>
                    <div className="space-y-2 text-sm text-left max-w-md mx-auto">
                      <p className="font-semibold">Possible reasons:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Age criteria not met</li>
                        <li>Income exceeds the maximum limit</li>
                        <li>Category-specific restrictions</li>
                        <li>Scheme not available in your state</li>
                      </ul>
                      <p className="mt-4 text-muted-foreground">
                        Try checking eligibility for different scheme components or contact your local welfare office for more options.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GrantEligibility;
