import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, Loader2, CheckCircle2, XCircle, Database, GraduationCap, Building2 } from "lucide-react";
import Layout from "@/components/Layout";
import { syncService } from "@/lib/registration-service";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminCoursesSync() {
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [metadata, setMetadata] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const data = await syncService.getSyncMetadata();
      setMetadata(data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast.error("Failed to load sync metadata");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncService.triggerCoursesSync();
      toast.success("Courses and colleges synced successfully!");
      await fetchMetadata();
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "secondary", icon: Loader2 },
      success: { variant: "outline", icon: CheckCircle2 },
      error: { variant: "destructive", icon: XCircle }
    };

    const { variant, icon: Icon } = config[status] || config.pending;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className={`h-3 w-3 ${status === "pending" ? "animate-spin" : ""}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const coursesData = metadata.find(m => m.resource_id === "courses");
  const collegesData = metadata.find(m => m.resource_id === "colleges");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/admin-dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="gap-2"
            size="lg"
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Sync Courses & Colleges
              </>
            )}
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Courses & Colleges Sync
          </h1>
          <p className="text-lg text-gray-600">
            Synchronize course and college data from Data.gov.in API
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Courses</CardTitle>
                      <CardDescription>PM-AJAY course catalog</CardDescription>
                    </div>
                  </div>
                  {coursesData && getStatusBadge(coursesData.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Records</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {coursesData?.row_count || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {coursesData?.status || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {coursesData?.last_synced_at && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Last Synced:</p>
                      <p>{format(new Date(coursesData.last_synced_at), "PPp")}</p>
                    </div>
                  )}

                  {coursesData?.error_message && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                      {coursesData.error_message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Colleges</CardTitle>
                      <CardDescription>Participating institutions</CardDescription>
                    </div>
                  </div>
                  {collegesData && getStatusBadge(collegesData.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Records</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {collegesData?.row_count || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {collegesData?.status || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {collegesData?.last_synced_at && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Last Synced:</p>
                      <p>{format(new Date(collegesData.last_synced_at), "PPp")}</p>
                    </div>
                  )}

                  {collegesData?.error_message && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                      {collegesData.error_message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">About Course & College Sync</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>• Syncs course catalog and college directory from Data.gov.in</li>
              <li>• Automatically creates course-college mappings</li>
              <li>• Prevents duplicate records using hash-based deduplication</li>
              <li>• Updates existing records with latest information</li>
              <li>• Powers the course registration system</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
