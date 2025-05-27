import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NewLanding = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* Navigation */}
      <div className="bg-white py-4 px-6 flex justify-between items-center">
        <img
          src="/images/rtgradey-logo.svg"
          alt="RTGradey Logo"
          className="h-10"
        />
        <div className="flex items-center gap-4">
          <Link to="/about" className="text-gray-600 hover:text-gray-900">
            About
          </Link>
          <Link to="/features" className="text-gray-600 hover:text-gray-900">
            Features
          </Link>
          <Link to="/pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <Button variant="outline" className="rounded-full">
            <Link to="/login">Log in</Link>
          </Button>
          <Button className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B] rounded-full">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-medium mb-4">
          AI-Powered Essay Grading Platform
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Transform essay assessment through AI-driven feedback, custom rubrics,
          and peer learning capabilities, helping educators save time while
          providing students with consistent, personalized writing guidance.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="rounded-full px-6">
            <Link to="/about">
              Learn more <span className="ml-1">›</span>
            </Link>
          </Button>
          <Button className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B] rounded-full px-6">
            <Link to="/signup">
              Get started <span className="ml-1">›</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Try it now section */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-bold mb-8">
          Try it now.{" "}
          <span className="bg-[#FFB672]/20 px-2 py-1 rounded">
            It takes 10s
          </span>
        </h2>
        <p className="text-gray-600 mb-6">Use your own data or</p>
        <Button
          variant="outline"
          className="bg-[#FFB672]/10 border-[#FFB672] text-[#1B1B1B] mb-12"
          onClick={() => {
            const instructionsElement = document.getElementById(
              "assignmentInstructions",
            ) as HTMLTextAreaElement | null;

            const answerElement = document.getElementById(
              "studentAnswer",
            ) as HTMLTextAreaElement | null;

            if (instructionsElement) {
              instructionsElement.value =
                "Write a 500-word essay discussing the impact of artificial intelligence on modern education. Include examples and consider both benefits and potential drawbacks.";
            }

            if (answerElement) {
              answerElement.value =
                "Artificial intelligence has transformed education by providing personalized learning experiences, automating grading, and offering intelligent tutoring systems. Students can now receive immediate feedback and tailored content based on their learning pace and style. However, concerns about privacy, over-reliance on technology, and the digital divide remain significant challenges that educational institutions must address as they integrate AI into their systems.\n\nOne of the most significant benefits of AI in education is personalization. Traditional classrooms often struggle to accommodate different learning styles and paces. AI-powered adaptive learning platforms like Carnegie Learning and DreamBox can analyze student performance in real-time and adjust content difficulty accordingly. For example, if a student excels at algebraic equations but struggles with geometry, the system can provide more practice in geometry while advancing algebra concepts. This targeted approach helps students build confidence in areas of strength while improving areas of weakness.";
            }
          }}
        >
          Fill in with sample
        </Button>

        {/* Two column layout */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-left">
            <h3 className="text-xl font-medium mb-2 flex items-center">
              Assignment Instructions
              <ArrowRight className="ml-2 h-4 w-4" />
            </h3>
            <p className="text-gray-500 mb-4">
              Paste the prompt you gave your students
            </p>
            <div className="border border-gray-300 rounded-lg p-4 h-48 bg-white">
              <textarea
                className="w-full h-full resize-none outline-none text-gray-700"
                placeholder="Enter the assignment instructions here..."
                id="assignmentInstructions"
              ></textarea>
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-xl font-medium mb-2 flex items-center">
              Student Answer
              <ArrowRight className="ml-2 h-4 w-4" />
            </h3>
            <p className="text-gray-500 mb-4">
              Paste the answer the student wrote
            </p>
            <div className="border border-gray-300 rounded-lg p-4 h-48 bg-white">
              <textarea
                className="w-full h-full resize-none outline-none text-gray-700"
                placeholder="Enter the student answer here..."
                id="studentAnswer"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Grade button */}
        <div className="mt-8 flex justify-center">
          <Button
            className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B] rounded-full px-8 py-2 text-lg"
            onClick={() => {
              const instructionsElement = document.getElementById(
                "assignmentInstructions",
              ) as HTMLTextAreaElement | null;
              const answerElement = document.getElementById(
                "studentAnswer",
              ) as HTMLTextAreaElement | null;

              const instructions = instructionsElement?.value;
              const answer = answerElement?.value;

              if (!instructions || !answer) {
                alert(
                  "Please fill in both the assignment instructions and student answer",
                );
                return;
              }

              // Store in localStorage to ensure data persists through navigation
              localStorage.setItem("gradeInstructions", instructions);
              localStorage.setItem("gradeAnswer", answer);

              // Set active page to essay-grading
              localStorage.setItem("activePage", "essay-grading");
              window.location.href = "/dashboard";
            }}
          >
            Grade Essay <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewLanding;
