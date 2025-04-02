
import React from 'react';
import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterSectionProps {
  selectedPetFilter: string | undefined;
  onPetFilterChange: (value: string) => void;
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
  formatDateRange: () => string;
  onExport: () => void;
  petList: Array<{ id: string; name: string }>;
  petId?: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  selectedPetFilter,
  onPetFilterChange,
  dateRange,
  onDateRangeChange,
  formatDateRange,
  onExport,
  petList,
  petId,
}) => {
  if (petId) return null;
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
        <Select
          value={selectedPetFilter || 'all'}
          onValueChange={(value) => onPetFilterChange(value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select pet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pets</SelectItem>
            {petList.map((pet) => (
              <SelectItem key={pet.id} value={pet.id}>
                {pet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Calendar className="h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({
                    from: range.from,
                    to: range.to,
                  });
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Button variant="outline" onClick={onExport} className="gap-2">
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
};

export default FilterSection;
