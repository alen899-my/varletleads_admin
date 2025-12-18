"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";

export default function AdminDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      router.replace("/signin");
      return;
    }

    if (user.role !== "admin") {
      setAllowed(false);
      setAuthChecked(true);
      return;
    }

    setAllowed(true);
    setAuthChecked(true);
  }, []);

  if (!authChecked) return null;

  // ❌ If user is logged in but not admin
  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="text-center p-6 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-w-sm">
          <p className="text-lg font-semibold text-red-600">Access Denied</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            You do not have permission to view this page.
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-[#007bff] hover:bg-blue-700 text-white rounded-md text-sm"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // ✅ Admin Dashboard
  return (
    <div className="space-y-6">
      {/* ROW 1 — Metrics */}
      <div className="col-span-12">
        <EcommerceMetrics />
      </div>

      {/* ROW 2 — Chart */}
      <div className="col-span-12">
        <MonthlySalesChart />
      </div>

      {/* ROW 3 — Recent Orders */}
      <div className="col-span-12">
        <RecentOrders />
      </div>
    </div>
  );
}
