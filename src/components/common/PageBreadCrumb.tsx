"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
    CarFront, 
    MapPin, 
    ArrowRight, 
    Upload, 
    Users, 
    Coins, 
    Banknote, 
    UserCog, 
    FileText, 
    ShieldUser, 
    CheckCircle,
    Plus, 
    X
} from "lucide-react";
import { useRouter } from "next/navigation"; 

// --- FORM COMPONENT (Internal Modal with Dark Mode) ---
const LeadFormModal = ({ onClose, onLeadAdded }: { onClose: () => void, onLeadAdded: () => void }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [wizardError, setWizardError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [errors, setErrors] = useState<any>({
        locationName: "",
        capacity: "",
        adminName: "",
        adminEmail: "",
        adminPhone: "",
        logoCompany: "",
        logoClient: "",
        vatCertificate: "",
        tradeLicense: "",
    });

    // --- CLICK OUTSIDE & ESCAPE KEY LOGIC ---
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    // Placeholder for form data state
    const [formData, setFormData] = useState<any>({
        // STEP 1
        locationName: "",
        capacity: "",
        waitTime: "",
        mapsUrl: "",
        latitude: "",
        longitude: "",
        timing: "",
        address: "",

        // STEP 2
        lobbies: "",
        keyRooms: "",
        distance: "",
        supervisorUser: "no",
        validationUser: "no",
        reportUser: "no",

        // STEP 3
        ticketType: "pre-printed",
        feeType: "fixed",
        ticketPricing: "",
        vatType: "inclusive",

        // STEP 4
        driverCount: "",
        driverList: "",

        // STEP 5
        adminName: "",
        adminEmail: "",
        adminPhone: "",
        trainingRequired: "yes",

        // STEP 6 (attachments & text)
        logoCompany: null,
        logoClient: null,
        vatCertificate: null,
        tradeLicense: null,
        documentSubmitMethod: ""
    });

    const validateBeforeJump = (targetStep: number) => {
        if (targetStep < currentStep) {
            setWizardError("");
            setCurrentStep(targetStep);
            return;
        }

        const validations: Record<number, () => boolean> = {
            1: validateStep1,
            2: validateStep2,
            3: validateStep3,
            4: validateStep4,
            5: validateStep5,
            6: validateStep6,
        };

        for (let step = currentStep; step < targetStep; step++) {
            if (!validations[step]()) {
                setWizardError("Please finish the required fields before moving ahead.");
                return;
            }
        }

        setWizardError("");
        setCurrentStep(targetStep);
    };

    // Handle form input changes
    const handleChange = (e: any) => {
        const { name, value, type, files } = e.target;
        
        // Clear errors on change
        if (errors[name]) {
            setErrors((prev: any) => {
                const newErrs = { ...prev };
                delete newErrs[name];
                return newErrs;
            });
        }

        if (type === "file") {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFinalSubmit = async () => {
        if (!validateStep1() || !validateStep5()) {
            setWizardError("Please check required fields.");
            return;
        }

        // ✅ Final Check for File Size Errors
        if (!validateStep6()) {
            setWizardError("Please resolve the errors in the document section (Max size 500KB).");
            return;
        }

        setIsSaving(true);
        const formDataToSend = new FormData();
        
        // Append text fields
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && typeof value !== "object") {
                formDataToSend.append(key, value as string);
            }
        });

        // Append files
        if (formData.logoCompany) formDataToSend.append("companyLogo", formData.logoCompany);
        if (formData.logoClient) formDataToSend.append("clientLogo", formData.logoClient);
        if (formData.vatCertificate) formDataToSend.append("vatCertificate", formData.vatCertificate);
        if (formData.tradeLicense) formDataToSend.append("tradeLicense", formData.tradeLicense);

        try {
            const res = await fetch("/api/leads", {
                method: "POST",
                body: formDataToSend,
            });

            if (!res.ok) {
                const errData = await res.json();
                alert("❌ Error submitting form: " + (errData.error || res.statusText));
                setIsSaving(false);
                return;
            }

            const data = await res.json();
            if (data.success) {
                setIsSubmitted(true);
                // Reset form
                setFormData({
                    locationName: "", capacity: "", waitTime: "", mapsUrl: "", latitude: "", longitude: "", timing: "", address: "",
                    lobbies: "", keyRooms: "", distance: "", supervisorUser: "no", validationUser: "no", reportUser: "no",
                    ticketType: "pre-printed", feeType: "fixed", ticketPricing: "", vatType: "inclusive", driverCount: "", driverList: "",
                    adminName: "", adminEmail: "", adminPhone: "", trainingRequired: "yes",
                    logoCompany: null, logoClient: null, vatCertificate: null, tradeLicense: null, documentSubmitMethod: ""
                });
                router.refresh();
                if (onLeadAdded) onLeadAdded();
            } else {
                alert("⚠️ Submission failed: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("❌ Network error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (isSubmitted) {
            const timer = setTimeout(() => {
                setIsSubmitted(false);
                onClose(); 
            }, 2000); 
            return () => clearTimeout(timer);
        }
    }, [isSubmitted, onClose]);

    const validateStep1 = () => {
        let newErrors: any = {};
        if (!formData.locationName.trim()) newErrors.locationName = "Location name is required.";
        if (!String(formData.capacity).trim()) newErrors.capacity = "Parking capacity is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const validateStep2 = () => true;
    const validateStep3 = () => true;
    const validateStep4 = () => true;
    const validateStep5 = () => {
        let newErrors: any = {};
        if (!formData.adminName.trim()) newErrors.adminName = "Full name is required.";
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.adminEmail.trim()) {
            newErrors.adminEmail = "Email is required.";
        } else if (!emailRegex.test(formData.adminEmail.trim())) {
            newErrors.adminEmail = "Enter a valid email address.";
        }
        
        const phoneClean = formData.adminPhone.replace(/\D/g, "");
        if (!formData.adminPhone.trim()) {
            newErrors.adminPhone = "Phone number is required.";
        } else if (phoneClean.length < 8 || phoneClean.length > 14) {
            newErrors.adminPhone = "Phone number must be 8–14 digits.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ✅ Step 6 validation
    const validateStep6 = () => {
        const fileKeys = ["logoCompany", "logoClient", "vatCertificate", "tradeLicense"];
        // If any of these keys have an error message, validation fails
        const hasErrors = fileKeys.some(key => errors[key]);
        return !hasErrors;
    };

    const handleNext = () => {
        const validations: Record<number, () => boolean> = {
            1: validateStep1, 2: validateStep2, 3: validateStep3, 4: validateStep4, 5: validateStep5, 6: validateStep6,
        };
        if (!validations[currentStep]()) {
            setWizardError("Please complete required fields before continuing.");
            return;
        }
        setWizardError(""); 
        setCurrentStep(prev => prev + 1);
    };

    // --- REFINED FILE UPLOAD BLOCK WITH VALIDATION ---
    const FileUploadBlock = ({ label, name, accept, file, setFormData, error, setErrors }: any) => {
        const fileRef = useRef<HTMLInputElement>(null);
        const [previewUrl, setPreviewUrl] = useState<string | null>(null);
        
        const isImage = accept.includes("image");
        const isPdf = accept.includes("pdf");

        // Handle Preview Generation
        useEffect(() => {
            if (!file || !isImage) {
                setPreviewUrl(null);
                return;
            }
            
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            // Cleanup to prevent memory leaks
            return () => URL.revokeObjectURL(url);
        }, [file, isImage]);
        
        return (
            <div className={`border rounded-lg p-3 bg-gray-50 dark:bg-gray-800 flex flex-col gap-2 
                ${error ? "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/20" : "border-gray-300 dark:border-gray-700"}`}>
                
                <div className="flex justify-between items-center">
                    <label className={`text-sm font-medium ${error ? "text-red-600" : "text-gray-900 dark:text-gray-100"}`}>{label}</label>
                    {error && <span className="text-xs text-red-600 font-semibold">{error}</span>}
                </div>
                
                {/* Image Preview Area */}
                {previewUrl && (
                    <div className="relative w-full h-[100px] bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden p-2 flex justify-center items-center">
                        <img 
                            src={previewUrl} 
                            alt="preview" 
                            className="object-contain w-full h-full"
                        />
                    </div>
                )}

                {/* File Info Area (for PDF or when no preview) */}
                {(!previewUrl && file) && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 p-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700/50">
                        {isPdf ? <FileText className="w-4 h-4 text-red-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                        <span className="truncate">{file.name}</span>
                    </div>
                )}

                <input
                    ref={fileRef}
                    type="file"
                    accept={accept}
                    name={name}
                    onChange={(e: any) => {
                        const selectedFile = e.target.files[0];
                        if (selectedFile) {
                            // ✅ 500KB Validation
                            if (selectedFile.size > 500 * 1024) {
                                setErrors((prev: any) => ({ ...prev, [name]: "File size must be less than 500KB" }));
                                e.target.value = ""; // Clear input
                            } else {
                                // Clear error
                                setErrors((prev: any) => {
                                    const newErrs = { ...prev };
                                    delete newErrs[name];
                                    return newErrs;
                                });
                                setFormData((prev: any) => ({ ...prev, [name]: selectedFile }));
                            }
                        }
                    }}
                    className="hidden"
                />
                
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={`flex items-center justify-between border bg-white dark:bg-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition mt-1
                    ${error 
                        ? "border-red-300 text-red-700 dark:border-red-500 dark:text-red-300" 
                        : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-100"}`}
                >
                    <span className="truncate">
                        {file ? `Change: ${file.name}` : "Upload File"}
                    </span>
                    {file ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Upload className={`w-4 h-4 ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`} />}
                </button>
            </div>
        );
    };

    // Shared Input Styles
    const inputClass = "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#007bff] focus:border-transparent outline-none transition-all";
    const labelClass = "text-sm font-medium text-gray-900 dark:text-gray-100";

    return (
        // BACKDROP
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            
            {/* MODAL WRAPPER */}
            <div
                ref={modalRef}
                className={`
                    w-full max-w-5xl 
                    h-[90vh]         /* 👈 Fixed height */
                    shadow-2xl
                    bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-600
                    flex flex-col rounded-xl overflow-hidden
                `}>

                
                {/* HEADER */}
                <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 px-5 py-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <UserCog className="w-5 h-5 text-[#007bff] dark:text-blue-500" /> 
                            Add Lead Details
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Add client information</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className={`
                    flex-1 overflow-y-auto p-5 sm:p-8
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-950
                    [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
                    [&::-webkit-scrollbar-thumb]:rounded-full
                `}>

                    
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


                    {wizardError && (
                        <div className="text-red-600 dark:text-red-400 text-sm mb-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 px-3 py-2 rounded-lg">
                            ⚠️ {wizardError}
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                <span>Step {currentStep} of 6</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-[#007bff] h-full rounded-full transition-all duration-300"
                                style={{ width: `${(currentStep / 6) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {isSubmitted ? (
                        <div className="bg-green-100 dark:bg-green-900/30 mb-3 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 p-4 rounded-lg text-center shadow-md animate-in fade-in duration-500">
                            New Lead Added Successfully
                        </div>
                    ) : null}

                    {/* --- STEPS CONTENT --- */}

                    {/* STEP 1: LOCATION */}
                    {currentStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Location Information
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Basic details about the property where valet parking will be
                    operated.
                  </p>
                </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-1">
                                    <label className={labelClass}>Location Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="locationName" placeholder="e.g. Grand Hyatt Dubai" value={formData.locationName} onChange={handleChange} className={`${inputClass} ${errors.locationName ? "border-red-500" : ""}`} />
                                    {errors.locationName && <small className="text-red-500 text-xs">{errors.locationName}</small>}
                                </div>
                                <div>
                                    <label className={labelClass}>Parking Capacity <span className="text-red-500">*</span></label>
                                    <input type="number" name="capacity" placeholder="Total slots" value={formData.capacity} onChange={handleChange} className={`${inputClass} ${errors.capacity ? "border-red-500" : ""}`} />
                                    {errors.capacity && <small className="text-red-500 text-xs">{errors.capacity}</small>}
                                </div>
                                {/* Updated Label */}
                                <div><label className={labelClass}>Average Waiting Time</label><input type="text" name="waitTime" placeholder="e.g. 15 mins" value={formData.waitTime} onChange={(e) => setFormData({ ...formData, waitTime: e.target.value })} className={inputClass} /></div>
                                {/* Updated Label */}
                                <div><label className={labelClass}>Google Maps Location URL</label><input type="url" name="mapsUrl" placeholder="Google Maps Link" value={formData.mapsUrl} onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })} className={inputClass} /></div>
                                <div><label className={labelClass}>Latitude</label><input type="text" name="latitude" placeholder="25.2852° N" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className={inputClass} /></div>
                                <div><label className={labelClass}>Longitude</label><input type="text" name="longitude" placeholder="55.3598° E" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className={inputClass} /></div>
                                <div className="md:col-span-2"><label className={labelClass}>Operation Timing</label><input type="text" name="timing" placeholder="e.g. 24 Hours" value={formData.timing} onChange={(e) => setFormData({ ...formData, timing: e.target.value })} className={inputClass} /></div>
                                {/* Updated Label */}
                                <div className="md:col-span-2"><label className={labelClass}>Location TRN / Registered Address</label><textarea rows={3} name="address" placeholder="Registered Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`${inputClass} resize-none`} /></div>
                            </div>
                        
                        </div>
                    )}

                    {/* STEP 2: USERS */}
                    {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                              <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    On-Site User Setup
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Internal users + operational setup details.
                  </p>
                </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Updated Label */}
                                <div><label className={labelClass}>Number of lobbies / entrances</label><input type="number" name="lobbies" placeholder="e.g. 2" value={formData.lobbies} onChange={handleChange} className={inputClass} /></div>
                                {/* Updated Label */}
                                <div><label className={labelClass}>Number of key control rooms</label><input type="number" name="keyRooms" placeholder="e.g. 1" value={formData.keyRooms} onChange={handleChange} className={inputClass} /></div>
                                {/* Updated Label */}
                                <div className="md:col-span-2"><label className={labelClass}>Distance between lobby & key room</label><input type="text" name="distance" placeholder="e.g. 50 meters" value={formData.distance} onChange={handleChange} className={inputClass} /></div>
                                
                                {/* Radio Groups */}
                                {[
                                        { label: "Supervisor user required?", name: "supervisorUser" },
                                        { label: "Ticket validation user?", name: "validationUser" },
                                        { label: "Finance report access?", name: "reportUser" }
                                ].map((item) => (
                                    <div key={item.name} className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                                            <p className={`text-sm font-medium mb-2 text-gray-900 dark:text-gray-100`}>{item.label}</p>
                                            <div className="flex gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                                                    <input type="radio" name={item.name} value="yes" checked={(formData as any)[item.name] === "yes"} onChange={handleChange} className="accent-[#007bff] w-4 h-4" /> Yes
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                                                    <input type="radio" name={item.name} value="no" checked={(formData as any)[item.name] === "no"} onChange={handleChange} className="accent-[#007bff] w-4 h-4" /> No
                                                </label>
                                            </div>
                                    </div>
                                ))}
                            </div>
                        
                        </div>
                    )}

                    {/* STEP 3: PRICING */}
                    {currentStep === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                             <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    Valet Ticket & Pricing
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tell us how tickets are generated and how you charge guests.
                  </p>
                </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                                    <label className={`${labelClass} mb-2 block`}>Ticket Type</label>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="ticketType" value="pre-printed" checked={formData.ticketType === "pre-printed"} onChange={handleChange} className="accent-[#007bff] w-4 h-4" /> Pre-printed ticket</label>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="ticketType" value="system-generated" checked={formData.ticketType === "system-generated"} onChange={handleChange} className="accent-[#007bff] w-4 h-4" /> Ticket generated by system</label>
                                    </div>
                                </div>
                                <div className="md:col-span-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                                    {/* Updated Label */}
                                    <label className={`${labelClass} mb-2 block`}>Valet Fee Type</label>
                                    <div className="flex flex-wrap gap-4">
                                        {["fixed", "hourly", "Free (complimentary)"].map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                <input type="radio" name="feeType" value={type} checked={formData.feeType === type} onChange={handleChange} className="accent-[#007bff] w-4 h-4" /> {type}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={`${labelClass} flex items-center gap-1`}>Ticket Prices (AED) <Banknote className="w-4 h-4 text-gray-400" /></label>
                                    <textarea rows={2} name="ticketPricing" placeholder="e.g. Standard: 50 AED, VIP: 100 AED" value={formData.ticketPricing} onChange={handleChange} className={inputClass} />
                                </div>
                                <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                                    <label className={`${labelClass} mb-2 block`}>VAT Handling</label>
                                    <div className="flex gap-4">
                                        {["inclusive", "exclusive"].map(type => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                <input type="radio" name="vatType" value={type} checked={formData.vatType === type} onChange={handleChange} className="accent-[#007bff] w-4 h-4" /> {type}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    )}

                    {/* STEP 4: DRIVERS */}
                    {currentStep === 4 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                  <div>
                                              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <UserCog className="w-5 h-5 text-[#007bff] dark:text-blue-500" />{" "}
                                                Drivers / CVA Team
                                              </h2>
                                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Details of drivers who will be mapped to this location.
                                              </p>
                                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className={`${labelClass} flex items-center gap-1 mb-1`}>Number of drivers <Users className="w-4 h-4 text-gray-400" /></label>
                                    <input type="number" name="driverCount" placeholder="e.g. 15" value={formData.driverCount} onChange={handleChange} className={inputClass} />
                                </div>
                                <div className="col-span-2">
                                    {/* Updated Label */}
                                    <label className={`${labelClass} flex items-center gap-1 mb-1`}>Drivers list (Employee ID & full name) <FileText className="w-4 h-4 text-gray-400" /></label>
                                    <textarea rows={6} name="driverList" placeholder={`e.g.\n1001 - John Doe\n1002 - Jane Smith`} value={formData.driverList} onChange={handleChange} className={`${inputClass} font-mono text-sm resize-none`} />
                                    <p className="text-xs text-[#007bff] dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">ℹ️ Large lists can be emailed separately.</p>
                                </div>
                            </div>
                        
                        </div>
                    )}

                    {/* STEP 5: ADMIN */}
                    {currentStep === 5 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
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
                            <div className="space-y-4">
                                <div><label className={labelClass}>Full Name <span className="text-red-500">*</span></label><input type="text" name="adminName" placeholder="e.g. Ayush Aggarwal" value={formData.adminName} onChange={handleChange} className={`${inputClass} ${errors.adminName ? "border-red-500" : ""}`} />{errors.adminName && <p className="text-xs text-red-500">{errors.adminName}</p>}</div>
                                <div><label className={labelClass}>Email Address <span className="text-red-500">*</span></label><input type="email" name="adminEmail" placeholder="e.g. admin@example.com" value={formData.adminEmail} onChange={handleChange} className={`${inputClass} ${errors.adminEmail ? "border-red-500" : ""}`} />{errors.adminEmail && <p className="text-xs text-red-500">{errors.adminEmail}</p>}</div>
                                {/* Updated Label */}
                                <div><label className={labelClass}>Mobile / WhatsApp Number <span className="text-red-500">*</span></label><input type="tel" name="adminPhone" placeholder="e.g. 971521234567" value={formData.adminPhone} onChange={handleChange} className={`${inputClass} ${errors.adminPhone ? "border-red-500" : ""}`} />{errors.adminPhone && <p className="text-xs text-red-500">{errors.adminPhone}</p>}</div>
                                
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                                    {/* Updated Label */}
                                    <label className={`${labelClass} mb-3 block`}>Super admin will receive full application training</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="trainingRequired" value="yes" checked={formData.trainingRequired === "yes"} onChange={handleChange} className="accent-[#007bff] w-4 h-4" /> Yes</label>
                                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="trainingRequired" value="no" checked={formData.trainingRequired === "no"} onChange={handleChange} className="accent-[#007bff] w-4 h-4" /> No</label>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    )}

                    {/* STEP 6: DOCS */}
                    {currentStep === 6 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                              <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    📎 Required Documents
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Upload now or submit later via email/WhatsApp.
                  </p>
                </div>
                            {/* ✅ Updated File Upload Blocks with Error Handling and Correct Labels */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FileUploadBlock label="Company Logo (JPG/PNG)" name="logoCompany" accept="image/*" file={formData.logoCompany} setFormData={setFormData} error={errors.logoCompany} setErrors={setErrors} />
                                <FileUploadBlock label="Client Logo (JPG/PNG)" name="logoClient" accept="image/*" file={formData.logoClient} setFormData={setFormData} error={errors.logoClient} setErrors={setErrors} />
                                <FileUploadBlock label="VAT Certificate (PDF)" name="vatCertificate" accept="application/pdf" file={formData.vatCertificate} setFormData={setFormData} error={errors.vatCertificate} setErrors={setErrors} />
                                <FileUploadBlock label="Trade License (PDF)" name="tradeLicense" accept="application/pdf" file={formData.tradeLicense} setFormData={setFormData} error={errors.tradeLicense} setErrors={setErrors} />
                            </div>
                            <div>
                                {/* Updated Label */}
                                <label className={labelClass}>How will you send documents?</label>
                                <textarea rows={3} name="documentSubmitMethod" placeholder="e.g. Emailing later" value={formData.documentSubmitMethod} onChange={handleChange} className={inputClass} />
                            </div>
                            
                        </div>
                    )}
                </div>
                {/* FOOTER */}
                <div
                    className="
                        shrink-0 bg-white dark:bg-gray-900 
                        border-t border-gray-300 dark:border-gray-700 
                        px-4 py-4 
                        flex flex-row items-center justify-between gap-4 flex-wrap
                    "
                >
                    {/* Back Button */}
                    {currentStep > 1 ? (
                        <button 
                            onClick={() => setCurrentStep(prev => prev - 1)} 
                            disabled={isSaving}
                            className={`
                                flex items-center gap-2 
                                px-4 py-2 rounded-lg text-sm font-medium
                                border border-gray-400 dark:border-gray-700
                                text-gray-700 dark:text-gray-200
                                bg-white dark:bg-gray-900
                                hover:bg-gray-100 dark:hover:bg-gray-800
                                active:scale-[0.98]
                                transition-all duration-200
                                shadow-sm
                                ${isSaving ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                        >
                            ← Back
                        </button>
                    ) : (
                        <span />
                    )}

                    {/* Right Buttons */}
                    <div className="flex flex-row items-center gap-3 flex-wrap">

                        {/* Next or Submit */}
                        {currentStep < 6 ? (
                            <button
                                onClick={handleNext}
                                disabled={isSaving}
                                className="
                                    bg-[#007bff] hover:bg-blue-700 
                                    text-white px-5 py-2 rounded-lg 
                                    shadow-md transition-all
                                "
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                onClick={handleFinalSubmit}
                                disabled={isSaving}
                                className={`px-6 py-2 rounded-lg shadow-md transition-all text-white 
                                    ${isSaving ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
                                `}
                            >
                                {isSaving ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 104 12z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    "Finish & Submit"
                                )}
                            </button>

                        )}
                    </div>
                </div>


            </div>
            
        </div>
    );
};


// --- BREADCRUMB COMPONENT ---
interface BreadcrumbProps {
    pageTitle: string;
    onLeadAdded?: () => void;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, onLeadAdded }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
                    {pageTitle}
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="
                        inline-flex items-center justify-center gap-2 
                        w-fit sm:w-auto px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors
                        bg-[#007bff] hover:bg-[#007bff] text-white
                        dark:bg-[#007bff] dark:hover:bg-blue-500
                    "
                >

                    <Plus className="w-4 h-4" />
                    Add New Lead
                </button>
            </div>

            {isModalOpen && <LeadFormModal onClose={() => setIsModalOpen(false)} onLeadAdded={() => {
                if(onLeadAdded) onLeadAdded();
            }}/>}
        </>
    );
};

export default PageBreadcrumb;