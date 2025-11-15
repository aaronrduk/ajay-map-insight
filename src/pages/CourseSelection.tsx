import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCourses, registerForCourse, Course } from "@/lib/api";
import { getAllStates } from "@/data/india-geography";
import { GraduationCap, ExternalLink, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const CourseSelection = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [component, setComponent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [state, setState] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const components = ["Skill Development", "Higher Education", "Vocational Training"];
  const states = getAllStates();

  const handleComponentSelect = (value: string) => {
    setComponent(value);
    setStep(2);
  };

  const handleCourseSearch = async () => {
    if (!state) {
      toast({
        title: "State Required",
        description: "Please select a state to continue",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await fetchCourses(component, state);
      setCourses(data);
      setStep(3);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registrationData.name || !registrationData.email || !registrationData.phone) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await registerForCourse({
        ...registrationData,
        state,
        course: selectedCourse,
        component,
      });

      if (result.success) {
        setSubmitted(true);
        toast({
          title: "Registration Successful",
          description: `Your registration ID is ${result.registrationId}`,
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <CheckCircle className="h-20 w-20 text-success mx-auto" />
              <h2 className="text-3xl font-bold">Registration Successful!</h2>
              <p className="text-muted-foreground">
                Your course registration has been submitted successfully.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg space-y-2 text-left">
                <p><strong>Course:</strong> {selectedCourse}</p>
                <p><strong>State:</strong> {state}</p>
                <p><strong>Component:</strong> {component}</p>
              </div>
              <Button onClick={() => window.location.reload()}>Register for Another Course</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <GraduationCap className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Course Selection & Registration
          </h1>
          <p className="text-muted-foreground text-lg">
            Find and register for courses under PM-AJAY schemes
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`h-1 w-16 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Component */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Component</CardTitle>
              <CardDescription>Choose the PM-AJAY component you're interested in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {components.map((comp) => (
                  <Card
                    key={comp}
                    className="cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => handleComponentSelect(comp)}
                  >
                    <CardContent className="pt-6 text-center">
                      <GraduationCap className="h-12 w-12 text-primary mx-auto mb-3" />
                      <p className="font-semibold">{comp}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select State */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select State</CardTitle>
              <CardDescription>Choose your state to find available courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selected Component</Label>
                <div>
                  <Badge variant="outline" className="text-base px-4 py-2">{component}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleCourseSearch} disabled={!state || loading}>
                  {loading ? "Loading..." : "Search Courses"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: View Courses & Register */}
        {step === 3 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Courses List */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Courses</CardTitle>
                  <CardDescription>
                    Courses available in {state} under {component}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {courses.map((course) => (
                    <Card
                      key={course.id}
                      className={`cursor-pointer transition-all ${
                        selectedCourse === course.name
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/30"
                      }`}
                      onClick={() => setSelectedCourse(course.name)}
                    >
                      <CardContent className="pt-6 space-y-3">
                        <h3 className="text-lg font-semibold">{course.name}</h3>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground font-semibold">Colleges Offering:</p>
                          {course.colleges.map((college, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-muted/30 p-3 rounded">
                              <div>
                                <p className="font-medium text-sm">{college.name}</p>
                                <p className="text-xs text-muted-foreground">{college.location}</p>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={college.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Registration Form */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Registration Form</CardTitle>
                  <CardDescription>Fill in your details to register</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Selected Course</Label>
                      <Input value={selectedCourse || "Select a course"} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={registrationData.name}
                        onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registrationData.email}
                        onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={registrationData.phone}
                        onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={!selectedCourse}>
                      Submit Registration
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CourseSelection;
