"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  X, Download, FileText, 
  Copy, Check, ExternalLink
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function LeadDetailsModal({ open, onClose, data }) {
  const modalRef = useRef(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (previewSrc) return;
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, previewSrc]);

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

  // Organize attachments by field name
  const files = { companyLogo: null, clientLogo: null, vatCertificate: null, tradeLicense: null };
  data.attachments?.forEach((file) => {
    if (!files[file.fieldname]) files[file.fieldname] = file;
  });

  // Helper to get URL: Priority is 'path' (Vercel Blob), fallback to API if only ID exists (Legacy)
  const getFileUrl = (file) => {
    if (!file) return null;
    if (file.path) return file.path; // ✅ Direct path (Vercel Blob URL)
    if (file.fileId || file._id) return `/api/all-leads/files/${file.fileId || file._id}`; // Legacy fallback
    return null;
  };

  const editLink = `${origin}/location-registration/${data._id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(editLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- NEW: Helper function to force download ---
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to opening in new tab if fetch fails
      window.open(url, '_blank');
    }
  };

  return (
<>
  {/* CHANGED: Backdrop from bg-black/60 to softer bg-gray-900/80 */}
  <div className="fixed inset-0 bg-gray-900/80 dark:bg-gray-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-[9999]">
    <div
      ref={modalRef}
      className={`
        w-full max-w-5xl max-h-[90vh] shadow-2xl
        bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
        flex flex-col rounded-xl overflow-hidden font-sans
      `}
      /* CHANGED above: dark:bg-gray-950 -> dark:bg-gray-900 for softer dark theme background */
    >
      {/* Header */}
      <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
        {/* CHANGED above: dark:bg-gray-950 -> dark:bg-gray-900 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lead Details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Reference ID: {data.referenceId || "N/A"}</p>
        </div>

        <button
          onClick={() => onClose(false)}
          // CHANGED hover: dark:hover:bg-gray-900 -> dark:hover:bg-gray-800 (lighter than bg)
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className={`
        flex-1 overflow-y-auto p-6 md:p-8
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-gray-300
        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600
      `}>

        {/* ================== MAIN CONTENT CONTAINER ================== */}
        <div className="space-y-10">

          {/* ------------------ SECTION 1: LEAD INFORMATION ------------------ */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              General Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6">

              {/* STATUS */}
              <div className="flex flex-col">
                <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1.5">
                  Status
                </dt>
                <dd>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${data.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-inset ring-green-600/20"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 ring-1 ring-inset ring-yellow-600/20"
                    }`}
                  >
                    {data.status}
                  </span>
                </dd>
              </div>

              {/* DYNAMIC FIELDS LOOP */}
              {Object.entries(data).map(([key, value]) => {
                if (["_id", "__v", "status", "attachments", "createdAt", "updatedAt", "referenceId"].includes(key)) return null;
                if (typeof value === "object" && value !== null && !Array.isArray(value)) return null;

                return (
                  <div key={key} className="flex flex-col">
                    <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1.5">
                      {key.replace(/([A-Z])/g, " $1")}
                    </dt>
                    
                    <dd className="text-[15px] text-gray-900 dark:text-gray-100 font-medium leading-snug break-words">
                      {Array.isArray(value) ? (
                        value.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-0.5">
                            {value.map((item, idx) => (
                              <span 
                                key={idx} 
                                // CHANGED badge bg: dark:bg-gray-800 to pop against gray-900 modal bg
                                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 capitalize"
                              >
                                {item.toString().replace(/-/g, " ")}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600 text-sm">N/A</span>
                        )
                      ) : (
                        value || <span className="text-gray-400 dark:text-gray-600 font-normal">N/A</span>
                      )}
                    </dd>
                  </div>
                );
              })}

            </div>
          </section>

          {/* ------------------ SECTION 2: DOCUMENTS ------------------ */}
          <section>
             <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
              Uploaded Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {[...["companyLogo", "clientLogo"], ...["vatCertificate", "tradeLicense"]].map((field) => {
                const stored = files[field];
                const downloadUrl = getFileUrl(stored);
                const isImage = ["companyLogo", "clientLogo"].includes(field);
                const label = field.replace(/([A-Z])/g, " $1");

                if (!stored?.filename) return null;

                return (
                  // CHANGED card bg: dark:bg-gray-900 -> dark:bg-gray-800 (to sit on top of modal bg)
                  // CHANGED border: dark:border-gray-800 -> dark:border-gray-700 (for better definition)
                  <div key={field} className="group flex items-start gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-sm">
                    
                    {/* Thumbnail Area */}
                    {/* CHANGED thumbnail bg: dark:bg-gray-800 -> dark:bg-gray-700 (contrast inside card) */}
                    <div className="shrink-0 relative w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden border border-gray-100 dark:border-gray-600 flex items-center justify-center">
                        {isImage && downloadUrl ? (
                             <Image
                             unoptimized
                             src={downloadUrl}
                             fill
                             onClick={() => setPreviewSrc(downloadUrl)}
                             className="object-cover cursor-pointer"
                             alt={label}
                           />
                        ) : (
                            <FileText className="text-gray-400 dark:text-gray-500" size={24} />
                        )}
                    </div>

                    {/* Info & Action Area */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold truncate mb-0.5">{label}</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white truncate">{stored.filename}</dd>
                        
                        {downloadUrl && (
                            <button
                                onClick={() => handleDownload(downloadUrl, stored.filename)}
                                className="mt-1.5 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                                <Download size={12} /> Download
                            </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
              {!Object.keys(files).some(k => files[k]?.filename) && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic pl-1">No documents uploaded.</div>
              )}
          </section>

          {/* ------------------ SECTION 3: EDIT LINK CTA ------------------ */}
          {data.status !== "completed" && (
            // CHANGED bg: dark:bg-blue-950/20 -> dark:bg-blue-900/20 (slightly softer)
            <div className="rounded-lg border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 p-4 sm:p-6">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                Registration Link & Actions
              </h4>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* CHANGED input bg: dark:bg-gray-900 -> dark:bg-gray-800 (sit on top) */}
                <div className="flex-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 font-mono truncate select-all shadow-sm">
                  {editLink}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleCopy}
                    // CHANGED button bg & hover: dark:bg-gray-900 -> 800, hover -> 700
                    className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm"
                  >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </button>

                  <Link
                    href={`/location-registration/${data._id}`}
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition text-sm font-medium shadow-sm"
                  >
                    <ExternalLink size={14} />
                    Open
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
        {/* ================== END MAIN CONTENT ================== */}

      </div>
    </div>
  </div>

  {/* Image Lightbox Preview */}
  {previewSrc && (
    // CHANGED backdrop: bg-black/90 -> bg-gray-900/95 (softer)
    <div
      className="fixed inset-0 bg-gray-900/95 dark:bg-black/90 backdrop-blur-sm flex justify-center items-center z-[10000] p-4"
      onClick={() => setPreviewSrc(null)}
    >
      <Image
        unoptimized
        src={previewSrc}
        width={800}
        height={800}
        className="object-contain max-h-full max-w-full rounded-lg overflow-hidden shadow-2xl"
        alt="Expanded Preview"
      />
      <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2 bg-gray-900/50 rounded-full transition-colors">
          <X size={24} />
      </button>
    </div>
  )}
</>
  );
}