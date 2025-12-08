"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function SignInForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (storedUser) {
      if (storedUser.role === "admin") router.replace("/admin");
      else router.replace("/");
      return;
    }

    setAuthChecked(true);
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBackendError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const body = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const expires = new Date();
      expires.setDate(expires.getDate() + 7);

      document.cookie = `token=${data.token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      document.cookie = `role=${data.user.role}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

      if (data.user.role === "admin") router.push("/admin");
      else router.push("/");
    } catch (err: any) {
      setBackendError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4  dark:bg-gray-900">

      {/* CARD */}
      <div className="w-md  border border-gray-300 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4">

        {/* LOGO */}
        <div className="flex justify-center ">
          <img
            src="/logo.png" // change image path if needed
            alt="Company Logo"
            className="w-60 h-26 object-contain "
          />
        </div>

        <div className="text-center ">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in to continue
          </p>
        </div>

        {backendError && (
          <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-300 text-red-600 text-sm">
            {backendError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label>Email *</Label>
            <Input
              name="email"
              type="email"
              placeholder="info@gmail.com"
            />
          </div>

          <div>
            <Label>Password *</Label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Keep me logged in
              </span>
            </div>
          </div>

          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
