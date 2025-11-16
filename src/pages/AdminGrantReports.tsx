import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle, Download, Filter } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface EligibilityCheck {
  id: string;
  user_id: string | null;
  full_name: string;
  caste: string;
  annual_income: number;
  state: string;
  district: string;
  village: string;
  is_eligible: boolean;
  created_at: string;
}

export default function AdminGrantReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState<EligibilityCheck[]>([]);
  const [filterEligibility, setFilterEligibility] = useState<string>("all");
  const [filterCaste, setFilterCaste] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");

  useEffect(() => {
    fetchEligibilityChecks();
  }, []);

  const fetchEligibilityChecks = async () => {
    try {
      const { data, error } = await supabase
        .from("eligibility_checks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setChecks(data || []);
    } catch (error) {
      console.error("Error fetching eligibility checks:", error);
      toast.error("Failed to load eligibility checks");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Caste", "Income", "State", "District", "Village", "Eligible", "Date"];
    const rows = filteredChecks.map(check => [
      check.full_name,
      check.caste,
      check.annual_income,
      check.state,
      check.district,
      check.village,
      check.is_eligible ? "Yes" : "No",
      format(new Date(check.created_at), "yyyy-MM-dd HH:mm")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grant-eligibility-reports-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const filteredChecks = checks.filter((check) => {
    if (filterEligibility !== "all") {
      const isEligible = filterEligibility === "eligible";
      if (check.is_eligible !== isEligible) return false;
    }
    if (filterCaste !== "all" && !check.caste.includes(filterCaste)) return false;
    if (filterState !== "all" && check.state !== filterState) return false;
    return true;
  });

  const stats = {
    total: checks.length,
    eligible: checks.filter(c => c.is_eligible).length,
    notEligible: checks.filter(c => !c.is_eligible).length,
    scApplicants: checks.filter(c => c.caste.startsWith("SC")).length,
    avgIncome: checks.length > 0
      ? Math.round(checks.reduce((sum, c) => sum + Number(c.annual_income), 0) / checks.length)
      : 0
  };

  const uniqueStates = Array.from(new Set(checks.map(c => c.state))).sort();
  const castesFound = Array.from(new Set(checks.map(c => c.caste))).sort();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin-dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Grant-in-Aid Eligibility Reports
          </h1>
          <p className="text-lg text-gray-600">
            View and analyze all eligibility check submissions
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Eligible</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.eligible}</p>
              <p className="text-xs text-gray-500">
                {stats.total > 0 ? Math.round((stats.eligible / stats.total) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Not Eligible</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats.notEligible}</p>
              <p className="text-xs text-gray-500">
                {stats.total > 0 ? Math.round((stats.notEligible / stats.total) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">SC Applicants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.scApplicants}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{stats.avgIncome.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Eligibility Status</Label>
                <Select value={filterEligibility} onValueChange={setFilterEligibility}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="eligible">Eligible Only</SelectItem>
                    <SelectItem value="not-eligible">Not Eligible Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Caste Category</Label>
                <Select value={filterCaste} onValueChange={setFilterCaste}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Castes</SelectItem>
                    {castesFound.map(caste => (
                      <SelectItem key={caste} value={caste}>
                        {caste}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>State</Label>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {uniqueStates.map(state => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : filteredChecks.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Eligibility Checks Found
                </h3>
                <p className="text-gray-600">
                  {filterEligibility !== "all" || filterCaste !== "all" || filterState !== "all"
                    ? "Try adjusting your filters"
                    : "No eligibility checks have been submitted yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Check Records ({filteredChecks.length})</CardTitle>
                <CardDescription>
                  All grant eligibility submissions and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Caste</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Income</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Village</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Result</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredChecks.map((check) => (
                        <tr key={check.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">{check.full_name}</p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {check.caste}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-900">
                              ₹{Number(check.annual_income).toLocaleString()}
                            </p>
                            {Number(check.annual_income) <= 250000 && (
                              <p className="text-xs text-green-600">Within limit</p>
                            )}
                            {Number(check.annual_income) > 250000 && (
                              <p className="text-xs text-red-600">Exceeds limit</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-900">{check.district}</p>
                            <p className="text-xs text-gray-500">{check.state}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-600">{check.village}</p>
                          </td>
                          <td className="py-3 px-4">
                            {check.is_eligible ? (
                              <Badge className="gap-1 bg-green-100 text-green-800 border-green-300">
                                <CheckCircle2 className="h-3 w-3" />
                                Eligible
                              </Badge>
                            ) : (
                              <Badge className="gap-1 bg-red-100 text-red-800 border-red-300">
                                <XCircle className="h-3 w-3" />
                                Not Eligible
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-900">
                              {format(new Date(check.created_at), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(check.created_at), "h:mm a")}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
