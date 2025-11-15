import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  fetchAllProposals,
  fetchAllGrievances,
  updateProposalStatus,
  updateGrievanceStatus,
  Proposal,
  Grievance,
} from "@/lib/api";
import { CheckCircle, XCircle, Clock, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [proposalsData, grievancesData] = await Promise.all([
        fetchAllProposals(),
        fetchAllGrievances(),
      ]);
      setProposals(proposalsData);
      setGrievances(grievancesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProposalAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateProposalStatus(id, status);
      toast({
        title: "Success",
        description: `Proposal ${status} successfully`,
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} proposal`,
        variant: "destructive",
      });
    }
  };

  const handleGrievanceAction = async (id: string, status: 'in-progress' | 'resolved') => {
    try {
      await updateGrievanceStatus(id, status);
      toast({
        title: "Success",
        description: `Grievance marked as ${status}`,
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update grievance",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      "in-progress": { variant: "secondary", icon: AlertCircle },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
      resolved: { variant: "default", icon: CheckCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const stats = {
    totalProposals: proposals.length,
    pendingProposals: proposals.filter(p => p.status === 'pending').length,
    totalGrievances: grievances.length,
    pendingGrievances: grievances.filter(g => g.status === 'pending').length,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage proposals, grievances, and portal operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Proposals</p>
                <p className="text-3xl font-bold text-primary">{stats.totalProposals}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Pending Proposals</p>
                <p className="text-3xl font-bold text-accent">{stats.pendingProposals}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Grievances</p>
                <p className="text-3xl font-bold text-primary">{stats.totalGrievances}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Pending Grievances</p>
                <p className="text-3xl font-bold text-destructive">{stats.pendingGrievances}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="proposals" className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="proposals">Proposals Management</TabsTrigger>
            <TabsTrigger value="grievances">Grievances Management</TabsTrigger>
          </TabsList>

          {/* Proposals Tab */}
          <TabsContent value="proposals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Proposal Management
                </CardTitle>
                <CardDescription>Review, approve, or reject agency proposals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Agency</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Expected Impact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposals.map((proposal) => (
                        <TableRow key={proposal.id}>
                          <TableCell className="font-mono text-xs">{proposal.id}</TableCell>
                          <TableCell className="font-medium">{proposal.agencyName}</TableCell>
                          <TableCell>{proposal.state}</TableCell>
                          <TableCell>{proposal.title}</TableCell>
                          <TableCell className="text-sm">{proposal.expectedImpact}</TableCell>
                          <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(proposal.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {proposal.status === 'pending' && (
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => handleProposalAction(proposal.id, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleProposalAction(proposal.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {proposal.status !== 'pending' && (
                              <span className="text-sm text-muted-foreground">No action needed</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {proposals.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No proposals found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grievances Tab */}
          <TabsContent value="grievances">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Grievance Management
                </CardTitle>
                <CardDescription>View and manage citizen grievances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Agency</TableHead>
                        <TableHead>Component</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grievances.map((grievance) => (
                        <TableRow key={grievance.id}>
                          <TableCell className="font-mono text-xs">{grievance.id}</TableCell>
                          <TableCell className="font-medium">{grievance.name}</TableCell>
                          <TableCell>{grievance.state}</TableCell>
                          <TableCell>{grievance.agency}</TableCell>
                          <TableCell>{grievance.component}</TableCell>
                          <TableCell className="max-w-xs truncate">{grievance.description}</TableCell>
                          <TableCell>{getStatusBadge(grievance.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(grievance.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {grievance.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleGrievanceAction(grievance.id, 'in-progress')}
                                >
                                  Start
                                </Button>
                              )}
                              {grievance.status === 'in-progress' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleGrievanceAction(grievance.id, 'resolved')}
                                >
                                  Resolve
                                </Button>
                              )}
                              {grievance.status === 'resolved' && (
                                <span className="text-sm text-muted-foreground">Resolved</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {grievances.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No grievances found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
