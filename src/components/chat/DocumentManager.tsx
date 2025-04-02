import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, Folder, File, X, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Document,
  getDocuments,
  getCollections,
  uploadDocument,
  createCollection,
  deleteDocument,
} from "@/lib/documents";
import {
  uploadDocumentToExternalAPI,
  uploadDocumentUrlToExternalAPI,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  tags: string[];
  collection: string;
}

export default function DocumentManager() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [collections, setCollections] = useState<string[]>(["All Documents"]);
  const [activeCollection, setActiveCollection] = useState("All Documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  // Fetch documents and collections on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [docsData, collectionsData] = await Promise.all([
          getDocuments(),
          getCollections(),
        ]);

        setDocuments(docsData);
        setCollections(collectionsData);
      } catch (error) {
        console.error("Error fetching document data:", error);
        toast({
          title: "Error",
          description: "Failed to load documents. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredDocuments = documents.filter(
    (doc) =>
      (activeCollection === "All Documents" ||
        doc.collection === activeCollection) &&
      (doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )),
  );

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const tags = file.name
          .split(".")[0]
          .split(/[\s-_]+/)
          .filter(Boolean);

        // Upload to local database
        const uploadedDoc = await uploadDocument(file, tags, activeCollection);
        setDocuments((prev) => [uploadedDoc, ...prev]);

        // Also upload to external API
        try {
          const metadata = {
            title: file.name,
            tags: tags,
            collection: activeCollection,
            source: "user_upload",
          };

          await uploadDocumentToExternalAPI(file, metadata);
        } catch (apiError) {
          console.error("Error uploading to external API:", apiError);
          // Continue with local upload even if external API fails
        }
      }

      toast({
        title: "Upload Successful",
        description: `${files.length} document${files.length > 1 ? "s" : ""} uploaded successfully.`,
        variant: "default",
      });

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description:
          "There was an error uploading your document(s). Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      await createCollection(newCollectionName);
      setCollections((prev) => [...prev, newCollectionName]);
      setNewCollectionName("");

      toast({
        title: "Collection Created",
        description: `Collection "${newCollectionName}" created successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error creating collection:", error);
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));

      toast({
        title: "Document Deleted",
        description: "Document deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full bg-card/50 border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>Document Management</span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={handleFileUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileUp className="h-3 w-3" />
            )}
            Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="documents">
          <div className="px-4 pt-2">
            <TabsList className="w-full bg-background/50">
              <TabsTrigger value="documents" className="flex-1">
                Documents
              </TabsTrigger>
              <TabsTrigger value="collections" className="flex-1">
                Collections
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="documents" className="mt-0">
            <div className="p-4 pt-2">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2 bg-background/50 border-border"
              />

              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2 border border-border rounded-md bg-background/30 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <File className="h-4 w-4 mt-0.5 text-primary" />
                            <div>
                              <div className="text-sm font-medium truncate max-w-[180px]">
                                {doc.name}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{doc.type}</span>
                                <span className="mx-1">•</span>
                                <span>{doc.size}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {doc.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-[10px] px-1 py-0 h-4"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="mt-0">
            <div className="p-4 pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Input
                  placeholder="New collection..."
                  className="bg-background/50 border-border"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleCreateCollection()
                  }
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <Button
                      key={collection}
                      variant="ghost"
                      className={`w-full justify-start text-left font-normal ${collection === activeCollection ? "bg-secondary text-primary" : ""}`}
                      onClick={() => setActiveCollection(collection)}
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      {collection}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
