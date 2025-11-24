import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface FilterState {
  categories: string[];
  brands: string[];
  pricePerDay: [number, number];
  pricePerWeek: [number, number];
  pricePerMonth: [number, number];
  distance: number;
  availableFrom: Date | undefined;
  availableTo: Date | undefined;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const CATEGORIES = [
  "Tractors",
  "Seeding Equipment",
  "Landscaping Equipment",
  "Crop Protection",
  "Harvest Equipment",
  "Haulage",
];

const BRANDS = [
  "Mahindra",
  "John Deere",
  "CLAAS India",
  "Other",
];

export const AdvancedFilters = ({ filters, onFiltersChange }: AdvancedFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    distance: true,
    availability: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand);
    onFiltersChange({ ...filters, brands: newBrands });
  };

  return (
    <div className="w-80 bg-card border-r p-6 space-y-6 h-screen overflow-y-auto">
      {/* Categories */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full"
        >
          <h3 className="font-semibold text-lg">Categories</h3>
          <ChevronRight className={cn("h-5 w-5 transition-transform", expandedSections.categories && "rotate-90")} />
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked: boolean) => handleCategoryChange(category, checked)}
                />
                <label htmlFor={category} className="text-sm cursor-pointer">
                  {category}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("brands")}
          className="flex items-center justify-between w-full"
        >
          <h3 className="font-semibold text-lg">Brands</h3>
          <ChevronRight className={cn("h-5 w-5 transition-transform", expandedSections.brands && "rotate-90")} />
        </button>
        {expandedSections.brands && (
          <div className="space-y-2">
            {BRANDS.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={brand}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked: boolean) => handleBrandChange(brand, checked)}
                />
                <label htmlFor={brand} className="text-sm cursor-pointer">
                  {brand}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full"
        >
          <h3 className="font-semibold text-lg">Price Range</h3>
          <ChevronRight className={cn("h-5 w-5 transition-transform", expandedSections.price && "rotate-90")} />
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Per Day Price</Label>
              <div className="text-sm font-medium">₹{filters.pricePerDay[0].toLocaleString()} - ₹{filters.pricePerDay[1].toLocaleString()}</div>
              <Slider
                value={filters.pricePerDay}
                onValueChange={(value: number[]) => onFiltersChange({ ...filters, pricePerDay: value as [number, number] })}
                max={200000}
                step={1000}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Per Week Price</Label>
              <div className="text-sm font-medium">₹{filters.pricePerWeek[0].toLocaleString()} - ₹{filters.pricePerWeek[1].toLocaleString()}</div>
              <Slider
                value={filters.pricePerWeek}
                onValueChange={(value: number[]) => onFiltersChange({ ...filters, pricePerWeek: value as [number, number] })}
                max={1000000}
                step={5000}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Per Month Price</Label>
              <div className="text-sm font-medium">₹{filters.pricePerMonth[0].toLocaleString()} - ₹{filters.pricePerMonth[1].toLocaleString()}</div>
              <Slider
                value={filters.pricePerMonth}
                onValueChange={(value: number[]) => onFiltersChange({ ...filters, pricePerMonth: value as [number, number] })}
                max={3000000}
                step={10000}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Distance */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("distance")}
          className="flex items-center justify-between w-full"
        >
          <h3 className="font-semibold text-lg">Distance from you</h3>
          <ChevronRight className={cn("h-5 w-5 transition-transform", expandedSections.distance && "rotate-90")} />
        </button>
        {expandedSections.distance && (
          <div className="space-y-2">
            <div className="text-sm font-medium">{filters.distance} kms</div>
            <Slider
              value={[filters.distance]}
              onValueChange={(value: number[]) => onFiltersChange({ ...filters, distance: value[0] })}
              max={500}
              step={5}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Availability Date */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("availability")}
          className="flex items-center justify-between w-full"
        >
          <h3 className="font-semibold text-lg">Availability Date</h3>
          <ChevronRight className={cn("h-5 w-5 transition-transform", expandedSections.availability && "rotate-90")} />
        </button>
        {expandedSections.availability && (
          <div className="space-y-3">
            <div>
              <Label>From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.availableFrom ? format(filters.availableFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.availableFrom}
                    onSelect={(date: Date | undefined) => onFiltersChange({ ...filters, availableFrom: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.availableTo ? format(filters.availableTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.availableTo}
                    onSelect={(date: Date | undefined) => onFiltersChange({ ...filters, availableTo: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
