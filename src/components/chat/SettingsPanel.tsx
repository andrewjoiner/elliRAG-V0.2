import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Key, Sliders, User } from "lucide-react";
import ApiKeyManager from "../settings/ApiKeyManager";

interface SettingsPanelProps {
  onSettingsChange?: (settings: any) => void;
}

export default function SettingsPanel({
  onSettingsChange,
}: SettingsPanelProps) {
  const [llmProvider, setLlmProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState("2048");
  const [model, setModel] = useState("gpt-4");
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleSaveSettings = () => {
    const settings = {
      llmProvider,
      apiKey,
      temperature: temperature[0],
      maxTokens: parseInt(maxTokens),
      model,
      darkMode,
      autoSave,
    };

    if (onSettingsChange) {
      onSettingsChange(settings);
    }

    console.log("Settings saved:", settings);
  };

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="llm">
          <TabsList className="w-full mb-4 bg-background/50 grid grid-cols-4 gap-1">
            <TabsTrigger value="llm" className="px-2">
              <Key className="h-4 w-4 mr-2" />
              LLM
            </TabsTrigger>
            <TabsTrigger value="model" className="px-2">
              <Sliders className="h-4 w-4 mr-2" />
              Model
            </TabsTrigger>
            <TabsTrigger value="user" className="px-2">
              <User className="h-4 w-4 mr-2" />
              User
            </TabsTrigger>
            <TabsTrigger value="api" className="px-2">
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="llm" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="llm-provider" className="text-sm">
                LLM Provider
              </Label>
              <Select value={llmProvider} onValueChange={setLlmProvider}>
                <SelectTrigger id="llm-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google AI</SelectItem>
                  <SelectItem value="mistral">Mistral AI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-sm">
                API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
          </TabsContent>

          <TabsContent value="model" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-select" className="text-sm">
                Model
              </Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">
                    Claude 3 Sonnet
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="temperature-slider" className="text-sm">
                  Temperature: {temperature[0]}
                </Label>
              </div>
              <Slider
                id="temperature-slider"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onValueChange={setTemperature}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens" className="text-sm">
                Max Tokens
              </Label>
              <Input
                id="max-tokens"
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                min="1"
                max="8192"
              />
            </div>
          </TabsContent>

          <TabsContent value="user" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm">
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <Separator className="bg-border/50" />

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="text-sm">
                Auto-save Conversations
              </Label>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <ApiKeyManager />
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleSaveSettings}
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
