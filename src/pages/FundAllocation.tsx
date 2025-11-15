import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart } from "@/components/charts/BarChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchFundData, FundData } from "@/lib/api";
import { getAllStates } from "@/data/india-geography";
import { TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FundAllocation = () => {
  const { toast } = useToast();
  const [state, setState] = useState("");
  const [year, setYear] = useState("2024");
  const [agency, setAgency] = useState("");
  const [component, setComponent] = useState("");
  const [fundData, setFundData] = useState<FundData[]>([]);
  const [loading, setLoading] = useState(false);

  const states = getAllStates();
  const years = ["2021", "2022", "2023", "2024"];
  const agencies = ["NSFDC", "NSKFDC", "NBCFDC", "All"];
  const components = ["Adarsh Gram", "Hostels", "Skill Development", "All"];

  useEffect(() => {
    loadData();
  }, [state, year, agency, component]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchFundData({ state, year, agency, component });
      setFundData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load fund data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAllocated = fundData.reduce((sum, item) => sum + item.allocated, 0);
  const totalUtilized = fundData.reduce((sum, item) => sum + item.utilized, 0);
  const utilizationRate = totalAllocated > 0 ? ((totalUtilized / totalAllocated) * 100).toFixed(1) : "0";

  const chartData = fundData.map(item => ({
    name: `${item.state} - ${item.year}`,
    Allocated: item.allocated / 10000000,
    Utilized: item.utilized / 10000000,
  }));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Fund Allocation vs Utilization
          </h1>
          <p className="text-muted-foreground text-lg">
            Track financial allocation and utilization across PM-AJAY schemes
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Data</CardTitle>
            <CardDescription>Select criteria to view specific fund allocation data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {states.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Agency</Label>
                <Select value={agency} onValueChange={setAgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Component</Label>
                <Select value={component} onValueChange={setComponent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Component" />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Allocated</p>
                  <p className="text-3xl font-bold text-primary">
                    ₹{(totalAllocated / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Utilized</p>
                  <p className="text-3xl font-bold text-accent">
                    ₹{(totalUtilized / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-accent/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilization Rate</p>
                  <p className="text-3xl font-bold" style={{ color: "hsl(var(--success))" }}>
                    {utilizationRate}%
                  </p>
                </div>
                <TrendingUp className="h-12 w-12" style={{ color: "hsl(var(--success) / 0.3)" }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation vs Utilization Comparison</CardTitle>
            <CardDescription>Visual comparison of fund allocation and utilization (in Crores)</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                dataKeys={[
                  { key: "Allocated", color: "hsl(var(--primary))", name: "Allocated (Cr)" },
                  { key: "Utilized", color: "hsl(var(--accent))", name: "Utilized (Cr)" },
                ]}
                xAxisKey="name"
                height={400}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No data available for selected filters
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Fund Data</CardTitle>
            <CardDescription>Complete breakdown of fund allocation and utilization</CardDescription>
          </CardHeader>
          <CardContent>
            {fundData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Agency</TableHead>
                      <TableHead>Component</TableHead>
                      <TableHead className="text-right">Allocated (₹)</TableHead>
                      <TableHead className="text-right">Utilized (₹)</TableHead>
                      <TableHead className="text-right">Utilization %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fundData.map((item, index) => {
                      const util = ((item.utilized / item.allocated) * 100).toFixed(1);
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.state}</TableCell>
                          <TableCell>{item.year}</TableCell>
                          <TableCell>{item.agency}</TableCell>
                          <TableCell>{item.component}</TableCell>
                          <TableCell className="text-right">
                            ₹{(item.allocated / 10000000).toFixed(2)} Cr
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{(item.utilized / 10000000).toFixed(2)} Cr
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={parseFloat(util) >= 80 ? "text-success" : "text-accent"}>
                              {util}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No records found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FundAllocation;
