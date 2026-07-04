import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth/authSlice";
import { loginUser } from "../features/auth/authApi";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (data) => {
    try {
      console.log(data);
      const res = await loginUser(data);

      dispatch(
        loginSuccess({
          user: res.data,
          token: res.token,
        }),
      );
      console.log(res.data);
      localStorage.setItem("token", res.token);
      localStorage.setItem("data", JSON.stringify(res.data)); // Best practice: stringify objects before saving
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* LEFT SECTION: Login Form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2 xl:px-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your details to sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
            <div>
              <label className="block text-sm text-left font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                {...register("email")}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-left text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                {...register("password")}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-medium text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 shadow-md shadow-blue-500/20"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SECTION: Info & Title Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-800 p-12 items-center justify-center text-white overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
        
        <div className="max-w-md space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase">
            🚀 New Version 2.0
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Manage your entire workspace in one place.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Join thousands of professionals who streamline their daily workflow, track real-time metrics, and scale production seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;