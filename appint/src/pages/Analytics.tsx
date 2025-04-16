import RagControls from "../../../src/components/chat/RagControls";
import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <RagControls onSettingsChange={() => {}} />
      </Card>
    </div>
  );
}