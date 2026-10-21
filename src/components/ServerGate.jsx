import { useEffect, useState } from "react";
import axios from "axios";
import { CheckSquare } from "lucide-react";

const HEALTH_URL = `${new URL(import.meta.env.VITE_BASE_URL).origin}/health`;
const RETRY_MS = 2500;
const SLIDE_MS = 700;

// Pings the backend before anything else renders. A themed loading screen stays
// until the server answers, then slides up to reveal the app.
function ServerGate({ children }) {
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;
    const check = async () => {
      try {
        await axios.get(HEALTH_URL, { timeout: 5000 });
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) timer = setTimeout(check, RETRY_MS);
      }
    };
    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const timer = setTimeout(() => setGone(true), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <>
      {ready && children}
      {!gone && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-slate-50"
          style={{
            transform: ready ? "translateY(-100%)" : "translateY(0)",
            transition: `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <CheckSquare size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">TaskMaster</span>
          </div>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/3 animate-[loadbar_1.4s_ease-in-out_infinite] rounded-full bg-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">Starting the server, this may take a moment...</p>
        </div>
      )}
    </>
  );
}

export default ServerGate;
