import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { districtData, agencyMappings } from "@/data/agencies";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeftRight, TrendingUp } from "lucide-react";

const Comparison = () => {
  const [district1, setDistrict1] = useState("");
  const [district2, setDistrict2] = useState("");
  const [showComparison, setShowComparison] = useState(false);

  const handleCompare = () => {
    if (district1 && district2) {
      setShowComparison(true);
    }
  };

  const getDistrictStats = (districtName: string) => {
    const district = districtData.find((d) => d.district === districtName);
    if (!district) return null;

    const projects = agencyMappings.filter((m) => m.district === districtName);
    const completed = projects.filter((p) => p.status === "Completed").length;
    const ongoing = projects.filter((p) => p.status === "Ongoing").length;

    return {
      ...district,
      completed,
      ongoing,
      utilizationRate: ((district.fundsUtilized / district.fundsAllocated) * 100).toFixed(1),
    };
  };

  const stats1 = district1 ? getDistrictStats(district1) : null;
  const stats2 = district2 ? getDistrictStats(district2) : null;

  const comparisonData = [
    {
      metric: "Funds Allocated (Cr)",
      [district1 || "District 1"]: stats1 ? (stats1.fundsAllocated / 10000000).toFixed(1) : 0,
      [district2 || "District 2"]: stats2 ? (stats2.fundsAllocated / 10000000).toFixed(1) : 0,
    },
    {
      metric: "Funds Utilized (Cr)",
      [district1 || "District 1"]: stats1 ? (stats1.fundsUtilized / 10000000).toFixed(1) : 0,
      [district2 || "District 2"]: stats2 ? (stats2.fundsUtilized / 10000000).toFixed(1) : 0,
    },
    {
      metric: "Villages Covered",
      [district1 || "District 1"]: stats1 ? stats1.villages.length : 0,
      [district2 || "District 2"]: stats2 ? stats2.villages.length : 0,
    },
    {
      metric: "Projects",
      [district1 || "District 1"]: stats1 ? stats1.projects : 0,
      [district2 || "District 2"]: stats2 ? stats2.projects : 0,
    },
    {
      metric: "SC Population (K)",
      [district1 || "District 1"]: stats1 ? (stats1.scPopulation / 1000).toFixed(0) : 0,
      [district2 || "District 2"]: stats2 ? (stats2.scPopulation / 1000).toFixed(0) : 0,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <ArrowLeftRight className="h-10 w-10 text-primary" />
            District Comparison
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compare PM-AJAY implementation metrics across districts
          </p>
        </div>

        {/* Selection Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Select Districts to Compare</CardTitle>
            <CardDescription>Choose two districts to view comparative analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">District 1</label>
                <Select value={district1} onValueChange={setDistrict1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select first district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtData.map((d) => (
                      <SelectItem key={d.district} value={d.district}>
                        {d.district}, {d.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">District 2</label>
                <Select value={district2} onValueChange={setDistrict2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select second district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtData.map((d) => (
                      <SelectItem key={d.district} value={d.district}>
                        {d.district}, {d.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleCompare} className="w-full" disabled={!district1 || !district2}>
              Compare Districts
            </Button>
          </CardContent>
        </Card>

        {/* Comparison Results */}
        {showComparison && stats1 && stats2 && (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* District 1 */}
              <Card className="shadow-lg border-primary/30">
                <CardHeader>
                  <CardTitle className="text-primary">
                    {stats1.district}, {stats1.state}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                      <p className="text-2xl font-bold">{stats1.projects}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Villages</p>
                      <p className="text-2xl font-bold">{stats1.villages.length}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-secondary">{stats1.completed}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Ongoing</p>
                      <p className="text-2xl font-bold text-primary">{stats1.ongoing}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Utilization Rate</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <p className="text-3xl font-bold text-primary">{stats1.utilizationRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* District 2 */}
              <Card className="shadow-lg border-secondary/30">
                <CardHeader>
                  <CardTitle className="text-secondary">
                    {stats2.district}, {stats2.state}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                      <p className="text-2xl font-bold">{stats2.projects}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Villages</p>
                      <p className="text-2xl font-bold">{stats2.villages.length}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-secondary">{stats2.completed}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Ongoing</p>
                      <p className="text-2xl font-bold text-primary">{stats2.ongoing}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Utilization Rate</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-secondary" />
                      <p className="text-3xl font-bold text-secondary">{stats2.utilizationRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison Chart */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Comparative Analysis</CardTitle>
                <CardDescription>Side-by-side comparison of key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={district1} fill="hsl(var(--primary))" />
                    <Bar dataKey={district2} fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Comparison;
