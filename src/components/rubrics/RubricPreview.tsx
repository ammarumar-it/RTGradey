import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Download } from "lucide-react";

interface RubricPreviewProps {
  rubricName: string;
  rubricDescription: string;
  levels: string[];
  bands: string[];
  markRanges: string[];
  categories: string[];
  categoryWeights: number[];
  criteriaMatrix: Record<string, Record<string, string>>;
}

const RubricPreview = ({
  rubricName,
  rubricDescription,
  levels,
  bands,
  markRanges,
  categories,
  categoryWeights,
  criteriaMatrix,
}: RubricPreviewProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "", "height=600,width=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${rubricName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
            th { background-color: #f2f2f2; text-align: left; }
            h1 { font-size: 18px; margin-bottom: 5px; }
            p { font-size: 14px; margin-top: 0; color: #666; }
            .category-header { font-weight: bold; background-color: #f9f9f9; }
            .weight { font-size: 11px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${rubricName}</h1>
          <p>${rubricDescription}</p>
          ${content.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleExportPDF = () => {
    alert("PDF export functionality would be implemented here.");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="text-gray-600"
        >
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
        <Button
          variant="outline"
          onClick={handleExportPDF}
          className="text-gray-600"
        >
          <Download className="h-4 w-4 mr-2" /> Export PDF
        </Button>
      </div>

      <div
        ref={printRef}
        className="bg-white p-6 rounded-lg border border-gray-200"
      >
        <h2 className="text-xl font-semibold mb-1">{rubricName}</h2>
        {rubricDescription && (
          <p className="text-gray-600 mb-4">{rubricDescription}</p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-50 p-2 w-[200px]">
                  Categories
                </th>
                {levels.map((level, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 bg-gray-50 p-2 text-center"
                    colSpan={bands.length / levels.length}
                  >
                    {level}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="border border-gray-300 bg-gray-50 p-2">Band</th>
                {bands.map((band, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 bg-gray-50 p-2 text-center"
                  >
                    {band}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="border border-gray-300 bg-gray-50 p-2">Marks</th>
                {markRanges.map((range, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 bg-gray-50 p-2 text-center"
                  >
                    {range}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category, categoryIndex) => (
                <tr key={categoryIndex}>
                  <td className="border border-gray-300 p-2 bg-gray-50">
                    <div className="font-medium">{category}</div>
                    <div className="text-xs text-gray-500">
                      {categoryWeights[categoryIndex] > 0 && (
                        <span>{categoryWeights[categoryIndex]} marks</span>
                      )}
                    </div>
                  </td>
                  {levels.map((level, levelIndex) => (
                    <td
                      key={levelIndex}
                      className="border border-gray-300 p-2 align-top"
                      colSpan={bands.length / levels.length}
                    >
                      <div className="whitespace-pre-line text-sm">
                        {criteriaMatrix[category]?.[level] || ""}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RubricPreview;
