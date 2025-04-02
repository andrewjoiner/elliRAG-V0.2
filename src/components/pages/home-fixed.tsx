import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Settings,
  User,
  Zap,
  Shield,
  Database,
  Code,
  CheckCircle2,
  ArrowRight,
  Star,
  ChevronRight,
  Github,
  Loader2,
  Twitter,
  Instagram,
  X,
  FileText,
  BarChart,
  LineChart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, AuthProvider } from "@/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Define the Plan type
type Plan = {
  id: string;
  object: string;
  active: boolean;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  product: string;
  created: number;
  livemode: boolean;
  [key: string]: any;
};

// Feature interface
interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
}

// Process step interface
interface ProcessStep {
  title: string;
  description: string;
  icon: JSX.Element;
}

function LandingPage() {
  // Set dark mode as default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Use the Supabase client to call the Edge Function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-get-plans",
      );

      if (error) {
        throw error;
      }

      setPlans(data || []);
      setError("");
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      setError("Failed to load plans. Please try again later.");
    }
  };

  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "default",
      });
      navigate("/login?redirect=pricing");
      return;
    }

    setIsLoading(true);
    setProcessingPlanId(priceId);
    setError("");

    try {
      console.log(
        "Attempting to create checkout session with price ID:",
        priceId,
      );

      // Try direct function name first
      try {
        const { data, error } = await supabase.functions.invoke(
          "create-checkout",
          {
            body: {
              price_id: priceId,
              user_id: user.id,
              return_url: `${window.location.origin}/dashboard`,
            },
            headers: {
              "X-Customer-Email": user.email || "",
            },
          },
        );

        if (error) {
          console.error("Direct function name error:", error);
          throw error;
        }

        if (data?.url) {
          toast({
            title: "Redirecting to checkout",
            description:
              "You'll be redirected to Stripe to complete your purchase.",
            variant: "default",
          });
          navigate(data.url);
          return;
        }
      } catch (directError) {
        console.log(
          "Direct function call failed, trying with prefix:",
          directError,
        );
        // Continue to fallback method
      }

      // Fallback to prefixed function name
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user.id,
            return_url: `${window.location.origin}/dashboard`,
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        toast({
          title: "Redirecting to checkout",
          description:
            "You'll be redirected to Stripe to complete your purchase.",
          variant: "default",
        });
        navigate(data.url);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError("Failed to create checkout session. Please try again.");
      toast({
        title: "Checkout failed",
        description:
          "There was an error creating your checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProcessingPlanId(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    });

    return formatter.format(amount / 100);
  };

  // Sample features data
  const features: Feature[] = [
    {
      title: "Protocol Navigation",
      description:
        "Quickly understand requirements across multiple climate impact frameworks without wading through hundreds of pages of technical documentation.",
      icon: <FileText className="h-10 w-10" />,
    },
    {
      title: "Compliance Guidance",
      description:
        "Get specific answers about eligibility criteria, monitoring requirements, and verification standards tailored to your project type.",
      icon: <Shield className="h-10 w-10" />,
    },
    {
      title: "Document Analysis",
      description:
        "Upload project documents and receive instant feedback on potential compliance issues or improvement opportunities.",
      icon: <Database className="h-10 w-10" />,
    },
    {
      title: "Cross-Protocol Comparison",
      description:
        "Understand key differences between regulatory frameworks to identify the best path forward for your specific project.",
      icon: <Code className="h-10 w-10" />,
    },
  ];

  // Process steps
  const processSteps: ProcessStep[] = [
    {
      title: "Ask Your Question",
      description:
        "Simply type your regulatory question in natural language—no need for precise terminology or technical expertise.",
      icon: <FileText className="h-10 w-10" />,
    },
    {
      title: "Receive Context-Aware Answers",
      description:
        "elli understands your project context and delivers targeted guidance specific to your situation.",
      icon: <Shield className="h-10 w-10" />,
    },
    {
      title: "Explore Related Requirements",
      description:
        "Discover connected regulations and considerations you might have overlooked but that impact your compliance.",
      icon: <BarChart className="h-10 w-10" />,
    },
    {
      title: "Implement with Confidence",
      description:
        "Get clear, actionable insights that help you move forward with regulatory assurance.",
      icon: <CheckCircle2 className="h-10 w-10" />,
    },
  ];

  // Plan features
  const getPlanFeatures = (planType: string) => {
    const freeFeatures = [
      "Basic regulatory guidance for climate projects",
      "Access to core regulatory frameworks",
      "Single-question interactions",
      "Basic document summaries (up to 5 pages per document)",
      "50 questions per month",
    ];

    const proFeatures = [
      "Everything in Free tier",
      "Advanced multi-turn conversations",
      "Full document analysis (unlimited pages)",
      "Priority response times",
      "Conversation history saved for 90 days",
      "Export conversation insights",
      "Email support",
      "500 questions per month",
    ];

    const enterpriseFeatures = [
      "Everything in Pro tier",
      "Custom knowledge integration (your internal documents)",
      "Web scraping for regulatory updates",
      "API access for integration with your systems",
      "Dedicated account manager",
      "Training sessions for your team",
      "Custom reporting",
      "SLA guarantees",
      "Phone and email support",
      "Custom usage limits",
    ];

    if (planType.includes("PRO")) return proFeatures;
    if (planType.includes("ENTERPRISE")) return enterpriseFeatures;
    return freeFeatures;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="font-bold text-xl flex items-center text-foreground"
            >
              <img
                src="/elli-icon.svg"
                alt="elli logo"
                className="h-10 w-auto mr-2"
              />
              elli
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 text-foreground hover:text-primary"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user.email || ""} />
                        <AvatarFallback>
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block">
                        {user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-card border-border"
                  >
                    <DropdownMenuLabel className="text-foreground">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem className="text-foreground hover:text-primary focus:text-primary">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:text-primary focus:text-primary">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onSelect={() => signOut()}
                      className="text-foreground hover:text-primary focus:text-primary"
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/80">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 space-y-8">
                <div>
                  <Badge className="mb-4 bg-secondary text-foreground hover:bg-secondary/80 border-none">
                    AI-Powered Regulatory Guidance
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    Stop Getting Lost in Climate Regulatory Mazes
                  </h1>
                </div>
                <p className="text-lg md:text-xl text-muted-foreground">
                  elli is your AI regulatory guide that transforms complex
                  climate frameworks into clear, actionable insights. Ask
                  questions in plain language and get expert-level answers
                  instantly—without spending weeks deciphering dense regulatory
                  documents.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/80 w-full sm:w-auto"
                    >
                      Start Chatting
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:border-primary hover:text-primary w-full sm:w-auto"
                    onClick={() => {
                      const featuresSection =
                        document.querySelector("#features-section");
                      if (featuresSection) {
                        featuresSection.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Explore Capabilities
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Trained on Real Project Submissions</span>
                  <Separator
                    orientation="vertical"
                    className="h-4 mx-2 bg-border"
                  />
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Up-to-Date Regulatory Knowledge</span>
                  <Separator
                    orientation="vertical"
                    className="h-4 mx-2 bg-border"
                  />
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Protocol-Specific Guidance</span>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-primary/10 via-primary/5 to-background rounded-3xl blur-2xl transform scale-110" />
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl shadow-xl overflow-hidden">
                  <div className="p-1 bg-gradient-to-r from-background via-secondary to-primary/50 rounded-t-xl">
                    <div className="flex items-center gap-2 px-3 py-1">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <div className="ml-2 text-xs text-foreground font-medium">
                        elli Chat
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-start">
                        <div className="bg-secondary p-3 rounded-lg rounded-tl-none max-w-[80%]">
                          <p className="text-foreground">
                            Hi there! I'm elli. How can I help with your climate
                            impact project today?
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start justify-end">
                        <div className="bg-primary/20 p-3 rounded-lg rounded-tr-none max-w-[80%]">
                          <p className="text-foreground">
                            I'm working on a renewable energy project and need
                            guidance on regulatory requirements.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-secondary p-3 rounded-lg rounded-tl-none max-w-[80%]">
                          <p className="text-foreground">
                            I'd be happy to help with that. Let me guide you
                            through the key regulations for renewable energy
                            projects...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-0 right-0 -z-10 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
        </section>

        {/* Features Section */}
        <section id="features-section" className="py-16 md:py-24 bg-background">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-secondary text-foreground hover:bg-secondary/80 border-none">
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                Expert Knowledge at Your Fingertips
              </h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto">
                elli gives you immediate access to regulatory insights that
                typically take years of specialized experience to acquire.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-border bg-card shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="mb-4 text-primary">{feature.icon}</div>
                    <CardTitle className="text-foreground">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-secondary text-foreground hover:bg-secondary/80 border-none">
                How It Works
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                Simple Steps to Regulatory Clarity
              </h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto">
                elli makes accessing complex regulatory knowledge as easy as
                having a conversation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <Card
                  key={index}
                  className="border-border bg-background shadow-md hover:shadow-lg transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary"></div>
                  <CardHeader>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-4">
                      {index + 1}
                    </div>
                    <CardTitle className="text-foreground">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-secondary text-foreground hover:bg-secondary/80 border-none">
                Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto">
                Choose the perfect plan for your climate impact projects. All
                plans include access to our core features. No hidden fees or
                surprises.
              </p>
            </div>

            {error && (
              <div
                className="bg-destructive/20 border border-destructive/50 text-destructive-foreground px-4 py-3 rounded relative mb-6"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
                <button
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  onClick={() => setError("")}
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Tier */}
              <Card className="flex flex-col h-full border-border bg-card shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold">Free</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Get started with basic guidance
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      $0
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Separator className="my-4 bg-border" />
                  <ul className="space-y-3">
                    {getPlanFeatures("FREE").map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start text-muted-foreground"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
                    onClick={() => navigate("/signup")}
                  >
                    Get Started
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro Tier */}
              <Card className="flex flex-col h-full border-border bg-card shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <div className="absolute top-5 right-5">
                  <Badge className="bg-primary text-primary-foreground">
                    Popular
                  </Badge>
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold">Pro</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    For professionals and small teams
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      $39
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    or $399/year (save ~15%)
                  </p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Separator className="my-4 bg-border" />
                  <ul className="space-y-3">
                    {getPlanFeatures("PRO").map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start text-muted-foreground"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
                    onClick={() => handleCheckout("pro_monthly")}
                    disabled={isLoading}
                  >
                    {isLoading && processingPlanId === "pro_monthly" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Subscribe Now
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Enterprise Tier */}
              <Card className="flex flex-col h-full border-border bg-card shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold">
                    Enterprise
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    For organizations with advanced needs
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-foreground">
                      Custom pricing
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Separator className="my-4 bg-border" />
                  <ul className="space-y-3">
                    {getPlanFeatures("ENTERPRISE").map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start text-muted-foreground"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
                    onClick={() =>
                      (window.location.href =
                        "mailto:admin@nvend.io?subject=Enterprise Plan Inquiry")
                    }
                  >
                    Contact Sales
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-secondary text-foreground hover:bg-secondary/80 border-none">
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto">
                Find answers to common questions about elli and our services.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    What happens if I exceed my monthly question limit?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Once you reach your monthly question limit, you'll receive a
                    notification inviting you to upgrade to the next tier. Free
                    users will need to wait until the next billing cycle for
                    their limit to reset, while Pro users can purchase
                    additional questions at $0.10 per question if they need more
                    before their next renewal.
                  </AccordionContent>
                </AccordionItem>

                {/* Placeholder for additional FAQ items */}
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    Can I upgrade or downgrade at any time?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, you can upgrade your plan at any time, and the change
                    will take effect immediately. Downgrades will apply at the
                    beginning of your next billing cycle. We'll prorate any
                    charges when you upgrade mid-cycle to ensure you only pay
                    for what you use.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    How are questions counted in multi-turn conversations?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Each distinct question you ask elli counts as one question
                    against your monthly limit. Follow-up questions for
                    clarification within the same conversation thread are also
                    counted individually. However, elli's responses and
                    clarifications don't count against your limit.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    Do unused questions roll over to the next month?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    No, unused questions don't roll over. Your question
                    allowance resets at the beginning of each billing cycle.
                    This helps us maintain service quality and responsiveness
                    for all users.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    What types of documents can elli analyze?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    elli can analyze PDFs, Word documents, text files, HTML, and
                    even CSV content. In the Free tier, documents are limited to
                    5 pages. Pro users can analyze documents of any length,
                    while Enterprise users can also integrate elli with their
                    document management systems for seamless analysis.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    How does web scraping work in the Enterprise plan?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Enterprise users can designate specific regulatory websites
                    for elli to regularly monitor. elli will automatically scan
                    these sites for updates and incorporate new regulatory
                    information into its knowledge base. This ensures you always
                    have access to the latest regulatory guidance without
                    manually tracking changes yourself.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    How accurate is elli's regulatory guidance?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    elli provides guidance based on the most current regulatory
                    information available in our database. While we strive for
                    accuracy, we recommend consulting with legal professionals
                    for critical compliance decisions.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="text-left text-foreground hover:text-primary">
                    Can I export my conversations with elli?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, Pro and Enterprise users can export their conversation
                    history in various formats including PDF and CSV. Free users
                    can view their conversation history but cannot export it.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 mx-auto">
            <div className="bg-gradient-to-r from-background to-card rounded-3xl p-8 md:p-12 shadow-xl border border-border">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Ready to Navigate Climate Regulations?
                </h2>
                <p className="text-lg md:text-xl mb-8 text-muted-foreground">
                  Join sustainability professionals who are already using elli
                  to optimize their climate impact projects.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/80 w-full sm:w-auto"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:border-primary hover:text-primary w-full sm:w-auto"
                    onClick={() =>
                      (window.location.href =
                        "mailto:demo@elli-climate.com?subject=Demo Request")
                    }
                  >
                    Schedule a Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link
                to="/"
                className="font-bold text-xl flex items-center mb-4 text-foreground"
              >
                <img
                  src="/elli-icon.svg"
                  alt="elli logo"
                  className="h-8 w-auto mr-2"
                />
                elli
              </Link>
              <p className="text-muted-foreground mb-4">
                An AI regulatory assistant for climate impact projects, powered
                by the team behind Nexus.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-primary"
                >
                  <Github className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-primary"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-primary"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-foreground">
                Capabilities
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Biogas Frameworks
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Carbon Markets
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Methane Reduction
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Coming Features
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-foreground">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-foreground">
                nvend
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Nexus Platform
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-border" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 nvend, Inc. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Privacy
              </Link>
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Terms
              </Link>
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

export default function WrappedLandingPage() {
  return (
    <AuthProvider>
      <LandingPage />
    </AuthProvider>
  );
}
