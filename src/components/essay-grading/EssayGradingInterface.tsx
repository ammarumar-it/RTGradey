import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ArrowRight,
  FileText,
  Upload,
  Sun,
  Sprout,
  ThumbsUp,
  Download,
  Share2,
  Printer,
  Save,
  History,
} from "lucide-react";
import { usePDF } from "react-to-pdf";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import { supabase } from "../../../supabase/supabase";
import { theme } from "@/lib/theme";
import { useAuth } from "../../../supabase/auth";
import "./print-styles.css";
import { Rubric, RubricCriteria } from "@/types/database.types";
import { getRubrics, getRubricCriteria } from "@/lib/database";

interface FeedbackItem {
  type: "glow" | "grow" | "think";
  content: string;
}

interface RubricItem {
  id: number;
  title: string;
  description: string;
  level: string;
  score: number;
  maxScore: number;
}

interface GradingResult {
  summary: string;
  feedback: FeedbackItem[];
  rubric: RubricItem[];
  totalScore: number;
  maxScore: number;
}

interface GradedEssay {
  id: string;
  user_id: string;
  student_name: string;
  assignment_title: string;
  instructions: string;
  answer: string;
  summary: string;
  feedback: FeedbackItem[];
  rubric: RubricItem[];
  total_score: number;
  max_score: number;
  created_at: string;
}

const EssayGradingInterface = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [assignmentInstructions, setAssignmentInstructions] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "summary" | "feedback" | "rubric" | "preview"
  >("summary");
  const [gradingMode, setGradingMode] = useState<"standard" | "rubric">(
    "standard",
  );
  const [gradedEssays, setGradedEssays] = useState<GradedEssay[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState<string>("");
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriteria[]>([]);
  const [loadingRubrics, setLoadingRubrics] = useState(false);

  useEffect(() => {
    // Check if we have instructions and answer from navigation state
    if (location.state) {
      const { instructions, answer } = location.state as {
        instructions: string;
        answer: string;
      };
      if (instructions) setAssignmentInstructions(instructions);
      if (answer) setStudentAnswer(answer);

      // Auto-grade if both are provided
      if (instructions && answer) {
        setTimeout(() => {
          handleGradeEssay();
        }, 500); // Small delay to ensure state is updated
      }
    }

    // Check localStorage for essay grading data
    const instructionsFromStorage = localStorage.getItem("gradeInstructions");
    const answerFromStorage = localStorage.getItem("gradeAnswer");

    if (instructionsFromStorage && answerFromStorage) {
      setAssignmentInstructions(instructionsFromStorage);
      setStudentAnswer(answerFromStorage);

      // Auto-grade with localStorage data
      setTimeout(() => {
        handleGradeEssay();
      }, 500);

      // Clear localStorage after reading
      localStorage.removeItem("gradeInstructions");
      localStorage.removeItem("gradeAnswer");
    }
  }, []);

  // Removed auto-grade when landing on the page with sample data

  // Fetch graded essays history when component mounts
  useEffect(() => {
    if (user) {
      fetchGradedEssays();
      fetchRubrics();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRubricId) {
      fetchRubricCriteria(selectedRubricId);
    }
  }, [selectedRubricId]);

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

  const fetchRubrics = async () => {
    setLoadingRubrics(true);
    try {
      const { data, error } = await getRubrics();
      if (error) throw error;
      setRubrics(data || []);
    } catch (err) {
      console.error("Error fetching rubrics:", err);
    } finally {
      setLoadingRubrics(false);
    }
  };

  const fetchRubricCriteria = async (rubricId: string) => {
    try {
      // Get the rubric
      const { data: rubric, error: rubricError } = await supabase
        .from("rubrics")
        .select("*")
        .eq("id", rubricId)
        .single();

      if (rubricError) throw rubricError;
      setSelectedRubric(rubric);

      // Get the criteria
      const { data: criteria, error: criteriaError } =
        await getRubricCriteria(rubricId);
      if (criteriaError) throw criteriaError;
      setRubricCriteria(criteria || []);
    } catch (err) {
      console.error("Error fetching rubric criteria:", err);
    }
  };

  const handleFillSample = async () => {
    setAssignmentTitle("AI in Education Essay");
    setAssignmentInstructions(
      "Write a 500-word essay discussing the impact of artificial intelligence on modern education. Include examples and consider both benefits and potential drawbacks.",
    );
    setStudentAnswer(
      "Artificial intelligence has transformed education by providing personalized learning experiences, automating grading, and offering intelligent tutoring systems. Students can now receive immediate feedback and tailored content based on their learning pace and style. However, concerns about privacy, over-reliance on technology, and the digital divide remain significant challenges that educational institutions must address as they integrate AI into their systems.\n\nOne of the most significant benefits of AI in education is personalization. Traditional classrooms often struggle to accommodate different learning styles and paces. AI-powered adaptive learning platforms like Carnegie Learning and DreamBox can analyze student performance in real-time and adjust content difficulty accordingly. For example, if a student excels at algebraic equations but struggles with geometry, the system can provide more practice in geometry while advancing algebra concepts. This targeted approach helps students build confidence in areas of strength while improving areas of weakness.\n\nAutomated grading represents another transformative application of AI in education. Tools like Turnitin and Gradescope use natural language processing to evaluate written assignments, providing consistent feedback and freeing teachers from time-consuming grading tasks. For instance, a high school English teacher who previously spent weekends grading essays can now focus on developing engaging lesson plans and providing personalized support to struggling students. This efficiency allows educators to redirect their expertise where it matters most: human connection and mentorship.\n\nIntelligent tutoring systems serve as virtual teaching assistants, offering 24/7 support to students. Platforms like Khan Academy use AI to identify knowledge gaps and suggest appropriate learning resources. When a student repeatedly makes similar mistakes in calculus problems, the system recognizes the pattern and offers targeted tutorials addressing the specific misconception. This immediate intervention prevents frustration and helps maintain student engagement.\n\nDespite these benefits, AI integration in education raises significant concerns. Privacy issues top the list, as these systems collect vast amounts of student data. When schools implement learning analytics platforms, they gather information about study habits, academic performance, and even attention patterns. Without proper safeguards, this sensitive information could be vulnerable to breaches or misuse. Educational institutions must implement robust data protection policies and ensure transparency about data collection practices.\n\nOver-reliance on technology presents another challenge. As AI systems become more prevalent in classrooms, students might develop dependence on immediate feedback and guidance. Critical thinking skills could diminish if students always expect technology to provide answers. Educators must balance technological tools with activities that promote independent problem-solving and creativity.\n\nPerhaps most concerning is how AI might exacerbate the digital divide. Schools in affluent areas can afford cutting-edge AI educational tools, while under-resourced institutions cannot. Students without home internet access or personal devices face additional disadvantages when homework requires AI-powered platforms. This technological inequality threatens to widen existing educational disparities unless policymakers prioritize equitable access.\n\nIn conclusion, artificial intelligence offers tremendous potential to transform education through personalization, efficiency, and accessibility. However, thoughtful implementation must address privacy concerns, prevent over-reliance, and ensure equitable access. The future of AI in education depends not on the technology itself, but on how educators, administrators, and policymakers harness its capabilities while mitigating its risks.",
    );

    // No longer automatically grading the essay after filling the sample
  };

  const handleGradeEssay = async () => {
    if (!assignmentInstructions.trim() || !studentAnswer.trim()) {
      setError(
        "Please provide both assignment instructions and student answer.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let requestBody: any = {
        instructions: assignmentInstructions,
        answer: studentAnswer,
      };

      // If a rubric is selected, include rubric data
      if (selectedRubricId && selectedRubric && rubricCriteria.length > 0) {
        // Extract unique categories, levels, bands, and mark ranges
        const uniqueCategories = [
          ...new Set(rubricCriteria.map((c) => c.category)),
        ];
        const uniqueLevels = [...new Set(rubricCriteria.map((c) => c.level))];
        const uniqueBands = [...new Set(rubricCriteria.map((c) => c.band))];
        const uniqueMarkRanges = [
          ...new Set(rubricCriteria.map((c) => c.mark_range)),
        ];

        // Set category weights
        const categoryWeights = uniqueCategories.map((category) => {
          const criteriaForCategory = rubricCriteria.find(
            (c) => c.category === category,
          );
          return criteriaForCategory?.weight || 0;
        });

        // Build criteria matrix
        const criteriaMatrix: Record<string, Record<string, string>> = {};
        uniqueCategories.forEach((category) => {
          criteriaMatrix[category] = {};
          uniqueLevels.forEach((level) => {
            const criteriaItem = rubricCriteria.find(
              (c) => c.category === category && c.level === level,
            );
            criteriaMatrix[category][level] = criteriaItem?.description || "";
          });
        });

        // Add rubric data to request as additional properties
        requestBody = {
          instructions: assignmentInstructions,
          answer: studentAnswer,
          // Add these as additional properties to the any type
          rubricId: selectedRubricId,
          rubricName: selectedRubric.name,
          categories: uniqueCategories,
          levels: uniqueLevels,
          bands: uniqueBands,
          markRanges: uniqueMarkRanges,
          categoryWeights: categoryWeights,
          criteriaMatrix: criteriaMatrix,
        };
      }

      // Call the Supabase Edge Function for essay grading
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-essay-grading",
        { body: requestBody },
      );

      if (error) {
        throw new Error(error.message);
      }

      setResult(data as GradingResult);
    } catch (err) {
      console.error("Error grading essay:", err);
      setError("An error occurred while grading the essay. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGradedEssay = async () => {
    if (!result || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("graded_essays").insert({
        user_id: user.id,
        student_name: studentName,
        assignment_title: assignmentTitle || "Untitled Assignment",
        instructions: assignmentInstructions,
        answer: studentAnswer,
        summary: result.summary,
        feedback: result.feedback,
        rubric: result.rubric,
        total_score: result.totalScore,
        max_score: result.maxScore,
      });

      if (error) throw error;

      // Refresh the graded essays list
      await fetchGradedEssays();
    } catch (err) {
      console.error("Error saving graded essay:", err);
      setError("Failed to save the graded essay. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const loadGradedEssay = (essay: GradedEssay) => {
    setAssignmentTitle(essay.assignment_title);
    setStudentName(essay.student_name || "");
    setAssignmentInstructions(essay.instructions);
    setStudentAnswer(essay.answer);
    setResult({
      summary: essay.summary,
      feedback: essay.feedback,
      rubric: essay.rubric,
      totalScore: essay.total_score,
      maxScore: essay.max_score,
    });
    setShowHistory(false);
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "glow":
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case "grow":
        return <Sprout className="h-5 w-5 text-green-500" />;
      case "think":
        return <ThumbsUp className="h-5 w-5 text-purple-500" />;
      default:
        return null;
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

  const pdfRef = useRef<HTMLDivElement>(null);
  const { toPDF } = usePDF();

  const handleDownloadPDF = async () => {
    if (!result || !pdfRef.current) return;

    try {
      // Create a temporary container for PDF generation
      const pdfContainer = document.createElement("div");
      pdfContainer.setAttribute(
        "style",
        "position: absolute; left: -9999px; top: 0; width: 800px; background-color: white; padding: 40px;",
      );

      // Clone the PDF content
      const contentClone = pdfRef.current.cloneNode(true) as HTMLElement;
      contentClone.setAttribute(
        "style",
        "display: block; visibility: visible; width: 100%; height: auto;",
      );

      // Make sure all nested elements are visible
      const allElements = contentClone.querySelectorAll("*");
      allElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          const tagName = el.tagName.toLowerCase();
          const isTextElement = tagName.match(/^(h[1-6]|p|span|div)$/) !== null;
          const displayValue = tagName === "div" ? "block" : "";
          const colorValue = isTextElement ? "#000000" : "";

          el.setAttribute(
            "style",
            `visibility: visible; display: ${displayValue}; color: ${colorValue};`,
          );
        }
      });

      pdfContainer.appendChild(contentClone);
      document.body.appendChild(pdfContainer);

      // Use html2canvas and jsPDF for more reliable PDF generation
      setTimeout(async () => {
        try {
          // Create a new PDF document
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          // Ensure all text is rendered as actual text, not images
          const allTextElements = pdfContainer.querySelectorAll(
            "h1, h2, h3, h4, p, span, div",
          );
          allTextElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.setAttribute(
                "style",
                "font-family: Arial, sans-serif; color: #000000;",
              );
            }
          });

          // Render the HTML to canvas
          const canvas = await html2canvas(pdfContainer, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: "#FFFFFF",
          });

          // Calculate the number of pages
          const imgData = canvas.toDataURL("image/png", 1.0);
          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;
          let pageCount = 1;

          // Add first page with better quality settings
          pdf.addImage(
            imgData,
            "PNG",
            0,
            position,
            imgWidth,
            imgHeight,
            undefined,
            "FAST",
          );
          heightLeft -= pdfHeight;

          // Add additional pages if needed
          while (heightLeft > 0) {
            position = -pdfHeight * pageCount;
            pdf.addPage();
            pdf.addImage(
              imgData,
              "PNG",
              0,
              position,
              imgWidth,
              imgHeight,
              undefined,
              "FAST",
            );
            heightLeft -= pdfHeight;
            pageCount++;
          }

          // Save the PDF
          pdf.save(
            `${studentName || "Student"}_${assignmentTitle || "Essay"}_Graded.pdf`,
          );

          // Clean up
          document.body.removeChild(pdfContainer);
        } catch (err) {
          console.error("PDF generation error:", err);
          document.body.removeChild(pdfContainer);

          // Fallback to react-to-pdf if html2canvas/jsPDF fails
          try {
            const pdfOptions = {
              targetRef: pdfRef,
              filename: `${studentName || "Student"}_${assignmentTitle || "Essay"}_Graded.pdf`,
              options: {
                page: { margin: 40 },
                overrides: {
                  pdf: {
                    compress: true,
                    format: "a4",
                    orientation: "portrait",
                  },
                  canvas: {
                    useCORS: true,
                  },
                },
              },
            };

            toPDF(pdfOptions);
            document.body.removeChild(pdfContainer);
          } catch (fallbackErr) {
            console.error("Fallback PDF generation error:", fallbackErr);
            document.body.removeChild(pdfContainer);
            alert("There was an error generating the PDF. Please try again.");
          }
        }
      }, 500);
    } catch (err) {
      console.error("Error preparing PDF:", err);
      alert("There was an error preparing the PDF. Please try again.");
    }
  };

  const handlePrint = () => {
    if (!pdfRef.current || !result) return;

    try {
      // Create a new div that will be visible during printing
      const printContainer = document.createElement("div");
      printContainer.className = "pdf-content";
      printContainer.style.position = "fixed";
      printContainer.style.left = "0";
      printContainer.style.top = "0";
      printContainer.style.width = "100%";
      printContainer.style.height = "auto";
      printContainer.style.backgroundColor = "white";
      printContainer.style.zIndex = "9999";
      printContainer.style.padding = "40px";
      printContainer.style.overflow = "visible";
      printContainer.style.visibility = "visible";
      printContainer.style.display = "block";

      // Clone the PDF content
      const contentClone = pdfRef.current.cloneNode(true) as HTMLElement;
      contentClone.style.display = "block";
      contentClone.style.visibility = "visible";
      contentClone.style.position = "static";
      contentClone.style.width = "100%";
      contentClone.style.maxWidth = "100%";
      contentClone.style.height = "auto";
      contentClone.style.overflow = "visible";

      // Make sure all child elements are visible
      const allElements = contentClone.querySelectorAll("*");
      allElements.forEach((el) => {
        (el as HTMLElement).style.visibility = "visible";
        (el as HTMLElement).style.display = "block";
        if ((el as HTMLElement).style.maxHeight) {
          (el as HTMLElement).style.maxHeight = "none";
        }
        if ((el as HTMLElement).style.overflow) {
          (el as HTMLElement).style.overflow = "visible";
        }
      });

      printContainer.appendChild(contentClone);
      document.body.appendChild(printContainer);

      // Print after a short delay to ensure content is rendered
      setTimeout(() => {
        window.print();
        // Remove the print container after printing
        document.body.removeChild(printContainer);
      }, 300);
    } catch (err) {
      console.error("Error during printing:", err);
      alert(
        "There was an error preparing the document for printing. Please try again.",
      );
    }
  };

  const renderTabContent = () => {
    if (!result) return null;

    switch (activeTab) {
      case "summary":
        return (
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Summary Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center">
                  <div
                    className={`text-4xl font-bold ${getScoreColor(result.totalScore, result.maxScore)}`}
                  >
                    {getGradeLevel(result.totalScore, result.maxScore)}
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold">
                      {result.totalScore}{" "}
                      <span className="text-gray-500 font-normal">
                        / {result.maxScore}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round((result.totalScore / result.maxScore) * 100)}%
                      Score
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-500"
                    onClick={handleDownloadPDF}
                  >
                    <FileText className="h-4 w-4 mr-1" /> Download PDF
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-500">
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-500"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4 mr-1" /> Print
                  </Button>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case "feedback":
        return (
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Detailed Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.feedback.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 bg-white p-2 rounded-full shadow-sm">
                        {getFeedbackIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={cn(
                            "font-medium mb-2 text-lg",
                            item.type === "glow"
                              ? "text-yellow-600"
                              : item.type === "grow"
                                ? "text-green-600"
                                : "text-purple-600",
                          )}
                        >
                          {item.type === "glow"
                            ? "Strengths"
                            : item.type === "grow"
                              ? "Areas for Improvement"
                              : "Consider This"}
                        </h4>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case "rubric":
        return (
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Rubric Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {result.rubric.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {item.title}
                      </h4>
                      <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                        <span
                          className={`text-lg font-bold ${getScoreColor(item.score, item.maxScore)}`}
                        >
                          {item.score}
                        </span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-gray-700">{item.maxScore}</span>
                      </div>
                    </div>
                    <div
                      className="mb-3 inline-block px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: item.level.includes("Exceeds")
                          ? "#DCFCE7"
                          : item.level.includes("Meets")
                            ? "#FEF9C3"
                            : "#FEE2E2",
                        color: item.level.includes("Exceeds")
                          ? "#166534"
                          : item.level.includes("Meets")
                            ? "#854D0E"
                            : "#991B1B",
                      }}
                    >
                      {item.level}
                    </div>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={cn(
                          "h-3 rounded-full",
                          item.score / item.maxScore < 0.6
                            ? "bg-red-500"
                            : item.score / item.maxScore < 0.8
                              ? "bg-yellow-500"
                              : "bg-green-500",
                        )}
                        style={{
                          width: `${(item.score / item.maxScore) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case "preview":
        return (
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex justify-between items-center">
                <span>Complete Essay Preview</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-500"
                    onClick={handleDownloadPDF}
                  >
                    <FileText className="h-4 w-4 mr-1" /> Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-500"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4 mr-1" /> Print
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Header with grade and score */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold">
                    {assignmentTitle || "Untitled Assignment"}
                  </h2>
                  {studentName && (
                    <p className="text-gray-600">Student: {studentName}</p>
                  )}
                  <p className="text-gray-500 text-sm">
                    Graded on: {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div
                      className={`text-5xl font-bold ${getScoreColor(result.totalScore, result.maxScore)}`}
                    >
                      {getGradeLevel(result.totalScore, result.maxScore)}
                    </div>
                    <div className="text-sm text-gray-500">Grade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {result.totalScore}
                      <span className="text-gray-500 text-xl">
                        /{result.maxScore}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round((result.totalScore / result.maxScore) * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Instructions */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold mb-2">
                  Assignment Instructions
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="whitespace-pre-line text-gray-700">
                    {assignmentInstructions}
                  </p>
                </div>
              </div>

              {/* Student Essay */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold mb-2">Student Essay</h3>
                <div className="bg-gray-50 p-4 rounded-md max-h-[500px] overflow-y-auto">
                  <p className="whitespace-pre-line text-gray-700">
                    {studentAnswer}
                  </p>
                </div>
              </div>

              {/* Summary Assessment */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold mb-2">
                  Summary Assessment
                </h3>
                <p className="whitespace-pre-line text-gray-700">
                  {result.summary}
                </p>
              </div>

              {/* Detailed Feedback */}
              <div className="pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold mb-2">
                  Detailed Feedback
                </h3>
                <div className="space-y-4">
                  {result.feedback.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-white p-2 rounded-full shadow-sm">
                          {getFeedbackIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <h4
                            className={cn(
                              "font-medium mb-2",
                              item.type === "glow"
                                ? "text-yellow-600"
                                : item.type === "grow"
                                  ? "text-green-600"
                                  : "text-purple-600",
                            )}
                          >
                            {item.type === "glow"
                              ? "Strengths"
                              : item.type === "grow"
                                ? "Areas for Improvement"
                                : "Consider This"}
                          </h4>
                          <p className="text-gray-700 whitespace-pre-line">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rubric Assessment */}
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Rubric Assessment
                </h3>
                <div className="space-y-4">
                  {result.rubric.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-md p-4"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                        }}
                      >
                        <h4 style={{ fontWeight: "600" }}>{item.title}</h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "0 8px",
                            borderRadius: "9999px",
                            backgroundColor: "#F3F4F6",
                            color:
                              item.score / item.maxScore >= 0.8
                                ? "#059669"
                                : item.score / item.maxScore >= 0.6
                                  ? "#D97706"
                                  : "#DC2626",
                          }}
                        >
                          <span style={{ fontWeight: "bold" }}>
                            {item.score}
                          </span>
                          <span style={{ color: "#6B7280", margin: "0 4px" }}>
                            /
                          </span>
                          <span>{item.maxScore}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          marginBottom: "8px",
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: "500",
                          backgroundColor: item.level.includes("Exceeds")
                            ? "#DCFCE7"
                            : item.level.includes("Meets")
                              ? "#FEF9C3"
                              : "#FEE2E2",
                          color: item.level.includes("Exceeds")
                            ? "#166534"
                            : item.level.includes("Meets")
                              ? "#854D0E"
                              : "#991B1B",
                        }}
                      >
                        {item.level}
                      </div>
                      <p style={{ whiteSpace: "pre-line", fontSize: "14px" }}>
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          AI Essay Grading
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-100"
          >
            <History className="mr-2 h-4 w-4" />
            {showHistory ? "Hide History" : "View History"}
          </Button>
          <Button
            onClick={handleFillSample}
            variant="outline"
            className={`text-[${theme.colors.secondary}] border-[${theme.colors.secondary}]/20 hover:bg-[${theme.colors.secondary}]/10`}
          >
            <FileText className="mr-2 h-4 w-4" />
            Fill with sample
          </Button>
        </div>
      </div>

      {/* Hidden PDF content for export */}
      <div className="hidden" style={{ position: "absolute", left: "-9999px" }}>
        <div
          ref={pdfRef}
          className="p-8 bg-white pdf-content"
          style={{
            width: "800px",
            height: "auto",
            minHeight: "1100px",
            visibility: "visible",
            fontFamily: "Arial, sans-serif",
            display: "block",
            overflow: "visible",
          }}
        >
          {result && (
            <div className="pdf-content">
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <h1
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  Graded Essay Report
                </h1>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "8px",
                    backgroundColor: "#FFFFFF",
                    padding: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "bold",
                      color: result
                        ? result.totalScore / result.maxScore >= 0.8
                          ? "#059669"
                          : result.totalScore / result.maxScore >= 0.6
                            ? "#D97706"
                            : "#DC2626"
                        : "",
                      padding: "5px",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "4px",
                      display: "inline-block",
                      minWidth: "50px",
                      textAlign: "center",
                    }}
                  >
                    {result
                      ? getGradeLevel(result.totalScore, result.maxScore)
                      : ""}
                  </div>
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      padding: "5px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {result ? result.totalScore : ""}{" "}
                      <span style={{ color: "#6B7280", fontWeight: "normal" }}>
                        / {result ? result.maxScore : ""}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6B7280",
                        textAlign: "center",
                      }}
                    >
                      {result
                        ? Math.round(
                            (result.totalScore / result.maxScore) * 100,
                          )
                        : ""}
                      % Score
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginBottom: "24px",
                  borderBottom: "1px solid #E5E7EB",
                  paddingBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Assignment Details
                </h2>
                <p>
                  <strong>Title:</strong>{" "}
                  {assignmentTitle || "Untitled Assignment"}
                </p>
                {studentName && (
                  <p>
                    <strong>Student:</strong> {studentName}
                  </p>
                )}
                <p>
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>

              <div
                style={{
                  marginBottom: "24px",
                  borderBottom: "1px solid #E5E7EB",
                  paddingBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Instructions
                </h2>
                <p style={{ whiteSpace: "pre-line" }}>
                  {assignmentInstructions}
                </p>
              </div>

              <div
                style={{
                  marginBottom: "24px",
                  borderBottom: "1px solid #E5E7EB",
                  paddingBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Student Answer
                </h2>
                <p style={{ whiteSpace: "pre-line" }}>{studentAnswer}</p>
              </div>

              <div
                style={{
                  marginBottom: "24px",
                  borderBottom: "1px solid #E5E7EB",
                  paddingBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Summary Assessment
                </h2>
                <p style={{ whiteSpace: "pre-line" }}>{result.summary}</p>
              </div>

              <div
                style={{
                  marginBottom: "24px",
                  borderBottom: "1px solid #E5E7EB",
                  paddingBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Detailed Feedback
                </h2>
                {result.feedback.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "16px",
                      padding: "12px",
                      backgroundColor:
                        item.type === "glow"
                          ? "#FFFBEB"
                          : item.type === "grow"
                            ? "#F0FDF4"
                            : "#FAF5FF",
                      borderLeft: `4px solid ${
                        item.type === "glow"
                          ? "#F59E0B"
                          : item.type === "grow"
                            ? "#22C55E"
                            : "#A855F7"
                      }`,
                      borderRadius: "4px",
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: "500",
                        marginBottom: "4px",
                        color:
                          item.type === "glow"
                            ? "#B45309"
                            : item.type === "grow"
                              ? "#15803D"
                              : "#7E22CE",
                      }}
                    >
                      {item.type === "glow"
                        ? "Strengths"
                        : item.type === "grow"
                          ? "Areas for Improvement"
                          : "Consider This"}
                    </h4>
                    <p style={{ whiteSpace: "pre-line" }}>{item.content}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Rubric Assessment
                </h2>
                {result.rubric.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "16px",
                      padding: "12px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <h4 style={{ fontWeight: "600" }}>{item.title}</h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0 8px",
                          borderRadius: "9999px",
                          backgroundColor: "#F3F4F6",
                          color:
                            item.score / item.maxScore >= 0.8
                              ? "#059669"
                              : item.score / item.maxScore >= 0.6
                                ? "#D97706"
                                : "#DC2626",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>{item.score}</span>
                        <span style={{ color: "#6B7280", margin: "0 4px" }}>
                          /
                        </span>
                        <span>{item.maxScore}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        marginBottom: "8px",
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: item.level.includes("Exceeds")
                          ? "#DCFCE7"
                          : item.level.includes("Meets")
                            ? "#FEF9C3"
                            : "#FEE2E2",
                        color: item.level.includes("Exceeds")
                          ? "#166534"
                          : item.level.includes("Meets")
                            ? "#854D0E"
                            : "#991B1B",
                      }}
                    >
                      {item.level}
                    </div>
                    <p style={{ whiteSpace: "pre-line", fontSize: "14px" }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#6B7280",
                  marginTop: "32px",
                }}
              >
                <p>Generated by RTGradey AI Essay Grading Platform</p>
                <p>
                  {new Date().toLocaleDateString()} at{" "}
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showHistory && (
        <div className="mb-6">
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Graded Essays History
              </CardTitle>
              <CardDescription>Previously graded essays</CardDescription>
            </CardHeader>
            <CardContent>
              {gradedEssays.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No graded essays found
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {gradedEssays.map((essay) => (
                    <div
                      key={essay.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      onClick={() => loadGradedEssay(essay)}
                    >
                      <div>
                        <h4 className="font-medium">
                          {essay.assignment_title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {essay.student_name
                            ? `Student: ${essay.student_name} • `
                            : ""}
                          Score: {essay.total_score}/{essay.max_score} •
                          {new Date(essay.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`text-lg font-bold ${getScoreColor(essay.total_score, essay.max_score)}`}
                      >
                        {getGradeLevel(essay.total_score, essay.max_score)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!result ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
                  Select Rubric (Optional)
                </CardTitle>
                <CardDescription>Choose a rubric for grading</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRubrics ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : rubrics.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">
                      No rubrics found. Please create a rubric first.
                    </p>
                    <Button
                      className="mt-4 bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]"
                      onClick={() => (window.location.href = "/rubrics")}
                    >
                      Create Rubric
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <select
                      value={selectedRubricId}
                      onChange={(e) => setSelectedRubricId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB672] focus:border-transparent"
                    >
                      <option value="">Select a rubric (optional)</option>
                      {rubrics.map((rubric) => (
                        <option key={rubric.id} value={rubric.id}>
                          {rubric.name}
                        </option>
                      ))}
                    </select>

                    {selectedRubric && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">
                          {selectedRubric.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedRubric.description ||
                            "No description provided."}
                        </p>
                        <p className="text-xs text-gray-500">
                          Category: {selectedRubric.category || "General"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <span className="h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
                  Assignment Details
                </CardTitle>
                <CardDescription>Enter assignment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Assignment Title
                  </label>
                  <Input
                    placeholder="Enter assignment title"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    className="mb-4"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Instructions
                  </label>
                  <Textarea
                    placeholder="Enter the assignment instructions here..."
                    className="min-h-[200px] resize-none"
                    value={assignmentInstructions}
                    onChange={(e) => setAssignmentInstructions(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                Student Answer
              </CardTitle>
              <CardDescription>
                Paste the answer the student wrote
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Student Name (Optional)
                </label>
                <Input
                  placeholder="Enter student name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="mb-4"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Essay Content
                </label>
                <Textarea
                  placeholder="Enter the student answer here..."
                  className="min-h-[250px] resize-none"
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-500">
                <Upload className="h-4 w-4 mr-1" />
                Import essay (can be handwritten)
              </div>
              <Button
                onClick={handleGradeEssay}
                className={`bg-[${theme.colors.secondary}] hover:bg-[${theme.colors.secondary}]/80 text-[${theme.colors.buttonText}] rounded-full px-4 h-9 shadow-sm transition-colors flex items-center gap-2`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Grading...
                  </>
                ) : (
                  <>
                    Grade <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {error && (
            <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => {
                setResult(null);
                setActiveTab("summary");
                setError(null);
              }}
              variant="outline"
              className={`text-[${theme.colors.secondary}] border-[${theme.colors.secondary}]/20 hover:bg-[${theme.colors.secondary}]/10`}
            >
              ← Back to Essay Input
            </Button>
            <div className="flex items-center gap-3">
              {user && (
                <Button
                  onClick={handleSaveGradedEssay}
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Result
                    </>
                  )}
                </Button>
              )}
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                <div
                  className={`text-2xl font-bold ${getScoreColor(result.totalScore, result.maxScore)}`}
                >
                  {getGradeLevel(result.totalScore, result.maxScore)}
                </div>
                <div className="mx-3 h-8 w-px bg-gray-200"></div>
                <div>
                  <span className="text-xl font-bold text-gray-900">
                    {result.totalScore}
                  </span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-700">{result.maxScore}</span>
                  <div className="text-xs text-gray-500">
                    {Math.round((result.totalScore / result.maxScore) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === "summary" ? `border-b-2 border-[${theme.colors.secondary}] text-[${theme.colors.primary}]` : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("summary")}
            >
              Summary
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === "feedback" ? `border-b-2 border-[${theme.colors.secondary}] text-[${theme.colors.primary}]` : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("feedback")}
            >
              Feedback
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === "rubric" ? `border-b-2 border-[${theme.colors.secondary}] text-[${theme.colors.primary}]` : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("rubric")}
            >
              Rubric
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === "preview" ? `border-b-2 border-[${theme.colors.secondary}] text-[${theme.colors.primary}]` : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
          </div>

          {renderTabContent()}
        </div>
      )}
    </div>
  );
};

export default EssayGradingInterface;
