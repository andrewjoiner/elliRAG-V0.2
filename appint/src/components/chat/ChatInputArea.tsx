import React, { useState, useRef } from "react";
import ChatInput from "./ChatInput";
import ToolToggleGroup from "../tools/ToolToggleGroup";
import ToolConfigPopover from "../tools/ToolConfigPopover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ChatInputAreaProps {
  /**
   * Function called when a message is sent
   */
  onSendMessage?: (message: string, documents?: File[]) => void;

  /**
   * Whether the chat is currently loading/processing a response
   */
  isLoading?: boolean;

  /**
   * Whether the chat input is disabled
   */
  disabled?: boolean;

  /**
   * Placeholder text for the chat input
   */
  placeholder?: string;

  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Bottom area containing message input, send button, and tool toggles.
 */
const ChatInputArea = ({
  onSendMessage = () => {},
  isLoading = false,
  disabled = false,
  placeholder = "Type your message here...",
  className = "",
}: ChatInputAreaProps) => {
  const [activeToolConfig, setActiveToolConfig] = useState<
    "document" | "web" | "scrape" | null
  >(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle tool toggle
  const handleToolToggle = (toolId: string, isActive: boolean) => {
    console.log(`Tool ${toolId} is now ${isActive ? "active" : "inactive"}`);
    // Here you would update your application state with the tool status
  };

  // Handle tool config button click
  const handleToolConfigClick = () => {
    // Default to document config if nothing is active
    setActiveToolConfig("document");
  };

  // Handle closing the tool config popover
  const handleToolConfigClose = (open: boolean) => {
    if (!open) setActiveToolConfig(null);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle file button click
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handle message send with files
  const handleSendMessage = (message: string) => {
    onSendMessage(
      message,
      uploadedFiles.length > 0 ? uploadedFiles : undefined,
    );
    setUploadedFiles([]);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 w-full p-4 border-t bg-background",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <ToolToggleGroup
            onToolToggle={handleToolToggle}
            onConfigClick={handleToolConfigClick}
          />
        </div>

        {activeToolConfig && (
          <ToolConfigPopover
            toolType={activeToolConfig}
            isOpen={!!activeToolConfig}
            onOpenChange={handleToolConfigClose}
          />
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30 mb-2">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 text-xs bg-background rounded-md p-1.5 border"
            >
              <span className="max-w-[150px] truncate">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full"
                onClick={() => handleRemoveFile(index)}
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="flex-shrink-0"
          onClick={handleFileButtonClick}
          disabled={isLoading || disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx"
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full"
        />
      </div>

      <div className="text-xs text-muted-foreground text-center">
        <p>
          AI responses are generated based on enabled tools and may contain
          inaccuracies.
        </p>
      </div>
    </div>
  );
};

export default ChatInputArea;
