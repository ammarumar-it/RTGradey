import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  Settings,
  User,
  BookOpen,
  PenTool,
  BarChart4,
  Layers,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";

export default function LandingPage() {
  const { user, signOut } = useAuth();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Apple-style navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-[#f5f5f7]/30">
        <div className="max-w-[980px] mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="font-medium text-xl">
              RTGradey
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-sm font-light hover:text-gray-500"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 hover:cursor-pointer">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback>
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-lg"
                  >
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => signOut()}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-light hover:text-gray-500"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-full bg-black text-white hover:bg-gray-800 text-sm px-4">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-12">
        {/* Hero section */}
        <section className="py-20 text-center">
          <h2 className="text-5xl font-semibold tracking-tight mb-1">
            RTGradey
          </h2>
          <h3 className="text-2xl font-medium text-gray-500 mb-4">
            AI-Powered Essay Grading Platform
          </h3>
          <p className="max-w-2xl mx-auto text-gray-600 mb-6">
            Transform essay assessment through AI-driven feedback, custom
            rubrics, and peer learning capabilities, helping educators save time
            while providing students with consistent, personalized writing
            guidance.
          </p>
          <div className="flex justify-center space-x-6 text-xl text-blue-600">
            <Link to="/" className="flex items-center hover:underline">
              Learn more <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/signup" className="flex items-center hover:underline">
              Get started <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Try it now section */}
          <div className="mt-16 max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-4xl font-bold text-[#001b44] mb-6">
              Try it now.{" "}
              <span className="bg-[#e6fbfa] px-2 py-1 rounded">
                It takes 10s
              </span>
            </h2>

            <div className="flex items-center justify-center mb-8">
              <p className="text-lg font-medium">Use your own data or</p>
              <Button
                variant="secondary"
                className="ml-4 bg-[#eef1ff] hover:bg-[#dce0ff] text-blue-600 font-medium"
                onClick={() => {
                  const instructionsElem = document.querySelector(
                    ".try-it-now-instructions",
                  ) as HTMLTextAreaElement;
                  const answerElem = document.querySelector(
                    ".try-it-now-answer",
                  ) as HTMLTextAreaElement;

                  if (instructionsElem && answerElem) {
                    instructionsElem.value =
                      "Analyze the themes of power and corruption in George Orwell's 'Animal Farm'.";
                    answerElem.value =
                      "If I could change the world, I would make pizza fly. Because pizza is good and if it can fly then it would be faster and cooler. Imagine you want pizza and then boom it comes flying in the sky like a bird or something. That would be awesome and people would be happy more. Also, flying pizza would help traffic. Because then people don't have to drive cars to get pizza. Cars are slow sometimes, and also traffic is annoying. But pizza in the air means no traffic pizza. And maybe the pizza can have wings or propellers or something. Furthermore, if pizza fly, then birds maybe want to eat it but we can figure that out later. The main thing is pizza flying is the best change. It helps hunger and makes the sky more interesting because now it's not just clouds, it's pizza too. In conclusion, the world needs flying pizza. That is my answer and I think it's a good one. Thank you for reading this essay I write.";
                  }
                }}
              >
                Fill in with sample
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-[#001b44]">
                    Assignment instructions
                  </h3>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-3">
                  Paste the prompt you gave your students
                </p>
                <textarea
                  className="try-it-now-instructions w-full border border-gray-300 rounded-lg p-4 h-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the assignment instructions here..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-[#001b44]">
                    Student Answer
                  </h3>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-3">
                  Paste the answer the student wrote
                </p>
                <textarea
                  className="try-it-now-answer w-full border border-gray-300 rounded-lg p-4 h-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the student answer here..."
                />
                <div className="flex items-center mt-2 text-blue-600">
                  <img
                    src="https://api.dicebear.com/7.x/shapes/svg?seed=google"
                    alt="Google icon"
                    className="w-5 h-5 mr-2"
                  />
                  <a href="#" className="text-blue-600 hover:underline">
                    Import essay (can be handwritten)
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8">
              <Button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-10 py-6 rounded-lg font-medium text-lg"
                onClick={() => {
                  const instructionsElem = document.querySelector(
                    ".try-it-now-instructions",
                  ) as HTMLTextAreaElement;
                  const answerElem = document.querySelector(
                    ".try-it-now-answer",
                  ) as HTMLTextAreaElement;

                  if (instructionsElem && answerElem) {
                    navigate("/dashboard", {
                      state: {
                        instructions: instructionsElem.value,
                        answer: answerElem.value,
                        activePage: "essay-grading",
                      },
                    });
                  }
                }}
              >
                Grade <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-20 bg-[#f5f5f7] text-center">
          <h2 className="text-5xl font-semibold tracking-tight mb-1">
            Key Features
          </h2>
          <h3 className="text-2xl font-medium text-gray-500 mb-4">
            Everything educators need for efficient essay grading
          </h3>
          <div className="flex justify-center space-x-6 text-xl text-blue-600">
            <Link to="/" className="flex items-center hover:underline">
              Explore features <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/" className="flex items-center hover:underline">
              View documentation <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <BarChart4 className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-medium mb-2">Intuitive Dashboard</h4>
              <p className="text-gray-500">
                Clean, intuitive dashboard showing pending essays, grading
                progress, and detailed analytics.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-medium mb-2">Custom Rubrics</h4>
              <p className="text-gray-500">
                Build custom rubrics with drag-and-drop criteria creation and
                flexible weighting options.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <PenTool className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-xl font-medium mb-2">AI Evaluation</h4>
              <p className="text-gray-500">
                AI-powered essay evaluation with side-by-side document view and
                inline feedback capabilities.
              </p>
            </div>
          </div>
        </section>

        {/* Grid section for other features */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
          <div className="bg-[#f5f5f7] rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-semibold tracking-tight mb-1">
              LMS Integration
            </h2>
            <h3 className="text-xl font-medium text-gray-500 mb-4">
              Seamless grade syncing
            </h3>
            <div className="flex justify-center space-x-6 text-lg text-blue-600">
              <Link to="/" className="flex items-center hover:underline">
                Learn more <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/" className="flex items-center hover:underline">
                View integrations <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm max-w-sm mx-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-2 border rounded-lg">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">
                    Canvas Integration
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 border rounded-lg">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">
                    Moodle Integration
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 border rounded-lg">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">
                    Blackboard Integration
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#f5f5f7] rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-semibold tracking-tight mb-1">
              Accessibility
            </h2>
            <h3 className="text-xl font-medium text-gray-500 mb-4">
              Designed for everyone
            </h3>
            <div className="flex justify-center space-x-6 text-lg text-blue-600">
              <Link to="/" className="flex items-center hover:underline">
                Learn more <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/" className="flex items-center hover:underline">
                View features <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm max-w-sm mx-auto text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">High contrast modes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">Screen reader compatibility</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">Keyboard navigation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">Text-to-speech support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Educator/Student section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-semibold tracking-tight mb-12 text-center">
              For Educators & Students
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-[#f5f5f7] p-8 rounded-2xl">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-medium mb-4">Educators</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Save time with AI-assisted grading and feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Create custom rubrics tailored to your assignments
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Track student progress with detailed analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Seamlessly sync grades with your LMS</span>
                  </li>
                </ul>
                <Button className="mt-6 rounded-full bg-black text-white hover:bg-gray-800">
                  Educator Sign Up
                </Button>
              </div>
              <div className="bg-[#f5f5f7] p-8 rounded-2xl">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-medium mb-4">Students</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Receive consistent, detailed feedback on your writing
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      Understand grading criteria with transparent rubrics
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Track your progress over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Submit essays and receive feedback quickly</span>
                  </li>
                </ul>
                <Button className="mt-6 rounded-full bg-black text-white hover:bg-gray-800">
                  Student Sign Up
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f5f5f7] py-12 text-xs text-gray-500">
        <div className="max-w-[980px] mx-auto px-4">
          <div className="border-b border-gray-300 pb-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                RTGradey
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Examples
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Getting Started
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                Community
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    YouTube
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Licenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="py-4">
            <p>Copyright © 2025 RTGradey. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
