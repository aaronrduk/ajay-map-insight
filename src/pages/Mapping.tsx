import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { agencyMappings, components, states } from "@/data/agencies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV, exportToPDF, getLastUpdatedTimestamp } from "@/lib/export-utils";

const Mapping = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterComponent, setFilterComponent] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const lastUpdated = useMemo(() => getLastUpdatedTimestamp(), []);

  const filteredMappings = agencyMappings.filter((mapping) => {
    const matchesSearch =
      searchTerm === "" ||
      mapping.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.agencies.some((agency) => agency.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesComponent = filterComponent === "all" || mapping.component === filterComponent;
    const matchesState = filterState === "all" || mapping.state === filterState;
    const matchesStatus = filterStatus === "all" || mapping.status === filterStatus;

    return matchesSearch && matchesComponent && matchesState && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)} L`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-secondary text-secondary-foreground";
      case "Ongoing":
        return "bg-primary text-primary-foreground";
      case "Approved":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredMappings.map(mapping => ({
      Component: mapping.component,
      State: mapping.state,
      District: mapping.district,
      Village: mapping.village,
      'Implementing Agencies': mapping.agencies.join(', '),
      Status: mapping.status,
      'Funds Allocated': formatCurrency(mapping.fundsAllocated),
      'Funds Utilized': formatCurrency(mapping.fundsUtilized),
    }));
    exportToCSV(exportData, 'pm-ajay-agency-mapping');
    toast({
      title: "Export Successful",
      description: "Data exported to CSV file",
    });
  };

  const handleExportPDF = () => {
    const exportData = filteredMappings.map(mapping => ({
      Component: mapping.component,
      State: mapping.state,
      District: mapping.district,
      Village: mapping.village,
      Agencies: mapping.agencies.join(', '),
      Status: mapping.status,
      Allocated: formatCurrency(mapping.fundsAllocated),
      Utilized: formatCurrency(mapping.fundsUtilized),
    }));
    exportToPDF(exportData, 'pm-ajay-agency-mapping', 'PM-AJAY Agency Mapping Report');
    toast({
      title: "Export Successful",
      description: "Report exported to PDF file",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Agency-Component Mapping</h1>
            <p className="text-muted-foreground">
              Detailed view of implementing agencies across PM-AJAY components
            </p>
            <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find agencies by component, state, district, or village</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by village, district, or agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Select value={filterComponent} onValueChange={setFilterComponent}>
                <SelectTrigger>
                  <SelectValue placeholder="All Components" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Components</SelectItem>
                  {components.map((comp) => (
                    <SelectItem key={comp} value={comp}>
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results ({filteredMappings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-semibold">Component</th>
                    <th className="text-left p-3 font-semibold">State</th>
                    <th className="text-left p-3 font-semibold">District</th>
                    <th className="text-left p-3 font-semibold">Village</th>
                    <th className="text-left p-3 font-semibold">Implementing Agencies</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Allocated</th>
                    <th className="text-left p-3 font-semibold">Utilized</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMappings.map((mapping) => (
                    <tr key={mapping.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">{mapping.component}</td>
                      <td className="p-3">{mapping.state}</td>
                      <td className="p-3">{mapping.district}</td>
                      <td className="p-3">{mapping.village}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {mapping.agencies.map((agency) => (
                            <Badge key={agency} variant="outline" className="text-xs">
                              {agency}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(mapping.status)}>{mapping.status}</Badge>
                      </td>
                      <td className="p-3 font-medium">{formatCurrency(mapping.fundsAllocated)}</td>
                      <td className="p-3 font-medium">{formatCurrency(mapping.fundsUtilized)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Mapping;
