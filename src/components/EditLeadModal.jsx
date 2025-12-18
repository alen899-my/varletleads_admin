"use client";
import { useState, useEffect, useRef ,useMemo} from "react";
import {
  CarFront,
  MapPin,
  Users,
  Coins,
  ArrowRight,
  Upload,
  UserCog,
  FileText,
  CheckCircle,
  X,
  ShieldUser,
  Banknote,
  Activity,
  FileText as FileIcon, // Use FileText as a generic file icon
} from "lucide-react";
import { LeadPDFDocument } from "@/components/LeadPDFDocument"; // Adjust path
import { pdf } from "@react-pdf/renderer";
import ReviewModal from "@/components/ReviewModal";

export default function EditLeadModal({ isOpen, onClose, leadData, onUpdate }) {
  // 1. MOVED ALL HOOKS TO THE TOP
  const modalRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [wizardError, setWizardError] = useState("");
  const [errors, setErrors] = useState({});
  const [previewSrc, setPreviewSrc] = useState(null); // Used for the modal preview

  // --- NEW STATE: Loading state for buttons ---
  const [isSaving, setIsSaving] = useState(false);

  // Initial State
  const [formData, setFormData] = useState({
    status: "pending",
    locationName: "",
    capacity: "",
    waitTime: "",
    mapsUrl: "",
    latitude: "",
    longitude: "",
    timing: "",
    address: "",
    lobbies: "",
    keyRooms: "",
    distance: "",
    supervisorUser: "no",
    validationUser: "no",
    reportUser: "no",
    ticketType: "pre-printed",
    feeType: "fixed",
    ticketPricing: "",
    vatType: "inclusive",
    driverCount: "",
    driverList: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    trainingRequired: "yes",
    logoCompany: null,
    logoClient: null,
    vatCertificate: null,
    tradeLicense: null,
    documentSubmitMethod: "",
  });

  const [existingFiles, setExistingFiles] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
const [isPdfUploading, setIsPdfUploading] = useState(false);
const [pdfUrl, setPdfUrl] = useState(null);
const [referenceId, setReferenceId] = useState(null);
  // --- CLICK OUTSIDE & ESCAPE KEY LOGIC ---
useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // Prevents closing parent if interacting with the Review Modal
      if (showReviewModal) return; 
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        if (showReviewModal) {
            setShowReviewModal(false);
        } else {
            onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose, showReviewModal]);

 
 const filePreview = (fileObj) => {
  if (!fileObj || !fileObj.path) return null;

  // Change this to your actual backend URL if paths are relative (e.g., /uploads/...)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""; 
  
  if (fileObj.path.startsWith('http') || fileObj.path.startsWith('blob:')) {
    return fileObj.path;
  }
  
  return `${baseUrl}${fileObj.path}`;
};


  // POPULATE DATA
  useEffect(() => {
    // Only populate if open and data exists
    if (isOpen && leadData) {
      setFormData((prev) => ({
        ...prev,
        status: leadData.status || "pending",
        locationName: leadData.locationName || "",
        capacity: leadData.capacity || "",
        waitTime: leadData.waitTime || "",
        mapsUrl: leadData.mapsUrl || "",
        latitude: leadData.latitude || "",
        longitude: leadData.longitude || "",
        timing: leadData.timing || "",
        address: leadData.address || "",
        lobbies: leadData.lobbies || "",
        keyRooms: leadData.keyRooms || "",
        distance: leadData.distance || "",
        supervisorUser: leadData.supervisorUser || "no",
        validationUser: leadData.validationUser || "no",
        reportUser: leadData.reportUser || "no",
        ticketType: leadData.ticketType || "pre-printed",
        feeType: leadData.feeType || "fixed",
        ticketPricing: leadData.ticketPricing || "",
        vatType: leadData.vatType || "inclusive",
        driverCount: leadData.driverCount || "",
        driverList: leadData.driverList || "",
        adminName: leadData.adminName || "",
        adminEmail: leadData.adminEmail || "",
        adminPhone: leadData.adminPhone || "",
        trainingRequired: leadData.trainingRequired || "yes",
        documentSubmitMethod: leadData.documentSubmitMethod || "",
        logoCompany: null,
        logoClient: null,
        vatCertificate: null,
        tradeLicense: null,
      }));

      // --- UPDATED ATTACHMENT MAPPING ---
      if (leadData.attachments && Array.isArray(leadData.attachments)) {
  const fileMap = {};
  leadData.attachments.forEach((file) => {
    // Standardize backend names to frontend state keys
    let key = file.fieldname;
    if (key === "companyLogo") key = "logoCompany";
    if (key === "clientLogo") key = "logoClient";

    fileMap[key] = {
      filename: file.filename,
      id: file.fileId || file._id,
      // Ensure this path is a full URL or relative to your public folder
      path: file.path, 
    };
  });
  setExistingFiles(fileMap);
}
    }
    if (isOpen) {
      setCurrentStep(1);
      setErrors({}); // Clear errors when opening
    }
  }, [leadData, isOpen]);

  // --- VALIDATION ---
  const validateStep1 = () => {
    let newErrors = {};
    if (!formData.locationName?.trim()) newErrors.locationName = "Required";
    if (!String(formData.capacity)?.trim()) newErrors.capacity = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = () => {
    let newErrors = {};
    if (!formData.adminName?.trim()) newErrors.adminName = "Required";
    if (!formData.adminEmail?.trim()) newErrors.adminEmail = "Required";
    if (!formData.adminPhone?.trim()) newErrors.adminPhone = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBeforeJump = (targetStep) => {
    setWizardError("");
    setCurrentStep(targetStep);
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 5 && !validateStep5()) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    // Validate Real-time: Check if the field is required and empty
    let updatedErrors = { ...errors };
    const requiredFields = [
      "locationName",
      "capacity",
      "adminName",
      "adminEmail",
      "adminPhone",
    ];

    if (requiredFields.includes(name)) {
      if (!value || value.toString().trim() === "") {
        updatedErrors[name] = "This field is required";
      } else {
        delete updatedErrors[name];
      }
      setErrors(updatedErrors);
    }

    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  // 1. Handle extracting Lat/Long when URL is pasted
const handleMapUrlChange = (e) => {
  const url = e.target.value;
  let newLat = formData.latitude;
  let newLng = formData.longitude;

  // Regex to find coordinates in Google Maps URL
  const coordRegex = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/;
  const match = url.match(coordRegex);

  if (match) {
    const coords = match[0].split(",");
    newLat = coords[0].trim();
    newLng = coords[1].trim();
  }

  setFormData((prev) => ({
    ...prev,
    mapsUrl: url,
    latitude: newLat,
    longitude: newLng,
  }));
};
const uploadPdfToBlob = async (finalRefId, finalFormData, finalExistingFiles) => {
  setIsPdfUploading(true);
  try {
    const blob = await pdf(
      <LeadPDFDocument 
          formData={finalFormData} 
          existingFiles={finalExistingFiles} 
          referenceId={finalRefId} 
      />
    ).toBlob();

    const filename = `Valet_Registration_Update_${finalRefId}.pdf`;
    const file = new File([blob], filename, { type: "application/pdf" });
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("filename", filename);

    const res = await fetch("/api/upload-pdf", { method: "POST", body: uploadData });
    const data = await res.json();
    if (data.success) setPdfUrl(data.url);
  } catch (error) {
    console.error("PDF Upload failed:", error);
  } finally {
    setIsPdfUploading(false);
  }
};
const handleReviewClick = () => {
    if (!validateStep1() || !validateStep5()) {
      setWizardError("Please fill in all required fields.");
      return;
    }
    setWizardError("");
    setShowReviewModal(true);
};
// 2. Handle generating URL when Lat or Long is typed
const handleCoordinateChange = (e) => {
  const { name, value } = e.target;
  
  setFormData((prev) => {
    const newData = { ...prev, [name]: value };
    
    // Auto-generate URL if BOTH lat and long are present
    if (newData.latitude && newData.longitude) {
      newData.mapsUrl = `https://www.google.com/maps/search/?api=1&query=${newData.latitude},${newData.longitude}`;
    }
    
    return newData;
  });
};
const handleTicketTypeChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const current = Array.isArray(prev.ticketType) ? prev.ticketType : 
                      (prev.ticketType ? prev.ticketType.split(", ") : []);
      
      if (checked) {
        return { ...prev, ticketType: [...current, value] };
      } else {
        return { ...prev, ticketType: current.filter((item) => item !== value) };
      }
    });
  };

  const handleFeeTypeChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const current = Array.isArray(prev.feeType) ? prev.feeType : 
                      (prev.feeType ? prev.feeType.split(", ") : []);
      
      if (checked) {
        return { ...prev, feeType: [...current, value] };
      } else {
        return { ...prev, feeType: current.filter((item) => item !== value) };
      }
    });
  };
  const handleFinalSubmit = async () => {
    setIsSaving(true);
    const formDataToSend = new FormData();

    // Format fields for DB
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formDataToSend.append(key, value.join(", "));
      } else if (value !== null && typeof value !== "object") {
        formDataToSend.append(key, value);
      }
    });

    // Attach Files
    if (formData.logoCompany) formDataToSend.append("companyLogo", formData.logoCompany);
    if (formData.logoClient) formDataToSend.append("clientLogo", formData.logoClient);
    if (formData.vatCertificate) formDataToSend.append("vatCertificate", formData.vatCertificate);
    if (formData.tradeLicense) formDataToSend.append("tradeLicense", formData.tradeLicense);

    try {
      const res = await fetch(`/api/all-leads/${leadData._id}`, {
        method: "PUT",
        body: formDataToSend,
      });
      const data = await res.json();

      if (data.success) {
        const finalRefId = data.lead?.referenceId || leadData.referenceId;
        setReferenceId(finalRefId);
        
        // Open Success State immediately to show "Generating PDF..."
        setIsSubmitted(true);
        setShowReviewModal(false);

        // Background PDF Upload
        await uploadPdfToBlob(finalRefId, formData, existingFiles);
        
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      alert("❌ Submission error.");
    } finally {
      setIsSaving(false);
    }
  };
  // --- SUBMIT ---
  const handleUpdateSubmit = async () => {
    // Final check before submit
    if (!validateStep1() || !validateStep5()) {
      setWizardError("Please fill in all required fields.");
      return;
    }

    // Check if there are any lingering file errors
    const hasFileErrors = Object.keys(errors).some(key => 
      ["logoCompany", "logoClient", "vatCertificate", "tradeLicense"].includes(key)
    );
    if (hasFileErrors) {
      setWizardError("⚠️ Please resolve the errors in the document section (Max size 500KB).");
      return;
    }

    setIsSaving(true); // Start saving/loading process

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && typeof value !== "object") {
        formDataToSend.append(key, value);
      }
    });

    if (formData.logoCompany)
      formDataToSend.append("companyLogo", formData.logoCompany);
    if (formData.logoClient)
      formDataToSend.append("clientLogo", formData.logoClient);
    if (formData.vatCertificate)
      formDataToSend.append("vatCertificate", formData.vatCertificate);
    if (formData.tradeLicense)
      formDataToSend.append("tradeLicense", formData.tradeLicense);

    try {
      const res = await fetch(`/api/all-leads/${leadData._id}`, {
        method: "PUT",
        body: formDataToSend,
      });
      const data = await res.json();

      if (data.success) {
        const finalRefId = data.lead?.referenceId || leadData.referenceId;
        setReferenceId(finalRefId);
        
        // Trigger PDF generation after successful DB update
        await uploadPdfToBlob(finalRefId, formData, existingFiles);
        
        setIsSubmitted(true);
        setShowReviewModal(false); // Close review
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error submitting form.");
    } finally {
      setIsSaving(false); // End saving/loading process
    }
  };
  useEffect(() => {
  if (isSubmitted) {
    const timer = setTimeout(() => {
      setIsSubmitted(false);
    }, 3000); // 3000ms = 3 seconds

    return () => clearTimeout(timer); // Cleanup if component unmounts
  }
}, [isSubmitted]);

// Add useMemo to your imports at the top: import { ... useMemo } from "react";

const FileUploadBlock = ({ label, name, accept, file, currentFileName }) => {
  const fileRef = useRef(null);
  const isImageFile = accept.includes("image");
  const isPdfFile = accept.includes("pdf");
  
  const existingPreviewUrl = isImageFile ? filePreview(currentFileName) : null;
  const [newPreviewUrl, setNewPreviewUrl] = useState(null);

  useEffect(() => {
    if (file && isImageFile) {
      const objectUrl = URL.createObjectURL(file);
      setNewPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setNewPreviewUrl(null);
    }
  }, [file, isImageFile]);

  const fieldError = errors[name];

  return (
    <div className={`border rounded-lg p-3 flex flex-col gap-2 transition-all 
      bg-gray-50 dark:bg-gray-800/40 
      ${fieldError ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700"}`}
    >
      <div className="flex justify-between items-center">
        <label className={`text-sm font-medium ${fieldError ? "text-red-600" : "text-gray-700 dark:text-gray-200"}`}>
          {label}
        </label>
        {fieldError && <span className="text-xs text-red-600 font-bold">{fieldError}</span>}
      </div>

      {/* Image Preview Box */}
      {isImageFile && (newPreviewUrl || existingPreviewUrl) && (
        <div className="relative w-full h-[100px] bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden p-2 flex items-center justify-center">
          <img
            src={newPreviewUrl || existingPreviewUrl}
            alt="Preview"
            className="object-contain max-w-full max-h-full"
          />
        </div>
      )}

      {/* File Detail Box (Non-image or Empty) */}
      {(!isImageFile || (!existingPreviewUrl && !newPreviewUrl)) && (
        <div className="flex items-center gap-2 text-sm p-2 border border-dashed rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400">
          {isPdfFile ? <FileText className="w-4 h-4 text-red-500" /> : <FileIcon className="w-4 h-4" />}
          <span className="truncate">{file ? file.name : (currentFileName?.filename || "No file chosen")}</span>
        </div>
      )}

      <input ref={fileRef} type="file" accept={accept} name={name} className="hidden" onChange={handleChange} />

      {/* The Styled Button - No longer white in dark mode */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex items-center justify-between border rounded-lg px-4 py-2 text-sm font-medium transition-all
          bg-white dark:bg-gray-900 
          border-gray-300 dark:border-gray-700 
          text-gray-700 dark:text-gray-200 
          hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span className="truncate">{file ? "Change" : currentFileName ? "Replace" : "Upload"}</span>
        <Upload className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
};

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[9999]">
      {/* --- MODAL CONTAINER --- */}
     <div 
  ref={modalRef} 
  className="w-full max-w-5xl h-[85vh] flex flex-col bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
>
        {/* --- HEADER (Fixed) --- */}
<div className="shrink-0 bg-black border-b border-gray-800 px-6 py-4 flex justify-between items-center z-30">
  <div>
    <h2 className="text-xl font-bold text-white flex items-center gap-3">
      <UserCog className="w-6 h-6 text-[#007bff]" />
      Edit Lead Details
    </h2>
    <p className="text-[12px] text-gray-400 mt-1 font-medium tracking-wide uppercase opacity-90">
      Update client information & registration data
    </p>
  </div>
  
  <button
    onClick={onClose}
    className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
    aria-label="Close modal"
  >
    <X size={24} />
  </button>
</div>
  
        {/* --- CONTENT BODY (Scrollable) --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500    transition-all duration-300 ease-in-out
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-950
    [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
    [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-500
    dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
       
          {/* 1. TABS NAVIGATION */}
          {/* Step Navigation Tabs */}
          <div className="w-full flex items-center justify-center py-2 mb-4">
            <div
              className="
                w-full flex overflow-x-auto no-scrollbar scroll-smooth 
                rounded-lg border border-gray-300 dark:border-gray-700 
                bg-white dark:bg-gray-800 shadow-sm
              "
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {[
                { label: "Location", icon: <MapPin size={14} /> },
                { label: "Users", icon: <Users size={14} /> },
                { label: "Pricing", icon: <Coins size={14} /> },
                { label: "Drivers", icon: <CarFront size={14} /> },
                { label: "Admin", icon: <UserCog size={14} /> },
                { label: "Docs", icon: <FileText size={14} /> },
              ].map((tab, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;

                return (
                  <button
                    key={tab.label}
                    onClick={() => validateBeforeJump(stepNumber)}
                    className={`
                      flex items-center justify-center gap-1 flex-1
                      px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap
                      transition-all duration-200 select-none border-r border-gray-300 dark:border-gray-600
                      ${
                        isActive
                          ? "bg-[#007bff] text-white font-semibold shadow-md scale-[1.03]"
                          : isCompleted
                          ? "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }
                    `}
                  >
                    {tab.icon} {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. PROGRESS BAR */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Step {currentStep} of 6
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 mt-2 rounded-full overflow-hidden">
              <div
                className="bg-[#007bff] h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* WIZARD ERROR MESSAGE */}
          {wizardError && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 px-3 py-2 rounded-lg text-center">
              ⚠️ {wizardError}
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {isSubmitted && (
            <div
              className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 
      text-green-800 dark:text-green-200 px-4 py-3 rounded-lg text-sm font-medium 
      flex items-center gap-2 animate-in fade-in slide-in-from-top-2 mb-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              Changes saved successfully.
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 min-h-0">
           {/* STEP 1: LOCATION */}
{currentStep === 1 && (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
        Location Information
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        Basic details about the property where valet parking will be
        operated.
      </p>
    </div>

    {/* --- STATUS DROPDOWN --- */}
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-[#007bff] dark:text-blue-400" />
        <div>
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
            Status
          </p>
          <p className="text-xs text-[#007bff] dark:text-blue-300">
            Set the current progress of this lead
          </p>
        </div>
      </div>
      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full sm:w-48 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
      >
        <option value="pending">pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-1">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Location Name <span className="text-red-600 font-bold">*</span>
        </label>
        <input
          type="text"
          name="locationName"
          value={formData.locationName}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
            errors.locationName
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
        />
        {errors.locationName && (
          <p className="text-red-500 text-xs mt-1">{errors.locationName}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Parking Capacity <span className="text-red-600 font-bold">*</span>
        </label>
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
            errors.capacity
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
        />
        {errors.capacity && (
          <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Average Waiting Time
        </label>
        <input
          type="text"
          name="waitTime"
          value={formData.waitTime}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Operation Timing
        </label>
        <input
          type="text"
          name="timing"
          value={formData.timing}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>


      {/* AUTO-FILL LATITUDE */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Latitude
        </label>
        <input
          type="text"
          name="latitude"
          value={formData.latitude}
          onChange={handleCoordinateChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* AUTO-FILL LONGITUDE */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Longitude
        </label>
        <input
          type="text"
          name="longitude"
          value={formData.longitude}
          onChange={handleCoordinateChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* AUTO-FILL MAP URL */}
      <div>
        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Google Maps Location URL
        </label>
        <input
          type="url"
          name="mapsUrl"
          value={formData.mapsUrl}
          onChange={handleMapUrlChange}
          placeholder="Paste URL to auto-fill Lat/Long"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="md:col-span-1">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Location TRN / Registered Address
        </label>
        <textarea
          rows={2}
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>
    </div>
  </div>
)}

            {/* STEP 2: USERS */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    On-Site User Setup
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Internal users + operational setup details.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Number of lobbies / entrances
                    </label>
                    <input
                      type="number"
                      name="lobbies"
                      value={formData.lobbies}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Number of key control rooms
                    </label>
                    <input
                      type="number"
                      name="keyRooms"
                      value={formData.keyRooms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Distance between lobby & key room
                    </label>
                    <input
                      type="text"
                      name="distance"
                      value={formData.distance}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  {/* FIXED: Mapped correctly to state keys */}
                  {[
                    {
                      label: "Supervisor user required?",
                      key: "supervisorUser",
                    },
                    { label: "Ticket validation user?", key: "validationUser" },
                    { label: "Finance report access?", key: "reportUser" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                        {item.label}
                      </p>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name={item.key}
                            value="yes"
                            checked={formData[item.key] === "yes"}
                            onChange={handleChange}
                            className="w-4 h-4 !text-[#007bff] !accent-[#007bff] focus:ring-blue-500"
                          />{" "}
                          Yes
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="radio"
                            name={item.key}
                            value="no"
                            checked={formData[item.key] === "no"}
                            onChange={handleChange}
                           className="w-4 h-4 !text-[#007bff] !accent-[#007bff] focus:ring-blue-500"
                          />{" "}
                          No
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: VALET TICKET & PRICING */}
{currentStep === 3 && (
  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        Valet Ticket & Pricing
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Tell us how tickets are generated and how you charge guests.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Ticket Type (Multiple Choice) */}
      <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">
          Ticket Type <span className="text-gray-400 text-xs font-normal">(Select all that apply)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
          {[
            { id: "pre-printed-paper", label: "Pre-printed ticket paper" },
            { id: "pre-printed-plastic", label: "Pre-printed reusable plastic ticket" },
            { id: "system-generated", label: "System generated ticket" },
            { id: "e-ticket", label: "E-ticket" },
          ].map((type) => (
            <label key={type.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="ticketType"
                value={type.id}
                checked={formData.ticketType?.includes(type.id)}
                onChange={handleTicketTypeChange}
                className="w-4 h-4 text-[#007bff] rounded focus:ring-blue-500 accent-[#007bff]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#007bff] dark:group-hover:text-blue-400 transition-colors">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Valet Fee Type (Multiple Choice) */}
      <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">
          Valet Fee Type <span className="text-gray-400 text-xs font-normal">(Select all that apply)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4">
          {[
            { id: "fixed", label: "Fixed fee" },
            { id: "hourly", label: "Hourly" },
            { id: "free", label: "Free (complimentary)" },
          ].map((fee) => (
            <label key={fee.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="feeType"
                value={fee.id}
                checked={formData.feeType?.includes(fee.id)}
                onChange={handleFeeTypeChange}
                className="w-4 h-4 text-[#007bff] rounded focus:ring-blue-500 accent-[#007bff]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#007bff] dark:group-hover:text-blue-400 transition-colors">
                {fee.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Ticket Pricing */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
          Ticket Prices (AED) <Banknote className="w-4 h-4 text-gray-400" />
        </label>
        <textarea
          rows={2}
          name="ticketPricing"
          value={formData.ticketPricing}
          onChange={handleChange}
          placeholder="e.g. Standard: 50 AED, VIP: 100 AED..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>

      {/* VAT Handling */}
      <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">
          Tax Handling
        </label>
        <div className="flex gap-8">
          {["inclusive", "exclusive"].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="vatType"
                value={type}
                checked={formData.vatType === type}
                onChange={handleChange}
               className="w-4 h-4 !text-[#007bff] !accent-[#007bff] focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

            {/* STEP 4: DRIVERS */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <UserCog className="w-5 h-5 text-[#007bff] dark:text-blue-500" />{" "}
                    Drivers / CVA Team
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Details of drivers who will be mapped to this location.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Driver Count
                    </label>
                    <input
                      type="number"
                      name="driverCount"
                      value={formData.driverCount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Driver List
                    </label>
                    <textarea
                      rows={5}
                      name="driverList"
                      value={formData.driverList}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: ADMIN */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                {/* Section Heading */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldUser className="w-5 h-5 text-[#007bff] dark:text-blue-500" />
                    Super Admin Contact
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Main person responsible for valet operations & application
                    access.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Admin Name{" "}
                      <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        errors.adminName
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.adminName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.adminName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Email <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        errors.adminEmail
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.adminEmail && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.adminEmail}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Phone <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="tel"
                      name="adminPhone"
                      value={formData.adminPhone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        errors.adminPhone
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    />
                    {errors.adminPhone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.adminPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Training Radio Section */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="block font-medium text-gray-900 dark:text-gray-200 mb-3">
                    Super admin will receive full application training
                  </label>

                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Yes Option */}
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="radio"
                        name="trainingRequired"
                        value="yes"
                        checked={formData.trainingRequired === "yes"}
                        onChange={handleChange}
                       className="w-4 h-4 !text-[#007bff] !accent-[#007bff] focus:ring-blue-500"
                      />
                      Yes, they will be trained
                    </label>

                    {/* No Option */}
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="radio"
                        name="trainingRequired"
                        value="no"
                        checked={formData.trainingRequired === "no"}
                        onChange={handleChange}
                        className="text-[#007bff] focus:ring-blue-500"
                      />
                      No / different plan
                    </label>
                  </div>
                </div>
              </div>
            )}
{/* STEP 6: DOCUMENTS */}
{currentStep === 6 && (
  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
    {/* Section Heading - Matches Step 5 Style */}
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#007bff] dark:text-blue-500" />
        Required Documents
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Upload now or submit later via email/WhatsApp.
      </p>
    </div>

    {/* Document Upload Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FileUploadBlock
        label="Company Logo"
        name="logoCompany"
        accept="image/*"
        file={formData.logoCompany}
        currentFileName={existingFiles.logoCompany}
      />
      <FileUploadBlock
        label="Client Logo"
        name="logoClient"
        accept="image/*"
        file={formData.logoClient}
        currentFileName={existingFiles.logoClient}
      />
      <FileUploadBlock
        label="VAT Certificate"
        name="vatCertificate"
        accept="application/pdf"
        file={formData.vatCertificate}
        currentFileName={existingFiles.vatCertificate}
      />
      <FileUploadBlock
        label="Trade License"
        name="tradeLicense"
        accept="application/pdf"
        file={formData.tradeLicense}
        currentFileName={existingFiles.tradeLicense}
      />
    </div>

    {/* Submission Method - Matches Step 5 Textarea Style */}
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <label className="block font-medium text-sm text-gray-900 dark:text-gray-200 mb-2">
        How will you send remaining documents?
      </label>
      <textarea
        rows={2}
        name="documentSubmitMethod"
        value={formData.documentSubmitMethod}
        onChange={handleChange}
        placeholder="e.g. Emailing soon, WhatsApping to manager..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
      />
    </div>
  </div>
)}
        
        </div>
            </div>
        {/* --- FOOTER ACTIONS (Fixed) --- */}

{/* --- FOOTER ACTIONS (Frozen & Stable) --- */}
<div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 px-3 py-3 sm:px-6 sm:py-4 z-30">
  <div className="flex items-center justify-between w-full">
    
    {/* LEFT SIDE: Back Button Slot */}
    <div className="flex-1 flex justify-start"> 
      {currentStep > 1 && (
        <button 
          onClick={() => setCurrentStep(prev => prev - 1)} 
          disabled={isSaving}
          className="h-9 sm:h-10 flex items-center gap-2 px-2 sm:px-3 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#007bff] dark:hover:text-blue-400 transition-all group disabled:opacity-50"
        >
          <div className="p-1 sm:p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
            <ArrowRight className="rotate-180 w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
          </div>
          <span>Back</span>
        </button>
      )}
    </div>

    {/* RIGHT SIDE: Save & Next Group */}
    <div className="flex items-center gap-2 sm:gap-3">
      
      {/* SAVE BUTTON: Hidden ONLY on step 6 */}
      {currentStep < 6 && (
        <button
          onClick={handleUpdateSubmit}
          disabled={isSaving}
          className="min-w-[70px] sm:min-w-[110px] h-9 sm:h-10 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 border-2 border-[#007bff] text-[#007bff] dark:border-blue-500 dark:text-blue-400 rounded-lg text-[11px] sm:text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            "Save"
          )}
        </button>
      )}

      {/* NEXT OR REVIEW BUTTON */}
      {currentStep < 6 ? (
        <button 
          onClick={handleNext} 
          className="min-w-[70px] sm:min-w-[110px] h-9 sm:h-10 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 bg-[#007bff] hover:bg-blue-700 text-white rounded-lg text-[11px] sm:text-sm font-bold shadow-md transition-all active:scale-95"
        >
          Next 
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      ) : (
        <button 
          onClick={handleReviewClick} 
          className="min-w-[130px] sm:min-w-[180px] h-9 sm:h-10 flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] sm:text-sm font-bold shadow-lg transition-all active:scale-95 animate-in fade-in zoom-in-95 duration-300"
        >
          Review <span className="hidden sm:inline">& Finalize</span>
          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
    
  </div>
</div>
      </div>
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleFinalSubmit} // Pass the final confirm function
        formData={formData}
        existingFiles={existingFiles}
        isSubmitting={isSaving}
        themeColor="#007bff"
      />
    </div>
    
  );
}