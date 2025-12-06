# Implementation Examples

This document provides practical examples of how to integrate the backend APIs and real-time features into your pages.

## Example 1: Agency Dashboard with Real-Time Updates

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useAgencyProposals } from "@/hooks/use-api";
import { useRealtimeAgencyProposals } from "@/hooks/use-realtime";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AgencyDashboard() {
  const { user } = useAuth();

  // Fetch proposals with real-time updates
  const { data: proposals = [], isLoading } = useAgencyProposals(user?.id);
  useRealtimeAgencyProposals(user?.id);

  const pendingCount = proposals.filter(p => p.status === "pending").length;
  const approvedCount = proposals.filter(p => p.status === "approved").length;

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{proposals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposals.slice(0, 5).map((proposal) => (
              <div key={proposal.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{proposal.title}</p>
                  <p className="text-sm text-muted-foreground">{proposal.category}</p>
                </div>
                <Badge
                  variant={
                    proposal.status === "approved"
                      ? "default"
                      : proposal.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {proposal.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Example 2: Submit Proposal with Notifications

```typescript
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubmitAgencyProposal } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function SubmitProposal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const submitProposal = useSubmitAgencyProposal();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitProposal.mutateAsync({
        user_id: user!.id,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        status: "pending",
      });

      toast({
        title: "Success",
        description: "Your proposal has been submitted successfully!",
      });

      navigate("/agency/proposals");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Proposal Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <Input
        placeholder="Category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        required
      />

      <Textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={6}
        required
      />

      <Button type="submit" disabled={submitProposal.isPending}>
        {submitProposal.isPending ? "Submitting..." : "Submit Proposal"}
      </Button>
    </form>
  );
}
```

## Example 3: Admin Proposal Review with Notifications

```typescript
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllProposals, useUpdateAgencyProposal } from "@/hooks/use-api";
import { useRealtimeAgencyProposals } from "@/hooks/use-realtime";
import { notifyProposalStatusChange } from "@/lib/notification-helper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function AdminProposalReview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: proposals = [] } = useAllProposals("pending");
  const updateProposal = useUpdateAgencyProposal();

  useRealtimeAgencyProposals();

  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [reply, setReply] = useState("");

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedProposal) return;

    try {
      await updateProposal.mutateAsync({
        id: selectedProposal.id,
        status,
        reply,
        adminId: user!.id,
      });

      // Send notification to the proposal owner
      await notifyProposalStatusChange(
        selectedProposal.user_id,
        selectedProposal.title,
        status,
        "/agency/proposals"
      );

      toast({
        title: "Success",
        description: `Proposal ${status} successfully!`,
      });

      setSelectedProposal(null);
      setReply("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update proposal.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Proposal List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Pending Proposals</h2>
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            onClick={() => setSelectedProposal(proposal)}
            className="border rounded-lg p-4 cursor-pointer hover:bg-muted"
          >
            <h3 className="font-semibold">{proposal.title}</h3>
            <p className="text-sm text-muted-foreground">{proposal.category}</p>
          </div>
        ))}
      </div>

      {/* Review Panel */}
      {selectedProposal && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Review Proposal</h2>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{selectedProposal.title}</h3>
            <p className="text-sm mb-4">{selectedProposal.description}</p>

            <Textarea
              placeholder="Your reply to the agency..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
            />

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => handleReview("approved")}
                disabled={updateProposal.isPending}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReview("rejected")}
                disabled={updateProposal.isPending}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Example 4: Grievance Tracking with Real-Time Status

```typescript
import { useAuth } from "@/contexts/AuthContext";
import { useUserGrievances } from "@/hooks/use-api";
import { useRealtimeGrievances } from "@/hooks/use-realtime";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function MyGrievances() {
  const { user } = useAuth();
  const { data: grievances = [], isLoading } = useUserGrievances(user?.email || "");

  // Real-time updates
  useRealtimeGrievances(user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "default";
      case "in_progress":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">My Grievances</h1>

      {grievances.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No grievances submitted yet.
          </CardContent>
        </Card>
      ) : (
        grievances.map((grievance) => (
          <Card key={grievance.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{grievance.grievance_type}</h3>
                  <p className="text-sm text-muted-foreground">
                    Ref: {grievance.reference_id}
                  </p>
                </div>
                <Badge variant={getStatusColor(grievance.status)}>
                  {grievance.status}
                </Badge>
              </div>

              <p className="text-sm mb-2">{grievance.description}</p>

              {grievance.resolution_notes && (
                <div className="bg-muted p-3 rounded-md mt-3">
                  <p className="text-sm font-medium">Resolution:</p>
                  <p className="text-sm">{grievance.resolution_notes}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Submitted {formatDistanceToNow(new Date(grievance.created_at), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
```

## Example 5: Course Registration with Backend Integration

```typescript
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses, useColleges, useSubmitCourseRegistrationNew } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function CourseRegistration() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    course_id: "",
    college_id: "",
    reason: "",
    preferred_batch: "",
  });

  const { data: courses = [] } = useCourses();
  const { data: colleges = [] } = useColleges(undefined, formData.course_id);
  const submitRegistration = useSubmitCourseRegistrationNew();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submitRegistration.mutateAsync({
        user_id: user!.id,
        full_name: formData.full_name,
        course_id: formData.course_id,
        college_id: formData.college_id,
        reason: formData.reason,
        preferred_batch: formData.preferred_batch,
        source: "citizen",
      });

      toast({
        title: "Success",
        description: "Registration submitted successfully!",
      });

      setFormData({
        full_name: "",
        course_id: "",
        college_id: "",
        reason: "",
        preferred_batch: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit registration.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <Input
        placeholder="Full Name"
        value={formData.full_name}
        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        required
      />

      <Select
        value={formData.course_id}
        onValueChange={(value) => setFormData({ ...formData, course_id: value, college_id: "" })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Course" />
        </SelectTrigger>
        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.course_name} ({course.component})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {formData.course_id && (
        <Select
          value={formData.college_id}
          onValueChange={(value) => setFormData({ ...formData, college_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select College" />
          </SelectTrigger>
          <SelectContent>
            {colleges.map((college: any) => (
              <SelectItem key={college.id} value={college.id}>
                {college.name} - {college.district}, {college.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Input
        placeholder="Preferred Batch (e.g., Morning, Evening)"
        value={formData.preferred_batch}
        onChange={(e) => setFormData({ ...formData, preferred_batch: e.target.value })}
      />

      <Input
        placeholder="Reason for Registration"
        value={formData.reason}
        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        required
      />

      <Button type="submit" disabled={submitRegistration.isPending}>
        {submitRegistration.isPending ? "Submitting..." : "Submit Registration"}
      </Button>
    </form>
  );
}
```

## Example 6: Adding NotificationCenter to Layout

```typescript
import { NotificationCenter } from "@/components/NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">PM-AJAY Portal</h1>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, {user.name}</span>
              <NotificationCenter />
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

## Example 7: Grant Eligibility Check

```typescript
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGrantEligibility, useSaveEligibilityCheck } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

export default function EligibilityCheck() {
  const { user } = useAuth();
  const checkEligibility = useGrantEligibility();
  const saveCheck = useSaveEligibilityCheck();

  const [formData, setFormData] = useState({
    age: "",
    category: "",
    income: "",
    component: "",
    state: "",
    district: "",
    village: "",
  });

  const [result, setResult] = useState<any>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const eligibilityResult = await checkEligibility.mutateAsync({
        age: parseInt(formData.age),
        category: formData.category,
        income: parseFloat(formData.income),
        component: formData.component,
        state: formData.state,
      });

      setResult(eligibilityResult);

      // Save the check to database
      if (user) {
        await saveCheck.mutateAsync({
          user_id: user.id,
          full_name: user.name,
          caste: formData.category,
          annual_income: parseFloat(formData.income),
          state: formData.state,
          district: formData.district,
          village: formData.village,
          is_eligible: eligibilityResult.eligible,
        });
      }
    } catch (error) {
      console.error("Eligibility check failed:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Check Grant Eligibility</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheck} className="space-y-4">
            <Input
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
            />

            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SC">Scheduled Caste (SC)</SelectItem>
                <SelectItem value="ST">Scheduled Tribe (ST)</SelectItem>
                <SelectItem value="OBC">Other Backward Classes (OBC)</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Annual Income (₹)"
              value={formData.income}
              onChange={(e) => setFormData({ ...formData, income: e.target.value })}
              required
            />

            <Select
              value={formData.component}
              onValueChange={(value) => setFormData({ ...formData, component: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Component" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="economic">Economic Development</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />

            <Input
              placeholder="District"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              required
            />

            <Input
              placeholder="Village"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              required
            />

            <Button type="submit" disabled={checkEligibility.isPending}>
              {checkEligibility.isPending ? "Checking..." : "Check Eligibility"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {result.eligible ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-700 mb-2">
                    You are Eligible!
                  </h2>
                  <p className="text-lg mb-4">
                    Grant Amount: ₹{result.grant_amount.toLocaleString()}
                  </p>
                  {result.required_documents.length > 0 && (
                    <div className="text-left mt-4">
                      <h3 className="font-semibold mb-2">Required Documents:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {result.required_documents.map((doc: string, idx: number) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-red-700 mb-2">
                    Not Eligible
                  </h2>
                  <p className="text-muted-foreground">
                    Based on the criteria provided, you are not eligible for this grant.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## Key Patterns

### Pattern 1: Data Fetching with Real-Time
```typescript
// Always combine query hook with real-time hook
const { data, isLoading } = useMyData();
useRealtimeMyData(); // Automatic updates
```

### Pattern 2: Mutations with Notifications
```typescript
// After mutation, send notification
await updateData(...);
await notifyUser(...);
```

### Pattern 3: Error Handling
```typescript
try {
  await mutation.mutateAsync(data);
  toast.success("Success!");
} catch (error) {
  toast.error("Failed!");
}
```

### Pattern 4: Loading States
```typescript
<Button disabled={isPending}>
  {isPending ? "Loading..." : "Submit"}
</Button>
```

### Pattern 5: Conditional Rendering
```typescript
if (isLoading) return <Skeleton />;
if (error) return <Error />;
return <Data data={data} />;
```
