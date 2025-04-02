import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

interface FeedbackControlsProps {
  messageId?: string;
  onFeedback?: (
    messageId: string,
    type: "positive" | "negative",
    comment?: string,
  ) => void;
}

const FeedbackControls = ({
  messageId = "default-message-id",
  onFeedback = () => {},
}: FeedbackControlsProps) => {
  const [feedbackGiven, setFeedbackGiven] = useState<
    "positive" | "negative" | null
  >(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedbackGiven(type);
    onFeedback(messageId, type);

    // Show detailed feedback form for negative feedback
    if (type === "negative") {
      setShowDetailedFeedback(true);
    }
  };

  const submitDetailedFeedback = () => {
    if (feedbackGiven) {
      onFeedback(messageId, feedbackGiven, feedbackComment);
      setShowDetailedFeedback(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-background/80 p-1 rounded-md">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={feedbackGiven === "positive" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleFeedback("positive")}
              aria-label="Thumbs up"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This response was helpful</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={feedbackGiven === "negative" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleFeedback("negative")}
              aria-label="Thumbs down"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This response was not helpful</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Popover
        open={showDetailedFeedback}
        onOpenChange={setShowDetailedFeedback}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Additional feedback"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Additional Feedback</h4>
            <p className="text-sm text-muted-foreground">
              Please let us know how we can improve this response.
            </p>
            <Textarea
              placeholder="What was wrong with this response?"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button onClick={submitDetailedFeedback}>Submit</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FeedbackControls;
