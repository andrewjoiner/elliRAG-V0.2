import { supabase } from "../../supabase/supabase";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  tags: string[];
  collection: string;
  url: string;
}

export interface Collection {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

// Upload a document to storage and create a database entry
export async function uploadDocument(
  file: File,
  tags: string[] = [],
  collection: string = "All Documents",
) {
  try {
    // First, upload the file to storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user_documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL for the file
    const {
      data: { publicUrl },
    } = supabase.storage.from("user_documents").getPublicUrl(filePath);

    // Create a collection if it doesn't exist
    let collectionId;
    const { data: existingCollection } = await supabase
      .from("document_collections")
      .select("id")
      .eq("name", collection)
      .single();

    if (existingCollection) {
      collectionId = existingCollection.id;
    } else {
      const { data: newCollection, error: collectionError } = await supabase
        .from("document_collections")
        .insert({ name: collection })
        .select()
        .single();

      if (collectionError) throw collectionError;
      collectionId = newCollection.id;
    }

    // Create a document entry in the database
    const { data: document, error: documentError } = await supabase
      .from("documents")
      .insert({
        name: file.name,
        type: fileExt?.toUpperCase() || "UNKNOWN",
        size: formatFileSize(file.size),
        tags,
        collection_id: collectionId,
        url: publicUrl,
        raw_size: file.size,
      })
      .select()
      .single();

    if (documentError) throw documentError;

    return document;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

// Get all documents for the current user
export async function getDocuments() {
  try {
    const { data: documents, error } = await supabase
      .from("documents")
      .select(
        `
        id,
        name,
        type,
        size,
        tags,
        url,
        document_collections(id, name)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      tags: doc.tags || [],
      collection: doc.document_collections?.name || "All Documents",
      url: doc.url,
    }));
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
}

// Get all collections for the current user
export async function getCollections() {
  try {
    const { data: collections, error } = await supabase
      .from("document_collections")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    // Always include "All Documents" as the first collection
    return ["All Documents", ...collections.map((c) => c.name)];
  } catch (error) {
    console.error("Error fetching collections:", error);
    throw error;
  }
}

// Create a new collection
export async function createCollection(name: string) {
  try {
    const { data: collection, error } = await supabase
      .from("document_collections")
      .insert({ name })
      .select()
      .single();

    if (error) throw error;
    return collection;
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
}

// Delete a document
export async function deleteDocument(id: string) {
  try {
    // First get the document to find the file path
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Extract the file path from the URL
    const url = new URL(document.url);
    const filePath = url.pathname.split("/").pop();

    if (filePath) {
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from("user_documents")
        .remove([`documents/${filePath}`]);

      if (storageError) throw storageError;
    }

    // Delete the document entry from the database
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
