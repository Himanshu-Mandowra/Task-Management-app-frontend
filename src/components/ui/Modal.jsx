import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const CLOSE_MS = 300;

// Popup with a gentle enter and exit. Content is unmounted only after the exit finishes.
function Modal({ open, onClose, title, subtitle, children, footer, width = "max-w-lg" }) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    let frame;
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      frame = requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      timer = setTimeout(() => setMounted(false), CLOSE_MS);
    }
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <div
        className={`flex max-h-[90vh] w-full ${width} flex-col rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-300 ease-in-out ${
          visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.97] opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
