import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAgencyData, useFilterOptions, useAgencies } from "@/hooks/use-api";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Building2, TrendingUp, Users, Download, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const AgencyAnalytics = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    state: "",
    district: "",
    agency: "",
    component: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: agencyData, isLoading } = useAgencyData(filters);
  const filterOptions = useFilterOptions();
  const { data: agencies } = useAgencies();

  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Downloading agency data as ${format.toUpperCase()}...`,
    });
  };

  const totalAllocated = agencyData?.funds?.reduce((sum, item) => sum + Number(item.allocated_amount), 0) || 0;
  const totalUtilized = agencyData?.funds?.reduce((sum, item) => sum + Number(item.utilized_amount), 0) || 0;
  const utilizationRate = totalAllocated > 0 ? ((totalUtilized / totalAllocated) * 100).toFixed(1) : "0";
  const totalBeneficiaries = agencyData?.beneficiaries?.reduce((sum, item) => sum + item.beneficiary_count, 0) || 0;

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  const yearWiseData = agencyData?.funds?.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.year === item.year);
    if (existing) {
      existing.allocated += Number(item.allocated_amount) / 10000000;
      existing.utilized += Number(item.utilized_amount) / 10000000;
    } else {
      acc.push({
        year: item.year,
        allocated: Number(item.allocated_amount) / 10000000,
        utilized: Number(item.utilized_amount) / 10000000,
      });
    }
    return acc;
  }, []).sort((a, b) => a.year - b.year) || [];

  const componentWiseData = agencyData?.funds?.reduce((acc: any[], item) => {
    const existing = acc.find((x) => x.component === item.component);
    if (existing) {
      existing.allocated += Number(item.allocated_amount);
      existing.utilized += Number(item.utilized_amount);
      existing.beneficiaries += agencyData.beneficiaries?.filter(
        (b) => b.scheme_component === item.component
      ).reduce((sum, b) => sum + b.beneficiary_count, 0) || 0;
    } else {
      acc.push({
        component: item.component,
        allocated: Number(item.allocated_amount),
        utilized: Number(item.utilized_amount),
        beneficiaries: agencyData.beneficiaries?.filter(
          (b) => b.scheme_component === item.component
        ).reduce((sum, b) => sum + b.beneficiary_count, 0) || 0,
      });
    }
    return acc;
  }, []) || [];

  const selectedAgency = agencies?.find((a: any) => a.name === filters.agency);

  const filteredFunds = agencyData?.funds?.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.state.toLowerCase().includes(searchLower) ||
      item.district.toLowerCase().includes(searchLower) ||
      item.component.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-10 w-10 text-primary" />
              Agency-wise Analysis
            </h1>
            <p className="text-muted-foreground">Comprehensive performance metrics and implementation tracking</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Agency Data</CardTitle>
            <CardDescription>Select criteria to analyze specific agency performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Select value={filters.state} onValueChange={(value) => setFilters({ ...filters, state: value, district: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">District</label>
                <Input
                  value={filters.district}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                  placeholder="Enter district"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Agency</label>
                <Select value={filters.agency} onValueChange={(value) => setFilters({ ...filters, agency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Agencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Agencies</SelectItem>
                    {filterOptions.agencies.data?.map((agency) => (
                      <SelectItem key={agency} value={agency}>
                        {agency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Component</label>
                <Select value={filters.component} onValueChange={(value) => setFilters({ ...filters, component: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Components" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Components</SelectItem>
                    {filterOptions.components.data?.map((component) => (
                      <SelectItem key={component} value={component}>
                        {component}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => setFilters({ state: "", district: "", agency: "", component: "" })}
              variant="outline"
              className="mt-4"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>

        {/* Agency Info */}
        {selectedAgency && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedAgency.name}</span>
                {selectedAgency.is_verified && <Badge>Verified</Badge>}
              </CardTitle>
              <CardDescription>
                {selectedAgency.type} • {selectedAgency.state}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                {selectedAgency.contact_person && (
                  <div>
                    <p className="text-muted-foreground">Contact Person</p>
                    <p className="font-semibold">{selectedAgency.contact_person}</p>
                  </div>
                )}
                {selectedAgency.email && (
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-semibold">{selectedAgency.email}</p>
                  </div>
                )}
                {selectedAgency.phone && (
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-semibold">{selectedAgency.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funds Allocated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{formatCurrency(totalAllocated)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funds Utilized</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{formatCurrency(totalUtilized)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Utilization Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{utilizationRate}%</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                Beneficiaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalBeneficiaries.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Year-wise Implementation
              </CardTitle>
              <CardDescription>Funds allocated vs utilized over years</CardDescription>
            </CardHeader>
            <CardContent>
              {yearWiseData && yearWiseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={yearWiseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: "Amount (Cr)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)} Cr`} />
                    <Legend />
                    <Line type="monotone" dataKey="allocated" stroke="hsl(var(--primary))" strokeWidth={2} name="Allocated" />
                    <Line type="monotone" dataKey="utilized" stroke="hsl(var(--secondary))" strokeWidth={2} name="Utilized" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {isLoading ? "Loading data..." : "No data available"}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Component-wise Beneficiaries</CardTitle>
              <CardDescription>Number of beneficiaries by scheme component</CardDescription>
            </CardHeader>
            <CardContent>
              {componentWiseData && componentWiseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={componentWiseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="component" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="beneficiaries" fill="hsl(var(--primary))" name="Beneficiaries" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {isLoading ? "Loading data..." : "No data available"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Fund Allocation Data</CardTitle>
            <CardDescription>Complete breakdown of funds by state, district, and component</CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by state, district, or component..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Utilized</TableHead>
                    <TableHead className="text-right">Utilization %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunds && filteredFunds.length > 0 ? (
                    filteredFunds.map((item) => {
                      const utilization = ((Number(item.utilized_amount) / Number(item.allocated_amount)) * 100).toFixed(1);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.state}</TableCell>
                          <TableCell>{item.district}</TableCell>
                          <TableCell>{item.year}</TableCell>
                          <TableCell>{item.component}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {formatCurrency(Number(item.allocated_amount))}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-secondary">
                            {formatCurrency(Number(item.utilized_amount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`font-semibold ${
                                Number(utilization) > 80
                                  ? "text-green-600"
                                  : Number(utilization) > 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {utilization}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {isLoading ? "Loading data..." : "No records found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AgencyAnalytics;
