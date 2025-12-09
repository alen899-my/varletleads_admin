"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  X, Download, FileText, 
  Copy, Check, ExternalLink // ✅ Added icons for Copy/Open
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function LeadDetailsModal({ open, onClose, data }) {
  const modalRef = useRef(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  
  // ✅ State for Copy Feedback & Origin
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  // Get the base URL (window.location.origin) safely on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (previewSrc) return;
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, previewSrc]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") {
        previewSrc ? setPreviewSrc(null) : onClose(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, previewSrc]);

  if (!open || !data) return null;

  // Process attachments
  const files = { companyLogo: null, clientLogo: null, vatCertificate: null, tradeLicense: null };
  data.attachments?.forEach((file) => {
    if (!files[file.fieldname]) files[file.fieldname] = file;
  });

  const extractId = (id) => id?.toString().replace(/ObjectId\("|"|\)/g, "") ?? null;


  // ✅ Construct the Edit/Registration URL
  const editLink = `${origin}/location-registration/${data._id}`;

  // ✅ Handle Copy Function
  const handleCopy = () => {
    navigator.clipboard.writeText(editLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[9999]">
        
        {/* MODAL WRAPPER */}
        <div
          ref={modalRef}
          className={`
            w-full max-w-6xl max-h-[90vh] shadow-xl
            bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-600
            flex flex-col rounded-xl overflow-hidden
          `}
        >
          
          {/* --- HEADER --- */}
          <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 px-5 py-3 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Details</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Viewing client information</p>
            </div>

            {/* Close Button Only (Edit moved to grid) */}
            <button
              onClick={() => onClose(false)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* --- SCROLLABLE CONTENT AREA --- */}
          <div className={`
            flex-1 overflow-y-auto p-4 space-y-4
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-gray-100
            dark:[&::-webkit-scrollbar-track]:bg-gray-950
            [&::-webkit-scrollbar-thumb]:bg-gray-400
            dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-gray-500
            dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600
          `}>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* ✅ NEW: REGISTRATION / EDIT LINK CARD - Only show if NOT completed */}
           


              {/* STATUS BADGE */}
              <div className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1 block">
                  Status
                </label>
                <span
                  className={`px-3 py-1 text-xs rounded-md font-medium w-fit
                  ${data.status === "completed"
                    ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-white"
                    : "bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:text-black"
                  }`}
                >
                  {data.status}
                </span>
              </div>

              {/* TEXT FIELDS */}
              {Object.entries(data).map(([key, value]) => {
                if (["_id", "__v", "status", "attachments"].includes(key) || typeof value === "object") return null;

                return (
                  <div key={key} className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    <label className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium">{key.replace(/([A-Z])/g, " $1")}</label>
                    <p className="mt-1 text-[15px] text-gray-800 dark:text-gray-100">
                      {value || <i className="text-gray-400">No data</i>}
                    </p>
                  </div>
                );
              })}

              {/* IMAGE BLOCKS */}
              {["companyLogo", "clientLogo"].map((field) => {
                const stored = files[field];
                const id = stored ? extractId(stored.fileId) : null;
                const preview = id ? `/api/all-leads/files/${id}` : null;

                return (
                  <div key={field} className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{field.replace(/([A-Z])/g, " $1")}</label>
                    
<div
  className="
    mt-2 relative 
    w-full 
    h-[200px] sm:h-[150px] md:h-[180px] lg:h-[220px] 
    bg-gray-100 dark:bg-gray-900 
    border border-gray-300 dark:border-gray-700 
    rounded-lg overflow-hidden
  "
>
  {preview ? (
    <Image
      unoptimized
      src={preview}
      fill
      onClick={() => setPreviewSrc(preview)}
      className="cursor-pointer object-cover"
      alt="Preview"
    />
  ) : (
    <span className="text-gray-400 text-sm flex justify-center items-center h-full">
      No Image
    </span>
  )}
</div>


                    {id && (
                      <a
                        href={`/api/all-leads/files/${id}`}
                        download
                        className="mt-2 w-full flex items-center justify-center gap-2 text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                      >
                        <Download size={14} /> Download
                      </a>
                    )}
                  </div>
                );
              })}

              {/* PDF FILES */}
              {["vatCertificate", "tradeLicense"].map((field) => {
                const stored = files[field];
                const id = stored ? extractId(stored.fileId) : null;

                return (
                  <div key={field} className="p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{field.replace(/([A-Z])/g, " $1")}</label>

                    <div className="mt-2 flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 rounded-lg">
                      <FileText className="text-red-500" size={20} />
                      <span className="text-sm truncate dark:text-gray-200 text-gray-700">
                        {stored?.filename || "No Document"}
                      </span>
                    </div>

                    {id && (
                      <a
                        href={`/api/all-leads/files/${id}`}
                        download
                        className="mt-2 flex items-center justify-center gap-2 text-xs border border-gray-300 dark:border-gray-600 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      >
                        <Download size={14} /> Download
                      </a>
                    )}
                  </div>
                );
              })}
                 {data.status !== "completed" && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                  <label className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold mb-2 flex items-center gap-2">
                    Registration / Edit Link
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* URL Display */}
                    <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-600 dark:text-gray-300 font-mono truncate select-all">
                      {editLink}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-200"
                      >
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        {copied ? "Copied" : "Copy"}
                      </button>

                      <Link
                        href={`/location-registration/${data._id}`}
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-sm font-medium"
                      >
                        <ExternalLink size={16} />
                        Open
                      </Link>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* --- IMAGE PREVIEW OVERLAY --- */}
{previewSrc && ( 
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[10000]" onClick={() => setPreviewSrc(null)} > <Image unoptimized src={previewSrc} width={700} height={700} className="object-contain max-h-[90vh] rounded-lg shadow-xl" alt="Expanded Preview" /> </div> )}

      
    </>
  );
}