"use client";

import { useAuth } from "@/src/features/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { SubmitEventHandler, useEffect, useState } from "react";

const baseInputClass =
  "w-full rounded-md border bg-slate-900/60 px-3 py-2 text-white placeholder-white/40 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-400";
const validBorder = "border-white/20 focus:border-sky-400";
const errorBorder = "border-red-500 focus:border-red-500";

export default function Register() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { register, status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const emailMismatch = confirmEmail.length > 0 && email !== confirmEmail;
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;
  const emailTaken = error === "Email is already in use";
  const usernameTaken = error === "Username is already in use";

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);

    if (username.length < 3 || username.length > 40) {
      setError("Username must be between 3 and 40 characters");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (emailMismatch) {
      setError("Email addresses do not match");
      return;
    }

    if (passwordMismatch) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register({
        email,
        username,
        password,
      });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md rounded-lg bg-slate-800/60 p-6 shadow-lg sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-white sm:text-3xl">
          Register
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
              className={`${baseInputClass} ${emailTaken ? errorBorder : validBorder}`}
            />
          </div>

          <div>
            <label
              htmlFor="remail"
              className="mb-1 block text-sm font-medium text-white/80"
            >
              Repeat your email address
            </label>
            <input
              type="email"
              name="remail"
              id="remail"
              required
              onChange={(e) => setConfirmEmail(e.target.value)}
              className={`${baseInputClass} ${
                emailMismatch || emailTaken ? errorBorder : validBorder
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-white/80"
            >
              Choose your username that will be used for the Forum
            </label>
            <input
              type="text"
              name="username"
              id="username"
              maxLength={40}
              minLength={3}
              required
              onChange={(e) => setUsername(e.target.value)}
              className={`${baseInputClass} ${usernameTaken ? errorBorder : validBorder}`}
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

          <div>
            <label
              htmlFor="rpassword"
              className="mb-1 block text-sm font-medium text-white/80"
            >
              Repeat password
            </label>
            <input
              type="password"
              name="rpassword"
              id="rpassword"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${baseInputClass} ${passwordMismatch ? errorBorder : validBorder}`}
            />
          </div>

          <input
            type="submit"
            value="Register"
            className="mt-2 w-full cursor-pointer rounded-md bg-sky-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-sky-400"
          />
        </form>
      </div>
    </div>
  );
}
