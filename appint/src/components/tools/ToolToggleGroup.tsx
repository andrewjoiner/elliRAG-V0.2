import React, { useState } from "react";
import { Cog, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ToolToggle from "./ToolToggle";

interface Tool {
  id: string;
  name: string;
  isActive: boolean;
  tooltipText: string;
}

interface ToolToggleGroupProps {
  /**
   * Array of tools to display
   */
  tools?: Tool[];

  /**
   * Function called when a tool is toggled
   */
  onToolToggle?: (toolId: string, isActive: boolean) => void;

  /**
   * Function called when the config button is clicked
   */
  onConfigClick?: () => void;

  /**
   * Whether to show the config button
   */
  showConfigButton?: boolean;
}

/**
 * Button group for enabling/disabling RAG tools (Document Search, Web Search, Web Scrape).
 * Shows active state for each tool.
 */
const ToolToggleGroup = ({
  tools = [
    {
      id: "doc-search",
      name: "Document Search",
      isActive: true,
      tooltipText: "Search through your document knowledge base",
    },
    {
      id: "web-search",
      name: "Web Search",
      isActive: false,
      tooltipText: "Search the web for information",
    },
    {
      id: "web-scrape",
      name: "Web Scrape",
      isActive: false,
      tooltipText: "Extract information from websites",
    },
  ],
  onToolToggle = () => {},
  onConfigClick = () => {},
  showConfigButton = true,
}: ToolToggleGroupProps) => {
  const [localTools, setLocalTools] = useState<Tool[]>(tools);

  const handleToolToggle = (toolId: string) => {
    const updatedTools = localTools.map((tool) => {
      if (tool.id === toolId) {
        const newActiveState = !tool.isActive;
        // Call the external handler with the new state
        onToolToggle(toolId, newActiveState);
        return { ...tool, isActive: newActiveState };
      }
      return tool;
    });

    setLocalTools(updatedTools);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background/80 rounded-md border border-border">
      <div className="flex items-center gap-1">
        {localTools.map((tool) => (
          <ToolToggle
            key={tool.id}
            name={tool.name}
            isActive={tool.isActive}
            tooltipText={tool.tooltipText}
            onToggle={() => handleToolToggle(tool.id)}
          />
        ))}
      </div>

      {showConfigButton && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-1"
                onClick={onConfigClick}
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Configure tool settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ToolToggleGroup;
