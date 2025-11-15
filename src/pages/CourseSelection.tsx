import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCourses, useColleges, useSubmitRegistration } from "@/hooks/use-api";
import { components } from "@/data/agencies";
import { getAllStates } from "@/data/india-geography";
import { GraduationCap, CheckCircle, ExternalLink, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const CourseSelection = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    phone: "",
    document_url: "",
  });

  const { data: courses, isLoading: coursesLoading } = useCourses(selectedComponent);
  const { data: colleges, isLoading: collegesLoading } = useColleges(selectedState, selectedCourse);
  const submitRegistration = useSubmitRegistration();

  const selectedCourseDetails = courses?.find((c) => c.id === selectedCourse);

  const handleSubmitRegistration = async (e: React.FormEvent) => {
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
      await submitRegistration.mutateAsync({
        ...registrationData,
        state: selectedState,
        course_id: selectedCourse,
        component: selectedComponent,
      });

      toast({
        title: "Registration Successful",
        description: "Your course registration has been submitted successfully",
      });

      setShowRegistration(false);
      setStep(4);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your registration",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Component</CardTitle>
              <CardDescription>Choose the PM-AJAY scheme component</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                {components.map((comp) => (
                  <Button
                    key={comp}
                    variant={selectedComponent === comp ? "default" : "outline"}
                    className="h-auto py-4 text-left justify-start"
                    onClick={() => setSelectedComponent(comp)}
                  >
                    <div>
                      <p className="font-semibold">{comp}</p>
                    </div>
                  </Button>
                ))}
              </div>
              <Button onClick={() => setStep(2)} disabled={!selectedComponent} className="w-full">
                Next: Select Course
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select Course</CardTitle>
              <CardDescription>Choose a course under {selectedComponent}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Selected Component:</p>
                <p className="font-semibold text-primary">{selectedComponent}</p>
              </div>

              {coursesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading courses...</div>
              ) : courses && courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <Card
                      key={course.id}
                      className={`cursor-pointer transition-all ${
                        selectedCourse === course.id ? "border-primary border-2" : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedCourse(course.id)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <h3 className="font-semibold text-lg">{course.course_name}</h3>
                            <p className="text-sm text-muted-foreground">{course.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{course.duration}</Badge>
                              <Badge variant="secondary">Eligibility: {course.eligibility}</Badge>
                            </div>
                          </div>
                          {selectedCourse === course.id && (
                            <CheckCircle className="h-6 w-6 text-primary ml-4" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No courses available for this component
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!selectedCourse} className="flex-1">
                  Next: Select State
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Select State & View Colleges</CardTitle>
                  <CardDescription>Choose your state to find colleges offering this course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select State</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllStates().map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back to Courses
                  </Button>
                </CardContent>
              </Card>

              {selectedState && (
                <Card>
                  <CardHeader>
                    <CardTitle>Colleges Offering This Course</CardTitle>
                    <CardDescription>
                      Colleges in {selectedState} for {selectedCourseDetails?.course_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {collegesLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading colleges...</div>
                    ) : colleges && colleges.length > 0 ? (
                      <div className="space-y-4">
                        {colleges.map((college: any) => (
                          <Card key={college.id}>
                            <CardContent className="pt-4">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg">{college.name}</h3>
                                <p className="text-sm text-muted-foreground">{college.address}</p>
                                <p className="text-sm text-muted-foreground">District: {college.district}</p>
                                {college.contact && (
                                  <p className="text-sm text-muted-foreground">Contact: {college.contact}</p>
                                )}
                                {college.website && (
                                  <a
                                    href={college.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                  >
                                    Visit Website <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                                {college.college_courses && (
                                  <Badge>
                                    {college.college_courses.seats_available} seats available
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No colleges found in this state for the selected course
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Registration Form Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Registration Form</CardTitle>
                  <CardDescription>Register your interest in this course</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitRegistration} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={registrationData.name}
                        onChange={(e) =>
                          setRegistrationData({ ...registrationData, name: e.target.value })
                        }
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registrationData.email}
                        onChange={(e) =>
                          setRegistrationData({ ...registrationData, email: e.target.value })
                        }
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={registrationData.phone}
                        onChange={(e) =>
                          setRegistrationData({ ...registrationData, phone: e.target.value })
                        }
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document">Document Upload (Optional)</Label>
                      <div className="flex items-center gap-2">
                        <Input id="document" type="file" accept=".pdf,.jpg,.png" />
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                      <p className="text-xs text-muted-foreground">Component:</p>
                      <p className="text-sm font-semibold">{selectedComponent}</p>
                      <p className="text-xs text-muted-foreground mt-2">Course:</p>
                      <p className="text-sm font-semibold">{selectedCourseDetails?.course_name}</p>
                      <p className="text-xs text-muted-foreground mt-2">State:</p>
                      <p className="text-sm font-semibold">{selectedState || "Not selected"}</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!selectedState || submitRegistration.isPending}
                    >
                      {submitRegistration.isPending ? "Submitting..." : "Submit Registration"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <CheckCircle className="h-20 w-20 text-secondary mx-auto" />
              <h2 className="text-3xl font-bold text-foreground">Registration Successful!</h2>
              <p className="text-muted-foreground">
                Your course registration has been submitted successfully. You will receive a confirmation email shortly.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg space-y-3 text-left">
                <h3 className="font-semibold text-lg">Registration Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {registrationData.name}</p>
                  <p><strong>Email:</strong> {registrationData.email}</p>
                  <p><strong>Component:</strong> {selectedComponent}</p>
                  <p><strong>Course:</strong> {selectedCourseDetails?.course_name}</p>
                  <p><strong>State:</strong> {selectedState}</p>
                </div>
              </div>
              <Button onClick={() => {
                setStep(1);
                setSelectedComponent("");
                setSelectedCourse("");
                setSelectedState("");
                setRegistrationData({ name: "", email: "", phone: "", document_url: "" });
              }}>
                Register for Another Course
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <GraduationCap className="h-10 w-10 text-primary" />
            Course Selection & Registration
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find and register for skill development courses under PM-AJAY scheme
          </p>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 w-16 ${
                      step > s ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {renderStep()}
      </div>
    </Layout>
  );
};

export default CourseSelection;
