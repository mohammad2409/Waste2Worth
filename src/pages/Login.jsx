
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Recycle,
  Mail,
  LockKeyhole,
  UserRound,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (mode === "signup") {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (signupError) throw signupError;

        if (data.session) {
          navigate("/explore", { replace: true });
        } else {
          setMessage(
            "Account created! Check your email for a confirmation link, then return here to log in."
          );
          setMode("login");
          setPassword("");
        }
      } else {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (loginError) throw loginError;

        navigate("/explore", { replace: true });
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
  }

  return (
    <div className="min-h-screen bg-[#f8fbf8] text-[#18352a]">
      <header className="border-b border-emerald-100 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/home" className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-700 p-2.5 text-white">
              <Recycle size={25} />
            </div>
            <div>
              <h1 className="text-xl font-black text-emerald-950">
                Waste<span className="text-emerald-600">2</span>Worth
              </h1>
              <p className="text-xs text-slate-500">
                Give items a second life
              </p>
            </div>
          </Link>

          <Link
            to="/home"
            className="text-sm font-bold text-emerald-700 hover:text-emerald-900"
          >
            Back to Home
          </Link>
        </nav>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-12 md:px-8 lg:grid-cols-2">
        {/* Welcome panel */}
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
              <Leaf size={17} />
              A community built around reuse
            </div>

            <h2 className="text-6xl font-black leading-tight tracking-tight text-emerald-950">
              Good things
              <span className="block text-emerald-600">
                deserve another
              </span>
              life.
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Join Waste2Worth to discover useful items, share what you
              no longer need, and help your community waste less.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-100 bg-white p-5">
                <span className="text-3xl">♻️</span>
                <h3 className="mt-3 font-extrabold text-emerald-950">
                  Reuse more
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Give useful items another chance.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-5">
                <span className="text-3xl">🤝</span>
                <h3 className="mt-3 font-extrabold text-emerald-950">
                  Connect locally
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Make sharing part of everyday life.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication form */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-9">
            <div className="mb-7 text-center lg:text-left">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 lg:mx-0">
                <Recycle size={30} />
              </div>

              <h2 className="text-3xl font-black tracking-tight text-emerald-950">
                {mode === "login" ? "Welcome back!" : "Create your account"}
              </h2>

              <p className="mt-3 leading-6 text-slate-500">
                {mode === "login"
                  ? "Log in to continue your Waste2Worth journey."
                  : "Join the community and start sharing resources."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                  mode === "login"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-500 hover:text-emerald-800"
                }`}
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`rounded-lg px-4 py-3 text-sm font-bold transition ${
                  mode === "signup"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-500 hover:text-emerald-800"
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                      maxLength={100}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Log In" : "Create Account"}
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm leading-6 text-slate-500">
              {mode === "login"
                ? "New to Waste2Worth?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() =>
                  switchMode(mode === "login" ? "signup" : "login")
                }
                className="font-bold text-emerald-700 hover:text-emerald-900"
              >
                {mode === "login" ? "Create an account" : "Log in"}
              </button>
            </p>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              By joining, you agree to use Waste2Worth responsibly and treat
              other community members with respect.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}