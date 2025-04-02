import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, Globe, Code } from "lucide-react";

interface RagControlsProps {
  onSettingsChange: (settings: RagSettings) => void;
}

export interface RagSettings {
  documentSearch: boolean;
  webSearch: boolean;
  webScraping: boolean;
}

export default function RagControls({ onSettingsChange }: RagControlsProps) {
  const [settings, setSettings] = useState<RagSettings>({
    documentSearch: true,
    webSearch: false,
    webScraping: false,
  });

  const handleSettingChange = (setting: keyof RagSettings, value: boolean) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">RAG Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-primary" />
            <Label
              htmlFor="document-search"
              className="text-sm font-medium truncate"
            >
              Document Search
            </Label>
          </div>
          <Switch
            id="document-search"
            checked={settings.documentSearch}
            onCheckedChange={(checked) =>
              handleSettingChange("documentSearch", checked)
            }
          />
        </div>

        <Separator className="bg-border/50" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-primary" />
            <Label
              htmlFor="web-search"
              className="text-sm font-medium truncate"
            >
              Web Search
            </Label>
          </div>
          <Switch
            id="web-search"
            checked={settings.webSearch}
            onCheckedChange={(checked) =>
              handleSettingChange("webSearch", checked)
            }
          />
        </div>

        <Separator className="bg-border/50" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-4 w-4 text-primary" />
            <Label
              htmlFor="web-scraping"
              className="text-sm font-medium truncate"
            >
              Web Scraping
            </Label>
          </div>
          <Switch
            id="web-scraping"
            checked={settings.webScraping}
            onCheckedChange={(checked) =>
              handleSettingChange("webScraping", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
