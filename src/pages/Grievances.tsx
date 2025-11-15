import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserGrievances, Grievance } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

const Grievances = () => {
  const [email] = useState("user@example.com"); // Replace with actual user email
  const [grievances, setGrievances] = useState<Grievance[]>([]);

  useEffect(() => {
    loadGrievances();
  }, []);

  const loadGrievances = async () => {
    try {
      const data = await fetchUserGrievances(email);
      setGrievances(data);
    } catch (error) {
      console.error("Failed to load grievances:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle className="h-4 w-4 text-success" />;
      case "in-progress": return <AlertCircle className="h-4 w-4 text-accent" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Grievances</h1>
        <div className="space-y-4">
          {grievances.map((g) => (
            <Card key={g.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{g.id}</span>
                  <Badge variant="outline" className="gap-1">
                    {getStatusIcon(g.status)}
                    {g.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{g.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Grievances;
