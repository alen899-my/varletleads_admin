"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";

// ------------------- TYPES -------------------
interface Lead {
  _id?: string;
  adminName?: string | null;
  adminEmail?: string | null;
  locationName?: string | null;
  createdAt: string;
  status: "completed" | "pending" | "rejected" | string;
}

interface ApiResponse {
  success: boolean;
  recentLeads: Lead[];
}

// ----------------------------------------------

export default function RecentOrders() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    async function loadLeads() {
      try {
        const res = await fetch("/api/analytics/leads");
        const data: ApiResponse = await res.json();

        if (data.success) {
          setLeads(data.recentLeads);
        }
      } catch (error) {
        console.error("Error fetching recent leads", error);
      }
    }

    loadLeads();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Leads
        </h3>
      </div>

      {/* Responsive Scroll Wrapper */}
      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-400">
        <Table className="min-w-[650px] text-sm">
         <div className="overflow-x-auto w-full">
  <Table className="min-w-[750px] table-auto">
    <TableHeader className="border-y border-gray-200 dark:border-gray-800">
      <TableRow className="text-gray-600 dark:text-gray-300 text-sm">
        <TableCell className="px-4 py-2 w-[30%] whitespace-nowrap">Lead Name</TableCell>
        <TableCell className="px-4 py-2 w-[25%] whitespace-nowrap">Location</TableCell>
        <TableCell className="px-4 py-2 w-[20%] whitespace-nowrap">Created At</TableCell>
        <TableCell className="px-4 py-2 w-[15%] whitespace-nowrap">Status</TableCell>
      </TableRow>
    </TableHeader>

    <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
      {leads.length > 0 ? (
        leads.map((lead, index) => (
          <TableRow key={index} className="text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition">
            <TableCell className="px-4 py-3 font-semibold text-gray-800 dark:text-white whitespace-nowrap">
              {lead.adminName || "No Name"}
              <p className="text-xs text-gray-400">{lead.adminEmail ?? "N/A"}</p>
            </TableCell>

            <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {lead.locationName ?? "N/A"}
            </TableCell>

            <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {new Date(lead.createdAt).toLocaleDateString()}
            </TableCell>

            <TableCell className="px-4 py-3 whitespace-nowrap">
              <Badge
                size="sm"
                color={
                  lead.status === "completed"
                    ? "success"
                    : lead.status === "pending"
                    ? "warning"
                    : "error"
                }
              >
                {lead.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={4} className="py-5 text-center text-gray-400">
            No recent leads found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</div>

        </Table>
      </div>
    </div>
  );
}
