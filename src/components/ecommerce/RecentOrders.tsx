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

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader>Lead Name</TableCell>
              <TableCell isHeader>Location</TableCell>
              <TableCell isHeader>Created At</TableCell>
              <TableCell isHeader>Status</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {leads.length > 0 ? (
              leads.map((lead, index) => (
                <TableRow key={index}>
                  <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                    {lead.adminName || "No Name"}
                    <p className="text-gray-400 text-xs">{lead.adminEmail ?? "N/A"}</p>
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                    {lead.locationName ?? "N/A"}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="py-3">
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
