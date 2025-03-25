import { memo, useEffect, useRef } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { type FunctionDeclaration } from "@google/generative-ai";
import { LiveConfig, ToolCall } from "../multimodal-live-types";
import { knowledgeBaseDeclaration, knowledgeBaseHandler } from "./knowledge-base-tools";
import { renderAltairDeclaration, renderAltairHandler } from "./altair-tools";
import { renderWebsiteDeclaration, renderWebsiteHandler } from "./website-tools";
// import vegaEmbed from "vega-embed";

// Combine all tool declarations
const functionDeclarations: FunctionDeclaration[] = [
    knowledgeBaseDeclaration,
    renderAltairDeclaration,
    renderWebsiteDeclaration
];

interface ToolsManagerProps { }

function ToolsManagerComponent({ }: ToolsManagerProps) {
    const { client, setConfig } = useLiveAPIContext();
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial setup - register all tools with a single config
    useEffect(() => {
        const registerTools = async () => {
            const config: LiveConfig = {
                model: "models/gemini-2.0-flash-exp",
                generationConfig: {
                    responseModalities: "audio",
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
                    },
                },
                systemInstruction: {
                    parts: [
                        {
                            text: `You are a robot created by Ronith to help him talk to others when he is busy. 
                            You have to act just like him. 
                            Here are some of his details:
                            - He is a 21 year old male.
                            - He has B.Tech in AI and computer science from Amrita Vishwa Vidyapeetham, Coimbatore.
                            - He has done freelancing from the age of 14.
                            - He has managed dropshipping businesses, software businesses etc.
                            - He likes to be challenged and has a growth mindset.
                            - He is a good communicator and has a good sense of humor.
                            - He also has many internship experiences and in the last company he worked at, he was the first one to receive the Founding Engineer role.
                            - He resigned from his job due to a lot of hiring and firing in his company and he was not happy with the work culture.
                            - His PPO was 10 LPA and 1.5% equity.
                            - He has started using computers from the age of 4.
                            - He has good understanding of AI, Android Development, LLMs and has dabbled in web development.
                            - Misconception about him: Most of my co workers from the previous companies thought I didn't have a life outside of work but that is not true I play about 9 musical instruments, I draw paint play sport etc.s
                            
                            You should always talk as Ronith and in a human way. Keep your responses short and to the point and do not blabber about things that are not related.
                            Do not talk about the resignation and compensation unless specifically asked.
                            
                            You have access to the following tools to help you talk:

1. KNOWLEDGE BASE TOOL - query_knowledge_base
   - Use this when users ask about information that might be related to Ronith as you have access to his resume etc.
   - After getting results, you should always reply in 1st person as Ronith would.
   - You must prefer information from documents over your general knowledge

2. VISUALIZATION TOOL - render_altair
   - Use this whenever the user requests some information and you think a chart would help. 
   - You can create many types of charts: bar charts, line graphs, scatter plots, etc.
   - Send a valid Vega-Lite JSON specification

3. WEBSITE OPENER TOOL - render_website
   - Use this when you want to share a relevant webpage with the user
   - Especially useful for showing Ronith's profiles: GitHub (ronith256) or LinkedIn (ronith-s-539420259)
   - Provide a valid URL (starting with http:// or https://) and optional display text
   - The tool will create a link card and automatically open the URL in a new browser tab

HOW TO DECIDE WHICH TOOL TO USE:
- If the user asks about specific content that is about Ronith, use query_knowledge_base
- If the user asks for a visualization or chart, use render_altair
- If you want to share a relevant web resource or Ronith's profiles, use render_website
- You can use multiple tools in the same response if needed

DO NOT say you don't have information if the knowledge base contains relevant results. Always reference the source documents directly.`,
                        },
                    ],
                },
                tools: [
                    { googleSearch: {} },
                    { functionDeclarations: functionDeclarations },
                ],
            };

            await setConfig(config);
            console.log("All tools registered with unified config");
        };

        registerTools();
    }, [setConfig]);

    // Handle all tool calls with appropriate handlers
    useEffect(() => {
        const onToolCall = async (toolCall: ToolCall) => {
            console.log("Tool call received:", toolCall);

            // Process each function call
            const responses = await Promise.all(
                toolCall.functionCalls.map(async (fc) => {
                    let response;

                    // Route to the appropriate handler based on function name
                    switch (fc.name) {
                        case knowledgeBaseDeclaration.name:
                            response = await knowledgeBaseHandler(fc);
                            break;
                        case renderAltairDeclaration.name:
                            response = await renderAltairHandler(fc, containerRef);
                            break;
                        case renderWebsiteDeclaration.name:
                            response = await renderWebsiteHandler(fc, containerRef);
                            break;
                        default:
                            console.warn(`Unknown function call: ${fc.name}`);
                            response = { error: `Unknown function: ${fc.name}` };
                    }

                    return {
                        response: { output: response },
                        id: fc.id,
                    };
                })
            );

            // Send all responses
            client.sendToolResponse({
                functionResponses: responses,
            });
        };

        client.on("toolcall", onToolCall);
        return () => {
            client.off("toolcall", onToolCall);
        };
    }, [client]);

    // Return the visualization/website container
    return (
        <div className="tools-manager">
            <div className="visualization-container" ref={containerRef} />
        </div>
    );
}

export const ToolsManager = memo(ToolsManagerComponent);