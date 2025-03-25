/**
 * Side Panel component for logging and debug
 */

import cn from "classnames";
import { useEffect, useRef, useState } from "react";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import Select from "react-select";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { useLoggerStore } from "../../lib/store-logger";
import Logger, { LoggerFilterType } from "../logger/Logger";
// import { FileUpload } from "../file-upload/FileUpload";

const filterOptions = [
  { value: "conversations", label: "Conversations" },
  { value: "tools", label: "Tool Use" },
  { value: "none", label: "All" },
];

export default function SidePanel() {
  const { connected, client } = useLiveAPIContext();
  const [open, setOpen] = useState(true);
  const loggerRef = useRef<HTMLDivElement>(null);
  const loggerLastHeightRef = useRef<number>(-1);
  const { log, logs } = useLoggerStore();

  // const [textInput, setTextInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
  // const inputRef = useRef<HTMLTextAreaElement>(null);

  //scroll the log to the bottom when new logs come in
  useEffect(() => {
    if (loggerRef.current) {
      const el = loggerRef.current;
      const scrollHeight = el.scrollHeight;
      if (scrollHeight !== loggerLastHeightRef.current) {
        el.scrollTop = scrollHeight;
        loggerLastHeightRef.current = scrollHeight;
      }
    }
  }, [logs]);

  // listen for log events and store them
  useEffect(() => {
    client.on("log", log);
    return () => {
      client.off("log", log);
    };
  }, [client, log]);

  // const handleSubmit = () => {
  //   client.send([{ text: textInput }]);

  //   setTextInput("");
  //   if (inputRef.current) {
  //     inputRef.current.innerText = "";
  //   }
  // };

  return (
    <div className={cn("bg-neutral-00 flex flex-col h-screen transition-all duration-200 ease-in text-neutral-90 font-space-mono text-sm font-normal leading-[160%]", {
      "w-[400px]": open,
      "w-10": !open,
    })}>
      <header className={cn("flex justify-between items-center px-6 py-3 border-b border-neutral-20", {
        "w-[calc(100%-45px)]": open,
        "w-full": !open
      })}>
        <h2 className={cn("relative text-neutral-90 font-sans text-xl font-medium leading-4 transition-all duration-200 ease-in", {
          "opacity-100 block left-0": open,
          "opacity-0 hidden -left-full": !open
        })}>Console</h2>
        {open ? (
          <button className="transition-transform duration-200 ease-in" onClick={() => setOpen(false)}>
            <RiSidebarFoldLine className="text-neutral-80" />
          </button>
        ) : (
          <button className="transition-transform duration-200 ease-in transform translate-x-[-50%]" onClick={() => setOpen(true)}>
            <RiSidebarUnfoldLine className="text-neutral-80" />
          </button>
        )}
      </header>
      <section className="flex px-6 py-6 justify-end gap-5">
        <Select
          className={cn("transition-all duration-200 ease-in", {
            "opacity-0 hidden": !open
          })}
          classNamePrefix="react-select"
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              backgroundColor: "var(--neutral-20)",
              color: "var(--neutral-90)",
              width: "193px",
              height: "30px",
              minHeight: "30px",
              maxHeight: "30px",
              border: 0,
            }),
            singleValue: (baseStyles) => ({
              ...baseStyles,
              color: "var(--neutral-90)",
            }),
            menu: (baseStyles) => ({
              ...baseStyles,
              backgroundColor: "var(--neutral-20)",
              color: "var(--neutral-90)",
            }),
            option: (styles, { isFocused, isSelected }) => ({
              ...styles,
              backgroundColor: isFocused
                ? "var(--neutral-30)"
                : isSelected
                  ? "var(--neutral-20)"
                  : undefined,
            }),
          }}
          defaultValue={selectedOption}
          options={filterOptions}
          onChange={(e) => {
            setSelectedOption(e);
          }}
        />
        <div className={cn("flex items-center justify-center select-none rounded border border-neutral-20 bg-neutral-10", {
          "w-[136px] h-[30px] gap-1.5": open,
          "w-[30px] opacity-0": !open,
          "text-green-500": connected
        })}>
          {connected
            ? `🔵${open ? " Streaming" : ""}`
            : `⏸️${open ? " Paused" : ""}`}
        </div>
      </section>
      <div 
        ref={loggerRef} 
        className={cn("self-end overflow-y-auto overflow-x-scroll scrollbar-hide", {
          "w-[400px] flex-grow": open,
          "opacity-0 hidden": !open
        })}
      >
        <Logger
          filter={(selectedOption?.value as LoggerFilterType) || "none"}
        />
      </div>
      {/* <div className={cn("h-[50px] flex-shrink-0 border-t border-neutral-20 px-6 py-3.5 overflow-hidden", {
        "opacity-0 hidden": !open,
        "pointer-events-none": !connected
      })}>
        <div className="relative bg-neutral-10 border border-neutral-15 h-[22px] rounded-[10px] px-[18px] py-[11px]">
          <textarea
            className="absolute top-0 left-0 z-[2] inline-block w-[calc(100%-72px)] max-h-[20px] outline-none flex-1 break-words overflow-auto px-[18px] py-[14px] border-0 resize-none bg-transparent text-neutral-90"
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }
            }}
            onChange={(e) => setTextInput(e.target.value)}
            value={textInput}
          ></textarea>
          <span
            className={cn("absolute left-0 top-0 flex items-center z-[1] h-full w-full pointer-events-none select-none px-[18px] whitespace-pre-wrap", {
              "hidden": textInput.length,
            })}
          >
            Type&nbsp;something...
          </span>

          <button
            className="absolute top-1/2 right-0 transform translate-y-[-50%] bg-transparent border-0 text-neutral-20 cursor-pointer transition-colors hover:text-neutral-60 z-[2] material-symbols-outlined filled"
            onClick={handleSubmit}
          >
            send
          </button>
        </div>
      </div> */}
      {/* <FileUpload /> */}
    </div>
  );
}