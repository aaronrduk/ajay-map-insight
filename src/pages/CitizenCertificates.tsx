import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye, Award, CheckCircle2, Calendar, FileText } from "lucide-react";
import Layout from "@/components/Layout";
import { certificateService, Certificate } from "@/lib/certificate-service";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CitizenCertificates() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await certificateService.getMyCertificates();
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId: string, certNumber: string) => {
    try {
      toast.info("Generating certificate...");
      await certificateService.downloadCertificate(certificateId);
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download certificate");
    }
  };

  const handleView = async (certificateId: string) => {
    try {
      const result = await certificateService.generateCertificatePDF(certificateId);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(result.html);
        newWindow.document.close();
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("Failed to view certificate");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/citizen-dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Certificates</h1>
              <p className="text-lg text-gray-600">
                View and download your course admission certificates
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : certificates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Certificates Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Your certificates will appear here once your registrations are approved
              </p>
              <Button onClick={() => navigate("/citizen/course-registration")}>
                Register for a Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-xl">{cert.course_name}</CardTitle>
                      </div>
                      <CardDescription className="text-base">
                        {cert.college_name}
                      </CardDescription>
                    </div>
                    {cert.revoked ? (
                      <Badge variant="destructive">Revoked</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Certificate Number</p>
                        <p className="font-mono font-semibold text-gray-900">
                          {cert.certificate_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Issued On</p>
                        <p className="font-semibold text-gray-900">
                          {format(new Date(cert.issued_at), "PPP")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {cert.revoked && cert.revoked_reason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Revocation Reason:</strong> {cert.revoked_reason}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleView(cert.id)}
                      variant="outline"
                      className="flex-1"
                      disabled={cert.revoked}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Certificate
                    </Button>
                    <Button
                      onClick={() => handleDownload(cert.id, cert.certificate_number)}
                      className="flex-1"
                      disabled={cert.revoked}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">About Your Certificates</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2 text-sm">
              <li>• Certificates are automatically generated when your registration is approved</li>
              <li>• Each certificate has a unique number and QR code for verification</li>
              <li>• You can download certificates as HTML files and print them</li>
              <li>• Certificates can be verified using the QR code or certificate number</li>
              <li>• Keep your certificate safe - you may need it for admission purposes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
