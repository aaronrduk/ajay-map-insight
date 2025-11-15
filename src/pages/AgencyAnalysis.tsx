import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAgencyData, AgencyData } from "@/lib/api";
import { getAllStates } from "@/data/india-geography";
import { Building2, Users, TrendingUp, DollarSign } from "lucide-react";

const AgencyAnalysis = () => {
  const [agency, setAgency] = useState("NSFDC");
  const [state, setState] = useState("");
  const [agencyData, setAgencyData] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(false);

  const states = getAllStates();
  const agencies = [
    "NSFDC",
    "NSKFDC",
    "NBCFDC",
    "State SC Development Corporation",
    "District Welfare Office",
  ];

  useEffect(() => {
    loadData();
  }, [agency, state]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAgencyData(agency, state);
      setAgencyData(data);
    } catch (error) {
      console.error("Failed to load agency data:", error);
    } finally {
      setLoading(false);
    }
  };

  const utilizationRate = agencyData
    ? ((agencyData.utilized / agencyData.allocated) * 100).toFixed(1)
    : "0";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Agency-wise Scheme Analysis
          </h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive analysis of agency performance and implementation
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Select Agency & Location</CardTitle>
            <CardDescription>Choose an agency and optional state filter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agency</Label>
                <Select value={agency} onValueChange={setAgency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>State (Optional)</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {states.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {agencyData && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Allocated</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{(agencyData.allocated / 10000000).toFixed(2)} Cr
                      </p>
                    </div>
                    <DollarSign className="h-10 w-10 text-primary/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Utilized</p>
                      <p className="text-2xl font-bold text-accent">
                        ₹{(agencyData.utilized / 10000000).toFixed(2)} Cr
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-accent/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-success/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Utilization</p>
                      <p className="text-2xl font-bold" style={{ color: "hsl(var(--success))" }}>
                        {utilizationRate}%
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10" style={{ color: "hsl(var(--success) / 0.3)" }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Beneficiaries</p>
                      <p className="text-2xl font-bold text-primary">
                        {agencyData.beneficiaries.toLocaleString()}
                      </p>
                    </div>
                    <Users className="h-10 w-10 text-primary/30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scheme-wise Beneficiaries */}
            <Card>
              <CardHeader>
                <CardTitle>Scheme-wise Beneficiary Distribution</CardTitle>
                <CardDescription>Number of beneficiaries under each scheme component</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={agencyData.schemes}
                  dataKeys={[
                    { key: "count", color: "hsl(var(--primary))", name: "Beneficiaries" },
                  ]}
                  xAxisKey="component"
                  height={350}
                />
              </CardContent>
            </Card>

            {/* Year-wise Fund Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Year-wise Fund Allocation & Utilization</CardTitle>
                <CardDescription>Trend of fund allocation and utilization over the years (in Crores)</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={agencyData.yearWiseData.map(d => ({
                    year: d.year,
                    Allocated: d.allocated / 10000000,
                    Utilized: d.utilized / 10000000,
                  }))}
                  dataKeys={[
                    { key: "Allocated", color: "hsl(var(--primary))", name: "Allocated (Cr)" },
                    { key: "Utilized", color: "hsl(var(--accent))", name: "Utilized (Cr)" },
                  ]}
                  xAxisKey="year"
                  height={350}
                />
              </CardContent>
            </Card>

            {/* Detailed Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Scheme Breakdown</CardTitle>
                <CardDescription>Complete breakdown of all schemes implemented</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scheme Component</TableHead>
                        <TableHead className="text-right">Beneficiaries</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agencyData.schemes.map((scheme, index) => {
                        const percentage = ((scheme.count / agencyData.beneficiaries) * 100).toFixed(1);
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{scheme.component}</TableCell>
                            <TableCell className="text-right">{scheme.count.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-accent">{percentage}%</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-muted/30 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{agencyData.beneficiaries.toLocaleString()}</TableCell>
                        <TableCell className="text-right">100%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AgencyAnalysis;
