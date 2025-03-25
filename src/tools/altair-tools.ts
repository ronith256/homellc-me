import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { RefObject } from "react";
import vegaEmbed from "vega-embed";

/**
 * Function declaration for Altair visualization tool
 */
export const renderAltairDeclaration: FunctionDeclaration = {
    name: "render_altair",
    description: "Displays a visualization chart using Vega-Lite/Altair JSON specification.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            json_graph: {
                type: SchemaType.STRING,
                description: "JSON STRING representation of the Vega-Lite specification to render. Must be a string, not a JSON object.",
            },
        },
        required: ["json_graph"],
    },
};

/**
 * Handler for Altair visualization tool calls
 */
export const renderAltairHandler = async (
    functionCall: any,
    vegaEmbedRef: RefObject<HTMLDivElement | null>
): Promise<any> => {
    try {
        console.log("Processing Altair visualization request");
        const jsonString = functionCall.args.json_graph;

        // Try to parse the JSON to validate it
        const parsedSpec = JSON.parse(jsonString);

        // Render the visualization if we have a reference
        if (vegaEmbedRef.current) {
            try {
                await vegaEmbed(vegaEmbedRef.current, parsedSpec);
                console.log("Visualization rendered successfully");
            } catch (renderError) {
                console.error("Error rendering visualization:", renderError);
            }
        } else {
            console.warn("No vegaEmbed reference available for rendering");
        }

        return {
            success: true,
            message: "Visualization rendered successfully"
        };
    } catch (error) {
        console.error("Error processing Altair visualization:", error);
        return {
            success: false,
            error: "Failed to process visualization",
            details: String(error)
        };
    }
};