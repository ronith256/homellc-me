import { createContext, FC, ReactNode, useContext, useState } from "react";

interface KnowledgeBaseContextType {
  uploadDocument: (file: File, metadata?: Record<string, any>) => Promise<{ document_id: string }>;
  queryDocuments: (query: string, nResults?: number) => Promise<Array<{
    id: string;
    text: string;
    metadata: Record<string, any>;
    score?: number;
  }>>;
  isUploading: boolean;
  isQuerying: boolean;
}

const KnowledgeBaseContext = createContext<KnowledgeBaseContextType | undefined>(undefined);
const BASE_URL = import.meta.env.VITE_API_URL;
export const KnowledgeBaseProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);

  const uploadDocument = async (file: File, metadata: Record<string, any> = {}) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata_json", JSON.stringify(metadata));

      const response = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      return await response.json();
    } finally {
      setIsUploading(false);
    }
  };

  const queryDocuments = async (query: string, nResults: number = 3) => {
    setIsQuerying(true);
    try {
      const response = await fetch(`${BASE_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, n_results: nResults }),
      });

      if (!response.ok) {
        throw new Error("Failed to query documents");
      }

      const data = await response.json();
      return data.results;
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <KnowledgeBaseContext.Provider
      value={{
        uploadDocument,
        queryDocuments,
        isUploading,
        isQuerying,
      }}
    >
      {children}
    </KnowledgeBaseContext.Provider>
  );
};

export const useKnowledgeBase = () => {
  const context = useContext(KnowledgeBaseContext);
  if (!context) {
    throw new Error("useKnowledgeBase must be used within a KnowledgeBaseProvider");
  }
  return context;
}; 