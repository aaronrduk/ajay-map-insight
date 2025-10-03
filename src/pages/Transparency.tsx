import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Users, FileText, CheckCircle } from "lucide-react";
import { agencyMappings, districtData } from "@/data/agencies";
import { useToast } from "@/hooks/use-toast";

const Transparency = () => {
  const { toast } = useToast();
  const [searchDistrict, setSearchDistrict] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [grievanceSubmitted, setGrievanceSubmitted] = useState(false);
  const [grievanceForm, setGrievanceForm] = useState({
    name: "",
    issue: "",
  });

  const handleSearch = () => {
    const result = districtData.find(
      (d) => d.district.toLowerCase().includes(searchDistrict.toLowerCase())
    );
    if (result) {
      setSearchResult(result);
      const projectsInDistrict = agencyMappings.filter(
        (m) => m.district === result.district
      );
      setSearchResult({ ...result, projects: projectsInDistrict });
    } else {
      setSearchResult(null);
      toast({
        title: "No results found",
        description: "Please try another district name.",
        variant: "destructive",
      });
    }
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGrievanceSubmitted(true);
    toast({
      title: "Grievance Submitted",
      description: "Your grievance has been recorded. Reference ID: GRV2025001",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <Users className="h-10 w-10 text-secondary" />
            Public Transparency Portal
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access information about PM-AJAY projects in your area and submit grievances
          </p>
        </div>

        {/* Search Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Find Projects in Your Area
            </CardTitle>
            <CardDescription>
              Enter your district name to see implementing agencies and ongoing projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Enter district name (e.g., Kollam, Chennai, Lucknow)"
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {searchResult && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">
                    {searchResult.district}, {searchResult.state}
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">SC Population</p>
                      <p className="font-semibold">{searchResult.scPopulation.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Projects</p>
                      <p className="font-semibold">{searchResult.projects.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Villages Covered</p>
                      <p className="font-semibold">{searchResult.villages.length}</p>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Responsible Agencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.agencies.map((agency: string) => (
                        <Badge key={agency} variant="secondary" className="text-sm">
                          {agency}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {searchResult.projects.map((project: any) => (
                        <div
                          key={project.id}
                          className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{project.component}</h4>
                              <p className="text-sm text-muted-foreground">{project.village}</p>
                            </div>
                            <Badge
                              className={
                                project.status === "Completed"
                                  ? "bg-secondary text-secondary-foreground"
                                  : project.status === "Ongoing"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-accent text-accent-foreground"
                              }
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>
                              Allocated: ₹{(project.fundsAllocated / 100000).toFixed(1)}L
                            </span>
                            <span>
                              Utilized: ₹{(project.fundsUtilized / 100000).toFixed(1)}L
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grievance Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Submit a Grievance
            </CardTitle>
            <CardDescription>
              Report issues or concerns related to PM-AJAY implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {grievanceSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="h-16 w-16 text-secondary mx-auto" />
                <h3 className="text-2xl font-semibold">Grievance Submitted Successfully</h3>
                <p className="text-muted-foreground">
                  Your grievance has been recorded and will be reviewed by the concerned authorities.
                </p>
                <div className="p-4 bg-muted/30 rounded-lg inline-block">
                  <p className="text-sm text-muted-foreground">Reference ID</p>
                  <p className="text-xl font-bold text-primary">GRV2025001</p>
                </div>
                <Button
                  onClick={() => {
                    setGrievanceSubmitted(false);
                    setGrievanceForm({ name: "", issue: "" });
                  }}
                  variant="outline"
                >
                  Submit Another Grievance
                </Button>
              </div>
            ) : (
              <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={grievanceForm.name}
                    onChange={(e) =>
                      setGrievanceForm({ ...grievanceForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue">Describe Your Issue</Label>
                  <Textarea
                    id="issue"
                    placeholder="Provide details about your grievance..."
                    rows={5}
                    value={grievanceForm.issue}
                    onChange={(e) =>
                      setGrievanceForm({ ...grievanceForm, issue: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Submit Grievance
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                For urgent queries, contact: <strong>1800-XXX-XXXX</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Email: <strong>pmajay-support@mosje.gov.in</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transparency;
