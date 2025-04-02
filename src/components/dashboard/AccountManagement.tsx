import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "./UserProfile";
import { supabase } from "../../../supabase/supabase";
import { getUsageStats, UsageStats } from "@/lib/user";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface UsageStats {
  totalChats: number;
  remainingChats: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  plan: string;
}

export default function AccountManagement() {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  // Fetch usage data from the database
  useEffect(() => {
    const fetchUsageData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const stats = await getUsageStats();
        setUsageStats(stats);
      } catch (error) {
        console.error("Error fetching usage data:", error);
        toast({
          title: "Error",
          description: "Failed to load usage data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUsageData();
    }
  }, [user, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        Please sign in to view your account
      </div>
    );
  }

  const usagePercentage = usageStats
    ? Math.round(
        ((usageStats.totalChats - usageStats.remainingChats) /
          usageStats.totalChats) *
          100,
      )
    : 0;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Account Management</h1>
        <Button onClick={() => (window.location.href = "/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfile />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
              <Button>Update Profile</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium">
                    {usageStats.plan} Plan
                  </h3>
                  <p className="text-muted-foreground">
                    Billing period: {usageStats.billingPeriodStart} -{" "}
                    {usageStats.billingPeriodEnd}
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  Active
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Free</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      $0<span className="text-sm font-normal">/month</span>
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>• Basic regulatory guidance for climate projects</li>
                      <li>• Access to core regulatory frameworks</li>
                      <li>• Single-question interactions</li>
                      <li>
                        • Basic document summaries (up to 5 pages per document)
                      </li>
                      <li>• 50 questions per month</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Downgrade
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pro</CardTitle>
                    <Badge className="bg-primary text-primary-foreground">
                      Current
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      $39<span className="text-sm font-normal">/month</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or $399/year (save ~15%)
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>• Everything in Free tier</li>
                      <li>• Advanced multi-turn conversations</li>
                      <li>• Full document analysis (unlimited pages)</li>
                      <li>• Priority response times</li>
                      <li>• Conversation history saved for 90 days</li>
                      <li>• Export conversation insights</li>
                      <li>• Email support</li>
                      <li>• 500 questions per month</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Enterprise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">Custom pricing</p>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li>• Everything in Pro tier</li>
                      <li>
                        • Custom knowledge integration (your internal documents)
                      </li>
                      <li>• Web scraping for regulatory updates</li>
                      <li>• API access for integration with your systems</li>
                      <li>• Dedicated account manager</li>
                      <li>• Training sessions for your team</li>
                      <li>• Custom reporting</li>
                      <li>• SLA guarantees</li>
                      <li>• Phone and email support</li>
                      <li>• Custom usage limits</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                Track your chat usage for the current billing period
              </CardDescription>
            </CardHeader>
            {isLoading ? (
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            ) : usageStats ? (
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Chat Usage</span>
                    <span>
                      {usageStats.totalChats - usageStats.remainingChats} /{" "}
                      {usageStats.totalChats}
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    You have {usageStats.remainingChats} questions remaining for
                    this billing period.
                  </p>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Usage History</h3>
                  <div className="space-y-2">
                    {usageStats.usageHistory.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.period}</span>
                        <span>{item.count} questions</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Failed to load usage data. Please try again.
                </p>
              </CardContent>
            )}
            <CardFooter>
              <Button variant="outline" className="w-full">
                Download Usage Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
