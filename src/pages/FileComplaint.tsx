import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, FileText, Upload, Clock, CheckCircle2, XCircle } from "lucide-react";
import { getAllStates, getDistrictsByState } from "@/data/india-geography";
import { useSubmitGrievance, useUserGrievances } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { components } from "@/data/agencies";

const FileComplaint = () => {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    district: "",
    agency: "",
    component: "",
    grievanceType: "",
    description: "",
  });

  const submitGrievance = useSubmitGrievance();
  const { data: userGrievances } = useUserGrievances(formData.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.state || !formData.district || !formData.description) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await submitGrievance.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        district: formData.district,
        agency: formData.agency,
        component: formData.component,
        grievance_type: formData.grievanceType,
        description: formData.description,
        status: "pending",
        priority: "medium",
      });

      toast({
        title: "Grievance Submitted",
        description: `Your grievance has been registered. Reference ID: ${result.reference_id}`,
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        state: "",
        district: "",
        agency: "",
        component: "",
        grievanceType: "",
      description: "",
      });
      setSelectedState("");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your grievance",
        variant: "destructive",
      });
    }
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setFormData({ ...formData, state: value, district: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "assigned":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "closed":
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "assigned":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
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
                  <h3 className="text-lg font-semibold">Grievance Details</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="agency">Agency</Label>
                      <Input
                        id="agency"
                        value={formData.agency}
                        onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                        placeholder="Enter agency name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="component">Scheme Component *</Label>
                      <Select
                        value={formData.component}
                        onValueChange={(value) => setFormData({ ...formData, component: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select component" />
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grievanceType">Grievance Type *</Label>
                    <Select
                      value={formData.grievanceType}
                      onValueChange={(value) => setFormData({ ...formData, grievanceType: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grievance type" />
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
                        grievanceType: "",
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
              <p>• Your grievance will be assigned a unique reference ID for tracking</p>
              <p>• You will receive updates on your registered email address</p>
              <p>• False grievances may lead to legal action</p>
              <p>• For urgent matters, please contact the helpline: 1800-XXX-XXXX</p>
            </CardContent>
          </Card>

          {/* Grievance History */}
          {formData.email && userGrievances && userGrievances.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Previous Grievances</CardTitle>
                <CardDescription>Track the status of your submitted grievances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userGrievances.map((grievance) => (
                    <Card key={grievance.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{grievance.reference_id}</h4>
                              <Badge
                                variant="outline"
                                className={`flex items-center gap-1 ${getStatusColor(grievance.status)}`}
                              >
                                {getStatusIcon(grievance.status)}
                                {grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {grievance.description}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>• {grievance.grievance_type}</span>
                              <span>• {grievance.component}</span>
                              <span>• {grievance.state}, {grievance.district}</span>
                              <span>• Filed: {new Date(grievance.created_at).toLocaleDateString()}</span>
                            </div>
                            {grievance.resolution_notes && (
                              <p className="text-xs text-green-600 mt-2">
                                <strong>Resolution:</strong> {grievance.resolution_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FileComplaint;
