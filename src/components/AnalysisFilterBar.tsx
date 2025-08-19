import React from "react";
import { ChevronDownIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalysisFilterBarProps {
  rangeFilter: string;
  onRangeChange: (value: string) => void;
}

const AnalysisFilterBar: React.FC<AnalysisFilterBarProps> = ({
  rangeFilter,
  onRangeChange,
}) => {
  const rangeOptions = [
    { value: "last-12-months", label: "Last 12 Months" },
    { value: "last-6-months", label: "Last 6 Months" },
    { value: "last-month", label: "Last Month" },
  ];

  // Filter out the currently selected option from dropdown
  const availableRangeOptions = rangeOptions.filter(
    (option) => option.value !== rangeFilter
  );

  return (
    <div className="flex items-center space-x-4">
      {/* Range Filter */}
      <div className="relative w-full max-w-md">
        <div className="absolute left-0 top-0 bottom-0 z-10">
          <div className="h-full bg-blue-100 rounded-l px-3 flex items-center">
            <span className="text-xs font-medium text-gray-600">Range</span>
          </div>
        </div>
        <div className="absolute left-20 top-1/2 transform -translate-y-1/2 z-10 max-w-[calc(100%-7rem)]">
          <span className="text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis block">
            {rangeOptions.find((option) => option.value === rangeFilter)
              ?.label || "Last 12 Months"}
          </span>
        </div>
        <Select value={rangeFilter} onValueChange={onRangeChange}>
          <SelectTrigger className="w-full pl-28 pr-12 py-2 bg-white border border-gray-200 rounded text-sm [&>svg]:hidden">
            <SelectValue>
              <span className="invisible">Last 12 Months</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default AnalysisFilterBar;
