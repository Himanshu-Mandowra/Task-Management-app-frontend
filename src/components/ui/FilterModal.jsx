import { useEffect, useState } from "react";
import Modal from "./Modal";

// Popup with choice groups (chips / radio rows). `extra` renders additional sections.
// Changes apply when the user presses Apply.
function FilterModal({ open, onClose, groups, values, onApply, onReset, extra }) {
  const [draft, setDraft] = useState(values);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setDraft(values);
  }, [open, values]);

  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filters"
      subtitle="Narrow down and order the list"
      footer={
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply filters
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.key}>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{group.title}</h4>
            {group.type === "radio" ? (
              <div className="space-y-2">
                {group.options.map((option) => {
                  const active = draft[group.key] === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => set(group.key, option.value)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                        active ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                        {option.hint && <span className="block text-xs text-slate-500">{option.hint}</span>}
                      </span>
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          active ? "border-blue-600 bg-blue-600 ring-2 ring-white ring-inset" : "border-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const active = draft[group.key] === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => set(group.key, option.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ))}
        {extra?.(draft, set)}
      </div>
    </Modal>
  );
}

export default FilterModal;
