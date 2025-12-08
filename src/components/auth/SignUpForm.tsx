"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// ---------- ZOD VALIDATION SCHEMA ----------
const signupSchema = z.object({
  fname: z.string().min(2, "First name must be at least 2 characters"),
  lname: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormFields = z.infer<typeof signupSchema>;

export default function SignUpForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] =
    useState<Partial<Record<keyof SignupFormFields, string>>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBackendError("");
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const body: SignupFormFields = {
      fname: String(formData.get("fname")),
      lname: String(formData.get("lname")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    };

    // 🧪 ---- ZOD VALIDATION ----
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      const validationErrors: Partial<Record<keyof SignupFormFields, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof SignupFormFields;
        validationErrors[field] = err.message;
      });
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Signup failed");

      router.push("/signin");
    } catch (err: any) {
      setBackendError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 px-4">
      {/* CARD */}
      <div className="w-full max-w-md bg-white border border-gray-400 dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your details to sign up
          </p>
        </div>

        {/* Backend Error */}
        {backendError && (
          <p className="text-center text-sm text-red-500 mb-2">{backendError}</p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>First Name *</Label>
              <Input name="fname" placeholder="Enter first name" />
              {errors.fname && <p className="text-red-500 text-xs">{errors.fname}</p>}
            </div>

            <div>
              <Label>Last Name *</Label>
              <Input name="lname" placeholder="Enter last name" />
              {errors.lname && <p className="text-red-500 text-xs">{errors.lname}</p>}
            </div>
          </div>

          <div>
            <Label>Email *</Label>
            <Input name="email" placeholder="Enter email" type="email" />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <div>
            <Label>Password *</Label>
            <div className="relative">
              <Input
                name="password"
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>

          {/* TERMS */}
          <div className="flex items-start gap-3 text-sm">
            <Checkbox
              className="mt-1"
              checked={isChecked}
              onChange={setIsChecked}
            />
            <p className="text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our
              <span className="font-medium text-gray-900 dark:text-white">
                {" "}Terms & Privacy Policy
              </span>
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
