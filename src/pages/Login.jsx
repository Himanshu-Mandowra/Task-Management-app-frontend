import { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CheckSquare, ClipboardList, ShieldCheck, Users } from "lucide-react";
import { loginSuccess } from "../features/auth/authSlice";
import { loginUser } from "../features/auth/authApi";
import { errorMessage } from "../features/http";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data) => {
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(data);
      localStorage.setItem("token", res.token);
      localStorage.setItem("data", JSON.stringify(res.data));
      dispatch(loginSuccess({ user: res.data, token: res.token }));
      navigate("/");
    } catch (err) {
      setError(errorMessage(err, "Login failed. Please check your details."));
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    { icon: ClipboardList, text: "Create and assign tasks in a few clicks" },
    { icon: Users, text: "See which teammates are overloaded or overdue" },
    { icon: ShieldCheck, text: "Admins manage their own users securely" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2 xl:px-12">
        <div className="anim-rise w-full max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <CheckSquare size={22} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-slate-900">TaskMaster</span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to manage your tasks and team.</p>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
              <input type="email" required {...register("email")} placeholder="you@company.com" className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
              <input type="password" required {...register("password")} placeholder="Your password" className={inputClass} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden items-center justify-center bg-blue-600 p-12 text-white lg:flex lg:w-1/2">
        <div className="max-w-md space-y-8">
          <h2 className="text-4xl font-bold leading-tight">Everything your team needs to stay on track.</h2>
          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4 text-blue-50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700">
                  <Icon size={20} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
