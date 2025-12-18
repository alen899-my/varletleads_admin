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
import ReviewModal from "@/components/ReviewModal"
import { z } from "zod";
// --- FORM COMPONENT (Internal Modal with Dark Mode) ---
const LeadFormModal = ({ onClose, onLeadAdded }: { onClose: () => void, onLeadAdded: () => void }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [wizardError, setWizardError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    // State additions
const [showReviewModal, setShowReviewModal] = useState(false);
const [isPdfUploading, setIsPdfUploading] = useState(false);
const [referenceId, setReferenceId] = useState(null);
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
const leadSchema = z.object({
    locationName: z.string().min(1, "Location name is required."),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1").max(1500, "Capacity cannot exceed 1500"),
    adminName: z.string().min(1, "Full name is required."),
    adminEmail: z.string().email("Enter a valid email address."),
    adminPhone: z
        .string()
        .regex(/^[0-9]+$/, "Only numbers allowed.")
        .min(8, "Phone number must be at least 8 digits.")
        .max(14, "Phone number cannot exceed 14 digits."),
});
    // --- CLICK OUTSIDE & ESCAPE KEY LOGIC ---
    useEffect(() => {
    const handler = (e: MouseEvent) => {
        // IMPORTANT: If review modal is open, do not trigger the close logic
        if (showReviewModal) return; 

        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
}, [onClose, showReviewModal]); // Add showReviewModal to dependencies

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
        ticketType: [], 
feeType: [],
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
    // Extract Lat/Long when URL is pasted
    const handleMapUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        let newLat = formData.latitude;
        let newLng = formData.longitude;

        const coordRegex = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/;
        const match = url.match(coordRegex);

        if (match) {
            const coords = match[0].split(",");
            if (coords.length === 2) {
                newLat = coords[0].trim();
                newLng = coords[1].trim();
            }
        }

        setFormData((prev: any) => ({
            ...prev,
            mapsUrl: url,
            latitude: newLat,
            longitude: newLng,
        }));
    };

    // Generate URL when Lat or Long is typed
    const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => {
            const newData = { ...prev, [name]: value };
            if (newData.latitude && newData.longitude) {
                newData.mapsUrl = `https://www.google.com/maps?q=${newData.latitude},${newData.longitude}`;
            }
            return newData;
        });
    };
    // Review Trigger
const handleReviewClick = () => {
    if (!validateStep1() || !validateStep5()) {
        setWizardError("Please check required fields.");
        return;
    }
    if (!validateStep6()) return; // Your existing file validation
    setWizardError("");
    setShowReviewModal(true);
};
  const handleTicketTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev: any) => {
        const current = Array.isArray(prev.ticketType) ? prev.ticketType : [];
        return {
            ...prev,
            ticketType: checked 
                ? [...current, value] 
                : current.filter((item: string) => item !== value)
        };
    });
};

const handleFeeTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev: any) => {
        const current = Array.isArray(prev.feeType) ? prev.feeType : [];
        return {
            ...prev,
            feeType: checked 
                ? [...current, value] 
                : current.filter((item: string) => item !== value)
        };
    });
};
    const handleFinalSubmit = async () => {
    // 1. Validation Checks
    if (!validateStep1() || !validateStep5()) {
        setWizardError("Please check required fields.");
        return;
    }

    if (!validateStep6()) {
        setWizardError("Please resolve the errors in the document section (Max size 500KB).");
        return;
    }

    setIsSaving(true);
    const formDataToSend = new FormData();

    // 2. Optimized Data Appending
    Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            // IMPORTANT: Convert arrays (ticketType/feeType) to comma-separated strings for the DB
            formDataToSend.append(key, value.join(", "));
        } else if (value !== null && typeof value !== "object") {
            formDataToSend.append(key, value as string);
        }
    });

    // 3. Append Files (Ensure field names match your Multer/Backend configuration)
    if (formData.logoCompany) formDataToSend.append("companyLogo", formData.logoCompany);
    if (formData.logoClient) formDataToSend.append("clientLogo", formData.logoClient);
    if (formData.vatCertificate) formDataToSend.append("vatCertificate", formData.vatCertificate);
    if (formData.tradeLicense) formDataToSend.append("tradeLicense", formData.tradeLicense);

    try {
        const res = await fetch("/api/leads", {
            method: "POST",
            body: formDataToSend,
        });

        const data = await res.json();

        if (res.ok && data.success) {
            setIsSubmitted(true);
            setShowReviewModal(false); // Close the review popup on success

            // 4. Reset Form to correct Initial State
            setFormData({
                locationName: "", capacity: "", waitTime: "", mapsUrl: "", latitude: "", longitude: "", timing: "", address: "",
                lobbies: "", keyRooms: "", distance: "", supervisorUser: "no", validationUser: "no", reportUser: "no",
                ticketType: [], // Reset to array
                feeType: [],    // Reset to array
                ticketPricing: "", vatType: "inclusive", driverCount: "", driverList: "",
                adminName: "", adminEmail: "", adminPhone: "", trainingRequired: "yes",
                logoCompany: null, logoClient: null, vatCertificate: null, tradeLicense: null, documentSubmitMethod: ""
            });

            router.refresh();
            
            // Give user time to see success message before closing main modal
            setTimeout(() => {
                if (onLeadAdded) onLeadAdded();
                onClose();
            }, 1500);

        } else {
            alert("⚠️ Submission failed: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("❌ Network error. Please try again.");
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
    const result = leadSchema.pick({ locationName: true, capacity: true }).safeParse(formData);
    
    if (!result.success) {
        const formattedErrors: any = {};
        result.error.issues.forEach((issue) => {
            formattedErrors[issue.path[0]] = issue.message;
        });
        setErrors((prev: any) => ({ ...prev, ...formattedErrors }));
        return false;
    }
    setErrors((prev: any) => ({ ...prev, locationName: "", capacity: "" }));
    return true;
};
    const validateStep2 = () => true;
    const validateStep3 = () => true;
    const validateStep4 = () => true;
const validateStep5 = () => {
    const result = leadSchema.pick({ adminName: true, adminEmail: true, adminPhone: true }).safeParse(formData);
    
    if (!result.success) {
        const formattedErrors: any = {};
        result.error.issues.forEach((issue) => {
            formattedErrors[issue.path[0]] = issue.message;
        });
        setErrors((prev: any) => ({ ...prev, ...formattedErrors }));
        return false;
    }
    setErrors((prev: any) => ({ ...prev, adminName: "", adminEmail: "", adminPhone: "" }));
    return true;
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
                    bg-white dark:bg-gray-900 dark:border-gray-600
                    flex flex-col rounded-xl overflow-hidden
                `}>


               {/* --- HEADER (Fixed) --- */}
<div className="shrink-0 bg-black border-b border-gray-800 px-6 py-1 flex justify-between items-center z-30">
  <div>
    <h2 className="text-xl font-bold text-white flex items-center gap-3">
      <UserCog className="w-6 h-6 text-[#007bff]" />
      Add Lead Details
    </h2>
    <p className="text-[12px] text-gray-400 mt-1 font-medium tracking-wide uppercase opacity-90">
      Enter new client information & registration data
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
                                            ${isActive
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
                Basic details about the property where valet parking will be operated.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Name */}
            <div className="md:col-span-1">
                <label className={labelClass}>Location Name <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    name="locationName" 
                    placeholder="e.g. Grand Hyatt Dubai" 
                    value={formData.locationName} 
                    onChange={handleChange} 
                    className={`${inputClass} ${errors.locationName ? "border-red-500" : ""}`} 
                />
                {errors.locationName && <small className="text-red-500 text-xs">{errors.locationName}</small>}
            </div>

            {/* Parking Capacity */}
            <div>
                <label className={labelClass}>Parking Capacity <span className="text-red-500">*</span></label>
                <input 
                    type="number" 
                    name="capacity" 
                    placeholder="Total slots" 
                    value={formData.capacity} 
                    onChange={handleChange} 
                    className={`${inputClass} ${errors.capacity ? "border-red-500" : ""}`} 
                />
                {errors.capacity && <small className="text-red-500 text-xs">{errors.capacity}</small>}
            </div>

            {/* Waiting Time */}
            <div>
                <label className={labelClass}>Average Waiting Time</label>
                <input 
                    type="text" 
                    name="waitTime" 
                    placeholder="e.g. 10 – 15 mins" 
                    value={formData.waitTime} 
                    onChange={handleChange} 
                    className={inputClass} 
                />
            </div>

            {/* Operation Timing */}
            <div className="md:col-span-1">
                <label className={labelClass}>Operation Timing</label>
                <input 
                    type="text" 
                    name="timing" 
                    placeholder="e.g. 24 Hours / 10 AM – 2 AM" 
                    value={formData.timing} 
                    onChange={handleChange} 
                    className={inputClass} 
                />
            </div>

            {/* Latitude - Coordinate Handler */}
            <div>
                <label className={labelClass}>Latitude</label>
                <input 
                    type="text" 
                    name="latitude" 
                    placeholder="e.g. 25.2852" 
                    value={formData.latitude} 
                    onChange={handleCoordinateChange} 
                    className={inputClass} 
                />
            </div>

            {/* Longitude - Coordinate Handler */}
            <div>
                <label className={labelClass}>Longitude</label>
                <input 
                    type="text" 
                    name="longitude" 
                    placeholder="e.g. 55.3598" 
                    value={formData.longitude} 
                    onChange={handleCoordinateChange} 
                    className={inputClass} 
                />
            </div>
            {/* Google Maps URL - Extraction Handler */}
            <div>
                <label className={labelClass}>Google Maps Location URL</label>
                <input 
                    type="url" 
                    name="mapsUrl" 
                    placeholder="Paste Google Maps link here" 
                    value={formData.mapsUrl} 
                    onChange={handleMapUrlChange} 
                    className={inputClass} 
                />
            </div>
            

            {/* TRN / Address */}
            <div className="md:col-span-1">
                <label className={labelClass}>Location TRN / Registered Address</label>
                <textarea 
                    rows={3} 
                    name="address" 
                    placeholder="Enter TRN and full registered address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    className={`${inputClass} resize-none`} 
                />
            </div>
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
                                <div className="md:col-span-1"><label className={labelClass}>Distance between lobby & key room</label><input type="text" name="distance" placeholder="e.g. 50 meters" value={formData.distance} onChange={handleChange} className={inputClass} /></div>

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

                   {/* STEP 3: VALET TICKET & PRICING */}
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
            {/* Ticket Type - Multi Select */}
            <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                <label className={`${labelClass} mb-3 block`}>
                    Ticket Type <span className="text-gray-400 text-xs font-normal">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                    {[
                        { id: "pre-printed-paper", label: "Pre-printed ticket paper" },
                        { id: "pre-printed-plastic", label: "Pre-printed reusable plastic" },
                        { id: "system-generated", label: "System generated ticket" },
                        { id: "e-ticket", label: "E-ticket" },
                    ].map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                value={opt.id}
                                checked={formData.ticketType?.includes(opt.id)}
                                onChange={handleTicketTypeChange}
                                className="w-4 h-4 rounded accent-[#007bff]"
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Valet Fee Type - Multi Select */}
            <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                <label className={`${labelClass} mb-3 block`}>
                    Valet Fee Type <span className="text-gray-400 text-xs font-normal">(Select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                    {[
                        { id: "fixed", label: "Fixed Fee" },
                        { id: "hourly", label: "Hourly" },
                        { id: "free", label: "Free (Complimentary)" },
                    ].map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                value={opt.id}
                                checked={formData.feeType?.includes(opt.id)}
                                onChange={handleFeeTypeChange}
                                className="w-4 h-4 rounded accent-[#007bff]"
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Ticket Pricing Textarea */}
            <div className="md:col-span-2">
                <label className={`${labelClass} flex items-center gap-1 mb-1`}>
                    Ticket Prices (AED) <Banknote className="w-4 h-4 text-gray-400" />
                </label>
                <textarea
                    rows={2}
                    name="ticketPricing"
                    placeholder="e.g. Standard: 50 AED, VIP: 100 AED..."
                    value={formData.ticketPricing}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                />
                <p className="text-[10px] text-gray-400 mt-1">Mention separate pricing for different categories if applicable.</p>
            </div>

            {/* VAT Handling - Single Select */}
            <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                <label className={`${labelClass} mb-2 block`}>Tax Handling (VAT)</label>
                <div className="flex gap-8">
                    {["inclusive", "exclusive"].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 capitalize">
                            <input
                                type="radio"
                                name="vatType"
                                value={type}
                                checked={formData.vatType === type}
                                onChange={handleChange}
                                className="accent-[#007bff] w-4 h-4"
                            />
                            {type}
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
               {/* --- FOOTER ACTIONS (Compact & Responsive) --- */}
<div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-6 sm:py-3 z-30">
  <div className="flex flex-row items-center justify-between w-full gap-3">
    
    {/* LEFT SIDE: Back Button */}
    <div className="flex-1 flex justify-start"> 
      {currentStep > 1 && (
        <button 
          onClick={() => setCurrentStep(prev => prev - 1)} 
          disabled={isSaving}
          className="h-9 sm:h-10 flex items-center gap-2 px-2 sm:px-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#007bff] dark:hover:text-blue-400 transition-all group disabled:opacity-50 active:scale-95"
        >
          <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
            <ArrowRight className="rotate-180 w-3.5 h-3.5" /> 
          </div>
          <span className="hidden sm:inline">Back</span>
        </button>
      )}
    </div>

    {/* RIGHT SIDE: Next / Review Group */}
    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
      {currentStep < 6 ? (
        <button 
          onClick={handleNext} 
          className="flex-1 sm:flex-none min-w-[90px] sm:min-w-[120px] h-9 sm:h-10 flex items-center justify-center gap-2 px-5 bg-[#007bff] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          Next 
          <ArrowRight size={16} />
        </button>
      ) : (
        <button 
          onClick={handleReviewClick} 
          className="flex-1 sm:flex-none min-w-[150px] sm:min-w-[180px] h-9 sm:h-10 flex items-center justify-center gap-2 px-5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-md transition-all active:scale-95 animate-in fade-in zoom-in-95"
        >
          Review & Finalize
          <CheckCircle size={16} />
        </button>
      )}
    </div>
    
  </div>
</div>


            </div>
{/* After the Footer Actions </div> */}
<ReviewModal
    isOpen={showReviewModal}
    onClose={() => setShowReviewModal(false)}
    onSubmit={handleFinalSubmit} // This calls your API POST logic
    formData={formData}
    existingFiles={{}} // Empty for new leads
    isSubmitting={isSaving}
    themeColor="#007bff"
/>
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
                if (onLeadAdded) onLeadAdded();
            }} />}
        </>
    );
};

export default PageBreadcrumb;