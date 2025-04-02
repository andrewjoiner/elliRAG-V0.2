import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TopicSelectorProps {
  topics: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

export function TopicSelector({
  topics,
  value,
  onValueChange,
  placeholder = "Select a topic...",
  className,
}: TopicSelectorProps & { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || "");

  const handleSelect = (currentValue: string) => {
    setSelectedValue(currentValue);
    onValueChange?.(currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] bg-background/50 border-border text-foreground hover:bg-secondary/50 hover:text-primary"
        >
          {selectedValue
            ? topics.find((topic) => topic.value === selectedValue)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-background border-border">
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search topics..."
            className="text-foreground"
          />
          <CommandEmpty className="text-muted-foreground">
            No topic found.
          </CommandEmpty>
          <CommandGroup>
            {topics.map((topic) => (
              <CommandItem
                key={topic.value}
                value={topic.value}
                onSelect={handleSelect}
                className="text-foreground hover:bg-secondary hover:text-primary"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValue === topic.value
                      ? "opacity-100 text-primary"
                      : "opacity-0",
                  )}
                />
                {topic.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
