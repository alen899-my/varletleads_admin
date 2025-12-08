"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError("");
  setLoading(true);

  const formData = new FormData(e.currentTarget);

  const body = {
    fname: formData.get("fname"),
    lname: formData.get("lname"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    router.push("/signin");
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center  dark:bg-gray-900 px-4">
      {/* Card */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} method="POST" className="space-y-5">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>First Name *</Label>
              <Input
                type="text"
                id="fname"
                name="fname"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <Label>Last Name *</Label>
              <Input
                type="text"
                id="lname"
                name="lname"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
            />
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
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 text-sm">
            <Checkbox
              className="mt-1"
              checked={isChecked}
              onChange={setIsChecked}
            />
            <p className="text-gray-500 dark:text-gray-400">
              Creating an account means you agree to our{" "}
              <span className="text-gray-800 dark:text-white font-medium">
                Terms & Conditions
              </span>{" "}
              and{" "}
              <span className="text-gray-800 dark:text-white font-medium">
                Privacy Policy
              </span>.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
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
