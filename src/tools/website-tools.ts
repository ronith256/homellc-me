import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { RefObject } from "react";

/**
 * Function declaration for website renderer tool
 */
export const renderWebsiteDeclaration: FunctionDeclaration = {
    name: "render_website",
    description: "Opens a website in a new browser tab. Use this to help users directly access websites like GitHub, LinkedIn, or any other web resource.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            url: {
                type: SchemaType.STRING,
                description: "The URL of the website to open. Must be a valid URL with http:// or https:// protocol.",
            },
            display_text: {
                type: SchemaType.STRING,
                description: "Optional. Custom text to display for the link. Default is the URL.",
            },
        },
        required: ["url"],
    },
};

/**
 * Handler for website renderer tool calls
 */
export const renderWebsiteHandler = async (
    functionCall: any,
    containerRef: RefObject<HTMLDivElement | null>
): Promise<any> => {
    try {
        console.log("Processing website open request");
        const url = functionCall.args.url;
        const displayText = functionCall.args.display_text || url;

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            throw new Error("Invalid URL provided");
        }

        // Create a button that will open the URL in a new tab
        if (containerRef.current) {
            // Clear previous content
            containerRef.current.innerHTML = "";
            
            // Create a visually appealing link card
            const linkCard = document.createElement("div");
            linkCard.style.padding = "20px";
            linkCard.style.backgroundColor = "#f8f9fa";
            linkCard.style.border = "1px solid #ddd";
            linkCard.style.borderRadius = "8px";
            linkCard.style.marginBottom = "20px";
            linkCard.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
            
            // Get favicon
            const favicon = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
            
            // Format the hostname
            const hostname = new URL(url).hostname;
            
            linkCard.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <img src="${favicon}" style="width: 24px; height: 24px; margin-right: 10px;" />
                    <span style="font-weight: bold; font-size: 18px;">${hostname}</span>
                </div>
                <p style="margin-bottom: 15px;">${displayText}</p>
                <a href="${url}" target="_blank" style="display: inline-block; padding: 10px 15px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Open Website
                </a>
                <p style="margin-top: 10px; color: #666; font-size: 12px;">This link will open in a new tab</p>
            `;
            
            // Add click handler to automatically open the link
            const openLink = () => {
                window.open(url, '_blank');
            };
            
            // Automatically open the link in a new tab
            openLink();
            
            containerRef.current.appendChild(linkCard);
            console.log("Link card created and URL opened in new tab");
        } else {
            console.warn("No container reference available for rendering link card");
            // Still open the URL even if we can't render the card
            window.open(url, '_blank');
        }

        return {
            success: true,
            message: "Website opened in new tab and link card displayed",
            url: url
        };
    } catch (error) {
        console.error("Error handling website open request:", error);
        return {
            success: false,
            error: "Failed to open website",
            details: String(error)
        };
    }
}; 