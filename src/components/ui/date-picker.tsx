"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

interface DatePickerProps {
  date?: Date;
  setDate?: (date: Date | undefined) => void;
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
  mode?: "single" | "range";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DatePicker = ({
  date,
  setDate,
  dateRange,
  setDateRange,
  mode = "single",
  placeholder = "Pick a date",
  disabled = false,
  className
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const displayValue = React.useMemo(() => {
    if (mode === "single") {
      return date ? format(date, "PPP") : placeholder;
    } else {
      if (dateRange?.from) {
        if (dateRange.to) {
          return `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`;
        } else {
          return format(dateRange.from, "LLL dd, y");
        }
      }
      return placeholder;
    }
  }, [date, dateRange, mode, placeholder]);

  const handleSingleSelect = (selectedDate: Date | undefined) => {
    setDate?.(selectedDate);
    if (selectedDate) {
      setIsOpen(false);
    }
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    setDateRange?.(range);
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-white dark:bg-gray-950 border-[var(--color-line)] dark:border-gray-800",
            "hover:bg-gray-50 dark:hover:bg-gray-900",
            "focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-20",
            !displayValue && "text-muted-foreground",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[var(--color-muted)]" />
          <span className={cn(
            displayValue === placeholder ? "text-[var(--color-muted)]" : "text-[var(--color-text)] dark:text-gray-100"
          )}>
            {displayValue}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0 bg-white dark:bg-gray-950 border-[var(--color-line)] dark:border-gray-800",
          "shadow-lg dark:shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
        )} 
        align="start"
      >
        <DayPicker
          mode={mode}
          selected={mode === "single" ? date : dateRange}
          onSelect={mode === "single" ? handleSingleSelect : handleRangeSelect}
          disabled={disabled}
          className="p-3"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium text-[var(--color-text)] dark:text-gray-100",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              "hover:bg-[var(--color-accent)] dark:hover:bg-gray-800 transition-colors"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-[var(--color-muted)] rounded-md w-8 font-normal text-[0.8rem] dark:text-gray-400",
            row: "flex w-full mt-2",
            cell: cn(
              "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[var(--color-accent)] dark:[&:has([aria-selected])]:bg-gray-800",
              "[&:has([aria-selected].day-outside)]:bg-[var(--color-accent)]/50 dark:[&:has([aria-selected].day-outside)]:bg-gray-800/50",
              "[&:has([aria-selected].day-range-end)]:rounded-r-md",
              "[&:has([aria-selected].day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            ),
            day: cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
              "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-[var(--color-accent)] dark:hover:bg-gray-800",
              "transition-colors focus:bg-[var(--color-accent)] dark:focus:bg-gray-800"
            ),
            day_range_start: "day-range-start",
            day_range_end: "day-range-end",
            day_selected: cn(
              "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-600)] focus:bg-[var(--color-primary-600)]",
              "dark:bg-[var(--color-primary)] dark:text-white"
            ),
            day_today: "bg-[var(--color-accent)] text-[var(--color-text)] dark:bg-gray-800 dark:text-gray-100",
            day_outside: "text-[var(--color-muted)] opacity-50 aria-selected:bg-[var(--color-accent)]/50 aria-selected:text-[var(--color-muted)] aria-selected:opacity-30",
            day_disabled: "text-[var(--color-muted)] opacity-50 cursor-not-allowed",
            day_range_middle: "aria-selected:bg-[var(--color-accent)] aria-selected:text-[var(--color-text)] dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-100",
            day_hidden: "invisible",
          }}
          components={{
            IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
            IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />,
          }}
        />
      </PopoverContent>
    </Popover>
  );
};