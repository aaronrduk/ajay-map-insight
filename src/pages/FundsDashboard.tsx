import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFundsData, useFilterOptions } from "@/hooks/use-api";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, TrendingUp, DollarSign, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const FundsDashboard = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    state: "",
    year: 0,
    agency: "",
    component: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const { data: fundsData, isLoading } = useFundsData(filters);
  const filterOptions = useFilterOptions();

  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Downloading funds data as ${format.toUpperCase()}...`,
    });
  };

  const totalAllocated = fundsData?.reduce((sum, item) => sum + Number(item.allocated_amount), 0) || 0;
  const totalUtilized = fundsData?.reduce((sum, item) => sum + Number(item.utilized_amount), 0) || 0;
  const utilizationRate = totalAllocated > 0 ? ((totalUtilized / totalAllocated) * 100).toFixed(1) : "0";

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  const filteredData = fundsData?.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.state.toLowerCase().includes(searchLower) ||
      item.district.toLowerCase().includes(searchLower) ||
      item.agency.toLowerCase().includes(searchLower) ||
      item.component.toLowerCase().includes(searchLower)
    );
  });

  const chartData = filteredData?.slice(0, 10).map((item) => ({
    name: `${item.district.substring(0, 10)}...`,
    Allocated: Number(item.allocated_amount) / 10000000,
    Utilized: Number(item.utilized_amount) / 10000000,
  }));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-10 w-10 text-primary" />
              Fund Allocation vs Utilization
            </h1>
            <p className="text-muted-foreground">Comprehensive financial overview and analysis</p>
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

        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Select criteria to filter fund allocation data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Select value={filters.state} onValueChange={(value) => setFilters({ ...filters, state: value })}>
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
                <label className="text-sm font-medium">Year</label>
                <Select value={filters.year.toString()} onValueChange={(value) => setFilters({ ...filters, year: Number(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Years</SelectItem>
                    {filterOptions.years.data?.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => setFilters({ state: "", year: 0, agency: "", component: "" })}
                variant="outline"
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Allocated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{formatCurrency(totalAllocated)}</div>
              <p className="text-xs text-muted-foreground mt-1">Across {fundsData?.length || 0} entries</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Utilized</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{formatCurrency(totalUtilized)}</div>
              <p className="text-xs text-muted-foreground mt-1">{utilizationRate}% utilization rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-accent" />
                <div className="text-3xl font-bold text-accent">
                  {Number(utilizationRate) > 80 ? "Excellent" : Number(utilizationRate) > 60 ? "Good" : "Needs Attention"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on utilization rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Allocated vs Utilized Comparison</CardTitle>
                <CardDescription>Visual comparison of fund allocation and utilization</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                >
                  Bar Chart
                </Button>
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("line")}
                >
                  Line Chart
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Loading data...</p>
              </div>
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                {chartType === "bar" ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: "Amount (Cr)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)} Cr`} />
                    <Legend />
                    <Bar dataKey="Allocated" fill="hsl(var(--primary))" />
                    <Bar dataKey="Utilized" fill="hsl(var(--secondary))" />
                  </BarChart>
                ) : (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: "Amount (Cr)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)} Cr`} />
                    <Legend />
                    <Line type="monotone" dataKey="Allocated" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="Utilized" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">No data available for the selected filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Fund Data</CardTitle>
            <CardDescription>Sortable and searchable fund allocation records</CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by state, district, agency, or component..."
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
                    <TableHead>Agency</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Utilized</TableHead>
                    <TableHead className="text-right">Utilization %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData && filteredData.length > 0 ? (
                    filteredData.map((item) => {
                      const utilization = ((Number(item.utilized_amount) / Number(item.allocated_amount)) * 100).toFixed(1);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.state}</TableCell>
                          <TableCell>{item.district}</TableCell>
                          <TableCell>{item.year}</TableCell>
                          <TableCell>{item.agency}</TableCell>
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
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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

export default FundsDashboard;
