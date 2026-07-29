"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please enter both username and password");
      return;
    }
    setLoading(true);
    const result = await login(form.username, form.password);
    if (result.success) {
      router.push("/profile");
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f3f1fd] via-[#ece9fb] to-[#f3f1fd]">
      <div className="pointer-events-none absolute left-[8%] top-[15%] h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(109,92,216,0.18)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[10%] right-[8%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.15)_0%,transparent_70%)] blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="relative z-[1] mx-4 w-full max-w-[420px] rounded-[20px] border border-[rgba(30,27,46,0.08)] bg-white/90 p-8 shadow-card-lg backdrop-blur-2xl sm:p-10"
      >
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-teal text-[32px] shadow-[0_8px_32px_rgba(109,92,216,0.4)]">
            🔐
          </div>
          <h1 className="mb-1 text-xl font-bold text-text">Welcome Back</h1>
          <p className="text-sm text-text-secondary">Sign in to manage your portfolio</p>
        </div>

        {error && (
          <div className="mb-4 rounded-[10px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.12)] px-4 py-2.5 text-sm text-[#dc2626]">
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
            <i className="fa fa-user" aria-hidden="true" />
          </span>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-[10px] border border-[rgba(30,27,46,0.1)] bg-[rgba(30,27,46,0.05)] py-3 pl-10 pr-3.5 text-sm text-text transition-colors duration-200 focus:border-2 focus:border-accent focus:outline-none"
          />
        </div>

        <div className="relative mb-6">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
            <i className="fa fa-lock" aria-hidden="true" />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-[10px] border border-[rgba(30,27,46,0.1)] bg-[rgba(30,27,46,0.05)] py-3 pl-10 pr-10 text-sm text-text transition-colors duration-200 focus:border-2 focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mb-6 w-full rounded-[10px] py-3.5 text-[15px] font-bold text-white duration-300 ease-smooth ${
            loading
              ? "cursor-not-allowed bg-accent/50"
              : "bg-gradient-to-br from-accent to-accent-hover hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(109,92,216,0.4)]"
          }`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <hr className="mb-5 border-[rgba(30,27,46,0.08)]" />

        <div className="text-center text-xs text-[#94a3b8]">
          Default credentials: <span className="font-semibold text-accent">Admin</span> /{" "}
          <span className="font-semibold text-accent">Admin@123</span>
        </div>
      </form>
    </div>
  );
};

export default Login;
