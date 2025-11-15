import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSchemeData, useFilterOptions } from "@/hooks/use-api";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FileText, Users, MapPin, Building2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { components } from "@/data/agencies";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8b5cf6", "#f59e0b", "#10b981"];

const SchemeDetails = () => {
  const [step, setStep] = useState(1);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const { data: schemeData, isLoading } = useSchemeData({
    component: selectedComponent,
    state: selectedState,
  });
  const filterOptions = useFilterOptions();

  const totalBeneficiaries = schemeData?.reduce((sum, item) => sum + item.beneficiary_count, 0) || 0;
  const uniqueAgencies = [...new Set(schemeData?.map((item) => item.agency))];
  const uniqueStates = [...new Set(schemeData?.map((item) => item.state))];

  const agencyData = uniqueAgencies.map((agency) => {
    const count = schemeData
      ?.filter((item) => item.agency === agency)
      .reduce((sum, item) => sum + item.beneficiary_count, 0) || 0;
    return {
      name: agency.length > 20 ? agency.substring(0, 20) + "..." : agency,
      fullName: agency,
      count,
    };
  }).sort((a, b) => b.count - a.count);

  const yearData = schemeData?.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.year === item.year);
    if (existing) {
      existing.beneficiaries += item.beneficiary_count;
    } else {
      acc.push({ year: item.year, beneficiaries: item.beneficiary_count });
    }
    return acc;
  }, []).sort((a, b) => a.year - b.year);

  const categoryData = schemeData?.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.name === item.category);
    if (existing) {
      existing.value += item.beneficiary_count;
    } else {
      acc.push({ name: item.category, value: item.beneficiary_count });
    }
    return acc;
  }, []);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Scheme Component</CardTitle>
              <CardDescription>Choose the PM-AJAY component to analyze</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedComponent} onValueChange={setSelectedComponent}>
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
              <Button onClick={() => setStep(2)} disabled={!selectedComponent} className="w-full">
                Next: Select State
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select State</CardTitle>
              <CardDescription>Choose a state to view implementation details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Selected Component:</p>
                <p className="font-semibold text-primary">{selectedComponent}</p>
              </div>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state (optional for all states)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All States</SelectItem>
                  {filterOptions.states.data?.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  View Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Beneficiaries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{totalBeneficiaries.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Agencies Involved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">{uniqueAgencies.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    States Covered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-accent">{uniqueStates.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Component
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-primary">{selectedComponent}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agency-wise Distribution</CardTitle>
                  <CardDescription>Beneficiaries by implementing agency</CardDescription>
                </CardHeader>
                <CardContent>
                  {agencyData && agencyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={agencyData.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold">{data.fullName}</p>
                                <p className="text-primary">{data.count.toLocaleString()} beneficiaries</p>
                              </div>
                            );
                          }
                          return null;
                        }} />
                        <Legend />
                        <Bar dataKey="count" fill="hsl(var(--primary))" name="Beneficiaries" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Beneficiaries by social category</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryData && categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${entry.value.toLocaleString()}`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Year-wise Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Year-wise Implementation Trend</CardTitle>
                <CardDescription>Number of beneficiaries over the years</CardDescription>
              </CardHeader>
              <CardContent>
                {yearData && yearData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={yearData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value.toLocaleString(), "Beneficiaries"]} />
                      <Legend />
                      <Bar dataKey="beneficiaries" fill="hsl(var(--secondary))" name="Beneficiaries" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Implementation Data</CardTitle>
                <CardDescription>Complete breakdown by state, district, and agency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>State</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Agency</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Beneficiaries</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schemeData && schemeData.length > 0 ? (
                        schemeData.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.state}</TableCell>
                            <TableCell>{item.district}</TableCell>
                            <TableCell>{item.agency}</TableCell>
                            <TableCell>{item.year}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              {item.beneficiary_count.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {isLoading ? "Loading data..." : "No records found"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => setStep(1)} className="w-full">
              Start New Analysis
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <FileText className="h-10 w-10 text-primary" />
            Scheme Details & Analysis
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive analysis of PM-AJAY scheme implementation and beneficiary data
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4">
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

        {renderStep()}
      </div>
    </Layout>
  );
};

export default SchemeDetails;
