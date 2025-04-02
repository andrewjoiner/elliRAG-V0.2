import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Globe, FileText } from "lucide-react";

interface ToolToggleProps {
  /**
   * The name of the tool
   */
  name: string;

  /**
   * The icon to display for the tool
   */
  icon?: React.ElementType;

  /**
   * Whether the tool is currently active
   */
  isActive?: boolean;

  /**
   * The tooltip text to display when hovering over the tool
   */
  tooltipText?: string;

  /**
   * Function called when the tool is toggled
   */
  onToggle?: () => void;
}

/**
 * Individual toggle button for each RAG tool with icon and label.
 * Shows active/inactive state.
 */
const ToolToggle = ({
  name = "Document Search",
  icon: Icon,
  isActive = false,
  tooltipText = "Toggle this tool",
  onToggle = () => {},
}: ToolToggleProps) => {
  // Map default icons based on common tool names if no icon is provided
  const getDefaultIcon = () => {
    switch (name.toLowerCase()) {
      case "document search":
        return FileText;
      case "web search":
        return Search;
      case "web scrape":
        return Globe;
      default:
        return FileText;
    }
  };

  // Use the provided icon or fall back to a default based on name
  const IconComponent = Icon || getDefaultIcon();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={`flex items-center gap-2 rounded-md transition-all bg-background ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            onClick={onToggle}
            aria-pressed={isActive}
          >
            <IconComponent className="h-4 w-4" />
            <span className="text-xs font-medium">{name}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ToolToggle;
