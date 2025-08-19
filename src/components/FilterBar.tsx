import React, { useState } from "react";
import { CalendarIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface FilterBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  dateFilter: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  sortBy,
  onSortChange,
  dateFilter,
  onDateChange,
  searchTerm,
  onSearchChange,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const sortOptions = [
    { value: "all", label: "All" },
    { value: "price-high-low", label: "Price: Highest to Lowest" },
    { value: "price-low-high", label: "Price: Lowest to Highest" },
    { value: "date-new-old", label: "Date: Newest to Oldest" },
    { value: "date-old-new", label: "Date: Oldest to Newest" },
  ];

  // Filter out the currently selected option from dropdown
  const availableSortOptions = sortOptions.filter(
    (option) => option.value !== sortBy
  );

  return (
    <div className="flex items-center space-x-4">
      {/* Sort By Filter */}
      <div className="relative w-full max-w-md">
        <div className="absolute left-0 top-0 bottom-0 z-10">
          <div className="h-full bg-blue-100 rounded-l px-3 flex items-center">
            <span className="text-xs font-medium text-gray-600">Sort By</span>
          </div>
        </div>
        <div className="absolute left-20 top-1/2 transform -translate-y-1/2 z-10 max-w-[calc(100%-7rem)]">
          <span className="text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis block">
            {sortBy === "all"
              ? "All"
              : sortBy === "price-high-low"
              ? "Price: Highest to Lowest"
              : sortBy === "price-low-high"
              ? "Price: Lowest to Highest"
              : sortBy === "date-new-old"
              ? "Date: Newest to Oldest"
              : sortBy === "date-old-new"
              ? "Date: Oldest to Newest"
              : "All"}
          </span>
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full pl-28 pr-12 py-2 bg-white border border-gray-200 rounded text-sm [&>svg]:hidden">
            <SelectValue>
              <span className="invisible">All</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableSortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Date Filter */}
      <div className="relative w-full max-w-sm">
        <div className="absolute left-0 top-0 bottom-0 z-10">
          <div className="h-full bg-blue-100 rounded-l px-3 flex items-center">
            <span className="text-xs font-medium text-gray-600">By Date</span>
          </div>
        </div>
        <div className="absolute left-20 top-1/2 transform -translate-y-1/2 z-10">
          {dateFilter ? (
            <span className="text-sm text-gray-900">
              {format(dateFilter, "dd/MM/yyyy")}
            </span>
          ) : (
            <span className="text-sm text-gray-500">mm/dd/yyyy</span>
          )}
        </div>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full pl-28 pr-12 py-2 bg-white border border-gray-200 rounded text-sm justify-start text-left font-normal"
            >
              <span className="invisible">mm/dd/yyyy</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={(date) => {
                onDateChange(date);
                setIsCalendarOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Search Filter */}
      <div className="relative w-full max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded text-sm"
        />
      </div>
    </div>
  );
};

export default FilterBar;
