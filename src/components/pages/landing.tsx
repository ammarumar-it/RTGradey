import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, CheckCircle, ArrowRight } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="flex items-center mb-4">
              <img
                src="/images/rtgradey-logo.svg"
                alt="RTGradey Logo"
                className="h-10"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1B1B1B] mb-6">
              AI-Powered Essay Grading Platform
            </h2>
            <p className="text-lg text-[#4A4A4A] mb-8">
              Transform essay assessment with AI-driven feedback, custom
              rubrics, and consistent, personalized writing guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B] px-8 py-6 text-lg"
                asChild
              >
                <Link to="/login">Get Started</Link>
              </Button>
              <Button
                variant="outline"
                className="border-[#FFB672] text-[#FFB672] hover:bg-[#FFB672]/10 px-8 py-6 text-lg"
                asChild
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="/images/tempo-image-20250518T023544249Z.png"
              alt="RTGradey Platform"
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#1B1B1B] mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAF6F0] p-6 rounded-xl">
              <div className="h-12 w-12 rounded-full bg-[#FFB672]/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-[#FFB672]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Custom Rubrics</h3>
              <p className="text-[#4A4A4A]">
                Build personalized grading rubrics with drag-and-drop criteria
                creation and flexible weighting options.
              </p>
            </div>
            <div className="bg-[#FAF6F0] p-6 rounded-xl">
              <div className="h-12 w-12 rounded-full bg-[#FFB672]/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-[#FFB672]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Evaluation</h3>
              <p className="text-[#4A4A4A]">
                Leverage advanced AI to provide consistent, detailed feedback on
                essays with customizable evaluation criteria.
              </p>
            </div>
            <div className="bg-[#FAF6F0] p-6 rounded-xl">
              <div className="h-12 w-12 rounded-full bg-[#FFB672]/20 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-[#FFB672]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">LMS Integration</h3>
              <p className="text-[#4A4A4A]">
                Seamlessly sync grades and feedback with popular learning
                management systems like Canvas and Moodle.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="bg-[#FFB672]/10 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-[#1B1B1B] mb-4">
            Ready to transform essay grading?
          </h2>
          <p className="text-lg text-[#4A4A4A] mb-8 max-w-2xl mx-auto">
            Join educators worldwide who are saving time and providing better
            feedback with RTGradey.
          </p>
          <Button
            className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B] px-8 py-6 text-lg"
            asChild
          >
            <Link to="/signup">
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img
                src="/images/rtgradey-logo.svg"
                alt="RTGradey Logo"
                className="h-8"
              />
            </div>
            <div className="text-[#4A4A4A] text-sm">
              © {new Date().getFullYear()} RTGradey. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
