import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAllPMajayData } from "@/hooks/use-data-gov";
import DataTable from "@/components/DataTable";
import { Database, TrendingUp, MapPin, Building2, RefreshCw, AlertCircle } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];

const DataDashboard = () => {
  const { data, isLoading, error, refetch, isRefetching } = useAllPMajayData();
  const [activeTab, setActiveTab] = useState("overview");

  const renderOverview = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                Total Datasets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{data.summary.totalDatasets}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully loaded</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {data.summary.totalRecords.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all datasets</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {((data.summary.successfulFetches / data.summary.totalDatasets) * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.summary.successfulFetches}/{data.summary.totalDatasets} successful
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-primary">
                {new Date(data.summary.fetchedAt).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Data refresh time</p>
            </CardContent>
          </Card>
        </div>

        {/* Dataset Status */}
        <Card>
          <CardHeader>
            <CardTitle>Dataset Status</CardTitle>
            <CardDescription>Overview of all PM-AJAY datasets from Data.gov.in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.datasets).map(([key, dataset]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border ${
                    dataset.success ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{dataset.metadata.name}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            dataset.success
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {dataset.success ? "Success" : "Failed"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{dataset.metadata.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Records: {dataset.metadata.recordCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {dataset.error && (
                    <div className="mt-2 text-xs text-red-600">
                      Error: {dataset.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Record Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Dataset Record Distribution</CardTitle>
            <CardDescription>Number of records in each dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(data.datasets).map(([key, dataset]) => ({
                  name: dataset.metadata.name.split(' ').slice(0, 3).join(' '),
                  records: dataset.metadata.recordCount,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="records" fill="hsl(var(--primary))" name="Number of Records" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDatasetTab = (datasetKey: string) => {
    if (!data || !data.datasets[datasetKey]) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          Dataset not available
        </div>
      );
    }

    const dataset = data.datasets[datasetKey];

    if (!dataset.success) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dataset</AlertTitle>
          <AlertDescription>
            {dataset.error || "Failed to load this dataset"}
          </AlertDescription>
        </Alert>
      );
    }

    if (dataset.data.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>
            This dataset contains no records
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        {/* Dataset Info */}
        <Card>
          <CardHeader>
            <CardTitle>{dataset.metadata.name}</CardTitle>
            <CardDescription>{dataset.metadata.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-primary">
                  {dataset.metadata.recordCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-semibold">
                  {new Date(dataset.metadata.fetchedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Explorer</CardTitle>
            <CardDescription>Search, filter, and export data</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={dataset.data} title={dataset.metadata.name} pageSize={10} />
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-4">
            <Database className="h-16 w-16 text-primary mx-auto animate-pulse" />
            <h1 className="text-4xl font-bold">Loading PM-AJAY Data...</h1>
            <p className="text-muted-foreground">
              Fetching data from Data.gov.in APIs. This may take a moment.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-20 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load PM-AJAY data"}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-10 w-10 text-primary" />
              PM-AJAY Data Dashboard
            </h1>
            <p className="text-muted-foreground">Live data from Data.gov.in Open APIs</p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto">
            <TabsTrigger value="overview" className="text-xs lg:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="dataset1" className="text-xs lg:text-sm">Fund Allocation</TabsTrigger>
            <TabsTrigger value="dataset2" className="text-xs lg:text-sm">Fund Utilization</TabsTrigger>
            <TabsTrigger value="dataset3" className="text-xs lg:text-sm">Village Data</TabsTrigger>
            <TabsTrigger value="dataset4" className="text-xs lg:text-sm">District Data</TabsTrigger>
            <TabsTrigger value="dataset5" className="text-xs lg:text-sm">Agency Data</TabsTrigger>
            <TabsTrigger value="dataset6" className="text-xs lg:text-sm">Beneficiaries</TabsTrigger>
            <TabsTrigger value="dataset7" className="text-xs lg:text-sm">Components</TabsTrigger>
            <TabsTrigger value="dataset8" className="text-xs lg:text-sm">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{renderOverview()}</TabsContent>
          <TabsContent value="dataset1">{renderDatasetTab("dataset1")}</TabsContent>
          <TabsContent value="dataset2">{renderDatasetTab("dataset2")}</TabsContent>
          <TabsContent value="dataset3">{renderDatasetTab("dataset3")}</TabsContent>
          <TabsContent value="dataset4">{renderDatasetTab("dataset4")}</TabsContent>
          <TabsContent value="dataset5">{renderDatasetTab("dataset5")}</TabsContent>
          <TabsContent value="dataset6">{renderDatasetTab("dataset6")}</TabsContent>
          <TabsContent value="dataset7">{renderDatasetTab("dataset7")}</TabsContent>
          <TabsContent value="dataset8">{renderDatasetTab("dataset8")}</TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DataDashboard;
