import React, { useState, useEffect } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import RubricBuilder from "../rubrics/RubricBuilder";
import RubricsList from "../rubrics/RubricsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { theme } from "@/lib/theme";
import { getRubrics } from "@/lib/database";
import { Rubric } from "@/types/database.types";

const RubricsPage = () => {
  const [showRubricBuilder, setShowRubricBuilder] = useState(false);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRubrics();
  }, []);

  const fetchRubrics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getRubrics();
      if (error) throw error;
      setRubrics(data || []);
    } catch (err) {
      console.error("Error fetching rubrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRubric = () => {
    setSelectedRubric(null);
    setShowRubricBuilder(true);
  };

  const handleEditRubric = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setShowRubricBuilder(true);
  };

  const handleRubricSaved = () => {
    setShowRubricBuilder(false);
    fetchRubrics();
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activePage="rubrics" />
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#1B1B1B]">
                {showRubricBuilder
                  ? selectedRubric
                    ? `Edit Rubric: ${selectedRubric.name}`
                    : "Create Rubric"
                  : "My Rubrics"}
              </h2>
              {!showRubricBuilder && (
                <Button
                  className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]"
                  onClick={handleCreateRubric}
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Rubric
                </Button>
              )}
            </div>

            {showRubricBuilder ? (
              <RubricBuilder
                onCancel={() => setShowRubricBuilder(false)}
                onSave={handleRubricSaved}
                existingRubric={selectedRubric}
              />
            ) : (
              <RubricsList
                rubrics={rubrics}
                isLoading={isLoading}
                onEditRubric={handleEditRubric}
                onRefresh={fetchRubrics}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RubricsPage;
