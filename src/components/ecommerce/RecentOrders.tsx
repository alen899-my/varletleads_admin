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

      {/* 📌 ADDED RESPONSIVE WRAP */}
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-[600px] sm:min-w-full">
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="whitespace-nowrap">Lead Name</TableCell>
              <TableCell isHeader className="whitespace-nowrap">Location</TableCell>
              <TableCell isHeader className="whitespace-nowrap">Created At</TableCell>
              <TableCell isHeader className="whitespace-nowrap">Status</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {leads.length > 0 ? (
              leads.map((lead, index) => (
                <TableRow 
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition border-b sm:border-none block sm:table-row p-3 sm:p-0 rounded-lg sm:rounded-none mb-3 sm:mb-0"
                >
                  {/* 📱 MOBILE LABEL + VALUE */}
                  <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90 block sm:table-cell">
                    <span className="sm:hidden text-[10px] uppercase text-gray-400">Lead Name</span>
                    {lead.adminName || "No Name"}
                    <p className="text-gray-400 text-xs">{lead.adminEmail ?? "N/A"}</p>
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 dark:text-gray-400 block sm:table-cell">
                    <span className="sm:hidden text-[10px] uppercase text-gray-400">Location</span>
                    {lead.locationName ?? "N/A"}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 dark:text-gray-400 block sm:table-cell whitespace-nowrap">
                    <span className="sm:hidden text-[10px] uppercase text-gray-400">Created At</span>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="py-3 block sm:table-cell">
                    <span className="sm:hidden text-[10px] uppercase text-gray-400">Status</span>
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
    </div>
  );
}
