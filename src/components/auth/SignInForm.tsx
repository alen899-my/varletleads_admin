"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { z } from "zod";

// ----------- ZOD SCHEMA -----------
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function SignInForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>(
    {}
  );

  // Check if already logged in
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (storedUser) {
      router.replace(storedUser.role === "admin" ? "/admin" : "/");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBackendError("");
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const body: LoginForm = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
    };

    // ------- ZOD VALIDATION ------
  // ------- VALIDATION ------
const result = loginSchema.safeParse(body);

if (!result.success) {
  const validationErrors: Partial<Record<keyof LoginForm, string>> = {};
  
  // Use .issues instead of .errors
  result.error.issues.forEach((err) => {
    const field = err.path[0] as keyof LoginForm;
    validationErrors[field] = err.message;
  });

  setErrors(validationErrors);
  setLoading(false);
  return;
}


    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data), // validated data
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      document.cookie = `token=${data.token}; path=/`;
      document.cookie = `role=${data.user.role}; path=/`;

      router.push(data.user.role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      setBackendError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!authChecked)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        Checking session...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center px-4  dark:bg-gray-900">
      {/* CARD */}
      <div className="w-lg border border-gray-300 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* LOGO */}
        <div className="flex justify-center mb-2">
          <img src="/logo.png" alt="Company Logo" className="w-60 object-contain" />
        </div>

        <div className="text-center mb-4">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in to continue
          </p>
        </div>

        {/* BACKEND ERROR */}
        {backendError && (
          <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-300 text-red-600 text-sm">
            {backendError}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* EMAIL */}
          <div>
            <Label>Email <span className="text-red-500">*</span></Label>
            <Input
              name="email"
              type="email"
              placeholder="info@gmail.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <Label>Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? <EyeIcon /> : <EyeCloseIcon />}
              </span>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* REMEMBER ME */}
          <div className="flex items-center gap-2">
            <Checkbox checked={isChecked} onChange={setIsChecked} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Keep me logged in
            </span>
          </div>

          {/* SUBMIT */}
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#007bff] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
