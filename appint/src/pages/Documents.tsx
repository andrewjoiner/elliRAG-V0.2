import DocumentManager from "../../../src/components/chat/DocumentManager";
import { Card } from "@/components/ui/card";
import AuthLayout from "../../../src/components/auth/AuthLayout";

export default function DocumentsPage() {
  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto mt-8">
        <Card className="w-full">
          <DocumentManager />
        </Card>
      </div>
    </AuthLayout>
  );
}