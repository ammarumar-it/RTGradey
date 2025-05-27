import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Copy, Eye, GraduationCap } from "lucide-react";
import { Rubric } from "@/types/database.types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "../../../supabase/supabase";

interface RubricsListProps {
  rubrics: Rubric[];
  isLoading: boolean;
  onEditRubric: (rubric: Rubric) => void;
  onRefresh: () => void;
}

const RubricsList = ({
  rubrics,
  isLoading,
  onEditRubric,
  onRefresh,
}: RubricsListProps) => {
  const handleDeleteRubric = async (id: string) => {
    if (confirm("Are you sure you want to delete this rubric?")) {
      try {
        // First delete all criteria associated with this rubric
        await supabase.from("rubric_criteria").delete().eq("rubric_id", id);

        // Then delete the rubric itself
        await supabase.from("rubrics").delete().eq("id", id);

        // Refresh the list
        onRefresh();
      } catch (error) {
        console.error("Error deleting rubric:", error);
      }
    }
  };

  const handleDuplicateRubric = async (rubric: Rubric) => {
    try {
      // Create a new rubric with the same properties
      const { data: newRubric, error: rubricError } = await supabase
        .from("rubrics")
        .insert({
          name: `${rubric.name} (Copy)`,
          description: rubric.description,
          user_id: rubric.user_id,
          category: rubric.category,
          is_template: rubric.is_template,
        })
        .select()
        .single();

      if (rubricError) throw rubricError;

      // Get all criteria for the original rubric
      const { data: criteria, error: criteriaError } = await supabase
        .from("rubric_criteria")
        .select("*")
        .eq("rubric_id", rubric.id);

      if (criteriaError) throw criteriaError;

      // Create new criteria for the new rubric
      if (criteria && criteria.length > 0 && newRubric) {
        const newCriteria = criteria.map((criterion) => ({
          rubric_id: newRubric.id,
          category: criterion.category,
          level: criterion.level,
          band: criterion.band,
          mark_range: criterion.mark_range,
          description: criterion.description,
          order: criterion.order,
        }));

        const { error: insertError } = await supabase
          .from("rubric_criteria")
          .insert(newCriteria);

        if (insertError) throw insertError;
      }

      // Refresh the list
      onRefresh();
    } catch (error) {
      console.error("Error duplicating rubric:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (rubrics.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="mx-auto w-16 h-16 bg-[#FFB672]/20 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="h-8 w-8 text-[#FFB672]" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No rubrics found
        </h3>
        <p className="text-gray-500 mb-6">
          Create your first rubric to get started with essay grading.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rubrics.map((rubric) => (
        <Card
          key={rubric.id}
          className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onEditRubric(rubric)}
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg mb-1">{rubric.name}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {rubric.category || "General"}
                </p>
              </div>
              {rubric.is_template && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Template
                </span>
              )}
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-2">
              {rubric.description || "No description provided."}
            </p>

            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-gray-500">
                Created: {new Date(rubric.created_at).toLocaleDateString()}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onEditRubric(rubric)}
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDuplicateRubric(rubric)}
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeleteRubric(rubric.id)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RubricsList;
