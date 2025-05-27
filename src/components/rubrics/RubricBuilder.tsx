import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, X, Eye, Download, FileText } from "lucide-react";
import { theme } from "@/lib/theme";
import { createRubric, updateRubric } from "@/lib/database";
import { Rubric, RubricCriteria } from "@/types/database.types";
import { supabase } from "../../../supabase/supabase";
import RubricMatrixEditor from "./RubricMatrixEditor";
import RubricPreview from "./RubricPreview";

interface RubricBuilderProps {
  onCancel: () => void;
  onSave: () => void;
  existingRubric?: Rubric | null;
}

const RubricBuilder = ({
  onCancel,
  onSave,
  existingRubric = null,
}: RubricBuilderProps) => {
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rubricName, setRubricName] = useState("");
  const [rubricDescription, setRubricDescription] = useState("");
  const [rubricCategory, setRubricCategory] = useState("Essay");
  const [isTemplate, setIsTemplate] = useState(false);

  // Matrix structure
  const [levels, setLevels] = useState<string[]>([
    "C1+",
    "C1",
    "B2",
    "B1",
    "A2",
  ]);
  const [bands, setBands] = useState<string[]>([
    "5+",
    "5",
    "4.5",
    "4",
    "3.5",
    "3",
    "2.5",
    "2",
    "1",
  ]);
  const [markRanges, setMarkRanges] = useState<string[]>([
    "55-60",
    "49-54",
    "44-48",
    "36-43",
    "27-35",
    "21-26",
    "14-20",
    "6-13",
    "1-5",
  ]);

  const [categories, setCategories] = useState<string[]>([
    "Task Fulfilment",
    "Structures, Lexis & Organisation",
  ]);
  const [categoryWeights, setCategoryWeights] = useState<number[]>([30, 30]);

  // Matrix content
  const [criteriaMatrix, setCriteriaMatrix] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    if (existingRubric) {
      loadExistingRubric(existingRubric.id);
    } else {
      // Initialize empty criteria matrix
      const initialMatrix: Record<string, Record<string, string>> = {};
      categories.forEach((category) => {
        initialMatrix[category] = {};
        levels.forEach((level) => {
          initialMatrix[category][level] = "";
        });
      });
      setCriteriaMatrix(initialMatrix);
    }
  }, [existingRubric]);

  const loadExistingRubric = async (rubricId: string) => {
    setIsLoading(true);
    try {
      // Load rubric details
      const { data: rubric, error: rubricError } = await supabase
        .from("rubrics")
        .select("*")
        .eq("id", rubricId)
        .single();

      if (rubricError) throw rubricError;

      if (rubric) {
        setRubricName(rubric.name);
        setRubricDescription(rubric.description || "");
        setRubricCategory(rubric.category || "Essay");
        setIsTemplate(rubric.is_template || false);
      }

      // Load rubric criteria
      const { data: criteria, error: criteriaError } = await supabase
        .from("rubric_criteria")
        .select("*")
        .eq("rubric_id", rubricId)
        .order("order", { ascending: true });

      if (criteriaError) throw criteriaError;

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
    } catch (error) {
      console.error("Error loading rubric:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    const newCategory = `Category ${categories.length + 1}`;
    setCategories([...categories, newCategory]);
    setCategoryWeights([...categoryWeights, 10]);

    // Update criteria matrix
    const updatedMatrix = { ...criteriaMatrix };
    updatedMatrix[newCategory] = {};
    levels.forEach((level) => {
      updatedMatrix[newCategory][level] = "";
    });
    setCriteriaMatrix(updatedMatrix);
  };

  const handleRemoveCategory = (index: number) => {
    const categoryToRemove = categories[index];
    const updatedCategories = categories.filter((_, i) => i !== index);
    const updatedWeights = categoryWeights.filter((_, i) => i !== index);

    setCategories(updatedCategories);
    setCategoryWeights(updatedWeights);

    // Update criteria matrix
    const updatedMatrix = { ...criteriaMatrix };
    delete updatedMatrix[categoryToRemove];
    setCriteriaMatrix(updatedMatrix);
  };

  const handleAddLevel = () => {
    const newLevel = prompt(
      "Enter new level name:",
      `Level ${levels.length + 1}`,
    );
    if (newLevel) {
      setLevels([...levels, newLevel]);

      // Update criteria matrix
      const updatedMatrix = { ...criteriaMatrix };
      categories.forEach((category) => {
        updatedMatrix[category][newLevel] = "";
      });
      setCriteriaMatrix(updatedMatrix);

      // Add a new band and mark range
      setBands([...bands, `${bands.length + 1}`]);
      setMarkRanges([...markRanges, `0-0`]);
    }
  };

  const handleRemoveLevel = (index: number) => {
    const levelToRemove = levels[index];
    const updatedLevels = levels.filter((_, i) => i !== index);
    const updatedBands = bands.filter((_, i) => i !== index);
    const updatedMarkRanges = markRanges.filter((_, i) => i !== index);

    setLevels(updatedLevels);
    setBands(updatedBands);
    setMarkRanges(updatedMarkRanges);

    // Update criteria matrix
    const updatedMatrix = { ...criteriaMatrix };
    categories.forEach((category) => {
      delete updatedMatrix[category][levelToRemove];
    });
    setCriteriaMatrix(updatedMatrix);
  };

  const handleUpdateCriteria = (
    category: string,
    level: string,
    value: string,
  ) => {
    const updatedMatrix = { ...criteriaMatrix };
    if (!updatedMatrix[category]) {
      updatedMatrix[category] = {};
    }
    updatedMatrix[category][level] = value;
    setCriteriaMatrix(updatedMatrix);
  };

  const handleUpdateCategoryName = (oldName: string, newName: string) => {
    if (oldName === newName) return;

    const categoryIndex = categories.findIndex((c) => c === oldName);
    if (categoryIndex === -1) return;

    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = newName;
    setCategories(updatedCategories);

    // Update criteria matrix
    const updatedMatrix = { ...criteriaMatrix };
    updatedMatrix[newName] = { ...updatedMatrix[oldName] };
    delete updatedMatrix[oldName];
    setCriteriaMatrix(updatedMatrix);
  };

  const handleUpdateCategoryWeight = (index: number, weight: number) => {
    const updatedWeights = [...categoryWeights];
    updatedWeights[index] = weight;
    setCategoryWeights(updatedWeights);
  };

  const handleUpdateLevel = (index: number, newLevel: string) => {
    const oldLevel = levels[index];
    if (oldLevel === newLevel) return;

    const updatedLevels = [...levels];
    updatedLevels[index] = newLevel;
    setLevels(updatedLevels);

    // Update criteria matrix
    const updatedMatrix = { ...criteriaMatrix };
    categories.forEach((category) => {
      updatedMatrix[category][newLevel] =
        updatedMatrix[category][oldLevel] || "";
      delete updatedMatrix[category][oldLevel];
    });
    setCriteriaMatrix(updatedMatrix);
  };

  const handleUpdateBand = (index: number, newBand: string) => {
    const updatedBands = [...bands];
    updatedBands[index] = newBand;
    setBands(updatedBands);
  };

  const handleUpdateMarkRange = (index: number, newRange: string) => {
    const updatedMarkRanges = [...markRanges];
    updatedMarkRanges[index] = newRange;
    setMarkRanges(updatedMarkRanges);
  };

  const handleSaveRubric = async () => {
    if (!rubricName.trim()) {
      alert("Please enter a rubric name");
      return;
    }

    setIsSaving(true);
    try {
      // Save or update the rubric
      const rubricData = {
        name: rubricName,
        description: rubricDescription,
        category: rubricCategory,
        is_template: isTemplate,
      };

      let rubricId: string;

      if (existingRubric) {
        // Update existing rubric
        const result = await updateRubric(existingRubric.id, rubricData);
        if (result.error) {
          console.error("Update rubric error:", result.error);
          throw result.error;
        }
        rubricId = existingRubric.id;

        // Delete existing criteria
        const { error: deleteError } = await supabase
          .from("rubric_criteria")
          .delete()
          .eq("rubric_id", rubricId);

        if (deleteError) {
          console.error("Delete criteria error:", deleteError);
          throw deleteError;
        }
      } else {
        // Create new rubric
        const result = await createRubric(rubricData);
        if (result.error) {
          console.error("Create rubric error:", result.error);
          throw result.error;
        }
        // Check if result has data property and it contains values
        if (!result) {
          throw new Error("Failed to create rubric - no result returned");
        }

        // Use type assertion to access data property
        const resultData = result as any;
        if (!resultData.data || resultData.data.length === 0) {
          throw new Error("Failed to create rubric - no data returned");
        }
        rubricId = resultData.data[0].id;
      }

      // Create criteria
      const criteriaToInsert: Partial<RubricCriteria>[] = [];

      categories.forEach((category, categoryIndex) => {
        levels.forEach((level, levelIndex) => {
          criteriaToInsert.push({
            rubric_id: rubricId,
            category,
            level,
            band: bands[levelIndex] || "",
            mark_range: markRanges[levelIndex] || "",
            description: criteriaMatrix[category]?.[level] || "",
            weight: categoryWeights[categoryIndex] || 0,
            order: categoryIndex * 100 + levelIndex,
          });
        });
      });

      // Insert criteria in smaller batches to avoid payload size issues
      const batchSize = 20;
      for (let i = 0; i < criteriaToInsert.length; i += batchSize) {
        const batch = criteriaToInsert.slice(i, i + batchSize);
        const { error: criteriaError } = await supabase
          .from("rubric_criteria")
          .insert(batch);

        if (criteriaError) {
          console.error("Insert criteria error:", criteriaError);
          throw criteriaError;
        }
      }

      onSave();
    } catch (error) {
      console.error("Error saving rubric:", error);
      alert("Failed to save rubric. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportRubric = () => {
    // Create a JSON representation of the rubric
    const rubricData = {
      name: rubricName,
      description: rubricDescription,
      category: rubricCategory,
      is_template: isTemplate,
      levels,
      bands,
      markRanges,
      categories,
      categoryWeights,
      criteriaMatrix,
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(rubricData, null, 2);

    // Create a blob and download link
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rubricName.replace(/\s+/g, "_")}_rubric.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportRubric = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonData = JSON.parse(event.target?.result as string);

            // Validate the imported data
            if (
              !jsonData.name ||
              !jsonData.categories ||
              !jsonData.levels ||
              !jsonData.criteriaMatrix
            ) {
              throw new Error("Invalid rubric file format");
            }

            // Update state with imported data
            setRubricName(jsonData.name);
            setRubricDescription(jsonData.description || "");
            setRubricCategory(jsonData.category || "Essay");
            setIsTemplate(jsonData.is_template || false);
            setLevels(jsonData.levels || []);
            setBands(jsonData.bands || []);
            setMarkRanges(jsonData.markRanges || []);
            setCategories(jsonData.categories || []);
            setCategoryWeights(jsonData.categoryWeights || []);
            setCriteriaMatrix(jsonData.criteriaMatrix || {});
          } catch (error) {
            console.error("Error importing rubric:", error);
            alert("Failed to import rubric. Invalid file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="space-y-4 flex-1 max-w-2xl">
            <Input
              placeholder="Rubric Name"
              value={rubricName}
              onChange={(e) => setRubricName(e.target.value)}
              className="text-lg font-medium"
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Category (e.g., Essay, Report)"
                  value={rubricCategory}
                  onChange={(e) => setRubricCategory(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="template-mode"
                  checked={isTemplate}
                  onCheckedChange={setIsTemplate}
                />
                <Label htmlFor="template-mode">Save as template</Label>
              </div>
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={rubricDescription}
              onChange={(e) => setRubricDescription(e.target.value)}
              className="text-sm"
              rows={2}
            />
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              onClick={handleImportRubric}
              className="text-gray-600"
            >
              <FileText className="h-4 w-4 mr-2" /> Import
            </Button>
            <Button
              variant="outline"
              onClick={handleExportRubric}
              className="text-gray-600"
              disabled={!rubricName}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "editor" | "preview")}
      >
        <div className="px-6 border-b border-gray-100">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="p-6">
          <RubricMatrixEditor
            levels={levels}
            bands={bands}
            markRanges={markRanges}
            categories={categories}
            categoryWeights={categoryWeights}
            criteriaMatrix={criteriaMatrix}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onAddLevel={handleAddLevel}
            onRemoveLevel={handleRemoveLevel}
            onUpdateCriteria={handleUpdateCriteria}
            onUpdateCategoryName={handleUpdateCategoryName}
            onUpdateCategoryWeight={handleUpdateCategoryWeight}
            onUpdateLevel={handleUpdateLevel}
            onUpdateBand={handleUpdateBand}
            onUpdateMarkRange={handleUpdateMarkRange}
          />
        </TabsContent>

        <TabsContent value="preview" className="p-6">
          <RubricPreview
            rubricName={rubricName}
            rubricDescription={rubricDescription}
            levels={levels}
            bands={bands}
            markRanges={markRanges}
            categories={categories}
            categoryWeights={categoryWeights}
            criteriaMatrix={criteriaMatrix}
          />
        </TabsContent>
      </Tabs>

      <div className="p-6 border-t border-gray-100 flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button
          className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]"
          onClick={handleSaveRubric}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Save Rubric
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RubricBuilder;
