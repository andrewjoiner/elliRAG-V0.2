import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  ExternalLink,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Source {
  id: string;
  title: string;
  excerpt: string;
  confidence: number;
  type: "document" | "web";
  url?: string;
}

interface SourceCitationProps {
  sources?: Source[];
  messageId?: string;
}

const SourceCitation: React.FC<SourceCitationProps> = ({
  sources = [
    {
      id: "1",
      title: "Industry Report 2023",
      excerpt:
        "According to the latest findings, the industry has shown a 15% growth in Q3 compared to the previous year. Market analysts attribute this growth to increased adoption of digital solutions and favorable regulatory changes.",
      confidence: 0.92,
      type: "document",
    },
    {
      id: "2",
      title: "Competitive Analysis",
      excerpt:
        "The competitive landscape has shifted significantly with the entry of new players. Established companies are responding by investing in innovation and customer experience improvements.",
      confidence: 0.85,
      type: "document",
    },
    {
      id: "3",
      title: "Market Trends Blog",
      excerpt:
        "Recent trends indicate a growing preference for sustainable solutions. Companies that emphasize environmental responsibility are seeing improved customer loyalty and brand perception.",
      confidence: 0.78,
      type: "web",
      url: "https://example.com/market-trends",
    },
  ],
  messageId = "msg-1",
}) => {
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);

  const toggleSource = (id: string) => {
    setOpenSourceId(openSourceId === id ? null : id);
  };

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 mb-4 w-full bg-slate-50 rounded-md border border-slate-200">
      <div className="p-3">
        <h4 className="text-sm font-medium text-slate-700 mb-2">
          Sources ({sources.length})
        </h4>

        <div className="space-y-2">
          {sources.map((source) => (
            <Collapsible
              key={source.id}
              open={openSourceId === source.id}
              onOpenChange={() => toggleSource(source.id)}
              className="border border-slate-200 rounded-md bg-white"
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  {source.type === "document" ? (
                    <FileText className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium text-sm truncate max-w-[300px]">
                    {source.title}
                  </span>
                  <Badge
                    variant={getConfidenceBadgeVariant(source.confidence)}
                    className="ml-2"
                  >
                    {Math.round(source.confidence * 100)}%
                  </Badge>
                </div>

                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-7 w-7">
                    {openSourceId === source.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="p-3 pt-0 border-t border-slate-100">
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {source.excerpt}
                  </p>

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                    >
                      View source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to determine badge variant based on confidence score
const getConfidenceBadgeVariant = (
  confidence: number,
): "default" | "secondary" | "destructive" | "outline" => {
  if (confidence >= 0.9) return "default";
  if (confidence >= 0.7) return "secondary";
  if (confidence >= 0.5) return "outline";
  return "destructive";
};

export default SourceCitation;
