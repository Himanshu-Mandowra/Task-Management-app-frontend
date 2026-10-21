import { useCallback, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { ToastContext } from "./toastContext";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((toast) => toast.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="anim-rise flex max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg"
          >
            {toast.type === "error" ? (
              <AlertCircle size={20} className="shrink-0 text-red-600" />
            ) : (
              <CheckCircle2 size={20} className="shrink-0 text-green-600" />
            )}
            <span className="text-sm font-medium text-slate-700">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
