import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Course {
  id: string;
  course_name: string;
  component: string;
}

interface College {
  id: string;
  name: string;
  district: string;
  state: string;
}

export default function CitizenCourseRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    courseId: "",
    collegeId: "",
    reason: ""
  });

  useEffect(() => {
    fetchUserData();
    fetchCourses();
    fetchColleges();
  }, []);

  useEffect(() => {
    if (formData.courseId && colleges.length > 0) {
      filterCollegesByCourse();
    }
  }, [formData.courseId, colleges]);

  const fetchUserData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        const { data: portalUser } = await supabase
          .from("portal_users")
          .select("name")
          .eq("id", userData.user.id)
          .single();

        if (portalUser) {
          setUserName(portalUser.name);
          setFormData(prev => ({ ...prev, fullName: portalUser.name }));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, course_name, component")
        .eq("is_active", true)
        .order("course_name");

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from("colleges")
        .select("id, name, district, state")
        .order("name");

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  };

  const filterCollegesByCourse = async () => {
    try {
      const { data, error } = await supabase
        .from("college_courses")
        .select(`
          colleges (
            id,
            name,
            district,
            state
          )
        `)
        .eq("course_id", formData.courseId);

      if (error) throw error;

      const uniqueColleges = data
        .map(item => item.colleges)
        .filter((college): college is College => college !== null);

      setFilteredColleges(uniqueColleges);
    } catch (error) {
      console.error("Error filtering colleges:", error);
      setFilteredColleges(colleges);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user?.id) {
        toast.error("Please log in to register for a course");
        navigate("/login");
        return;
      }

      const { error } = await supabase
        .from("course_registrations_new")
        .insert({
          user_id: userData.user.id,
          full_name: formData.fullName,
          course_id: formData.courseId,
          college_id: formData.collegeId,
          reason: formData.reason,
          status: "pending"
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Course registration submitted successfully!");
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error("Failed to submit registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find(c => c.id === formData.courseId);
  const selectedCollege = filteredColleges.find(c => c.id === formData.collegeId);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/citizen-dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Course Registration</CardTitle>
            <CardDescription>
              Register for PM AJAY courses and training programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                  {userName && (
                    <p className="text-sm text-gray-500">Auto-filled from your profile</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseId">Select Course *</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => {
                      handleInputChange("courseId", value);
                      handleInputChange("collegeId", "");
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.course_name} ({course.component})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.courseId && (
                  <div className="space-y-2">
                    <Label htmlFor="collegeId">Select College *</Label>
                    <Select
                      value={formData.collegeId}
                      onValueChange={(value) => handleInputChange("collegeId", value)}
                      required
                      disabled={filteredColleges.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a college offering this course" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredColleges.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No colleges available for this course
                          </SelectItem>
                        ) : (
                          filteredColleges.map((college) => (
                            <SelectItem key={college.id} value={college.id}>
                              {college.name} - {college.district}, {college.state}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {filteredColleges.length === 0 && formData.courseId && (
                      <p className="text-sm text-amber-600">
                        No colleges currently offer this course. Please select a different course or contact support.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Choosing This Course *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => handleInputChange("reason", e.target.value)}
                    placeholder="Explain why you want to pursue this course and how it aligns with your career goals..."
                    rows={6}
                    required
                    minLength={50}
                  />
                  <p className="text-sm text-gray-500">
                    Minimum 50 characters. Be specific about your goals and motivations.
                  </p>
                </div>

                {selectedCourse && selectedCollege && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Registration Summary:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li><strong>Course:</strong> {selectedCourse.course_name}</li>
                      <li><strong>Component:</strong> {selectedCourse.component}</li>
                      <li><strong>College:</strong> {selectedCollege.name}</li>
                      <li><strong>Location:</strong> {selectedCollege.district}, {selectedCollege.state}</li>
                    </ul>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || filteredColleges.length === 0}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Submitting..." : "Submit Registration"}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 className="h-12 w-12 text-green-600 flex-shrink-0" />
                      <div>
                        <h3 className="text-2xl font-bold text-green-900 mb-2">
                          Registration Submitted Successfully
                        </h3>
                        <p className="text-green-800 mb-4">
                          Your course registration has been submitted for admin approval. You will be notified
                          once a decision is made.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900">What Happens Next?</h4>
                  <ol className="list-decimal list-inside space-y-2 text-blue-800">
                    <li>Your registration will be reviewed by the admin team</li>
                    <li>Admin will verify your eligibility and course availability</li>
                    <li>You will receive an email notification with the decision</li>
                    <li>If accepted, you'll receive further instructions for enrollment</li>
                    <li>Check "My Registrations" to track your application status</li>
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => navigate("/citizen/registrations")}
                    className="flex-1"
                  >
                    View My Registrations
                  </Button>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: userName,
                        courseId: "",
                        collegeId: "",
                        reason: ""
                      });
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Register for Another Course
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
