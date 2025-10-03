import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { components, states, agencyMappings } from "@/data/agencies";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Proposal = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    component: "",
    state: "",
    district: "",
    village: "",
    fundsRequired: "",
    description: "",
  });
  const [autoFilledAgencies, setAutoFilledAgencies] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleComponentChange = (value: string) => {
    setFormData({ ...formData, component: value });
  };

  const handleStateChange = (value: string) => {
    setFormData({ ...formData, state: value });
  };

  const handleDistrictChange = (value: string) => {
    setFormData({ ...formData, district: value });
    
    // Auto-fill agencies based on district
    const matchingMapping = agencyMappings.find(
      (m) => m.district === value && m.state === formData.state
    );
    if (matchingMapping) {
      setAutoFilledAgencies(matchingMapping.agencies);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
      title: "Proposal Submitted Successfully",
      description: "Your proposal has been created and is pending review.",
    });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
              step >= s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s}
          </div>
          {s < 3 && (
            <div
              className={`h-1 w-16 ${
                step > s ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <CheckCircle className="h-20 w-20 text-secondary mx-auto" />
              <h2 className="text-3xl font-bold text-foreground">Proposal Submitted!</h2>
              <p className="text-muted-foreground">
                Your proposal has been successfully created and submitted for review.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg space-y-3 text-left">
                <h3 className="font-semibold text-lg">Proposal Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Component:</strong> {formData.component}</p>
                  <p><strong>Location:</strong> {formData.village}, {formData.district}, {formData.state}</p>
                  <p><strong>Funds Required:</strong> ₹{formData.fundsRequired}</p>
                  <p><strong>Responsible Agencies:</strong></p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {autoFilledAgencies.map((agency) => (
                      <Badge key={agency}>{agency}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={() => { setSubmitted(false); setStep(1); setFormData({ component: "", state: "", district: "", village: "", fundsRequired: "", description: "" }); }}>
                Create Another Proposal
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-10 w-10 text-primary" />
            Create Project Proposal
          </h1>
          <p className="text-muted-foreground">
            Submit a new project proposal for PM-AJAY implementation
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Proposal Wizard</CardTitle>
            <CardDescription>Complete all steps to submit your proposal</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepIndicator()}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 1: Component & Location</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="component">Select Component</Label>
                    <Select value={formData.component} onValueChange={handleComponentChange}>
                      <SelectTrigger id="component">
                        <SelectValue placeholder="Choose a component" />
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

                  <div className="space-y-2">
                    <Label htmlFor="state">Select State</Label>
                    <Select value={formData.state} onValueChange={handleStateChange}>
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Choose a state" />
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
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      placeholder="Enter district name"
                      value={formData.district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="village">Village / Area</Label>
                    <Input
                      id="village"
                      placeholder="Enter village or area name"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.component || !formData.state || !formData.district || !formData.village}
                    className="w-full"
                  >
                    Next: Agencies & Funds
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 2: Responsible Agencies & Funds</h3>
                  
                  <div className="space-y-2">
                    <Label>Auto-filled Responsible Agencies</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                      {autoFilledAgencies.length > 0 ? (
                        autoFilledAgencies.map((agency) => (
                          <Badge key={agency} variant="secondary">
                            {agency}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Agencies will be auto-filled based on your location selection
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funds">Funds Required (in Lakhs)</Label>
                    <Input
                      id="funds"
                      type="number"
                      placeholder="Enter amount in lakhs"
                      value={formData.fundsRequired}
                      onChange={(e) => setFormData({ ...formData, fundsRequired: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!formData.fundsRequired}
                      className="flex-1"
                    >
                      Next: Description
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Step 3: Project Description</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide a detailed description of the project..."
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!formData.description}
                      className="flex-1"
                    >
                      Submit Proposal
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Proposal;
