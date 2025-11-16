import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Send, Loader2, Megaphone, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import Layout from "@/components/Layout";
import { broadcastService, EmailBroadcast } from "@/lib/certificate-service";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminAnnouncements() {
  const navigate = useNavigate();
  const [broadcasts, setBroadcasts] = useState<EmailBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    recipient_filter: "all",
    attachment_url: "",
  });

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const data = await broadcastService.getAllBroadcasts();
      setBroadcasts(data);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      toast.error("Failed to load broadcasts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSending(true);
      const broadcast = await broadcastService.createBroadcast(formData);
      await broadcastService.sendBroadcast(broadcast.id);
      toast.success("Broadcast sent successfully!");
      setShowDialog(false);
      setFormData({
        title: "",
        body: "",
        recipient_filter: "all",
        attachment_url: "",
      });
      fetchBroadcasts();
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send broadcast");
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }
    > = {
      draft: { variant: "secondary", icon: Clock },
      sent: { variant: "outline", icon: CheckCircle2 },
      sending: { variant: "default", icon: Loader2 },
      failed: { variant: "destructive", icon: XCircle },
    };

    const { variant, icon: Icon } = config[status] || config.draft;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className={`h-3 w-3 ${status === "sending" ? "animate-spin" : ""}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRecipientLabel = (filter: string | null) => {
    const labels: Record<string, string> = {
      all: "All Users",
      citizen: "Citizens Only",
      agency: "Agencies Only",
      admin: "Admins Only",
    };
    return labels[filter || "all"] || "All Users";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/admin-dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Megaphone className="h-4 w-4" />
                Send Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create & Send Announcement</DialogTitle>
                <DialogDescription>
                  Send an email announcement to all or specific user groups
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Announcement title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Message *</Label>
                  <Textarea
                    id="body"
                    placeholder="Write your announcement message here..."
                    rows={6}
                    value={formData.body}
                    onChange={(e) =>
                      setFormData({ ...formData, body: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select
                    value={formData.recipient_filter}
                    onValueChange={(value) =>
                      setFormData({ ...formData, recipient_filter: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="citizen">Citizens Only</SelectItem>
                      <SelectItem value="agency">Agencies Only</SelectItem>
                      <SelectItem value="admin">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachment">Attachment URL (Optional)</Label>
                  <Input
                    id="attachment"
                    type="url"
                    placeholder="https://example.com/document.pdf"
                    value={formData.attachment_url}
                    onChange={(e) =>
                      setFormData({ ...formData, attachment_url: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    className="flex-1"
                    disabled={sending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    className="flex-1 gap-2"
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Announcements</h1>
              <p className="text-lg text-gray-600">
                Send mass email announcements to users
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : broadcasts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Megaphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Announcements Yet
              </h3>
              <p className="text-gray-600">
                Create your first announcement to notify users
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {broadcasts.map((broadcast) => (
              <Card key={broadcast.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {broadcast.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {broadcast.body}
                      </CardDescription>
                    </div>
                    {getStatusBadge(broadcast.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600">Recipients</p>
                        <p className="font-semibold text-sm">
                          {getRecipientLabel(broadcast.recipient_filter)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="font-semibold">{broadcast.total_recipients}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Sent</p>
                      <p className="font-semibold text-green-600">
                        {broadcast.total_sent}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Failed</p>
                      <p className="font-semibold text-red-600">
                        {broadcast.total_failed}
                      </p>
                    </div>
                  </div>

                  {broadcast.sent_at && (
                    <p className="text-sm text-gray-600">
                      Sent on {format(new Date(broadcast.sent_at), "PPp")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How Announcements Work</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>• Announcements are sent as formatted emails to selected users</li>
              <li>• You can target all users or filter by role (citizen, agency, admin)</li>
              <li>• Delivery status is tracked for each recipient</li>
              <li>• Users also receive an in-app notification</li>
              <li>• Include attachment URLs for additional documents or links</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
