import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import DashboardGrid from "../dashboard/DashboardGrid";
import TaskBoard from "../dashboard/TaskBoard";
import EssayGradingInterface from "../essay-grading/EssayGradingInterface";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  FileText,
  BookOpen,
  GraduationCap,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { getRubrics } from "@/lib/database";
import { Rubric, GradedEssay } from "@/types/database.types";

interface Classroom {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  student_count: number;
  created_at: string;
}

const Home = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState("");
  const [gradedEssays, setGradedEssays] = useState<GradedEssay[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);

  useEffect(() => {
    // Check for welcome message in localStorage
    const username = localStorage.getItem("welcomeUser");
    if (username) {
      setWelcomeUsername(username);
      setShowWelcome(true);
      // Remove after 5 seconds
      setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
      // Clear from localStorage
      localStorage.removeItem("welcomeUser");
    }

    // Fetch data when component mounts
    if (user) {
      fetchGradedEssays();
      fetchClassrooms();
      fetchRubrics();
    }
  }, [user]);

  const fetchGradedEssays = async () => {
    try {
      const { data, error } = await supabase
        .from("graded_essays")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGradedEssays(data || []);
    } catch (err) {
      console.error("Error fetching graded essays:", err);
    }
  };

  const fetchClassrooms = async () => {
    try {
      // First try to get classrooms where the user is a teacher
      const { data, error } = await supabase
        .from("classrooms")
        .select("*, classroom_students(count)")
        .eq("teacher_id", user?.id || "");

      if (error) throw error;

      // Transform the data to include student count
      const classroomsWithCount =
        data?.map((classroom) => ({
          ...classroom,
          student_count: classroom.classroom_students?.[0]?.count || 0,
        })) || [];

      setClassrooms(classroomsWithCount);
    } catch (err) {
      console.error("Error fetching classrooms:", err);
    }
  };

  const fetchRubrics = async () => {
    try {
      const { data: rubricsData, error } = await getRubrics();

      if (error) throw error;

      // Get criteria counts for each rubric
      if (rubricsData && rubricsData.length > 0) {
        const rubricsWithCounts = await Promise.all(
          rubricsData.map(async (rubric) => {
            const { count, error: countError } = await supabase
              .from("rubric_criteria")
              .select("id", { count: "exact" })
              .eq("rubric_id", rubric.id);

            return {
              ...rubric,
              criteria_count: count || 0,
            } as Rubric;
          }),
        );

        setRubrics(rubricsWithCounts);
      } else {
        setRubrics([]);
      }
    } catch (err) {
      console.error("Error fetching rubrics:", err);
    }
  };

  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    // Check localStorage for active page
    const storedActivePage = localStorage.getItem("activePage");
    if (storedActivePage) {
      // Set the active page
      setActivePage(storedActivePage);
      // Clear from localStorage to prevent reuse on refresh
      localStorage.removeItem("activePage");
    }

    // Check localStorage for essay grading data
    const instructions = localStorage.getItem("gradeInstructions");
    const answer = localStorage.getItem("gradeAnswer");

    if (instructions && answer) {
      setActivePage("essay-grading");
    }

    // Check for state passed via location
    if (location.state?.activePage) {
      setActivePage(location.state.activePage);
    }
  }, [location.state]);

  // Fetch data when component mounts
  useEffect(() => {
    if (activePage === "rubrics") {
      fetchRubrics();
    }
  }, [activePage]);

  // Function to refresh all dashboard data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchGradedEssays(),
        fetchClassrooms(),
        fetchRubrics(),
      ]);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function for score color
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = score / maxScore;
    if (percentage >= 0.8) return "text-green-600";
    if (percentage >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  // We're now using React Router links directly in the Sidebar component
  // so we don't need this navigation effect anymore

  const [showRubricCreator, setShowRubricCreator] = useState(false);
  const [rubricName, setRubricName] = useState("");
  const [gradeType, setGradeType] = useState("levels");

  const renderPageContent = () => {
    switch (activePage) {
      case "essay-grading":
        return <EssayGradingInterface />;
      case "rubrics":
        return renderRubricsPage();
      case "dashboard":
      default:
        return (
          <>
            <div className="container mx-auto px-6 pt-4 pb-2 flex justify-end">
              <Button
                onClick={handleRefresh}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Loading..." : "Refresh Dashboard"}
              </Button>
            </div>
            <div
              className={cn(
                "container mx-auto p-6 space-y-8",
                "transition-all duration-300 ease-in-out",
              )}
            >
              {renderDashboardSections()}
            </div>
          </>
        );
    }
  };

  const renderDashboardSections = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Graded Essays Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-[#FFB672]/20 flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-[#FFB672]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1B1B1B]">
                  Graded Essays
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#4A4A4A] hover:text-[#1B1B1B]"
                onClick={() => (window.location.href = "/essays")}
              >
                View all
              </Button>
            </div>
            <div className="space-y-4">
              {gradedEssays.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No graded essays found
                </p>
              ) : (
                gradedEssays.slice(0, 2).map((essay) => (
                  <div
                    key={essay.id}
                    className="p-4 border border-[#E5E5E5] rounded-lg hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{essay.assignment_title}</h4>
                      <span
                        className={`text-sm ${getScoreColor(essay.total_score, essay.max_score).replace("text-", "bg-").replace("600", "100")} ${getScoreColor(essay.total_score, essay.max_score)} py-1 px-2 rounded-full`}
                      >
                        {Math.round(
                          (essay.total_score / essay.max_score) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <p className="text-sm text-[#4A4A4A] mt-1">
                      {essay.student_name || "Unnamed Student"}
                    </p>
                    <p className="text-xs text-[#A0A0A0] mt-2">
                      Graded {new Date(essay.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Classrooms Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center mr-3">
                  <BookOpen className="h-5 w-5 text-[#FFD700]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1B1B1B]">
                  Classrooms
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#4A4A4A] hover:text-[#1B1B1B]"
                onClick={() => setActivePage("classrooms")}
              >
                View all
              </Button>
            </div>
            <div className="space-y-4">
              {classrooms.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No classrooms found
                </p>
              ) : (
                classrooms.slice(0, 2).map((classroom) => (
                  <div
                    key={classroom.id}
                    className="p-4 border border-[#E5E5E5] rounded-lg hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{classroom.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                        {classroom.student_count || 0} students
                      </span>
                    </div>
                    <p className="text-sm text-[#4A4A4A] mt-1">
                      {classroom.description || "No description"}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-6 w-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs"
                          >
                            {i}
                          </div>
                        ))}
                      </div>
                      {classroom.student_count > 3 && (
                        <span className="text-xs text-[#A0A0A0] ml-2">
                          +{classroom.student_count - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rubrics Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-[#FFB672]/20 flex items-center justify-center mr-3">
                  <GraduationCap className="h-5 w-5 text-[#FFB672]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1B1B1B]">
                  Rubrics
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#4A4A4A] hover:text-[#1B1B1B]"
                onClick={() => setActivePage("rubrics")}
              >
                View all
              </Button>
            </div>
            <div className="space-y-4">
              {rubrics.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No rubrics found
                </p>
              ) : (
                rubrics.slice(0, 2).map((rubric) => (
                  <div
                    key={rubric.id}
                    className="p-4 border border-[#E5E5E5] rounded-lg hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                  >
                    <h4 className="font-medium">{rubric.name}</h4>
                    <p className="text-sm text-[#4A4A4A] mt-1">
                      {(rubric as any).criteria_count || 0} criteria •{" "}
                      {rubric.category || "General"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Button outside the space-y-4 div but inside the rubrics section */}
          <Button
            className="w-full mt-2 bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]"
            onClick={() => setActivePage("rubrics")}
          >
            <Plus className="h-4 w-4 mr-2" /> Create Rubric
          </Button>
        </div>
      </>
    );
  };

  const renderRubricsPage = () => {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#1B1B1B]">My Rubrics</h2>
          <Button
            className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]"
            onClick={() => setShowRubricCreator(true)}
          >
            Add rubric
          </Button>
        </div>

        {showRubricCreator ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5] mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#1B1B1B]">
                Create Rubric
              </h3>
              <Button
                variant="ghost"
                className="text-[#4A4A4A] hover:text-[#1B1B1B]"
                onClick={() => setShowRubricCreator(false)}
              >
                Cancel
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium mb-2">Rubric name</h4>
                <input
                  type="text"
                  className="w-full p-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB672]"
                  placeholder="New rubric"
                  value={rubricName}
                  onChange={(e) => setRubricName(e.target.value)}
                />
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Grade type</h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gradeType"
                      value="levels"
                      checked={gradeType === "levels"}
                      onChange={() => setGradeType("levels")}
                      className="h-4 w-4 text-[#FFB672] focus:ring-[#FFB672]"
                    />
                    <span>Levels</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gradeType"
                      value="points"
                      checked={gradeType === "points"}
                      onChange={() => setGradeType("points")}
                      className="h-4 w-4 text-[#FFB672] focus:ring-[#FFB672]"
                    />
                    <span>Points</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium mb-2">Generate via</h4>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-[#FAF6F0] hover:bg-[#F0EBE4] text-[#1B1B1B] border border-[#E5E5E5]">
                    <Sparkles className="h-4 w-4 mr-2 text-[#FFB672]" /> AI
                    Generator
                  </Button>
                  <Button className="bg-[#FAF6F0] hover:bg-[#F0EBE4] text-[#1B1B1B] border border-[#E5E5E5]">
                    <Upload className="h-4 w-4 mr-2" /> Upload CSV
                  </Button>
                  <Button className="bg-[#FAF6F0] hover:bg-[#F0EBE4] text-[#1B1B1B] border border-[#E5E5E5]">
                    <BookOpen className="h-4 w-4 mr-2" /> Common Core Standards
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] flex justify-end">
                <Button className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]">
                  Create rubric
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rubrics.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">
                No rubrics found. Create your first rubric to get started.
              </p>
            </div>
          ) : (
            rubrics.map((rubric) => (
              <div
                key={rubric.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5] hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => (window.location.href = `/rubrics/${rubric.id}`)}
              >
                <h3 className="font-medium mb-2">{rubric.name}</h3>
                <p className="text-sm text-[#4A4A4A] mb-4">
                  {(rubric as any).criteria_count || 0} criteria •{" "}
                  {rubric.category || "General"}
                </p>
                <div className="flex items-center text-xs text-[#A0A0A0]">
                  <span>
                    Last edited:{" "}
                    {new Date(
                      rubric.updated_at || rubric.created_at,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <TopNavigation />
      {showWelcome && (
        <div className="fixed top-20 right-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-fade-in-down">
          <div className="flex items-center">
            <div className="py-1">
              <p className="font-bold">Welcome back, {welcomeUsername}!</p>
              <p className="text-sm">You've successfully logged in.</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activePage={activePage} onPageChange={setActivePage} />
        <main className="flex-1 overflow-auto p-6">{renderPageContent()}</main>
      </div>
    </div>
  );
};

export default Home;
