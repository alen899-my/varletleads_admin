"use client";
import { useState, useEffect, useRef } from "react";
import {
  CarFront, MapPin, Users, Coins, ArrowRight,
  Upload, UserCog, FileText, CheckCircle, X, ShieldUser, Banknote, Activity
} from "lucide-react";

export default function EditLeadModal({ isOpen, onClose, leadData, onUpdate }) {
  // 1. MOVED ALL HOOKS TO THE TOP
  const modalRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [wizardError, setWizardError] = useState("");
  const [errors, setErrors] = useState({});
  const [previewSrc, setPreviewSrc] = useState(null);


  // Initial State
  const [formData, setFormData] = useState({
    status: "pending",
    locationName: "", capacity: "", waitTime: "", mapsUrl: "",
    latitude: "", longitude: "", timing: "", address: "",
    lobbies: "", keyRooms: "", distance: "",
    supervisorUser: "no", validationUser: "no", reportUser: "no",
    ticketType: "pre-printed", feeType: "fixed", ticketPricing: "", vatType: "inclusive",
    driverCount: "", driverList: "",
    adminName: "", adminEmail: "", adminPhone: "", trainingRequired: "yes",
    logoCompany: null, logoClient: null, vatCertificate: null, tradeLicense: null,
    documentSubmitMethod: ""
  });

  const [existingFiles, setExistingFiles] = useState({});

  // --- CLICK OUTSIDE & ESCAPE KEY LOGIC ---
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);
const filePreview = (fileObj) => fileObj?.id ? `/api/all-leads/files/${fileObj.id}` : null;


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

      if (leadData.attachments && Array.isArray(leadData.attachments)) {
        const fileMap = {};
        leadData.attachments.forEach(file => {
    fileMap[file.fieldname] = {
        filename: file.filename,
        id: file.fileId || file._id // whichever exists
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
    const requiredFields = ["locationName", "capacity", "adminName", "adminEmail", "adminPhone"];
    
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

  // --- SUBMIT ---
  const handleUpdateSubmit = async () => {
    // Final check before submit
    if(!validateStep1() || !validateStep5()) {
        setWizardError("Please fill in all required fields.");
        return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && typeof value !== "object") {
        formDataToSend.append(key, value);
      }
    });

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
        setIsSubmitted(true);
        if (onUpdate) onUpdate(); 
        setTimeout(() => {
            setIsSubmitted(false);
           
        }, 1500);
      } else {
        alert("⚠️ Update failed: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error submitting form.");
    }
  };

  // --- FILE UPLOAD COMPONENT ---
  const FileUploadBlock = ({ label, name, accept, file, currentFileName }) => {
    const fileRef = useRef(null);
    return (
     <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 flex flex-col gap-2">

  <label className="text-sm font-medium text-gray-900 dark:text-gray-200">{label}</label>

  {/* 📌 Preview */}
  {currentFileName && !file && (
    <div
      className="mt-2 relative w-full h-[150px] bg-gray-100 dark:bg-gray-900 border border-gray-300 
      dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer"
      onClick={() => setPreviewSrc(filePreview(currentFileName))}
    >
      <img
        src={filePreview(currentFileName)}
        className="object-cover w-full h-full"
      />
    </div>
  )}

  {/* Preview for newly selected file */}
  {file && (
    <div
      className="mt-2 relative w-full h-[150px] bg-gray-100 dark:bg-gray-900 border border-gray-300 
      dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer"
      onClick={() => setPreviewSrc(URL.createObjectURL(file))}
    >
      <img
        src={URL.createObjectURL(file)}
        className="object-cover w-full h-full"
      />
    </div>
  )}

  {/* File control below preview */}
  <input ref={fileRef} type="file" accept={accept} name={name}
    onChange={(e) => setFormData((prev) => ({ ...prev, [name]: e.target.files?.[0] }))} className="hidden" />

  <button type="button"
    onClick={() => fileRef.current?.click()}
    className="flex items-center justify-between border border-gray-300 dark:border-gray-600 bg-white 
    dark:bg-gray-700 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 
    dark:hover:bg-gray-600 transition"
  >
    <span className="truncate">{file ? `New: ${file.name}` : "Change File"}</span>
    {file 
      ? <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" /> 
      : <Upload className="w-4 h-4 text-gray-400" />
    }
  </button>
  {existingFiles[name] && !file && (
  <div
    className="mt-2 relative w-full h-[150px] bg-gray-100 dark:bg-gray-900 rounded-lg cursor-pointer"
    onClick={() => setPreviewSrc(filePreview(existingFiles[name]))}
  >
    <img src={filePreview(existingFiles[name])} className="object-cover w-full h-full" />
  </div>
)}


</div>

    );
  };

  // 2. CHECK ISOPEN AFTER ALL HOOKS ARE DEFINED
  if (!isOpen) return null;

  // --- RENDER ---
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[9999]">
      
      {/* --- MODAL CONTAINER --- */}
     <div 
  ref={modalRef} 
  className="
    w-full max-w-4xl 
    h-[90vh]      /* 👈 FIXED HEIGHT */
    shadow-xl relative 
    bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-600 
    flex flex-col rounded-xl overflow-hidden
  "
>

        
        {/* --- HEADER (Fixed) --- */}
        <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 px-5 py-3 flex justify-between items-center z-20">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCog className="w-5 h-5 text-blue-600 dark:text-blue-500" /> 
              Edit Lead Details
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update client information</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* --- CONTENT BODY (Scrollable) --- */}
        <div
  className={`
    p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto
    min-h-[420px]     /* 👈 prevents jumping */
    max-h-[65vh]      /* 👈 ensures scrolling instead of resize */
    transition-all duration-300 ease-in-out
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-950
    [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
    [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-500
    dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600
  `}
>
          
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
                          ? "bg-blue-600 text-white font-semibold shadow-md scale-[1.03]"
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
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
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
  <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 
      text-green-800 dark:text-green-200 px-4 py-3 rounded-lg text-sm font-medium 
      flex items-center gap-2 animate-in fade-in slide-in-from-top-2 mb-3">
    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
    Changes saved successfully.
  </div>
)}
            
           
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* STEP 1: LOCATION */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Location Information</h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Basic details about the property where valet parking will be operated.</p>
                  </div>

                  {/* --- STATUS DROPDOWN --- */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-200"> Status</p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">Set the current progress of this lead</p>
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
                  {/* ----------------------- */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Location Name <span className="text-red-600 font-bold">*</span></label>
                      <input type="text" name="locationName" value={formData.locationName} onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.locationName ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} />
                        {errors.locationName && <p className="text-red-500 text-xs mt-1">{errors.locationName}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Capacity <span className="text-red-600 font-bold">*</span></label>
                      <input type="number" name="capacity" value={formData.capacity} onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.capacity ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} />
                        {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Avg Wait Time</label>
                      <input type="text" name="waitTime" value={formData.waitTime} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Maps URL</label>
                      <input type="url" name="mapsUrl" value={formData.mapsUrl} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Latitude</label>
                      <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Longitude</label>
                      <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Operation Timing</label>
                      <input type="text" name="timing" value={formData.timing} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Address / TRN</label>
                      <textarea rows={2} name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: USERS */}
              {currentStep === 2 && (
                <div className="space-y-3">
                   <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">On-Site User Setup</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Internal users + operational setup details.</p>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Number of lobbies / entrances</label>
                      <input type="number" name="lobbies" value={formData.lobbies} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Number of key control rooms</label>
                      <input type="number" name="keyRooms" value={formData.keyRooms} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Distance between lobby & key room</label>
                      <input type="text" name="distance" value={formData.distance} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    {/* FIXED: Mapped correctly to state keys */}
                    {[
                      { label: 'Supervisor user required?', key: 'supervisorUser' },
                      { label: 'Ticket validation user?', key: 'validationUser' },
                      { label: 'Finance report access?', key: 'reportUser' }
                    ].map((item) => (
                      <div key={item.key} className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">{item.label}</p>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input 
                              type="radio" 
                              name={item.key} 
                              value="yes" 
                              checked={formData[item.key] === "yes"} 
                              onChange={handleChange} 
                              className="text-blue-600 focus:ring-blue-500" 
                            /> Yes
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input 
                              type="radio" 
                              name={item.key} 
                              value="no" 
                              checked={formData[item.key] === "no"} 
                              onChange={handleChange} 
                              className="text-blue-600 focus:ring-blue-500" 
                            /> No
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: PRICING */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    
                    {/* Section Heading */}
                    <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Valet Ticket & Pricing
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tell us how tickets are generated and how you charge guests.
                    </p>
                    </div>

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Ticket Type */}
                    <div className="md:col-span-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                        Ticket Type
                        </label>
                        <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input 
                            type="radio" 
                            name="ticketType" 
                            value="pre-printed" 
                            checked={formData.ticketType === "pre-printed"} 
                            onChange={handleChange} 
                            className="text-blue-600 focus:ring-blue-500" 
                            />
                            Pre-printed ticket
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input 
                            type="radio" 
                            name="ticketType" 
                            value="system-generated" 
                            checked={formData.ticketType === "system-generated"} 
                            onChange={handleChange} 
                            className="text-blue-600 focus:ring-blue-500" 
                            />
                            Ticket generated by system
                        </label>
                        </div>
                    </div>

                    {/* Valet Fee Type */}
                    <div className="md:col-span-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                        Valet Fee Type
                        </label>
                        <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input 
                            type="radio" 
                            name="feeType" 
                            value="fixed" 
                            checked={formData.feeType === "fixed"} 
                            onChange={handleChange} 
                            className="text-blue-600 focus:ring-blue-500" 
                            />
                            Fixed fee
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input 
                            type="radio" 
                            name="feeType" 
                            value="hourly" 
                            checked={formData.feeType === "hourly"} 
                            onChange={handleChange} 
                            className="text-blue-600 focus:ring-blue-500" 
                            />
                            Hourly
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input 
                            type="radio" 
                            name="feeType" 
                            value="free" 
                            checked={formData.feeType === "free"} 
                            onChange={handleChange} 
                            className="text-blue-600 focus:ring-blue-500" 
                            />
                            Free (complimentary)
                        </label>
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                        <p className="text-xs text-gray-400 mt-1">Mention separate pricing if applicable.</p>
                    </div>

                    {/* VAT Handling */}
                    <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                        VAT Handling
                        </label>
                        <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input 
                            type="radio" 
                            name="vatType" 
                            value="inclusive" 
                            checked={formData.vatType === "inclusive"} 
                            onChange={handleChange} 
                            className="text-blue-600 focus:ring-blue-500" 
                            />
                            Inclusive
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input 
                            type="radio" 
                            name="vatType" 
                            value="exclusive" 
                            checked={formData.vatType === "exclusive"} 
                            onChange={handleChange} 
                            className="text-blue-600 focus:ring-blue-500" 
                            />
                            Exclusive
                        </label>
                        </div>
                    </div>

                    </div>
                </div>
                )}

              {/* STEP 4: DRIVERS */}
              {currentStep === 4 && (
                <div className="space-y-3">
                   <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2"><UserCog className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Drivers / CVA Team</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Details of drivers who will be mapped to this location.</p>
                    </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Driver Count</label>
                      <input type="number" name="driverCount" value={formData.driverCount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-200">Driver List</label>
                      <textarea rows={5} name="driverList" value={formData.driverList} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" />
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
                        <ShieldUser className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        Super Admin Contact
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Main person responsible for valet operations & application access.
                    </p>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Name */}
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        Admin Name <span className="text-red-600 font-bold">*</span>
                        </label>
                        <input 
                        type="text" 
                        name="adminName" 
                        value={formData.adminName} 
                        onChange={handleChange} 
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.adminName ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} 
                        />
                        {errors.adminName && <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>}
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.adminEmail ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} 
                        />
                        {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>}
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.adminPhone ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} 
                        />
                        {errors.adminPhone && <p className="text-red-500 text-xs mt-1">{errors.adminPhone}</p>}
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
                            className="text-blue-600 focus:ring-blue-500"
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
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        No / different plan
                        </label>
                    </div>
                    </div>

                </div>
                )}

              {/* STEP 6: DOCUMENTS */}
              {currentStep === 6 && (
                <div className="space-y-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">📎 Required Documents</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Upload now or submit later via email/WhatsApp.</p>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FileUploadBlock label="Company Logo" name="logoCompany" accept="image/*" file={formData.logoCompany} currentFileName={existingFiles.companyLogo} />
                    <FileUploadBlock label="Client Logo" name="logoClient" accept="image/*" file={formData.logoClient} currentFileName={existingFiles.clientLogo} />
                    <FileUploadBlock label="VAT Cert" name="vatCertificate" accept="application/pdf" file={formData.vatCertificate} currentFileName={existingFiles.vatCertificate} />
                    <FileUploadBlock label="Trade License" name="tradeLicense" accept="application/pdf" file={formData.tradeLicense} currentFileName={existingFiles.tradeLicense} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-200">How will you send documents?</label>
                    <textarea rows={2} name="documentSubmitMethod" value={formData.documentSubmitMethod} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              )}
            </div>
        
        </div>

        {/* --- FOOTER ACTIONS (Fixed) --- */}
       
<div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 
    px-4 py-4 flex items-center justify-between gap-4">

  {/* BACK BUTTON */}
  {currentStep > 1 ? (
    <button 
      onClick={() => setCurrentStep(prev => prev - 1)} 
      disabled={isSubmitted}
      className={`gap-2 px-4 py-2 rounded-lg text-sm font-medium  border transition-all duration-200
        ${isSubmitted 
        ? "opacity-50 cursor-not-allowed border-gray-400 text-gray-400"
        : "border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      ← Back
    </button>
  ) : <span />}

  {/* BUTTONS ALWAYS HORIZONTAL */}
  <div className="flex flex-row items-center gap-3 flex-wrap">

    {currentStep < 6 && (
      <button
        onClick={handleUpdateSubmit}
        disabled={isSubmitted}
        className={`px-5 py-2 rounded-lg font-medium transition 
          ${isSubmitted
          ? "opacity-50 cursor-not-allowed bg-green-600 text-white"
          : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        Save
      </button>
    )}

    {currentStep < 6 && (
      <button 
        onClick={handleNext} 
        disabled={isSubmitted}
        className={`px-5 py-2 rounded-lg font-medium transition flex items-center gap-2
          ${isSubmitted
          ? "opacity-50 cursor-not-allowed bg-blue-600 text-white"
          : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
       Next <ArrowRight size={16} />
      </button>
    )}

    {currentStep === 6 && (
      <button 
        onClick={handleUpdateSubmit} 
        disabled={isSubmitted}
        className={`px-6 py-2 rounded-lg font-medium transition 
          ${isSubmitted
          ? "opacity-50 cursor-not-allowed bg-green-600 text-white"
          : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        Save
      </button>
    )}
  </div>
</div>




      </div>
    </div>
  );
}