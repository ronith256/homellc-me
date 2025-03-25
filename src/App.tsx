import { useRef, useState } from "react";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { KnowledgeBaseProvider } from "./contexts/KnowledgeBaseContext";
import SidePanel from "./components/side-panel/SidePanel";
import ControlTray from "./components/control-tray/ControlTray";
import { ToolsManager } from "./tools/ToolsManager";
import cn from "classnames";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set VITE_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <KnowledgeBaseProvider>
          <div className="flex bg-neutral-5 text-neutral-50 h-screen w-screen">
            <SidePanel />
            <main className="relative flex flex-col items-center justify-center flex-grow max-w-full overflow-hidden">
              <div className="flex items-center justify-center flex-1">
                <ToolsManager />
                <video
                  className={cn("flex-grow max-w-[90%] rounded-3xl max-h-fit", {
                    "hidden": !videoRef.current || !videoStream,
                  })}
                  ref={videoRef}
                  autoPlay
                  playsInline
                />
              </div>

              <ControlTray
                videoRef={videoRef as React.RefObject<HTMLVideoElement>}
                supportsVideo={true}
                onVideoStreamChange={setVideoStream}
              >
              </ControlTray>
            </main>
          </div>
        </KnowledgeBaseProvider>
      </LiveAPIProvider>
    </div>
  );
}

export default App;