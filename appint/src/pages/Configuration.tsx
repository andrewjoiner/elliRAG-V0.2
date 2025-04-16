import SettingsPanel from "../../../src/components/chat/SettingsPanel";
import { Card } from "@/components/ui/card";

export default function ConfigurationPage() {
  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <SettingsPanel />
      </Card>
    </div>
  );
}