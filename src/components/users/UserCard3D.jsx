import { useRef, useState } from "react";
import { Mail, UserCog } from "lucide-react";
import { TONE_STYLES, initials, roleLabel, userTone } from "../../utils/taskUtils";



// Front and back of the visiting card. Fills its parent, so the parent decides the size.
export function CardFaces({ user, stats }) {
  const tone = TONE_STYLES[userTone(stats)];

  return (
    <div className="card-body">
      <div className={`card-face flex flex-col justify-between rounded-2xl border-2 p-5 shadow-md ${tone.surface}`}>
        <div className="flex items-start justify-between">
          <span className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white ${tone.avatar}`}>
            {initials(user.userName)}
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
            {roleLabel(user.userRole)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold text-slate-900">{user.userName}</p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500">
            <Mail size={14} className="shrink-0" /> <span className="truncate">{user.email}</span>
          </p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${tone.chip}`}>{tone.label}</span>
      </div>

      <div className={`card-face card-back flex flex-col justify-between rounded-2xl border-2 p-5 shadow-md ${tone.surface}`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Workload</p>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <UserCog size={14} /> {user.adminName || "—"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Overdue", stats.overdue, "text-red-600"],
            ["Pending", stats.pending, "text-yellow-700"],
            ["Completed", stats.completed, "text-green-600"],
            ["Total", stats.total, "text-slate-800"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
              <p className={`text-xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs font-semibold text-slate-400">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400">Drag to turn the card</p>
      </div>
    </div>
  );
}

// Card in the grid: leans gently towards the pointer and lifts on hover.
function UserCard3D({ user, stats, onOpen }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, hover: false });

  const onMove = (event) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 12, y: px * 16, hover: true });
  };

  return (
    <div className="card-scene">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0, hover: false })}
        onClick={() => onOpen(ref.current.getBoundingClientRect())}
        className="h-[210px] w-full cursor-pointer"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.hover ? 1.03 : 1})`,
          transition: tilt.hover ? "transform 200ms ease-out" : "transform 600ms cubic-bezier(0.4,0,0.2,1)",
          transformStyle: "preserve-3d",
        }}
      >
        <CardFaces user={user} stats={stats} />
      </div>
    </div>
  );
}

export default UserCard3D;
