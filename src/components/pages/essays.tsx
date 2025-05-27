import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  FileText,
  RefreshCw,
  Search,
  Plus,
  Filter,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GradedEssay {
  id: string;
  user_id: string;
  student_name: string;
  assignment_title: string;
  instructions: string;
  answer: string;
  summary: string;
  feedback: any[];
  rubric: any[];
  total_score: number;
  max_score: number;
  created_at: string;
}

const EssaysPage = () => {
  const { user } = useAuth();
  const [gradedEssays, setGradedEssays] = useState<GradedEssay[]>([]);
  const [filteredEssays, setFilteredEssays] = useState<GradedEssay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchGradedEssays();
    }
  }, [user]);

  const fetchGradedEssays = async () => {
    setLoading(true);
    try {
      // Make sure we're getting fresh data from the server, not cached data
      const { data, error } = await supabase
        .from("graded_essays")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000) // Ensure we get all essays
        .throwOnError();

      if (error) throw error;
      setGradedEssays(data || []);
      setFilteredEssays(data || []);
      setSearchQuery(""); // Reset search query when refreshing
    } catch (err) {
      console.error("Error fetching graded essays:", err);
      toast({
        title: "Error",
        description: "Failed to refresh essays. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = score / maxScore;
    if (percentage >= 0.8) return "text-green-600";
    if (percentage >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeLevel = (score: number, maxScore: number) => {
    const percentage = score / maxScore;
    if (percentage >= 0.9) return "A";
    if (percentage >= 0.8) return "B";
    if (percentage >= 0.7) return "C";
    if (percentage >= 0.6) return "D";
    return "F";
  };

  const handleViewEssay = (essay: GradedEssay) => {
    // Store essay data in localStorage
    localStorage.setItem("gradeInstructions", essay.instructions);
    localStorage.setItem("gradeAnswer", essay.answer);
    localStorage.setItem("activePage", "essay-grading");

    // Navigate to dashboard with essay grading interface active
    window.location.href = "/dashboard";
  };

  const handleDeleteEssay = async (
    essayId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation(); // Prevent triggering the card click
    try {
      // Delete from database with throwOnError to ensure we get any errors
      const { error } = await supabase
        .from("graded_essays")
        .delete()
        .eq("id", essayId)
        .throwOnError();

      if (error) throw error;

      // Update the local state immediately
      const updatedEssays = gradedEssays.filter(
        (essay) => essay.id !== essayId,
      );
      setGradedEssays(updatedEssays);
      setFilteredEssays(
        updatedEssays.filter((essay) => {
          if (searchQuery.trim() === "") return true;
          return (
            essay.assignment_title
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (essay.student_name &&
              essay.student_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
          );
        }),
      );

      toast({
        title: "Essay deleted",
        description: "The essay has been successfully deleted.",
      });
    } catch (err) {
      console.error("Error deleting essay:", err);
      toast({
        title: "Error",
        description: "Failed to delete essay. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllEssays = async () => {
    try {
      if (!user) return;

      // Delete all essays with throwOnError to ensure we get any errors
      const { error } = await supabase
        .from("graded_essays")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      // Clear the essays from state
      setGradedEssays([]);
      setFilteredEssays([]);

      toast({
        title: "All essays deleted",
        description: "All graded essays have been successfully deleted.",
      });
    } catch (err) {
      console.error("Error deleting all essays:", err);
      toast({
        title: "Error",
        description: "Failed to delete essays. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEssays(gradedEssays);
    } else {
      const filtered = gradedEssays.filter(
        (essay) =>
          essay.assignment_title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (essay.student_name &&
            essay.student_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())),
      );
      setFilteredEssays(filtered);
    }
  }, [searchQuery, gradedEssays]);

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activePage="essay-grading" />
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#1B1B1B]">
                Graded Essays
              </h2>
              <Button
                className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]"
                onClick={() => {
                  localStorage.setItem("activePage", "essay-grading");
                  window.location.href = "/dashboard";
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add rubric
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search essays..."
                  className="pl-9 h-10 rounded-lg bg-white border border-gray-200 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="text-gray-600 border-gray-200 hover:bg-gray-100"
              >
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button
                onClick={fetchGradedEssays}
                variant="outline"
                className="text-gray-600 border-gray-200 hover:bg-gray-100"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    disabled={gradedEssays.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Essays</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete all graded essays? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={async () => {
                        try {
                          if (!user) return;

                          // Direct database operation instead of using the handler
                          const { error } = await supabase
                            .from("graded_essays")
                            .delete()
                            .eq("user_id", user.id);

                          if (error) throw error;

                          // Clear the essays from state
                          setGradedEssays([]);
                          setFilteredEssays([]);

                          toast({
                            title: "All essays deleted",
                            description:
                              "All graded essays have been successfully deleted.",
                          });

                          // Force a refresh from the database after deletion
                          await fetchGradedEssays();
                        } catch (err) {
                          console.error("Error deleting all essays:", err);
                          toast({
                            title: "Error",
                            description:
                              "Failed to delete essays. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredEssays.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 border border-[#E5E5E5] text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No graded essays found
                </h3>
                <p className="text-gray-500 mb-6">
                  You haven't graded any essays yet. Start by grading your first
                  essay.
                </p>
                <Button
                  className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]"
                  onClick={() => {
                    localStorage.setItem("activePage", "essay-grading");
                    window.location.href = "/dashboard";
                  }}
                >
                  Grade an Essay
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredEssays.map((essay) => (
                  <div
                    key={essay.id}
                    className="bg-white rounded-lg shadow-sm p-6 border border-[#E5E5E5] hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewEssay(essay)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          {essay.assignment_title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {essay.student_name
                            ? `Student: ${essay.student_name}`
                            : "Unnamed Student"}
                        </p>
                        <p className="text-sm text-gray-400">
                          Graded on{" "}
                          {new Date(essay.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="mr-2 text-gray-500 hover:text-red-500 hover:bg-red-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Essay</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this essay? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={(e) => e.stopPropagation()}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={async (e) => {
                                  await handleDeleteEssay(essay.id, e);
                                  // Force a refresh from the database after deletion
                                  await fetchGradedEssays();
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <div className="text-3xl font-bold mr-3 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                          <span
                            className={getScoreColor(
                              essay.total_score,
                              essay.max_score,
                            )}
                          >
                            {getGradeLevel(essay.total_score, essay.max_score)}
                          </span>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            {essay.total_score} / {essay.max_score}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.round(
                              (essay.total_score / essay.max_score) * 100,
                            )}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {essay.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EssaysPage;
