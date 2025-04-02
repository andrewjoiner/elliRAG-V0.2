import React, { useState } from "react";
import { Settings, Search, Globe, FileText } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ToolConfigPopoverProps {
  toolType?: "document" | "web" | "scrape";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ToolConfigPopover = ({
  toolType = "document",
  isOpen = false,
  onOpenChange,
}: ToolConfigPopoverProps) => {
  // Default configuration states for each tool type
  const [documentConfig, setDocumentConfig] = useState({
    maxResults: 5,
    threshold: 0.7,
    useMetadata: true,
    collection: "default",
  });

  const [webConfig, setWebConfig] = useState({
    maxResults: 3,
    safeSearch: true,
    siteRestriction: "",
  });

  const [scrapeConfig, setScrapeConfig] = useState({
    depth: 1,
    maxPages: 3,
    respectRobotsTxt: true,
  });

  // Get the appropriate icon based on tool type
  const getToolIcon = () => {
    switch (toolType) {
      case "document":
        return <FileText className="h-4 w-4 mr-2" />;
      case "web":
        return <Search className="h-4 w-4 mr-2" />;
      case "scrape":
        return <Globe className="h-4 w-4 mr-2" />;
      default:
        return <Settings className="h-4 w-4 mr-2" />;
    }
  };

  // Get the appropriate title based on tool type
  const getToolTitle = () => {
    switch (toolType) {
      case "document":
        return "Document Search Settings";
      case "web":
        return "Web Search Settings";
      case "scrape":
        return "Web Scraping Settings";
      default:
        return "Tool Settings";
    }
  };

  // Render the appropriate configuration form based on tool type
  const renderConfigForm = () => {
    switch (toolType) {
      case "document":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxResults">Max Results</Label>
              <Slider
                id="maxResults"
                min={1}
                max={10}
                step={1}
                value={[documentConfig.maxResults]}
                onValueChange={(value) =>
                  setDocumentConfig({ ...documentConfig, maxResults: value[0] })
                }
              />
              <div className="text-xs text-muted-foreground text-right">
                {documentConfig.maxResults}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Relevance Threshold</Label>
              <Slider
                id="threshold"
                min={0.1}
                max={1.0}
                step={0.1}
                value={[documentConfig.threshold]}
                onValueChange={(value) =>
                  setDocumentConfig({ ...documentConfig, threshold: value[0] })
                }
              />
              <div className="text-xs text-muted-foreground text-right">
                {documentConfig.threshold.toFixed(1)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="useMetadata" className="cursor-pointer">
                Use Metadata
              </Label>
              <Switch
                id="useMetadata"
                checked={documentConfig.useMetadata}
                onCheckedChange={(checked) =>
                  setDocumentConfig({ ...documentConfig, useMetadata: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection">Collection</Label>
              <Input
                id="collection"
                value={documentConfig.collection}
                onChange={(e) =>
                  setDocumentConfig({
                    ...documentConfig,
                    collection: e.target.value,
                  })
                }
                placeholder="Collection name"
              />
            </div>
          </div>
        );

      case "web":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webMaxResults">Max Results</Label>
              <Slider
                id="webMaxResults"
                min={1}
                max={10}
                step={1}
                value={[webConfig.maxResults]}
                onValueChange={(value) =>
                  setWebConfig({ ...webConfig, maxResults: value[0] })
                }
              />
              <div className="text-xs text-muted-foreground text-right">
                {webConfig.maxResults}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="safeSearch" className="cursor-pointer">
                Safe Search
              </Label>
              <Switch
                id="safeSearch"
                checked={webConfig.safeSearch}
                onCheckedChange={(checked) =>
                  setWebConfig({ ...webConfig, safeSearch: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteRestriction">Site Restriction</Label>
              <Input
                id="siteRestriction"
                value={webConfig.siteRestriction}
                onChange={(e) =>
                  setWebConfig({
                    ...webConfig,
                    siteRestriction: e.target.value,
                  })
                }
                placeholder="e.g., site:example.com"
              />
            </div>
          </div>
        );

      case "scrape":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="depth">Crawl Depth</Label>
              <Slider
                id="depth"
                min={1}
                max={5}
                step={1}
                value={[scrapeConfig.depth]}
                onValueChange={(value) =>
                  setScrapeConfig({ ...scrapeConfig, depth: value[0] })
                }
              />
              <div className="text-xs text-muted-foreground text-right">
                {scrapeConfig.depth}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPages">Max Pages</Label>
              <Slider
                id="maxPages"
                min={1}
                max={10}
                step={1}
                value={[scrapeConfig.maxPages]}
                onValueChange={(value) =>
                  setScrapeConfig({ ...scrapeConfig, maxPages: value[0] })
                }
              />
              <div className="text-xs text-muted-foreground text-right">
                {scrapeConfig.maxPages}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="respectRobotsTxt" className="cursor-pointer">
                Respect robots.txt
              </Label>
              <Switch
                id="respectRobotsTxt"
                checked={scrapeConfig.respectRobotsTxt}
                onCheckedChange={(checked) =>
                  setScrapeConfig({
                    ...scrapeConfig,
                    respectRobotsTxt: checked,
                  })
                }
              />
            </div>
          </div>
        );

      default:
        return <div>No configuration options available</div>;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-background">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configure tool</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-background">
        <div className="space-y-4">
          <div className="flex items-center border-b pb-2">
            {getToolIcon()}
            <h4 className="font-medium">{getToolTitle()}</h4>
          </div>
          {renderConfigForm()}
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={() => onOpenChange?.(false)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ToolConfigPopover;
