"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  X, Download, FileText, 
  Copy, Check, ExternalLink,
  MapPin, Building2, Coins, CarFront, ShieldUser, FileCheck
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

  const files = { logoCompany: null, logoClient: null, vatCertificate: null, tradeLicense: null };
  data.attachments?.forEach((file) => {
    let key = file.fieldname;
    if (key === "companyLogo") key = "logoCompany";
    if (key === "clientLogo") key = "logoClient";
    if (files.hasOwnProperty(key)) files[key] = file;
  });

  const getFileUrl = (file) => {
    if (!file) return null;
    if (file.path) return file.path;
    if (file.fileId || file._id) return `/api/all-leads/files/${file.fileId || file._id}`;
    return null;
  };

  const editLink = `${origin}/location-registration/${data._id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(editLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      window.open(url, '_blank');
    }
  };

  const DataRow = ({ label, value }) => (
    <div className="flex flex-col">
      <dt className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-extrabold tracking-wider mb-1.5">
        {label.replace(/([A-Z])/g, " $1")}
      </dt>
      <dd className="text-[16px] text-gray-900 dark:text-gray-50 font-semibold break-words leading-snug">
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-2 mt-1">
            {value.map((item, idx) => (
              <span key={idx} className="px-3 py-1 rounded-md bg-white dark:bg-gray-700 text-[13px] border border-gray-200 dark:border-gray-600 capitalize shadow-sm text-gray-800 dark:text-gray-100">
                {item.toString().replace(/-/g, " ")}
              </span>
            ))}
          </div>
        ) : (
          value || <span className="text-gray-400 dark:text-gray-600 font-normal italic text-base">N/A</span>
        )}
      </dd>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center p-4 z-[9999]">
        <div ref={modalRef} className="w-full max-w-5xl max-h-[85vh] shadow-2xl bg-white dark:bg-gray-900   dark:border-gray-800 flex flex-col rounded-2xl overflow-hidden ">
          
          {/* Header - Fixed Black Background */}
          <div className="shrink-0 bg-black border-b border-gray-800 px-6 py-4 flex justify-between items-center z-10">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-4">
                Registration Details
                <span className={`text-[12px] tracking-widest uppercase px-4 py-1.5 rounded-full border ${data.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  {data.status}
                </span>
              </h2>
              <p className="text-[12px] text-gray-400 mt-1.5 font-mono tracking-wider opacity-80 uppercase">REF: {data.referenceId || "N/A"}</p>
            </div>
            <button onClick={() => onClose(false)} className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8  transition-all duration-300 ease-in-out
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-950
    [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
    [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 bg-gray-50 dark:bg-gray-950 ">
            
            {/* SECTION 1: LOCATION */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-md">
              <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <MapPin size={18} /> 1. Location Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                <DataRow label="Location Name" value={data.locationName} />
                <DataRow label="Capacity" value={data.capacity} />
                <DataRow label="Wait Time" value={data.waitTime} />
                <DataRow label="Timing" value={data.timing} />
                <DataRow label="Latitude" value={data.latitude} />
                <DataRow label="Longitude" value={data.longitude} />
                <div className="sm:col-span-2 lg:col-span-3">
                  <DataRow label="Maps URL" value={data.mapsUrl ? <a href={data.mapsUrl} target="_blank" className="text-blue-600 dark:text-blue-400 font-bold underline decoration-blue-500/30 flex items-center gap-2 text-[15px]">{data.mapsUrl} <ExternalLink size={16}/></a> : null} />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <DataRow label="TRN / Address" value={data.address} />
                </div>
              </div>
            </section>

            {/* SECTION 2: OPERATIONAL */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-md">
              <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <Building2 size={18} /> 2. Operational Setup
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                <DataRow label="Lobbies" value={data.lobbies} />
                <DataRow label="Key Rooms" value={data.keyRooms} />
                <DataRow label="Distance" value={data.distance} />
                <DataRow label="Supervisor User" value={data.supervisorUser} />
                <DataRow label="Validation User" value={data.validationUser} />
                <DataRow label="Report User" value={data.reportUser} />
              </div>
            </section>

            {/* SECTION 3: PRICING */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-md">
              <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <Coins size={18} /> 3. Valet Ticket & Pricing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                <DataRow label="Ticket Type" value={data.ticketType} />
                <DataRow label="Fee Type" value={data.feeType} />
                <DataRow label="VAT Type" value={data.vatType} />
                <div className="sm:col-span-2 lg:col-span-3">
                  <DataRow label="Pricing Details" value={data.ticketPricing} />
                </div>
              </div>
            </section>

            {/* SECTION 4: DRIVERS */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-md">
              <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <CarFront size={18} /> 4. Drivers / CVA Team
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <DataRow label="Driver Count" value={data.driverCount} />
                <div className="sm:col-span-2">
                   <DataRow label="Driver List" value={<div className="bg-gray-50 dark:bg-gray-800/80 p-5 rounded-xl font-mono text-[14px] whitespace-pre-wrap border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 leading-relaxed shadow-inner">{data.driverList}</div>} />
                </div>
              </div>
            </section>

            {/* SECTION 5: ADMIN */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-md">
              <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <ShieldUser size={18} /> 5. Super Admin Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                <DataRow label="Admin Name" value={data.adminName} />
                <DataRow label="Admin Email" value={data.adminEmail} />
                <DataRow label="Admin Phone" value={data.adminPhone} />
                <DataRow label="Training Required" value={data.trainingRequired} />
              </div>
            </section>

        {/* SECTION 6: DOCUMENTS */}
<section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-md">
  <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.25em] mb-8 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
    <FileCheck size={18} /> 6. Uploaded Documents
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Object.keys(files).map((field) => {
      const stored = files[field];
      const downloadUrl = getFileUrl(stored);
      const isImage = field.toLowerCase().includes('logo');
      const label = field.replace(/([A-Z])/g, " $1");
      if (!stored?.filename) return null;

      return (
        <div key={field} className="flex items-start gap-6 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 shadow-sm">
          <div className="shrink-0 relative w-20 h-20 bg-white dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-md">
            {isImage && downloadUrl ? (
              <Image unoptimized src={downloadUrl} fill onClick={() => setPreviewSrc(downloadUrl)} className="object-cover cursor-pointer hover:scale-110 transition-transform duration-300" alt={label} />
            ) : (
              <FileText className="text-gray-400 dark:text-gray-500" size={36} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <dt className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[0.15em] truncate">{label}</dt>
            <dd className="text-[15px] font-bold text-gray-900 dark:text-white truncate mt-1.5">{stored.filename}</dd>
            
            {/* UPDATED DOWNLOAD BUTTON */}
            {downloadUrl && (
              <button 
                onClick={() => handleDownload(downloadUrl, stored.filename)} 
                className="mt-4 flex items-center gap-2 text-[11px] font-black text-white bg-[#007bff] hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 uppercase tracking-wider"
              >
                <Download size={14} /> DOWNLOAD
              </button>
            )}
          </div>
        </div>
      );
    })}
  </div>
  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
     <DataRow label="Document Submission Method" value={data.documentSubmitMethod} />
  </div>
</section>

            {/* SECTION 7: LINK ACTIONS */}
            {data.status !== "completed" && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-8 shadow-xl">
                <h4 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                   Registration Link & Actions
                </h4>
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-4 text-[13px] text-gray-600 dark:text-gray-300 font-mono truncate select-all shadow-inner">
                    {editLink}
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={handleCopy} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-[13px] font-black text-gray-700 dark:text-gray-100 shadow-sm">
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                      {copied ? "COPIED" : "COPY URL"}
                    </button>
                    <Link href={`/location-registration/${data._id}`} target="_blank" className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition text-[13px] font-black shadow-lg">
                      <ExternalLink size={18} /> OPEN PORTAL
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox Preview */}
      {previewSrc && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex justify-center items-center z-[10000] p-4" onClick={() => setPreviewSrc(null)}>
          <Image unoptimized src={previewSrc} width={1400} height={1400} className="object-contain max-h-full max-w-full rounded-2xl shadow-2xl transition-all duration-500" alt="Expanded Preview" />
          <button className="absolute top-8 right-8 text-white/50 hover:text-white p-4 bg-gray-800/50 rounded-full transition-all border border-white/10">
            <X size={32} />
          </button>
        </div>
      )}
    </>
  );
}