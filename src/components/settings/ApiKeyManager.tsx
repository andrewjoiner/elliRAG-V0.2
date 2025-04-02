import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  ApiKey,
  generateApiKey,
  getApiKeys,
  deleteApiKey,
} from "@/lib/apiKeys";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ApiKeyManager() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch API keys on component mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const keys = await getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      setIsLoading(true);
      const key = await generateApiKey(newKeyName);
      setNewKey(key);
      setApiKeys((prev) => [key, ...prev]);
      setNewKeyName("");
      setIsDialogOpen(true);

      toast({
        title: "API Key Created",
        description: `API key "${newKeyName}" created successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteApiKey(id);
      setApiKeys((prev) => prev.filter((key) => key.id !== id));

      toast({
        title: "API Key Deleted",
        description: "API key deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never used";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="h-full bg-card/50 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>API Key Management</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-3 w-3" />
                New API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Name</label>
                  <Input
                    placeholder="Enter a name for this API key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>

                {newKey && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Your API Key
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => copyToClipboard(newKey.api_key)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <div className="p-2 bg-muted rounded-md font-mono text-sm break-all">
                      {newKey.api_key}
                    </div>
                    <div className="flex items-center mt-2 text-amber-500 gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">
                        This key will only be shown once. Save it securely.
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim() || isLoading}
                >
                  Create API Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {isLoading && apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading API keys...
              </div>
            ) : apiKeys.length > 0 ? (
              apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="p-3 border border-border rounded-md bg-background/30 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <Key className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <div className="text-sm font-medium">
                          {key.key_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {formatDate(key.created_at)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last used: {formatDate(key.last_used)}
                        </div>
                        <div className="mt-1">
                          <Badge
                            variant={key.is_active ? "default" : "outline"}
                            className="text-[10px] px-1 py-0 h-4"
                          >
                            {key.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No API keys found. Create one to get started.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
