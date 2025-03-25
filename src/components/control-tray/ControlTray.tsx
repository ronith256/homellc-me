/**
 * Control Tray component for media controls
 */

import cn from "classnames";
import { memo, ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { UseMediaStreamResult } from "../../hooks/use-media-stream-mux";
import { useScreenCapture } from "../../hooks/use-screen-capture";
import { useWebcam } from "../../hooks/use-webcam";
import { AudioRecorder } from "../../lib/audio-recorder";
import AudioPulse from "../audio-pulse/AudioPulse";

export type ControlTrayProps = {
    videoRef: RefObject<HTMLVideoElement>;
    children?: ReactNode;
    supportsVideo: boolean;
    onVideoStreamChange?: (stream: MediaStream | null) => void;
};

type MediaStreamButtonProps = {
    isStreaming: boolean;
    onIcon: string;
    offIcon: string;
    start: () => Promise<any>;
    stop: () => any;
};

/**
 * button used for triggering webcam or screen-capture
 */
const MediaStreamButton = memo(
    ({ isStreaming, onIcon, offIcon, start, stop }: MediaStreamButtonProps) =>
        isStreaming ? (
            <button
                className="flex items-center justify-center bg-neutral-20 text-neutral-60 text-xl cursor-pointer transition-all duration-200 ease-in-out w-12 h-12 rounded-lg border border-transparent hover:bg-transparent hover:border-neutral-20"
                onClick={stop}
            >
                <span className="material-symbols-outlined">{onIcon}</span>
            </button>
        ) : (
            <button
                className="flex items-center justify-center bg-neutral-20 text-neutral-60 text-xl cursor-pointer transition-all duration-200 ease-in-out w-12 h-12 rounded-lg border border-transparent hover:bg-transparent hover:border-neutral-20"
                onClick={start}
            >
                <span className="material-symbols-outlined">{offIcon}</span>
            </button>
        ),
);

function ControlTray({
    videoRef,
    children,
    onVideoStreamChange = () => { },
    supportsVideo,
}: ControlTrayProps) {
    const videoStreams = [useWebcam(), useScreenCapture()];
    const [activeVideoStream, setActiveVideoStream] =
        useState<MediaStream | null>(null);
    const [webcam, screenCapture] = videoStreams;
    const [inVolume, setInVolume] = useState(0);
    const [audioRecorder] = useState(() => new AudioRecorder());
    const [muted, setMuted] = useState(false);
    const renderCanvasRef = useRef<HTMLCanvasElement>(null);
    const connectButtonRef = useRef<HTMLButtonElement>(null);

    const { client, connected, connect, disconnect, volume } =
        useLiveAPIContext();

    useEffect(() => {
        if (!connected && connectButtonRef.current) {
            connectButtonRef.current.focus();
        }
    }, [connected]);

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--volume",
            `${Math.max(5, Math.min(inVolume * 200, 8))}px`,
        );
    }, [inVolume]);

    useEffect(() => {
        const onData = (base64: string) => {
            client.sendRealtimeInput([
                {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64,
                },
            ]);
        };
        if (connected && !muted && audioRecorder) {
            audioRecorder.on("data", onData).on("volume", setInVolume).start();
        } else {
            audioRecorder.stop();
        }
        return () => {
            audioRecorder.off("data", onData).off("volume", setInVolume);
        };
    }, [connected, client, muted, audioRecorder]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = activeVideoStream;
        }

        let timeoutId = -1;

        function sendVideoFrame() {
            const video = videoRef.current;
            const canvas = renderCanvasRef.current;

            if (!video || !canvas) {
                return;
            }

            const ctx = canvas.getContext("2d")!;
            canvas.width = video.videoWidth * 0.25;
            canvas.height = video.videoHeight * 0.25;
            if (canvas.width + canvas.height > 0) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const base64 = canvas.toDataURL("image/jpeg", 1.0);
                const data = base64.slice(base64.indexOf(",") + 1, Infinity);
                client.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
            }
            if (connected) {
                timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5);
            }
        }
        if (connected && activeVideoStream !== null) {
            requestAnimationFrame(sendVideoFrame);
        }
        return () => {
            clearTimeout(timeoutId);
        };
    }, [connected, activeVideoStream, client, videoRef]);

    //handler for swapping from one video-stream to the next
    const changeStreams = (next?: UseMediaStreamResult) => async () => {
        if (next) {
            const mediaStream = await next.start();
            setActiveVideoStream(mediaStream);
            onVideoStreamChange(mediaStream);
        } else {
            setActiveVideoStream(null);
            onVideoStreamChange(null);
        }

        videoStreams.filter((msr) => msr !== next).forEach((msr) => msr.stop());
    };

    return (
        <section className="absolute bottom-0 left-1/2 transform -translate-x-1/2 inline-flex justify-center items-start gap-2 pb-4">
            <canvas className="hidden" ref={renderCanvasRef} />
            <nav className={cn("bg-neutral-5 border border-neutral-30 rounded-3xl inline-flex gap-3 items-center p-2.5", {
                "pointer-events-none": !connected
            })}>
                <button
                    className={cn("flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 ease-in-out bg-red-500 text-black z-10 hover:bg-red-400 focus:border-2 focus:border-neutral-20 focus:outline-2 focus:outline-red-500 relative", {
                        "bg-transparent border border-neutral-30 text-neutral-30": !connected
                    })}
                    onClick={() => setMuted(!muted)}
                >
                    {!muted ? (
                        <span className="material-symbols-outlined filled">mic</span>
                    ) : (
                        <span className="material-symbols-outlined filled">mic_off</span>
                    )}
                    <div
                        className="absolute -top-[--volume] -left-[--volume] block opacity-35 bg-red-500 rounded-2xl z-[-1]"
                        style={{
                            width: "calc(100% + var(--volume) * 2)",
                            height: "calc(100% + var(--volume) * 2)",
                            transition: "all 0.02s ease-in-out"
                        }}
                    ></div>
                </button>

                <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-neutral-20 bg-neutral-2 pointer-events-none">
                    <AudioPulse volume={volume} active={connected} hover={false} />
                </div>
                {children}
            </nav>

            <div className={cn("flex flex-col justify-center items-center gap-1", { "text-blue-500": connected })}>
                <div className="rounded-3xl border border-neutral-30 bg-neutral-5 p-2.5">
                    <button
                        ref={connectButtonRef}
                        className={cn("flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 ease-in-out focus:border-2 focus:border-neutral-20 focus:outline-2 focus:outline-neutral-80", {
                            "bg-blue-800 text-blue-500 hover:border hover:border-blue-500": connected,
                            "bg-blue-500 text-neutral-5": !connected
                        })}
                        onClick={connected ? disconnect : connect}
                    >
                        <span className="material-symbols-outlined filled">
                            {connected ? "pause" : "play_arrow"}
                        </span>
                    </button>
                </div>
                <span className={cn("text-xs transition-opacity duration-300", { "opacity-0": !connected })}>Streaming</span>
            </div>
        </section>
    );
}

export default memo(ControlTray);