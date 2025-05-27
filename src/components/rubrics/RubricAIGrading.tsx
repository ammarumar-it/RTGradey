import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { Rubric, RubricCriteria } from "@/types/database.types";
import { getRubrics, getRubricCriteria } from "@/lib/database";
import RubricPreview from "./RubricPreview";

interface RubricAIGradingProps {
  onGradeEssay: (result: any) => void;
  isLoading: boolean;
}

const RubricAIGrading = ({ onGradeEssay, isLoading }: RubricAIGradingProps) => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState<string>("");
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriteria[]>([]);
  const [assignmentInstructions, setAssignmentInstructions] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [loadingRubrics, setLoadingRubrics] = useState(false);

  // Matrix structure for preview
  const [levels, setLevels] = useState<string[]>([]);
  const [bands, setBands] = useState<string[]>([]);
  const [markRanges, setMarkRanges] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryWeights, setCategoryWeights] = useState<number[]>([]);
  const [criteriaMatrix, setCriteriaMatrix] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    fetchRubrics();
  }, []);

  useEffect(() => {
    if (selectedRubricId) {
      fetchRubricCriteria(selectedRubricId);
    }
  }, [selectedRubricId]);

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

      if (criteria && criteria.length > 0) {
        // Extract unique categories, levels, bands, and mark ranges
        const uniqueCategories = [...new Set(criteria.map((c) => c.category))];
        const uniqueLevels = [...new Set(criteria.map((c) => c.level))];
        const uniqueBands = [...new Set(criteria.map((c) => c.band))];
        const uniqueMarkRanges = [
          ...new Set(criteria.map((c) => c.mark_range)),
        ];

        setCategories(uniqueCategories);
        setLevels(uniqueLevels);
        setBands(uniqueBands);
        setMarkRanges(uniqueMarkRanges);

        // Set category weights if available
        const weights = uniqueCategories.map((category) => {
          const criteriaForCategory = criteria.find(
            (c) => c.category === category,
          );
          return criteriaForCategory?.weight || 0;
        });
        setCategoryWeights(weights);

        // Build criteria matrix
        const matrix: Record<string, Record<string, string>> = {};
        uniqueCategories.forEach((category) => {
          matrix[category] = {};
          uniqueLevels.forEach((level) => {
            const criteriaItem = criteria.find(
              (c) => c.category === category && c.level === level,
            );
            matrix[category][level] = criteriaItem?.description || "";
          });
        });
        setCriteriaMatrix(matrix);
      }
    } catch (err) {
      console.error("Error fetching rubric criteria:", err);
    }
  };

  const handleFillSample = () => {
    setAssignmentInstructions(
      "Write a 500-word essay discussing the impact of artificial intelligence on modern education. Include examples and consider both benefits and potential drawbacks.",
    );
    setStudentAnswer(
      "Artificial intelligence has transformed education by providing personalized learning experiences, automating grading, and offering intelligent tutoring systems. Students can now receive immediate feedback and tailored content based on their learning pace and style. However, concerns about privacy, over-reliance on technology, and the digital divide remain significant challenges that educational institutions must address as they integrate AI into their systems.\n\nOne of the most significant benefits of AI in education is personalization. Traditional classrooms often struggle to accommodate different learning styles and paces. AI-powered adaptive learning platforms like Carnegie Learning and DreamBox can analyze student performance in real-time and adjust content difficulty accordingly. For example, if a student excels at algebraic equations but struggles with geometry, the system can provide more practice in geometry while advancing algebra concepts. This targeted approach helps students build confidence in areas of strength while improving areas of weakness.\n\nAutomated grading represents another transformative application of AI in education. Tools like Turnitin and Gradescope use natural language processing to evaluate written assignments, providing consistent feedback and freeing teachers from time-consuming grading tasks. For instance, a high school English teacher who previously spent weekends grading essays can now focus on developing engaging lesson plans and providing personalized support to struggling students. This efficiency allows educators to redirect their expertise where it matters most: human connection and mentorship.\n\nIntelligent tutoring systems serve as virtual teaching assistants, offering 24/7 support to students. Platforms like Khan Academy use AI to identify knowledge gaps and suggest appropriate learning resources. When a student repeatedly makes similar mistakes in calculus problems, the system recognizes the pattern and offers targeted tutorials addressing the specific misconception. This immediate intervention prevents frustration and helps maintain student engagement.\n\nDespite these benefits, AI integration in education raises significant concerns. Privacy issues top the list, as these systems collect vast amounts of student data. When schools implement learning analytics platforms, they gather information about study habits, academic performance, and even attention patterns. Without proper safeguards, this sensitive information could be vulnerable to breaches or misuse. Educational institutions must implement robust data protection policies and ensure transparency about data collection practices.\n\nOver-reliance on technology presents another challenge. As AI systems become more prevalent in classrooms, students might develop dependence on immediate feedback and guidance. Critical thinking skills could diminish if students always expect technology to provide answers. Educators must balance technological tools with activities that promote independent problem-solving and creativity.\n\nPerhaps most concerning is how AI might exacerbate the digital divide. Schools in affluent areas can afford cutting-edge AI educational tools, while under-resourced institutions cannot. Students without home internet access or personal devices face additional disadvantages when homework requires AI-powered platforms. This technological inequality threatens to widen existing educational disparities unless policymakers prioritize equitable access.\n\nIn conclusion, artificial intelligence offers tremendous potential to transform education through personalization, efficiency, and accessibility. However, thoughtful implementation must address privacy concerns, prevent over-reliance, and ensure equitable access. The future of AI in education depends not on the technology itself, but on how educators, administrators, and policymakers harness its capabilities while mitigating its risks.",
    );
  };

  const handleGradeEssay = async () => {
    if (
      !selectedRubricId ||
      !assignmentInstructions.trim() ||
      !studentAnswer.trim()
    ) {
      alert(
        "Please select a rubric and provide both assignment instructions and student answer.",
      );
      return;
    }

    try {
      // Call the Supabase Edge Function for essay grading with rubric
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-essay-grading",
        {
          body: {
            instructions: assignmentInstructions,
            answer: studentAnswer,
            rubricId: selectedRubricId,
            rubricName: selectedRubric?.name,
            categories: categories,
            levels: levels,
            bands: bands,
            markRanges: markRanges,
            categoryWeights: categoryWeights,
            criteriaMatrix: criteriaMatrix,
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      onGradeEssay(data);
    } catch (err) {
      console.error("Error grading essay:", err);
      alert("An error occurred while grading the essay. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <span className="h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
            Select Rubric
          </CardTitle>
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
              <Select
                value={selectedRubricId}
                onValueChange={setSelectedRubricId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a rubric" />
                </SelectTrigger>
                <SelectContent>
                  {rubrics.map((rubric) => (
                    <SelectItem key={rubric.id} value={rubric.id}>
                      {rubric.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedRubric && (
                <div className="mt-4">
                  <Tabs defaultValue="preview">
                    <TabsList className="grid w-[400px] grid-cols-2">
                      <TabsTrigger value="preview">Rubric Preview</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="mt-4">
                      <RubricPreview
                        rubricName={selectedRubric.name}
                        rubricDescription={selectedRubric.description || ""}
                        levels={levels}
                        bands={bands}
                        markRanges={markRanges}
                        categories={categories}
                        categoryWeights={categoryWeights}
                        criteriaMatrix={criteriaMatrix}
                      />
                    </TabsContent>
                    <TabsContent value="details" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium mb-1">
                            Description
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedRubric.description ||
                              "No description provided."}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-1">Category</h3>
                          <p className="text-sm text-gray-600">
                            {selectedRubric.category || "General"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-1">Created</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              selectedRubric.created_at,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <span className="h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
              Assignment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter the assignment instructions here..."
              className="min-h-[250px] resize-none"
              value={assignmentInstructions}
              onChange={(e) => setAssignmentInstructions(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
              Student Answer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter the student answer here..."
              className="min-h-[250px] resize-none"
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
            />
          </CardContent>
          <div className="px-6 pb-6 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleFillSample}
              className="text-gray-600"
            >
              <FileText className="h-4 w-4 mr-2" /> Fill Sample
            </Button>
            <Button
              onClick={handleGradeEssay}
              className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B] rounded-full px-4 h-9 shadow-sm transition-colors flex items-center gap-2"
              disabled={isLoading || !selectedRubricId}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Grading...
                </>
              ) : (
                <>
                  Grade with Rubric <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RubricAIGrading;
