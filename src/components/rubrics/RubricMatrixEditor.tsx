import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface RubricMatrixEditorProps {
  levels: string[];
  bands: string[];
  markRanges: string[];
  categories: string[];
  categoryWeights: number[];
  criteriaMatrix: Record<string, Record<string, string>>;
  onAddCategory: () => void;
  onRemoveCategory: (index: number) => void;
  onAddLevel: () => void;
  onRemoveLevel: (index: number) => void;
  onUpdateCriteria: (category: string, level: string, value: string) => void;
  onUpdateCategoryName: (oldName: string, newName: string) => void;
  onUpdateCategoryWeight: (index: number, weight: number) => void;
  onUpdateLevel: (index: number, value: string) => void;
  onUpdateBand: (index: number, value: string) => void;
  onUpdateMarkRange: (index: number, value: string) => void;
}

const RubricMatrixEditor = ({
  levels,
  bands,
  markRanges,
  categories,
  categoryWeights,
  criteriaMatrix,
  onAddCategory,
  onRemoveCategory,
  onAddLevel,
  onRemoveLevel,
  onUpdateCriteria,
  onUpdateCategoryName,
  onUpdateCategoryWeight,
  onUpdateLevel,
  onUpdateBand,
  onUpdateMarkRange,
}: RubricMatrixEditorProps) => {
  return (
    <div className="space-y-8">
      {/* Levels and Bands Header */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex">
            <div className="w-[200px] flex-shrink-0">
              <div className="h-10 flex items-center justify-between px-2">
                <span className="font-medium text-gray-700">Categories</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onAddCategory}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className="flex-1 grid"
              style={{
                gridTemplateColumns: `repeat(${levels.length}, minmax(180px, 1fr))`,
              }}
            >
              {levels.map((level, index) => (
                <div key={index} className="px-2">
                  <div className="flex items-center justify-between h-10">
                    <Input
                      value={level}
                      onChange={(e) => onUpdateLevel(index, e.target.value)}
                      className="h-8 text-sm font-medium"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 ml-1"
                      onClick={() => onRemoveLevel(index)}
                      disabled={levels.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="px-2 flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onAddLevel}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bands Row */}
          <div className="flex mt-2">
            <div className="w-[200px] flex-shrink-0">
              <div className="h-10 flex items-center px-2">
                <span className="text-sm text-gray-500">Band</span>
              </div>
            </div>

            <div
              className="flex-1 grid"
              style={{
                gridTemplateColumns: `repeat(${levels.length}, minmax(180px, 1fr))`,
              }}
            >
              {bands.map((band, index) => (
                <div key={index} className="px-2">
                  <Input
                    value={band}
                    onChange={(e) => onUpdateBand(index, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
              <div className="px-2"></div>
            </div>
          </div>

          {/* Mark Ranges Row */}
          <div className="flex mt-2">
            <div className="w-[200px] flex-shrink-0">
              <div className="h-10 flex items-center px-2">
                <span className="text-sm text-gray-500">Mark Range</span>
              </div>
            </div>

            <div
              className="flex-1 grid"
              style={{
                gridTemplateColumns: `repeat(${levels.length}, minmax(180px, 1fr))`,
              }}
            >
              {markRanges.map((range, index) => (
                <div key={index} className="px-2">
                  <Input
                    value={range}
                    onChange={(e) => onUpdateMarkRange(index, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
              <div className="px-2"></div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Categories and Criteria */}
          {categories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <div className="flex mb-2">
                <div className="w-[200px] flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Input
                        value={category}
                        onChange={(e) =>
                          onUpdateCategoryName(category, e.target.value)
                        }
                        className="h-8 text-sm font-medium"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 ml-1"
                      onClick={() => onRemoveCategory(categoryIndex)}
                      disabled={categories.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500 mr-2">Weight:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={categoryWeights[categoryIndex] || 0}
                      onChange={(e) =>
                        onUpdateCategoryWeight(
                          categoryIndex,
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="h-6 text-xs"
                    />
                  </div>
                </div>

                <div
                  className="flex-1 grid"
                  style={{
                    gridTemplateColumns: `repeat(${levels.length}, minmax(180px, 1fr))`,
                  }}
                >
                  {levels.map((level, levelIndex) => (
                    <div key={levelIndex} className="px-2">
                      <Textarea
                        value={criteriaMatrix[category]?.[level] || ""}
                        onChange={(e) =>
                          onUpdateCriteria(category, level, e.target.value)
                        }
                        className="text-sm min-h-[100px] resize-none"
                        placeholder={`${category} criteria for ${level}`}
                      />
                    </div>
                  ))}
                  <div className="px-2"></div>
                </div>
              </div>

              <Separator className="my-4" />
            </div>
          ))}

          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={onAddCategory}
              className="text-gray-600"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RubricMatrixEditor;
