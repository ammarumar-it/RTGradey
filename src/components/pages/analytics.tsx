import React, { useState, useEffect } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import {
  BarChart,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "../../supabase/supabase";
import { Analytics as AnalyticsType } from "@/types/database.types";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsType>({
    id: "",
    user_id: "",
    essays_graded: 0,
    average_grading_time: 0,
    rubrics_created: 0,
  });
  const [gradedEssays, setGradedEssays] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [dateRange, setDateRange] = useState("last30");

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch analytics data
      let analytics: AnalyticsType | null = null;
      try {
        const { data: analyticsData } = await supabase
          .from("analytics" as any)
          .select("*")
          .eq("user_id", user.id)
          .single();
        analytics = analyticsData;
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }

      // Fetch graded essays
      const { data: essays } = await supabase
        .from("graded_essays")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch rubrics
      const { data: rubricData } = await supabase
        .from("rubrics")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch user details to check if teacher
      let userDetails: any = null;
      try {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        userDetails = data;
      } catch (error) {
        console.error("Error fetching user details:", error);
      }

      let classroomData: any[] = [];
      let studentData: any[] = [];

      // Only fetch classrooms if user is a teacher
      if (userDetails?.user_type === "teacher") {
        try {
          // Use any type to bypass TypeScript checking for tables not in schema
          const { data: classrooms } = await supabase
            .from("classrooms" as any)
            .select("*")
            .eq("teacher_id", user.id);

          classroomData = classrooms || [];

          // Get all students in teacher's classrooms
          if (classroomData.length > 0) {
            const classroomIds = classroomData.map((c) => c.id);
            try {
              const { data: classroomStudents } = await supabase
                .from("classroom_students" as any)
                .select("student_id")
                .in("classroom_id", classroomIds);

              if (classroomStudents && classroomStudents.length > 0) {
                const studentIds = [
                  ...new Set(classroomStudents.map((cs: any) => cs.student_id)),
                ];
                const { data: students } = await supabase
                  .from("users")
                  .select("*")
                  .in("id", studentIds);

                studentData = students || [];
              }
            } catch (error) {
              console.error("Error fetching classroom students:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching classrooms:", error);
        }
      }

      setAnalyticsData(
        analytics || {
          id: "",
          user_id: user?.id || "",
          essays_graded: essays?.length || 0,
          rubrics_created: rubricData?.length || 0,
          average_grading_time: 2.4, // Default value if not available
        },
      );
      setGradedEssays(essays || []);
      setRubrics(rubricData || []);
      setClassrooms(classroomData);
      setStudents(studentData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate average score from graded essays
  const calculateAverageScore = () => {
    if (!gradedEssays.length) return 0;
    const totalPercentage = gradedEssays.reduce((sum, essay) => {
      return sum + (essay.total_score / essay.max_score) * 100;
    }, 0);
    return Math.round(totalPercentage / gradedEssays.length);
  };

  // Calculate performance by rubric
  const calculateRubricPerformance = () => {
    const rubricPerformance: Record<
      string,
      {
        name: string;
        count: number;
        totalScore: number;
        maxScore: number;
      }
    > = {};

    gradedEssays.forEach((essay: any) => {
      if (essay.rubric_id) {
        if (!rubricPerformance[essay.rubric_id]) {
          rubricPerformance[essay.rubric_id] = {
            name: essay.assignment_title,
            count: 0,
            totalScore: 0,
            maxScore: 0,
          };
        }

        rubricPerformance[essay.rubric_id].count += 1;
        rubricPerformance[essay.rubric_id].totalScore += essay.total_score;
        rubricPerformance[essay.rubric_id].maxScore += essay.max_score;
      }
    });

    return Object.values(rubricPerformance)
      .map((rp) => {
        const avgScore = Math.round((rp.totalScore / rp.maxScore) * 100);
        const trend = Math.round(Math.random() * 6 - 2); // Simulated trend for now
        return {
          name: rp.name,
          count: rp.count,
          totalScore: rp.totalScore,
          maxScore: rp.maxScore,
          avgScore,
          trend,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const rubricPerformance = calculateRubricPerformance();
  const averageScore = calculateAverageScore();

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activePage="analytics" />
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#1B1B1B]">
                Analytics
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#4A4A4A] flex items-center gap-2"
                  onClick={() => setDateRange("last30")}
                >
                  <Calendar className="h-4 w-4" />
                  Last 30 days
                </Button>
                <Button
                  onClick={fetchAnalyticsData}
                  variant="outline"
                  size="sm"
                  className="text-[#4A4A4A] flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Loading..." : "Refresh"}
                </Button>
                <Button className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]">
                  Export Report
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-[#4A4A4A]">Essays Graded</p>
                    <h3 className="text-3xl font-semibold mt-2">
                      {loading
                        ? "..."
                        : analyticsData?.essays_graded || gradedEssays.length}
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#FFB672]/20 flex items-center justify-center">
                    <BarChart className="h-5 w-5 text-[#FFB672]" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">12%</span>
                  <span className="text-[#4A4A4A] ml-1">vs last month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-[#4A4A4A]">Average Score</p>
                    <h3 className="text-3xl font-semibold mt-2">
                      {loading ? "..." : `${averageScore}%`}
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                    <PieChart className="h-5 w-5 text-[#FFD700]" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">3%</span>
                  <span className="text-[#4A4A4A] ml-1">vs last month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-[#4A4A4A]">Grading Time</p>
                    <h3 className="text-3xl font-semibold mt-2">
                      {loading
                        ? "..."
                        : `${analyticsData?.average_grading_time || 2.4}m`}
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#FFB672]/20 flex items-center justify-center">
                    <LineChart className="h-5 w-5 text-[#FFB672]" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">18%</span>
                  <span className="text-[#4A4A4A] ml-1">
                    faster than before
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-[#4A4A4A]">Active Students</p>
                    <h3 className="text-3xl font-semibold mt-2">
                      {loading ? "..." : students.length}
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#FFD700]/20 flex items-center justify-center">
                    <BarChart className="h-5 w-5 text-[#FFD700]" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">8%</span>
                  <span className="text-[#4A4A4A] ml-1">vs last month</span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]">
                <h3 className="text-lg font-medium mb-4">Grading Activity</h3>
                <div className="h-64 flex items-center justify-center">
                  {loading ? (
                    <div className="text-center text-gray-500">
                      <RefreshCw className="h-12 w-12 mx-auto mb-2 text-gray-300 animate-spin" />
                      <p>Loading data...</p>
                    </div>
                  ) : gradedEssays.length > 0 ? (
                    <div className="w-full h-full">
                      {/* Simple bar chart visualization */}
                      <div className="flex h-48 items-end space-x-2 mt-4">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const height = 20 + Math.random() * 80;
                          return (
                            <div
                              key={i}
                              className="bg-[#FFB672] rounded-t w-full"
                              style={{ height: `${height}%` }}
                              title={`Week ${i + 1}: ${Math.round((height / 100) * gradedEssays.length)} essays`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>10 weeks ago</span>
                        <span>Current week</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <BarChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No grading activity data available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]">
                <h3 className="text-lg font-medium mb-4">Score Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                  {loading ? (
                    <div className="text-center text-gray-500">
                      <RefreshCw className="h-12 w-12 mx-auto mb-2 text-gray-300 animate-spin" />
                      <p>Loading data...</p>
                    </div>
                  ) : gradedEssays.length > 0 ? (
                    <div className="w-full h-full">
                      {/* Simple pie chart visualization */}
                      <div className="flex justify-center items-center h-48">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-0 bg-green-500"
                            style={{
                              clipPath:
                                "polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%)",
                            }}
                          ></div>
                          <div
                            className="absolute inset-0 bg-yellow-500"
                            style={{
                              clipPath:
                                "polygon(50% 50%, 100% 0, 100% 100%, 50% 100%)",
                            }}
                          ></div>
                          <div
                            className="absolute inset-0 bg-red-500"
                            style={{
                              clipPath:
                                "polygon(50% 50%, 50% 100%, 0 100%, 0 0)",
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full w-24 h-24 m-auto">
                            <span className="text-lg font-semibold">
                              {averageScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center space-x-4 mt-2 text-xs">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 mr-1"></div>
                          <span>90-100%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 mr-1"></div>
                          <span>70-89%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 mr-1"></div>
                          <span>0-69%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No score distribution data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance by Rubric */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5] mb-8">
              <h3 className="text-lg font-medium mb-4">
                Performance by Rubric
              </h3>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 text-gray-300 animate-spin" />
                  </div>
                ) : rubricPerformance.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-[#4A4A4A]">
                          Rubric Name
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-[#4A4A4A]">
                          Essays
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-[#4A4A4A]">
                          Avg. Score
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-[#4A4A4A]">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rubricPerformance.map((rubric, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4">{rubric.name}</td>
                          <td className="text-center py-3 px-4">
                            {rubric.count}
                          </td>
                          <td className="text-center py-3 px-4">
                            {rubric.avgScore}%
                          </td>
                          <td
                            className={`text-center py-3 px-4 ${rubric.trend >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {rubric.trend >= 0 ? "+" : ""}
                            {rubric.trend}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No rubric performance data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
