/**
 * Logger component for displaying logs
 */

import { Part } from "@google/generative-ai";
import cn from "classnames";
import { JSX, ReactNode } from "react";
import { useLoggerStore } from "../../lib/store-logger";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 as dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
    ClientContentMessage,
    isClientContentMessage,
    isInterrupted,
    isModelTurn,
    isServerContentMessage,
    isToolCallCancellationMessage,
    isToolCallMessage,
    isToolResponseMessage,
    isTurnComplete,
    ModelTurn,
    ServerContentMessage,
    StreamingLog,
    ToolCallCancellationMessage,
    ToolCallMessage,
    ToolResponseMessage,
} from "../../multimodal-live-types";

const formatTime = (d: Date) => d.toLocaleTimeString().slice(0, -3);

const LogEntry = ({
    log,
    MessageComponent,
}: {
    log: StreamingLog;
    MessageComponent: ({
        message,
    }: {
        message: StreamingLog["message"];
    }) => ReactNode;
}): JSX.Element => (
    <li
        className={cn(
            `flex px-0 py-2 text-neutral-50 font-mono text-sm`,
            {
                "text-blue-500": log.type.includes("server") || log.type.includes("receive"),
                "text-green-500": log.type.includes("client") || (log.type.includes("send") && !log.type.includes("server")),
            },
        )}
    >
        <span className="w-[70px] flex-shrink-0 text-neutral-50">{formatTime(log.date)}</span>
        <span className="flex-shrink-0 font-bold">{log.type}</span>
        <span className="flex-grow text-neutral-50 px-1">
            <MessageComponent message={log.message} />
        </span>
        {log.count && <span className="bg-neutral-5 text-xs py-1 px-2 rounded-lg text-blue-500">{log.count}</span>}
    </li>
);

const PlainTextMessage = ({
    message,
}: {
    message: StreamingLog["message"];
}) => <span>{message as string}</span>;

type Message = { message: StreamingLog["message"] };

const AnyMessage = ({ message }: Message) => (
    <pre>{JSON.stringify(message, null, "  ")}</pre>
);

function tryParseCodeExecutionResult(output: string) {
    try {
        const json = JSON.parse(output);
        return JSON.stringify(json, null, "  ");
    } catch (e) {
        return output;
    }
}

const RenderPart = ({ part }: { part: Part }) =>
    part.text && part.text.length ? (
        <p className="part part-text">{part.text}</p>
    ) : part.executableCode ? (
        <div className="part part-executableCode">
            <h5 className="m-0 pb-2 border-b border-neutral-20">executableCode: {part.executableCode.language}</h5>
            <SyntaxHighlighter
                language={part.executableCode.language.toLowerCase()}
                style={dark}
            >
                {part.executableCode.code}
            </SyntaxHighlighter>
        </div>
    ) : part.codeExecutionResult ? (
        <div className="part part-codeExecutionResult">
            <h5 className="m-0 pb-2 border-b border-neutral-20">codeExecutionResult: {part.codeExecutionResult.outcome}</h5>
            <SyntaxHighlighter language="json" style={dark}>
                {tryParseCodeExecutionResult(part.codeExecutionResult.output)}
            </SyntaxHighlighter>
        </div>
    ) : (
        <div className="part part-inlinedata">
            <h5 className="m-0 pb-2 border-b border-neutral-20">Inline Data: {part.inlineData?.mimeType}</h5>
        </div>
    );

const ClientContentLog = ({ message }: Message) => {
    const { turns, turnComplete } = (message as ClientContentMessage)
        .clientContent;
    return (
        <div className="block">
            <h4 className="text-green-500 text-sm uppercase py-2 m-0">User</h4>
            {turns.map((turn, i) => (
                <div key={`message-turn-${i}`}>
                    {turn.parts
                        .filter((part) => !(part.text && part.text === "\n"))
                        .map((part, j) => (
                            <RenderPart part={part} key={`message-turh-${i}-part-${j}`} />
                        ))}
                </div>
            ))}
            {!turnComplete ? <span>turnComplete: false</span> : ""}
        </div>
    );
};

const ToolCallLog = ({ message }: Message) => {
    const { toolCall } = message as ToolCallMessage;
    return (
        <div className="block">
            {toolCall.functionCalls.map((fc, _) => (
                <div key={fc.id} className="bg-neutral-5 p-3.5 mb-1 text-neutral-90 rounded-lg">
                    <h5 className="m-0 pb-2 border-b border-neutral-20">Function call: {fc.name}</h5>
                    <SyntaxHighlighter language="json" style={dark}>
                        {JSON.stringify(fc, null, "  ")}
                    </SyntaxHighlighter>
                </div>
            ))}
        </div>
    );
};

const ToolCallCancellationLog = ({ message }: Message): JSX.Element => (
    <div>
        <span>
            {" "}
            ids:{" "}
            {(message as ToolCallCancellationMessage).toolCallCancellation.ids.map(
                (id) => (
                    <span className="italic" key={`cancel-${id}`}>
                        "{id}"{id !== (message as ToolCallCancellationMessage).toolCallCancellation.ids.slice(-1)[0] && ", "}
                    </span>
                ),
            )}
        </span>
    </div>
);

const ToolResponseLog = ({ message }: Message): JSX.Element => (
    <div>
        {(message as ToolResponseMessage).toolResponse.functionResponses.map(
            (fc) => (
                <div key={`tool-response-${fc.id}`} className="bg-neutral-5 p-3.5 mb-1 text-neutral-90 rounded-lg">
                    <h5 className="m-0 pb-2 border-b border-neutral-20">Function Response: {fc.id}</h5>
                    <SyntaxHighlighter language="json" style={dark}>
                        {JSON.stringify(fc.response, null, "  ")}
                    </SyntaxHighlighter>
                </div>
            ),
        )}
    </div>
);

const ModelTurnLog = ({ message }: Message): JSX.Element => {
    const serverContent = (message as ServerContentMessage).serverContent;
    const { modelTurn } = serverContent as ModelTurn;
    const { parts } = modelTurn;

    return (
        <div className="block">
            <h4 className="text-blue-500 text-sm uppercase py-2 m-0">Model</h4>
            {parts
                .filter((part) => !(part.text && part.text === "\n"))
                .map((part, j) => (
                    <RenderPart part={part} key={`model-turn-part-${j}`} />
                ))}
        </div>
    );
};

const CustomPlainTextLog = (msg: string) => () => (
    <PlainTextMessage message={msg} />
);

export type LoggerFilterType = "conversations" | "tools" | "none";

export type LoggerProps = {
    filter: LoggerFilterType;
};

const filters: Record<LoggerFilterType, (log: StreamingLog) => boolean> = {
    tools: (log: StreamingLog) =>
        isToolCallMessage(log.message) ||
        isToolResponseMessage(log.message) ||
        isToolCallCancellationMessage(log.message),
    conversations: (log: StreamingLog) =>
        isClientContentMessage(log.message) || isServerContentMessage(log.message),
    none: () => true,
};

const component = (log: StreamingLog) => {
    if (typeof log.message === "string") {
        return PlainTextMessage;
    }
    if (isClientContentMessage(log.message)) {
        return ClientContentLog;
    }
    if (isToolCallMessage(log.message)) {
        return ToolCallLog;
    }
    if (isToolCallCancellationMessage(log.message)) {
        return ToolCallCancellationLog;
    }
    if (isToolResponseMessage(log.message)) {
        return ToolResponseLog;
    }
    if (isServerContentMessage(log.message)) {
        const { serverContent } = log.message;
        if (isInterrupted(serverContent)) {
            return CustomPlainTextLog("interrupted");
        }
        if (isTurnComplete(serverContent)) {
            return CustomPlainTextLog("turnComplete");
        }
        if (isModelTurn(serverContent)) {
            return ModelTurnLog;
        }
    }
    return AnyMessage;
};

export default function Logger({ filter = "none" }: LoggerProps) {
    const { logs } = useLoggerStore();

    const filterFn = filters[filter];

    return (
        <div className="text-neutral-50 w-full max-w-full">
            <ul className="p-0 overflow-x-hidden w-full">
                {logs.filter(filterFn).map((log, key) => {
                    return (
                        <LogEntry MessageComponent={component(log)} log={log} key={key} />
                    );
                })}
            </ul>
        </div>
    );
}