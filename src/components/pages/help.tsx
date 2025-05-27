import React from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  BookOpen,
  Video,
  MessageCircle,
  FileText,
  ExternalLink,
} from "lucide-react";

const Help = () => {
  const faqs = [
    {
      question: "How does AI essay grading work?",
      answer:
        "RTGradey uses advanced AI models to analyze essays based on custom rubrics. The system evaluates content, structure, grammar, and critical thinking to provide comprehensive feedback and scoring that's consistent with human grading standards.",
    },
    {
      question: "Can I customize the rubrics?",
      answer:
        "Yes, you can create custom rubrics with specific criteria and scoring weights. You can build them from scratch, use our templates, or import existing rubrics. The AI will adapt its grading to match your custom rubric requirements.",
    },
    {
      question: "How do I integrate with my LMS?",
      answer:
        "RTGradey supports integration with major Learning Management Systems like Canvas, Moodle, and Blackboard. Go to Settings > Integrations to connect your LMS account. Once connected, you can sync assignments, grades, and student rosters automatically.",
    },
    {
      question: "Is student data kept private and secure?",
      answer:
        "Yes, RTGradey takes data privacy seriously. All student data is encrypted, and we comply with FERPA and other educational privacy regulations. We never share or sell student data, and you can delete student information at any time.",
    },
    {
      question: "How accurate is the AI grading compared to human grading?",
      answer:
        "Our AI grading system has been trained on thousands of educator-graded essays and typically achieves 90-95% agreement with human graders. You can always review and adjust AI-generated grades before finalizing them.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activePage="help" />
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-[#1B1B1B] mb-6">
              Help Center
            </h2>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5] mb-8">
              <h3 className="text-lg font-medium mb-4">How can we help you?</h3>
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for help articles, tutorials, and more..."
                  className="pl-10 h-12 rounded-lg"
                />
              </div>
            </div>

            {/* Help Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5] hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-[#FFB672]/20 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-[#FFB672]" />
                </div>
                <h3 className="font-medium mb-2">Documentation</h3>
                <p className="text-sm text-[#4A4A4A] mb-4">
                  Browse our comprehensive guides and documentation
                </p>
                <Button variant="link" className="text-[#FFB672] p-0 h-auto">
                  View Documentation <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5] hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-[#FFD700]/20 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-[#FFD700]" />
                </div>
                <h3 className="font-medium mb-2">Video Tutorials</h3>
                <p className="text-sm text-[#4A4A4A] mb-4">
                  Watch step-by-step tutorials on using RTGradey
                </p>
                <Button variant="link" className="text-[#FFB672] p-0 h-auto">
                  Watch Tutorials <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5] hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-[#FFB672]/20 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-[#FFB672]" />
                </div>
                <h3 className="font-medium mb-2">Contact Support</h3>
                <p className="text-sm text-[#4A4A4A] mb-4">
                  Get help from our support team
                </p>
                <Button variant="link" className="text-[#FFB672] p-0 h-auto">
                  Contact Us <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5] mb-8">
              <div className="flex items-center mb-6">
                <FileText className="h-5 w-5 text-[#FFB672] mr-2" />
                <h3 className="text-lg font-medium">
                  Frequently Asked Questions
                </h3>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#4A4A4A]">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Still Need Help */}
            <div className="bg-[#FFB672]/10 rounded-xl p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Still Need Help?</h3>
              <p className="text-[#4A4A4A] mb-4 max-w-md mx-auto">
                Our support team is available Monday through Friday, 9am-5pm
                EST.
              </p>
              <Button className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]">
                <MessageCircle className="h-4 w-4 mr-2" /> Contact Support
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Help;
