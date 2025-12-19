// components/ReviewModal.tsx
"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation"; // 👈 Import usePathname
import {
  MapPin,
  Building2,
  Coins,
  CarFront,
  ShieldUser,
  FileText,
  CheckCircle,
  X,
  File as FileIcon,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: any;
  existingFiles: any;
  isSubmitting: boolean;
  themeColor?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  existingFiles,
  isSubmitting,
  themeColor = "#ae5c83",
}: ReviewModalProps) {
  const pathname = usePathname(); // 👈 Get current path
  // 👈 Check if route includes 'location-registration'
  const isLocationRegistrationRoute = pathname?.includes("location-registration");

  const lightBg = useMemo(() => `${themeColor}1A`, [themeColor]);

  if (!isOpen) return null;

  // --- 1. Data Row Component ---
  const ReviewRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    // 👈 Conditional dark mode classes
    <div className={`grid grid-cols-1 sm:grid-cols-12 gap-y-1 gap-x-6 py-4 border-b border-slate-100 last:border-0 items-start ${!isLocationRegistrationRoute ? "dark:border-slate-800" : ""}`}>
      <dt className={`sm:col-span-4 text-sm font-medium text-slate-500 leading-6 ${!isLocationRegistrationRoute ? "dark:text-slate-400" : ""}`}>
        {label}
      </dt>
      <dd className={`sm:col-span-8 text-base font-medium text-slate-900 leading-6 break-words whitespace-pre-wrap ${!isLocationRegistrationRoute ? "dark:text-slate-100" : ""}`}>
        {value ? value : <span className={`text-slate-400 italic font-normal ${!isLocationRegistrationRoute ? "dark:text-slate-500" : ""}`}>Not provided</span>}
      </dd>
    </div>
  );

  // --- 2. Array Formatter ---
  const formatArray = (arr: string[] | string) => {
    if (Array.isArray(arr)) {
      return arr.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-1">
          {arr.map((item) => (
            // 👈 Conditional dark mode classes
            <span
              key={item}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-slate-100 text-slate-800 border border-slate-200 capitalize ${!isLocationRegistrationRoute ? "dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700" : ""}`}
            >
              {item.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      ) : (
        "None selected"
      );
    }
    return arr || "None selected";
  };

  // --- 3. File Preview Card ---
  const FilePreviewCard = ({ fieldName, label }: { fieldName: string; label: string }) => {
    const newFile = formData[fieldName];
    const existingFile = existingFiles[fieldName];

    let content = null;
    let badge = null;

    const isFileObject = (obj: any): obj is File => {
       return (
         obj !== null &&
         typeof obj === 'object' &&
         typeof obj.name === 'string' &&
         typeof obj.size === 'number' &&
         typeof obj.type === 'string'
       );
    };

    if (isFileObject(newFile)) {
      const isImage = newFile.type.startsWith("image/");
      let previewUrl = null;
      if (typeof window !== 'undefined' && isImage) {
        try {
            previewUrl = URL.createObjectURL(newFile);
        } catch (e) {
            console.error("Error creating object URL", e);
        }
      }
      
      // 👈 Conditional dark mode classes
      badge = <span className={`bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${!isLocationRegistrationRoute ? "dark:bg-blue-900/30 dark:text-blue-400" : ""}`}>New Upload</span>;
      
      content = (
        <div className="flex items-start gap-4">
          {isImage && previewUrl ? (
            // 👈 Conditional dark mode classes
            <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-sm bg-white ${!isLocationRegistrationRoute ? "dark:border-slate-700 dark:bg-slate-800" : ""}`}>
              <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
            </div>
          ) : (
            // 👈 Conditional dark mode classes
            <div className={`h-12 w-12 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 ${!isLocationRegistrationRoute ? "dark:bg-slate-800 dark:text-slate-400" : ""}`}>
               {newFile.type === 'application/pdf' ? <FileText size={24} /> : <FileIcon size={24}/>}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {/* 👈 Conditional dark mode classes */}
            <p className={`text-sm font-semibold text-slate-900 truncate ${!isLocationRegistrationRoute ? "dark:text-slate-100" : ""}`}>{newFile.name}</p>
            <p className={`text-xs text-slate-500 mt-0.5 ${!isLocationRegistrationRoute ? "dark:text-slate-400" : ""}`}>{(newFile.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      );
    } 
    else if (existingFile && existingFile.filename) {
      const isImage = /\.(jpg|jpeg|png|webp)$/i.test(existingFile.filename);
      // 👈 Conditional dark mode classes
      badge = <span className={`bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${!isLocationRegistrationRoute ? "dark:bg-emerald-900/30 dark:text-emerald-400" : ""}`}>Existing File</span>;

      content = (
        <div className="flex items-start gap-4">
          {isImage ? (
            // 👈 Conditional dark mode classes
            <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-sm bg-white ${!isLocationRegistrationRoute ? "dark:border-slate-700 dark:bg-slate-800" : ""}`}>
               <img src={existingFile.path} alt={label} className="h-full w-full object-cover" />
            </div>
          ) : (
             // 👈 Conditional dark mode classes
             <div className={`h-12 w-12 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 ${!isLocationRegistrationRoute ? "dark:bg-slate-800 dark:text-slate-400" : ""}`}>
               {existingFile.filename.endsWith('.pdf') ? <FileText size={24} /> : <FileIcon size={24}/>}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {/* 👈 Conditional dark mode classes */}
            <p className={`text-sm font-semibold text-slate-900 truncate ${!isLocationRegistrationRoute ? "dark:text-slate-100" : ""}`}>{existingFile.filename}</p>
            {existingFile.path && (
              <a 
                href={existingFile.path} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 text-xs hover:underline mt-1 font-medium"
                style={{ color: themeColor }}
              >
                View Document <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      );
    } 
    else {
       return (
         // 👈 Conditional dark mode classes
         <div className={`p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-center items-center text-center h-full min-h-[100px] ${!isLocationRegistrationRoute ? "dark:border-slate-700 dark:bg-slate-800/50" : ""}`}>
            <span className={`text-slate-400 mb-1 ${!isLocationRegistrationRoute ? "dark:text-slate-500" : ""}`}><FileIcon size={20}/></span>
            <span className={`text-xs text-slate-400 font-medium ${!isLocationRegistrationRoute ? "dark:text-slate-500" : ""}`}>{label}</span>
            <span className={`text-[10px] text-slate-400 mt-1 ${!isLocationRegistrationRoute ? "dark:text-slate-600" : ""}`}>Not attached</span>
         </div>
       )
    }

    return (
      // 👈 Conditional dark mode classes
      <div className={`group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 ${!isLocationRegistrationRoute ? "dark:border-slate-700 dark:bg-slate-900" : ""}`}>
        <div className="absolute top-3 right-3">{badge}</div>
        <div className={`mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider ${!isLocationRegistrationRoute ? "dark:text-gray-400" : ""}`}>{label}</div>
        {content}
      </div>
    );
  };

  return (
    // 👈 Conditional dark mode classes for overlay
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 ${!isLocationRegistrationRoute ? "dark:bg-slate-950/80" : ""}`}>
      
      {/* 👈 Conditional dark mode classes for modal container */}
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ${!isLocationRegistrationRoute ? "dark:bg-slate-900" : ""}`}>
        
      {/* --- Header --- */}
{/* 👈 Conditional dark mode classes for header border */}
<div className={`px-4 py-2.5 sm:px-6 border-b border-slate-100 bg-black flex justify-between items-center shrink-0 ${!isLocationRegistrationRoute ? "dark:border-slate-800" : ""}`}>
  <div className="flex flex-col justify-center">
    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 leading-none">
      <span 
        className="p-1 rounded-md flex items-center justify-center"
        style={{ backgroundColor: lightBg, color: themeColor }}
      >
        <CheckCircle size={16} />
      </span>
      Final Review
    </h2>
    <p className="text-[10px] sm:text-xs text-white/70 mt-1 ml-7 leading-none">
      Please ensure all details below are accurate before submission.
    </p>
  </div>
  <button 
    onClick={onClose} 
    className="p-1.5 -mr-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
  >
    <X size={18} />
  </button>
</div>

        {/* --- Scrollable Body --- */}
        {/* 👈 Conditional dark mode classes for body container & scrollbar */}
        <div className={`flex-1 overflow-y-auto bg-white p-8 transition-all duration-300 ease-in-out
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-gray-100
    [&::-webkit-scrollbar-thumb]:bg-gray-400
    [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-500
    ${!isLocationRegistrationRoute ? "dark:bg-slate-900 dark:[&::-webkit-scrollbar-track]:bg-gray-950 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700" : ""}`}>
          
          <div className="space-y-10">
            {/* Section 1 */}
            <section>
              <h3 
                // 👈 Conditional dark mode classes for section headers
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-slate-200 text-black ${!isLocationRegistrationRoute ? "dark:border-slate-800 dark:text-white" : ""}`}
              >
                <MapPin size={18} style={{ color: themeColor }} /> Location Information
              </h3>
              <div className="pl-2">
                <ReviewRow label="Location Name" value={formData.locationName} />
                <ReviewRow label="Parking Capacity" value={formData.capacity ? `${formData.capacity} Slots` : null} />
                <ReviewRow label="Average Waiting Time" value={formData.waitTime} />
                <ReviewRow 
                  label="Google Maps Location URL" 
                  value={formData.mapsUrl ? <a href={formData.mapsUrl} target="_blank" rel="noreferrer" className={`text-[#007bff] hover:underline break-all flex items-center gap-1 ${!isLocationRegistrationRoute ? "dark:text-blue-400" : ""}`}>{formData.mapsUrl} <ExternalLink size={12}/></a> : null} 
                />
                <ReviewRow label="Coordinates" value={(formData.latitude && formData.longitude) ? <span className={`font-mono text-sm bg-slate-100 px-2 py-1 rounded border border-slate-200 ${!isLocationRegistrationRoute ? "dark:bg-gray-800 dark:border-slate-700" : ""}`}>{formData.latitude}, {formData.longitude}</span> : null} />
                <ReviewRow label="Operation Timing" value={formData.timing} />
                <ReviewRow label="Location TRN / Registered Address" value={formData.address} />
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h3 
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-slate-200 text-black ${!isLocationRegistrationRoute ? "dark:border-slate-800 dark:text-white" : ""}`}
              >
                <Building2 size={18} style={{ color: themeColor }} /> On-Site User Setup
              </h3>
              <div className="pl-2">
                <ReviewRow label="Number of lobbies / entrances" value={formData.lobbies} />
                <ReviewRow label="Number of key control rooms" value={formData.keyRooms} />
                <ReviewRow label="Distance between lobby & key room" value={formData.distance} />
                <ReviewRow label="Supervisor user required?" value={formData.supervisorUser ? <span className="capitalize">{formData.supervisorUser}</span> : null} />
                <ReviewRow label="Ticket validation user?" value={formData.validationUser ? <span className="capitalize">{formData.validationUser}</span> : null} />
                <ReviewRow label="Finance report access?" value={formData.reportUser ? <span className="capitalize">{formData.reportUser}</span> : null} />
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h3 
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-slate-200 text-black ${!isLocationRegistrationRoute ? "dark:border-slate-800 dark:text-white" : ""}`}
              >
                <Coins size={18} style={{ color: themeColor }} /> Valet Ticket & Pricing
              </h3>
              <div className="pl-2">
                <ReviewRow label="Ticket Type" value={formatArray(formData.ticketType)} />
                <ReviewRow label="Valet Fee Type" value={formatArray(formData.feeType)} />
                <ReviewRow label="Ticket Prices (AED)" value={formData.ticketPricing} />
                <ReviewRow label="Tax Handling" value={<span className="capitalize font-semibold">{formData.vatType}</span>} />
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h3 
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-slate-200 text-black ${!isLocationRegistrationRoute ? "dark:border-slate-800 dark:text-white" : ""}`}
              >
                <CarFront size={18} style={{ color: themeColor }} /> Drivers / CVA Team
              </h3>
              <div className="pl-2">
                <ReviewRow label="Number of drivers" value={formData.driverCount} />
                <ReviewRow 
                  label="Drivers list" 
                  value={<div className={`bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-mono max-h-40 overflow-y-auto ${!isLocationRegistrationRoute ? "dark:bg-gray-800/50 dark:border-gray-700 dark:text-slate-300" : ""}`}>{formData.driverList}</div>} 
                />
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h3 
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-slate-200 text-black ${!isLocationRegistrationRoute ? "dark:border-slate-800 dark:text-white" : ""}`}
              >
                <ShieldUser size={18} style={{ color: themeColor }} /> Super Admin Contact
              </h3>
              <div className="pl-2">
                <ReviewRow label="Full Name" value={formData.adminName} />
                <ReviewRow label="Email Address" value={formData.adminEmail} />
                <ReviewRow label="Mobile / WhatsApp Number" value={formData.adminPhone} />
                <ReviewRow label="Super admin will receive full application training" value={formData.trainingRequired === 'yes' ? <span className=" flex items-center gap-1"> Yes, training required</span> : "No"} />
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h3 
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-6 pb-2 border-b border-slate-200 text-black ${!isLocationRegistrationRoute ? "dark:border-slate-800 dark:text-white" : ""}`}
              >
                <ImageIcon size={18} style={{ color: themeColor }} /> Required Documents
              </h3>
              <div className="pl-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FilePreviewCard fieldName="logoCompany" label="Company Logo (JPG/PNG)" />
                  <FilePreviewCard fieldName="logoClient" label="Client Logo (JPG/PNG)" />
                  <FilePreviewCard fieldName="vatCertificate" label="VAT Certificate (PDF)" />
                  <FilePreviewCard fieldName="tradeLicense" label="Trade License (PDF)" />
                </div>
                <ReviewRow label="How will you send documents?" value={formData.documentSubmitMethod} />
              </div>
            </section>
          </div>

        </div>

        {/* --- Footer --- */}
        {/* 👈 Conditional dark mode classes for footer container */}
        <div className={`p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-5 shrink-0 ${!isLocationRegistrationRoute ? "dark:border-slate-800 dark:bg-gray-900" : ""}`}>
          <button
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
            disabled={isSubmitting}
            // 👈 Conditional dark mode classes for "Go Back" button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm disabled:opacity-50 active:scale-[0.97] ${!isLocationRegistrationRoute ? "dark:text-gray-300 dark:bg-gray-800 dark:border-slate-700 dark:hover:bg-gray-700" : ""}`}
          >
            Go Back & Edit
          </button>
          
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            // 👈 Conditional dark mode classes for Submit button (only need disabled state adjustment)
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed
              ${isSubmitting ? `bg-slate-400 ${!isLocationRegistrationRoute ? "dark:bg-gray-600" : ""}` : ""}
            `}
            style={{ backgroundColor: isSubmitting ? undefined : themeColor }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 104 12z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Confirm & Submit
                <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}