import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Modal from "../ui/Modal";
import { useToast } from "../ui/toastContext";
import { registerUser } from "../../features/auth/authApi";
import { errorMessage } from "../../features/http";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// Admins create users; the super admin can also create another admin.
function UserFormModal({ open, onClose, onSaved }) {
  const toast = useToast();
  const role = useSelector((state) => state.auth.user?.userRole);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [userRole, setUserRole] = useState("employee");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      reset({ userName: "", email: "", password: "" });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserRole("employee");
    }
  }, [open, reset]);

  const submit = async (values) => {
    setSaving(true);
    try {
      await registerUser({ ...values, userName: values.userName.trim(), email: values.email.trim(), userRole });
      toast(`${userRole === "admin" ? "Admin" : "User"} ${values.userName.trim()} created`);
      onClose();
      await onSaved?.();
    } catch (error) {
      toast(errorMessage(error, "Could not create the account"), "error");
    } finally {
      setSaving(false);
    }
  };

  const roleChoices = [
    { value: "employee", label: "User", hint: "Receives and completes tasks" },
    ...(role === "super-admin" ? [{ value: "admin", label: "Admin", hint: "Can add users and assign tasks" }] : []),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a new account"
      subtitle="The account is created under your name"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="user-form"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {saving ? "Creating..." : "Create account"}
          </button>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
        {roleChoices.length > 1 && (
          <div>
            <label className={labelClass}>Account type</label>
            <div className="grid grid-cols-2 gap-3">
              {roleChoices.map((choice) => (
                <button
                  type="button"
                  key={choice.value}
                  onClick={() => setUserRole(choice.value)}
                  className={`rounded-xl border px-4 py-3 text-left ${
                    userRole === choice.value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-sm font-bold text-slate-900">{choice.label}</span>
                  <span className="block text-xs text-slate-500">{choice.hint}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Full name</label>
          <input className={inputClass} placeholder="Jane Doe" {...register("userName", { required: "Name is required" })} />
          {errors.userName && <p className="mt-1 text-xs text-red-600">{errors.userName.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            className={inputClass}
            placeholder="jane@company.com"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            className={inputClass}
            placeholder="At least 6 characters"
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Use at least 6 characters" } })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
      </form>
    </Modal>
  );
}

export default UserFormModal;
