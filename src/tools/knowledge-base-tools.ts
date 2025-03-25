import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";

/**
 * Function declaration for knowledge base query tool
 */
const BASE_URL = import.meta.env.VITE_API_URL;
export const knowledgeBaseDeclaration: FunctionDeclaration = {
    name: "query_knowledge_base",
    description: "Query the knowledge base to find relevant information from user's uploaded documents.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            query: {
                type: SchemaType.STRING,
                description: "The search query to find information in the knowledge base",
            },
            n_results: {
                type: SchemaType.NUMBER,
                description: "Optional. The number of results to return. Default is 3.",
            },
        },
        required: ["query"],
    },
};

/**
 * Handler for knowledge base query tool calls
 * This calls the backend API to query the knowledge base
 */
export const knowledgeBaseHandler = async (functionCall: any): Promise<any> => {
    try {
        console.log("Processing knowledge base query:", functionCall.args);

        const query = functionCall.args.query;
        const n_results = functionCall.args.n_results || 3;

        // Query the knowledge base API
        const response = await fetch(`${BASE_URL}/query`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, n_results }),
        });

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        console.log("Knowledge base results:", data.results);

        // Format the results for the model
        const formattedResults = data.results.map((r: any) => ({
            text: r.text,
            source: r.metadata.source,
            score: r.score,
        }));

        return {
            results: formattedResults,
            query: query,
            count: formattedResults.length
        };
    } catch (error) {
        console.error("Error querying knowledge base:", error);
        return {
            error: "Failed to query knowledge base",
            details: String(error)
        };
    }
};