"use client";

import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

interface LeadAnalytics {
  _id: number;
  completed: number;
  pending: number;
}

export const EcommerceMetrics = () => {
  const [totalLeads, setTotalLeads] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/analytics/leads");
        const result = await res.json();

        if (result.success) {
          setTotalLeads(result.total);

          let completed = 0;
          let pending = 0;

          result.data.forEach((item: LeadAnalytics) => {
            completed += item.completed;
            pending += item.pending;
          });

          setCompletedCount(completed);
          setPendingCount(pending);
        }
      } catch (err) {
        console.log("Error fetching metrics", err);
      }
    }

    loadData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      
      {/* TOTAL LEADS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Leads
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalLeads}
            </h4>
          </div>

          <Badge color="success">
            <ArrowUpIcon />
          </Badge>
        </div>
      </div>

      {/* COMPLETED vs PENDING */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Completed / Pending
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {completedCount} / {pendingCount}
            </h4>
          </div>

          <Badge color={completedCount > pendingCount ? "success" : "error"}>
            {completedCount > pendingCount ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {totalLeads === 0
              ? "0%"
              : Math.round((completedCount / totalLeads) * 100) + "%"}
          </Badge>
        </div>
      </div>
    </div>
  );
};
