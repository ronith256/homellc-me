/**
 * Audio Pulse visualization component
 */

import { useEffect, useRef } from "react";
import cn from "classnames";

const lineCount = 3;

export type AudioPulseProps = {
    active: boolean;
    volume: number;
    hover?: boolean;
};

export default function AudioPulse({ active, volume, hover = false }: AudioPulseProps) {
    const lines = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        let timeout: number | null = null;
        const update = () => {
            lines.current.forEach(
                (line, i) =>
                (line.style.height = `${Math.min(
                    24,
                    4 + volume * (i === 1 ? 400 : 60),
                )}px`),
            );
            timeout = window.setTimeout(update, 100);
        };

        update();

        return () => clearTimeout((timeout as number)!);
    }, [volume]);

    return (
        <div
            className={cn("flex w-6 justify-evenly items-center transition-all duration-500 h-1 opacity-0", {
                "opacity-100": active,
                "hover": hover
            })}
        >
            {Array(lineCount)
                .fill(null)
                .map((_, i) => (
                    <div
                        key={i}
                        ref={(el) => {
                            if (el) lines.current[i] = el
                        }}
                        className={cn("bg-neutral-30 rounded-full w-1 min-h-1", {
                            "animate-hover": hover,
                            "bg-neutral-80": active
                        })}
                        style={{
                            animationDelay: `${i * 133}ms`,
                            transitionProperty: "height",
                            transitionDuration: "100ms"
                        }}
                    />
                ))}        </div>
    );
}