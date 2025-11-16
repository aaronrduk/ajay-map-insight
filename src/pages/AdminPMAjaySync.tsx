import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Loader2, CheckCircle2, XCircle, Clock, Database, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { pmAjayService, SyncMetadata } from "@/lib/pm-ajay-service";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminPMAjaySync() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncingDataset, setSyncingDataset] = useState<number | null>(null);
  const [metadata, setMetadata] = useState<SyncMetadata[]>([]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const data = await pmAjayService.getSyncMetadata();
      setMetadata(data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast.error("Failed to load sync metadata");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const result = await pmAjayService.triggerSync();
      toast.success(result.message || "All datasets synced successfully!");
      await fetchMetadata();
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync datasets. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncDataset = async (datasetNumber: number) => {
    setSyncingDataset(datasetNumber);
    try {
      const result = await pmAjayService.triggerSync(datasetNumber);
      toast.success(`Dataset ${datasetNumber} synced successfully!`);
      await fetchMetadata();
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(`Failed to sync dataset ${datasetNumber}`);
    } finally {
      setSyncingDataset(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      success: { variant: "outline", icon: CheckCircle2 },
      error: { variant: "destructive", icon: XCircle }
    };

    const { variant, icon: Icon } = config[status] || config.pending;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalRecords = metadata.reduce((sum, m) => sum + (m.total_records || 0), 0);
  const successCount = metadata.filter(m => m.last_sync_status === "success").length;
  const errorCount = metadata.filter(m => m.last_sync_status === "error").length;
  const pendingCount = metadata.filter(m => m.last_sync_status === "pending").length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/admin-dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          <Button
            onClick={handleSyncAll}
            disabled={syncing}
            className="gap-2"
            size="lg"
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing All Datasets...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Sync All Datasets
              </>
            )}
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PM-AJAY Data Sync Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage real-time data synchronization from Data.gov.in API
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Datasets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metadata.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Synced</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{successCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{errorCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{totalRecords.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metadata.map((item, index) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">
                        Dataset {index + 1}
                      </CardTitle>
                    </div>
                    {getStatusBadge(item.last_sync_status)}
                  </div>
                  <CardDescription className="text-xs font-mono break-all">
                    {item.resource_id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Records:</p>
                        <p className="font-semibold">{item.total_records || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status:</p>
                        <p className="font-semibold">{item.last_sync_status}</p>
                      </div>
                    </div>

                    {item.last_sync_at && (
                      <div className="text-xs text-gray-600">
                        Last synced: {format(new Date(item.last_sync_at), "PPp")}
                      </div>
                    )}

                    {item.last_sync_error && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        <div className="flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{item.last_sync_error}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => handleSyncDataset(index + 1)}
                      disabled={syncingDataset === index + 1}
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      {syncingDataset === index + 1 ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          Sync Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">About PM-AJAY Data Sync</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>• Data is synced from the official Data.gov.in API</li>
              <li>• Each dataset can be synced individually or all at once</li>
              <li>• Duplicate records are automatically prevented using hash-based deduplication</li>
              <li>• Sync failures are logged and can be retried manually</li>
              <li>• All dashboards and charts use this real-time data</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
