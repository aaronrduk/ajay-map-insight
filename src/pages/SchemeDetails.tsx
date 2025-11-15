import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart } from "@/components/charts/BarChart";
import { fetchSchemeData, SchemeData } from "@/lib/api";
import { getAllStates } from "@/data/india-geography";
import { Users, Building2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SchemeDetails = () => {
  const [component, setComponent] = useState("Adarsh Gram");
  const [state, setState] = useState("");
  const [schemeData, setSchemeData] = useState<SchemeData | null>(null);
  const [loading, setLoading] = useState(false);

  const states = getAllStates();
  const components = [
    "Adarsh Gram",
    "Hostels for SC Students",
    "Skill Development",
    "Livelihood Programs",
    "Infrastructure Development",
  ];

  useEffect(() => {
    loadData();
  }, [component, state]);

  const loadData = async () => {
    if (!component || !state) return;
    
    setLoading(true);
    try {
      const data = await fetchSchemeData(component, state);
      setSchemeData(data);
    } catch (error) {
      console.error("Failed to load scheme data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Scheme Details & Beneficiaries
          </h1>
          <p className="text-muted-foreground text-lg">
            Detailed insights into scheme implementation and beneficiary coverage
          </p>
        </div>

        {/* Selection Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Select Scheme & Location</CardTitle>
            <CardDescription>Choose a component and state to view detailed analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scheme Component</Label>
                <Select value={component} onValueChange={setComponent}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>State</Label>
                <Select value={state} onValueChange={setState}>
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
            </div>
          </CardContent>
        </Card>

        {schemeData && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Beneficiaries</p>
                      <p className="text-4xl font-bold text-primary">
                        {schemeData.beneficiaries.toLocaleString()}
                      </p>
                    </div>
                    <Users className="h-12 w-12 text-primary/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Agencies Involved</p>
                      <p className="text-4xl font-bold text-accent">
                        {schemeData.agencies.length}
                      </p>
                    </div>
                    <Building2 className="h-12 w-12 text-accent/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-success/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Implementation Years</p>
                      <p className="text-4xl font-bold" style={{ color: "hsl(var(--success))" }}>
                        {schemeData.yearWiseData.length}
                      </p>
                    </div>
                    <TrendingUp className="h-12 w-12" style={{ color: "hsl(var(--success) / 0.3)" }} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agencies List */}
            <Card>
              <CardHeader>
                <CardTitle>Implementing Agencies</CardTitle>
                <CardDescription>Organizations responsible for scheme delivery in {schemeData.state}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {schemeData.agencies.map((agency) => (
                    <Badge key={agency} variant="outline" className="text-base px-4 py-2">
                      {agency}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Year-wise Implementation Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Year-wise Beneficiary Growth</CardTitle>
                <CardDescription>Track the growth of beneficiaries over the years</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={schemeData.yearWiseData}
                  dataKeys={[
                    { key: "count", color: "hsl(var(--primary))", name: "Beneficiaries" },
                  ]}
                  xAxisKey="year"
                  height={350}
                />
              </CardContent>
            </Card>

            {/* Scheme Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Scheme Overview</CardTitle>
                <CardDescription>{component} in {schemeData.state}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground">
                    The <strong>{component}</strong> scheme has been successfully implemented in{" "}
                    <strong>{schemeData.state}</strong> through {schemeData.agencies.length} implementing agencies.
                    The program has benefited <strong>{schemeData.beneficiaries.toLocaleString()}</strong> individuals
                    since its inception, showing consistent growth year-over-year.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!schemeData && state && component && !loading && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground text-lg">
                Please select both a scheme component and state to view details
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SchemeDetails;
