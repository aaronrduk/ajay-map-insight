import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee, FileText, Users, CheckCircle2, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";

export default function GrantInAid() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Grant-in-Aid
          </h1>
          <p className="text-lg text-gray-600">
            Financial support available to eligible SC citizens under PM AJAY
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Objective of Grant-in-Aid</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                The Grant-in-Aid scheme under PM AJAY aims to provide financial assistance
                to eligible Scheduled Caste citizens for educational development, skill
                enhancement, and economic empowerment. This initiative supports beneficiaries
                in pursuing higher education and vocational training programs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Who Can Apply</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Applicant must belong to Scheduled Caste (SC) category</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Annual family income should not exceed ₹2,50,000</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Must be a citizen of India</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Age between 18-35 years (varies by component)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Amount of Financial Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Educational Grant</span>
                  <span className="text-lg font-bold text-orange-600">₹20,000 - ₹50,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Skill Training Grant</span>
                  <span className="text-lg font-bold text-orange-600">₹15,000 - ₹30,000</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Business Setup Grant</span>
                  <span className="text-lg font-bold text-orange-600">₹50,000 - ₹1,00,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Required Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Caste Certificate (SC)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Income Certificate (not exceeding ₹2,50,000)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Aadhaar Card</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Bank Account Details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Educational Certificates (if applicable)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">•</span>
                  <span>Passport Size Photograph</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Check Your Eligibility Now
                </h3>
                <p className="text-gray-700">
                  Find out if you qualify for Grant-in-Aid support in just a few minutes
                </p>
              </div>
              <Link to="/citizen/grant-in-aid/eligibility">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  Check Eligibility
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-yellow-600 text-xl">ℹ</span>
            Important Note
          </h4>
          <p className="text-gray-700">
            The eligibility check is a preliminary assessment only. Final approval is subject
            to document verification and availability of funds. Applicants meeting the criteria
            will be contacted for further processing.
          </p>
        </div>
      </div>
    </Layout>
  );
}
