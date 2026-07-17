"use client";

import { useAuth } from "@/src/features/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { SubmitEventHandler, useEffect, useState } from "react";

const baseInputClass =
  "w-full rounded-md border bg-slate-900/60 px-3 py-2 text-white placeholder-white/40 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-400";
const validBorder = "border-white/20 focus:border-sky-400";

export default function Login() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-lg bg-slate-800/60 p-6 shadow-lg sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-white sm:text-3xl">
          Login
        </h1>

        {error && (
          <p className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-white/80"
            >
              Enter your email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className={`${baseInputClass} ${validBorder}`}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-white/80"
            >
              Enter password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              minLength={8}
              required
              onChange={(e) => setPassword(e.target.value)}
              className={`${baseInputClass} ${validBorder}`}
            />
          </div>

          <input
            type="submit"
            value="Login"
            className="mt-2 w-full cursor-pointer rounded-md bg-sky-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-sky-400"
          />
        </form>
      </div>
    </div>
  );
}
