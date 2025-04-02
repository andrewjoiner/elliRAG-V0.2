import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Plus,
  Download,
  MoreVertical,
  Trash,
  Copy,
  Signal,
  AlertCircle,
} from "lucide-react";

interface TopBarProps {
  isConnected?: boolean;
  onNewChat?: () => void;
  onExportChat?: () => void;
  onClearChat?: () => void;
  onCopyChat?: () => void;
}

const TopBar = ({
  isConnected = true,
  onNewChat = () => {},
  onExportChat = () => {},
  onClearChat = () => {},
  onCopyChat = () => {},
}: TopBarProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background/90">
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
                className="rounded-full"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onExportChat}
                className="rounded-full"
              >
                <Download className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export Conversation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={onCopyChat}>
              <Copy className="mr-2 h-4 w-4" />
              Copy conversation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onClearChat}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Clear conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                {isConnected ? (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Signal className="h-4 w-4 mr-1 text-green-500" />
                    <span>Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Disconnected</span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isConnected
                  ? "R2R API is connected"
                  : "R2R API connection error"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TopBar;
