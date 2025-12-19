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
      <dt className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-extrabold tracking-wider mb-1">
        {label.replace(/([A-Z])/g, " $1")}
      </dt>
      <dd className="text-[14px] text-gray-900 dark:text-gray-50 font-semibold break-words leading-tight">
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {value.map((item, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-gray-700 text-[11px] border border-gray-200 dark:border-gray-600 capitalize shadow-sm text-gray-800 dark:text-gray-100">
                {item.toString().replace(/-/g, " ")}
              </span>
            ))}
          </div>
        ) : (
          value || <span className="text-gray-400 dark:text-gray-600 font-normal italic text-sm">N/A</span>
        )}
      </dd>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center p-4 z-[9999]">
        <div ref={modalRef} className="w-full max-w-4xl max-h-[85vh] shadow-2xl bg-white dark:bg-gray-900 flex flex-col rounded-2xl overflow-hidden ">
          
{/* --- HEADER (Fixed & Resized) --- */}
<div className="shrink-0 bg-black border-b border-gray-800 px-4 py-2.5 sm:px-6 flex justify-between items-center z-30 rounded-t-2xl">
  
  {/* Left Side: Title & Info */}
  <div className="flex flex-col justify-center">
    
    {/* Title Row */}
    <div className="flex items-center gap-2">
      {/* Icon added to match the reference layout's spacing */}
      <FileText className="w-5 h-5 text-[#007bff]" />
      
      <h2 className="text-base sm:text-lg font-bold text-white leading-none">
        Registration Details
      </h2>

      {/* Status Badge */}
      <span className={`ml-2 text-[9px] font-bold uppercase px-1.5 py-px rounded-full border tracking-wide ${
        data.status === 'completed' 
          ? 'bg-green-500/10 text-green-400 border-green-500/30' 
          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      }`}>
        {data.status}
      </span>
    </div>

    {/* Subtitle Row (ml-7 aligns it under the text, skipping the icon) */}
    <p className="text-[10px] sm:text-xs text-gray-400 mt-1 ml-7 font-medium tracking-wide uppercase opacity-90 leading-none font-mono">
      REF: <span className="text-gray-300">{data.referenceId || "N/A"}</span>
    </p>
  </div>

  {/* Right Side: Close Button */}
  <button 
    onClick={() => onClose(false)} 
    className="p-1.5 -mr-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 flex items-center justify-center"
    aria-label="Close modal"
  >
    <X size={18} />
  </button>
</div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 transition-all duration-300 ease-in-out
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-950
    [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
    [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 bg-gray-50 dark:bg-gray-950 ">
            
            {/* SECTION 1: LOCATION */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <MapPin size={14} /> 1. Location Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DataRow label="Location Name" value={data.locationName} />
                <DataRow label="Capacity" value={data.capacity} />
                <DataRow label="Wait Time" value={data.waitTime} />
                <DataRow label="Timing" value={data.timing} />
                <DataRow label="Latitude" value={data.latitude} />
                <DataRow label="Longitude" value={data.longitude} />
                <div className="sm:col-span-2 lg:col-span-3">
                  <DataRow label="Maps URL" value={data.mapsUrl ? <a href={data.mapsUrl} target="_blank" className="text-blue-600 dark:text-blue-400 font-bold underline decoration-blue-500/30 flex items-center gap-1.5 text-sm">{data.mapsUrl} <ExternalLink size={12}/></a> : null} />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <DataRow label="TRN / Address" value={data.address} />
                </div>
              </div>
            </section>

            {/* SECTION 2: OPERATIONAL */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <Building2 size={14} /> 2. Operational Setup
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DataRow label="Lobbies" value={data.lobbies} />
                <DataRow label="Key Rooms" value={data.keyRooms} />
                <DataRow label="Distance" value={data.distance} />
                <DataRow label="Supervisor User" value={data.supervisorUser} />
                <DataRow label="Validation User" value={data.validationUser} />
                <DataRow label="Report User" value={data.reportUser} />
              </div>
            </section>

            {/* SECTION 3: PRICING */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <Coins size={14} /> 3. Valet Ticket & Pricing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DataRow label="Ticket Type" value={data.ticketType} />
                <DataRow label="Fee Type" value={data.feeType} />
                <DataRow label="VAT Type" value={data.vatType} />
                <div className="sm:col-span-2 lg:col-span-3">
                  <DataRow label="Pricing Details" value={data.ticketPricing} />
                </div>
              </div>
            </section>

            {/* SECTION 4: DRIVERS */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <CarFront size={14} /> 4. Drivers / CVA Team
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DataRow label="Driver Count" value={data.driverCount} />
                <div className="sm:col-span-2">
                   <DataRow label="Driver List" value={<div className="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-lg font-mono text-[12px] whitespace-pre-wrap border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 leading-relaxed shadow-inner">{data.driverList}</div>} />
                </div>
              </div>
            </section>

            {/* SECTION 5: ADMIN */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <ShieldUser size={14} /> 5. Super Admin Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DataRow label="Admin Name" value={data.adminName} />
                <DataRow label="Admin Email" value={data.adminEmail} />
                <DataRow label="Admin Phone" value={data.adminPhone} />
                <DataRow label="Training Required" value={data.trainingRequired} />
              </div>
            </section>

            {/* SECTION 6: DOCUMENTS */}
            <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
              <h3 className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <FileCheck size={14} /> 6. Uploaded Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(files).map((field) => {
                  const stored = files[field];
                  const downloadUrl = getFileUrl(stored);
                  const isImage = field.toLowerCase().includes('logo');
                  const label = field.replace(/([A-Z])/g, " $1");
                  if (!stored?.filename) return null;

                  return (
                    <div key={field} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                      <div className="shrink-0 relative w-14 h-14 bg-white dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                        {isImage && downloadUrl ? (
                          <Image unoptimized src={downloadUrl} fill onClick={() => setPreviewSrc(downloadUrl)} className="object-cover cursor-pointer hover:scale-110 transition-transform duration-300" alt={label} />
                        ) : (
                          <FileText className="text-gray-400 dark:text-gray-500" size={24} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <dt className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest truncate">{label}</dt>
                        <dd className="text-[13px] font-bold text-gray-900 dark:text-white truncate mt-1">{stored.filename}</dd>
                        
                        {downloadUrl && (
                          <button 
                            onClick={() => handleDownload(downloadUrl, stored.filename)} 
                            className="mt-2.5 flex items-center gap-1.5 text-[9px] font-black text-white bg-[#007bff] hover:bg-blue-700 px-3 py-1.5 rounded shadow-sm transition-all active:scale-95 uppercase tracking-wider"
                          >
                            <Download size={12} /> DOWNLOAD
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <DataRow label="Document Submission Method" value={data.documentSubmitMethod} />
              </div>
            </section>

            {/* SECTION 7: LINK ACTIONS */}
            {data.status !== "completed" && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-5 shadow-lg">
                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   Registration Link & Actions
                </h4>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-[12px] text-gray-600 dark:text-gray-300 font-mono truncate select-all shadow-inner">
                    {editLink}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={handleCopy} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-[11px] font-black text-gray-700 dark:text-gray-100 shadow-sm">
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      {copied ? "COPIED" : "COPY URL"}
                    </button>
                   <Link 
  href={`/location-registration/${data._id}`} 
  target="_blank" 
  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg hover:opacity-90 transition text-[11px] font-black shadow-lg text-white"
  style={{ backgroundColor: '#007bff' }}
>
  <ExternalLink size={14} /> OPEN PORTAL
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