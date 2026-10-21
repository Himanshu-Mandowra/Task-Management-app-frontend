import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClipboardPlus, RotateCw, UserRound, X } from "lucide-react";
import { CardFaces } from "./UserCard3D";

const CARD_W = 400;
const CARD_H = 250;
const MS = 600;

// Centres the clicked card, scales it up slightly and lets the user turn it around.
function UserSpotlight({ user, stats, originRect, onClose, onProfile, onAssign }) {
  const [phase, setPhase] = useState("from");
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const closeTimer = useRef();

  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("in")));
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const close = () => {
    setRot({ x: 0, y: 0 });
    setPhase("from");
    closeTimer.current = setTimeout(onClose, MS - 100);
  };

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Start / end position: where the card sits in the grid, measured against the final centred spot
  const holder = useRef(null);
  const [fromTransform, setFromTransform] = useState("translate(0px, 24px) scale(0.85)");

  useLayoutEffect(() => {
    if (!originRect || !holder.current) return;
    const cx = holder.current.offsetLeft + CARD_W / 2;
    const cy = holder.current.offsetTop + CARD_H / 2;
    const dx = originRect.left + originRect.width / 2 - cx;
    const dy = originRect.top + originRect.height / 2 - cy;
    setFromTransform(`translate(${dx}px, ${dy}px) scale(${originRect.width / CARD_W})`);
  }, [originRect]);

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, rot };
    setDragging(true);
  };

  const onPointerMove = (event) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    setRot({
      y: drag.current.rot.y + dx * 0.6,
      x: Math.max(-20, Math.min(20, drag.current.rot.x - dy * 0.3)),
    });
  };

  // Settle on the nearest face when released
  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
    setRot((r) => ({ x: 0, y: Math.round(r.y / 180) * 180 }));
  };

  const flip = () => setRot((r) => ({ x: 0, y: (Math.round(r.y / 180) + 1) * 180 }));

  const visible = phase === "in";

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/50 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <button
        onClick={close}
        className="absolute right-6 top-6 rounded-xl bg-white p-2.5 text-slate-500 hover:text-slate-900"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div
        ref={holder}
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: visible ? "translate(0px, 0px) scale(1.1)" : fromTransform,
          transition: `transform ${MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          perspective: 1200,
        }}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`h-full w-full touch-none select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{
            transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
            transition: dragging ? "none" : "transform 700ms cubic-bezier(0.4, 0, 0.2, 1)",
            transformStyle: "preserve-3d",
          }}
        >
          <CardFaces user={user} stats={stats} />
        </div>
      </div>

      <div
        className={`mt-14 flex gap-3 transition-all duration-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        style={{ transitionDelay: visible ? "300ms" : "0ms" }}
      >
        <button
          onClick={flip}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <RotateCw size={16} /> Flip
        </button>
        <button
          onClick={onAssign}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <ClipboardPlus size={16} /> Assign task
        </button>
        <button
          onClick={onProfile}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <UserRound size={16} /> View profile
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default UserSpotlight;
