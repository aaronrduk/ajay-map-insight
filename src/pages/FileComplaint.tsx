import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, FileText, Upload, Clock, CheckCircle, XCircle } from "lucide-react";
import { getAllStates, getDistrictsByState } from "@/data/india-geography";
import { submitGrievance, fetchUserGrievances, Grievance } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const FileComplaint = () => {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState("");
  const [previousGrievances, setPreviousGrievances] = useState<Grievance[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    district: "",
    agency: "",
    component: "",
    complaintType: "",
    description: "",
  });

  useEffect(() => {
    if (formData.email) {
      loadPreviousGrievances();
    }
  }, [formData.email]);

  const loadPreviousGrievances = async () => {
    try {
      const grievances = await fetchUserGrievances(formData.email);
      setPreviousGrievances(grievances);
    } catch (error) {
      console.error("Failed to load grievances:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.state || !formData.district || !formData.agency || !formData.component || !formData.description) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await submitGrievance({
        name: formData.name,
        contact: formData.email,
        state: formData.state,
        agency: formData.agency,
        component: formData.component,
        description: formData.description,
      });

      toast({
        title: "Grievance Submitted",
        description: `Your grievance has been registered successfully. Reference ID: ${result.id}`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        state: "",
        district: "",
        agency: "",
        component: "",
        complaintType: "",
        description: "",
      });
      setSelectedState("");
      loadPreviousGrievances();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setFormData({ ...formData, state: value, district: "" });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">File a Complaint</h1>
            <p className="text-muted-foreground">
              Report issues related to PM-AJAY projects and agencies
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Complaint Registration Form
              </CardTitle>
              <CardDescription>
                All fields marked with * are mandatory. Your complaint will be forwarded to the concerned authorities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State / UT *</Label>
                      <Select value={selectedState} onValueChange={handleStateChange} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
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
                      <Label htmlFor="district">District *</Label>
                      <Select
                        value={formData.district}
                        onValueChange={(value) => setFormData({ ...formData, district: value })}
                        disabled={!selectedState}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedState &&
                            getDistrictsByState(selectedState).map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Complaint Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="complaintType">Complaint Type *</Label>
                    <Select
                      value={formData.complaintType}
                      onValueChange={(value) => setFormData({ ...formData, complaintType: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select complaint type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fund-delay">Fund Disbursement Delay</SelectItem>
                        <SelectItem value="implementation-issue">Implementation Issue</SelectItem>
                        <SelectItem value="quality-concern">Quality Concern</SelectItem>
                        <SelectItem value="corruption">Corruption/Misuse of Funds</SelectItem>
                        <SelectItem value="agency-unresponsive">Agency Unresponsive</SelectItem>
                        <SelectItem value="discrimination">Discrimination</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Complaint Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your complaint in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input id="attachment" type="file" accept="image/*,.pdf,.doc,.docx" />
                      <Button type="button" variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: Images, PDF, Word documents (Max 5MB)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Submit Complaint
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        state: "",
                    district: "",
                    agency: "",
                    component: "",
                    complaintType: "",
                    description: "",
                      });
                      setSelectedState("");
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Your complaint will be assigned a unique reference ID for tracking</p>
              <p>• You will receive updates on your registered email address</p>
              <p>• False complaints may lead to legal action</p>
              <p>• For urgent matters, please contact the helpline: 1800-XXX-XXXX</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FileComplaint;
