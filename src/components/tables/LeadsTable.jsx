"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import LeadDetailsModal from "../LeadDetailsModal";
import EditLeadModal from "../EditLeadModal";

export default function LeadsTable({ refreshTrigger = 0 }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 50; // ✅ SHOW 50 ROWS
  const [totalPages, setTotalPages] = useState(1);

  // Page jump input
  const [pageInput, setPageInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const scrollRef = React.useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const startDrag = (e) => {
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const stopDrag = () => {
    setIsDown(false);
  };

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setIsEditOpen(true);
  };

  const onDrag = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const updateRowData = (updatedLead) => {
    setLeads((prev) =>
      prev.map((lead) => (lead._id === updatedLead._id ? updatedLead : lead))
    );
  };

  //search
  const fetchLeads = async (manual = false) => {
    setLoading(true);

    const query = new URLSearchParams({
      page,
      limit,
      search,
      status: statusFilter,
    }).toString();

    const res = await fetch(`/api/all-leads?${query}`);
    const data = await res.json();

    if (data.success) {
      if (manual) {
        setLeads([]); // smooth reload on button click
        setTimeout(() => {
          setLeads(data.leads);
          setTotalPages(data.pagination.totalPages);
        }, 100);
      } else {
        setLeads(data.leads);
        setTotalPages(data.pagination.totalPages);
      }
    }

    setTimeout(() => setLoading(false), 100);
  };

  const handleFilterSearch = () => {
    setPage(1);
    fetchLeads(true); // fetch only when button clicked
  };

  // Call search immediately or only when pressing button
  const handleSearch = () => {
    setPage(1);
    fetchLeads();
  };

  const updateRowStatus = (index, newStatus) => {
    setLeads((prev) => {
      const updated = [...prev];
      // make sure we don't mutate directly
      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
  };

  const StatusBadge = ({ status }) => {
    const isCompleted = status === "completed";

    return (
      <span
        className={`
        inline-flex items-center justify-center px-3 py-1 text-[11px]
        font-medium rounded-md select-none

        ${
          isCompleted
            ? `bg-green-200 text-green-800 
               dark:bg-green-800 dark:text-green-200`
            : `bg-yellow-200 text-yellow-800 
               dark:bg-yellow-700 dark:text-yellow-200`
        }
      `}
      >
        {isCompleted ? "Completed" : "Pending"}
      </span>
    );
  };

  const openModal = (lead, mode) => {
    setSelectedLead(lead);
    setModalMode(mode);
    setModalOpen(true);
  };

  useEffect(() => {
    fetchLeads();
  }, [page, refreshTrigger]);

  const handleJumpPage = (e) => {
    if (e.key === "Enter") {
      let num = Number(pageInput);

      if (!num || num < 1) num = 1;
      if (num > totalPages) num = totalPages; // ✅ Jump to last page if too big

      setPage(num);
      setPageInput("");
    }
  };
useEffect(() => {
  fetchLeads();
}, [page, refreshTrigger]);

  const nextPage = () => page < totalPages && setPage(page + 1);
  const prevPage = () => page > 1 && setPage(page - 1);

  return (
    <div className="space-y-2 -z-100">
      {/* 🔍 SEARCH + STATUS FILTER */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded-lg text-sm w-60 dark:bg-gray-900 dark:text-white"
        />

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 px-3 py-2 rounded-lg text-sm dark:bg-gray-900 dark:text-white"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>

        {/* Search Button */}
        <button
          onClick={handleFilterSearch}
          className="px-4 py-2 bg-[#007bff] hover:bg-[#0578f4] text-white rounded-lg text-sm transition  dark:bg-gradient-to-r dark:from-[#252745] dark:to-[#252745] 
     "
        >
          Search
        </button>
      </div>

      {/* ---------- SCROLLABLE TABLE CONTAINER ---------- */}
      <div className="rounded-xl border  bg-white  dark:bg-gray-900 dark:border-gray-700 overflow-hidden">
        <div
          className="
            max-h-[600px] 
            overflow-y-auto overflow-x-auto 
            cursor-grab active:cursor-grabbing select-none
            
            /* SCROLLBAR STYLES START */
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar]:h-2
            [&::-webkit-scrollbar-track]:bg-gray-100
            dark:[&::-webkit-scrollbar-track]:bg-gray-900
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
            [&::-webkit-scrollbar-thumb]:rounded-full
            /* SCROLLBAR STYLES END */
          "
          ref={scrollRef}
          onMouseDown={startDrag}
          onMouseLeave={stopDrag}
          onMouseUp={stopDrag}
          onMouseMove={onDrag}
        >
          <Table className="w-full  -z-99">
            <TableHeader>
              <TableRow
                className="
      sticky top-0 z-1
      bg-[#000] 
      text-white

      dark:bg-gradient-to-r dark:from-[#252745] dark:to-[#252745] 
     
    "
              >
                {[
                  "#",
                  "Location",
                  "Capacity",
                  "Admin Name",
                  "Email",
                  "Phone",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    className="
          px-5 py-4 font-semibold text-white text-xs uppercase tracking-wider whitespace-nowrap 
          
        "
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {(loading ? [...Array(limit)] : leads).map((lead, index) => (
                <TableRow
                  key={index}
                  className={`transition-colors duration-200 border-b border-gray-300 dark:border-gray-700 ${
                    loading ? "opacity-40" : "opacity-100"
                  } ${
                    index % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50 dark:bg-gray-800/50"
                  } hover:bg-blue-50 dark:hover:bg-blue-900/10`}
                >
                  {loading ? (
                    <TableCell colSpan={8} className="animate-pulse px-5 py-3">
                      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </TableCell>
                  ) : (
                    <>
                      <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-center font-medium text-gray-600 dark:text-gray-400 text-xs">
                        {(page - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium">
                        {lead.locationName}
                      </TableCell>

                      <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                        {lead.capacity}
                      </TableCell>

                      <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium">
                        {lead.adminName}
                      </TableCell>

                      <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm">
                        {lead.adminEmail}
                      </TableCell>

                      <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm whitespace-nowrap">
                        {lead.adminPhone}
                      </TableCell>

                      <TableCell className="px-5 py-3 border-r border-gray-300 dark:border-gray-700 text-center">
                        <StatusBadge status={lead.status} />
                      </TableCell>

                      <TableCell className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* VIEW BUTTON */}
                          <div className="relative group">
                            <button
                              onClick={() => openModal(lead, "view")}
                              className="
          flex items-center justify-center w-8 h-8 rounded-md
          bg-emerald-500 text-white border border-emerald-500/50
          hover:bg-emerald-600 hover:border-emerald-600 transition-all

          dark:bg-emerald-700 dark:border-emerald-600/40 dark:text-white
          dark:hover:bg-emerald-600 dark:hover:border-emerald-500
        "
                            >
                              <Eye size={16} />
                            </button>

                            <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-md">
                              View
                            </span>
                          </div>

                          {/* EDIT BUTTON */}
                          <div className="relative group">
                            <button
                              onClick={() => handleEditClick(lead)}
                              className="
          flex items-center justify-center w-8 h-8 rounded-md
          bg-[#007bff] text-white border border-blue-500/50
          hover:bg-[#007bff] hover:border-[#007bff] transition-all

          dark:bg-blue-700 dark:border-[#007bff]/40 dark:text-white
          dark:hover:bg-[#007bff] dark:hover:border-blue-500
        "
                            >
                              <Pencil size={16} />
                            </button>

                            <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-md">
                              Edit
                            </span>
                          </div>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* ---------- PAGINATION ---------- */}
      {/* ---------- PAGINATION ---------- */}
      <div className="flex items-center justify-center gap-2 py-4">
        {/* Prev Button */}
        <button
          onClick={prevPage}
          disabled={page === 1}
          className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 font-medium border transition-all 
      ${
        page === 1
          ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400 dark:border-gray-700 dark:text-gray-600"
          : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        {/* Page 1 */}
        <button
          onClick={() => setPage(1)}
          className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all 
      ${
        page === 1
          ? "bg-[#007bff] border-[#465fff] text-white shadow-md dark:bg-[#374bd1] dark:border-[#374bd1]"
          : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
        >
          1
        </button>

        {/* Page 2 */}
        {totalPages > 1 && (
          <button
            onClick={() => setPage(2)}
            className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all 
        ${
          page === 2
            ? "  bg-[#007bff] border-[#465fff] text-white shadow-md dark:bg-[#374bd1] dark:border-[#374bd1]"
            : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        }`}
          >
            2
          </button>
        )}

        {/* Ellipsis if far away */}
        {page > 3 && (
          <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
        )}

        {/* Current Page Input */}
        <input
          type="number"
          placeholder={page}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onKeyDown={handleJumpPage}
          className="w-16 text-center border border-gray-400 rounded-lg py-2 text-sm outline-none 
      focus:ring-2 focus:ring-[#465fff]/50 
      dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200"
        />

        {/* Ellipsis before last page */}
        {page < totalPages - 2 && (
          <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
        )}

        {/* Last Page */}
        {totalPages > 2 && (
          <button
            onClick={() => setPage(totalPages)}
            className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all 
        ${
          page === totalPages
            ? "bg-[#007bff] border-[#465fff] text-white shadow-md dark:bg-[#374bd1] dark:border-[#374bd1]"
            : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        }`}
          >
            {totalPages}
          </button>
        )}

        {/* Next Button */}
        <button
          onClick={nextPage}
          disabled={page === totalPages}
          className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 font-medium border transition-all 
      ${
        page === totalPages
          ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400 dark:border-gray-700 dark:text-gray-600"
          : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      <LeadDetailsModal
        open={modalOpen}
        onClose={(shouldRefresh, updatedLead) => {
          setModalOpen(false);
          if (updatedLead) updateRowData(updatedLead); // ⬅️ update only that row
        }}
        data={selectedLead}
        mode={modalMode}
      />
      <EditLeadModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        leadData={selectedLead}
        onUpdate={fetchLeads}
      />
    </div>
  );
}