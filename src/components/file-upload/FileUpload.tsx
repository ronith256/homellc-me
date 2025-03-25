import { useCallback } from "react";
import { useKnowledgeBase } from "../../contexts/KnowledgeBaseContext";

export const FileUpload = () => {
  const { uploadDocument, isUploading } = useKnowledgeBase();

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        await uploadDocument(file);
        alert("Document uploaded successfully!");
      } catch (error) {
        console.error("Error uploading document:", error);
        alert("Failed to upload document. Please try again.");
      }
    },
    [uploadDocument]
  );

  return (
    <div className="flex items-center justify-center p-4">
      <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
        {isUploading ? "Uploading..." : "Upload Document"}
        <input
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}; 