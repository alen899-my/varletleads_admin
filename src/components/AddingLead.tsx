"use client";
import { useState, useEffect,useMemo } from "react";

import { LeadPDFDocument } from "@/components/LeadPDFDocument"; // Adjust path

import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
// CHANGE: Add 'Share' and 'ExternalLink' icons
import { Download, Share, ExternalLink, MessageCircle,Home } from "lucide-react";
import {
  CarFront,
  MapPin,
  Clock,
  Navigation,
  Building2,
  ArrowRight,
  Upload,
  Users,
  FileBarChart,
  DoorOpen,
  Key,
  Ruler,
  ShieldCheck,
  Ticket,
  Coins,
  Banknote,
  Receipt,
  Percent,
  UserCog,
  FileText,
  ShieldUser,
  User,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle,
  Lock, 
} from "lucide-react";
import { useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import ReviewModal from "@/components/ReviewModal"; // Adjust path based on where you saved it

export default function Page() {
  // Get ID from URL parameters
  const router = useRouter();
  const params = useParams();
  // explicit cast to avoid type errors if params is null
  const leadId = (params as any)?.id;
  const isEditMode = !!leadId;
  const [referenceId, setReferenceId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [wizardError, setWizardError] = useState("");

  // --- NEW STATE FOR READ-ONLY MODE ---
  const [isReadOnly, setIsReadOnly] = useState(false);
   const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  // --------------------------------
  // --- MODIFIED: State for both logo previews ---
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [clientLogoPreview, setClientLogoPreview] = useState<string | null>(null);
// --- NEW: REVIEW MODAL STATE ---
  const [showReviewModal, setShowReviewModal] = useState(false);
  
const [isClient, setIsClient] = useState(false); // <--- ADD THIS
  
  // Typed as any to allow dynamic property assignment
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

  // State to hold details of existing attachments
  const [existingFiles, setExistingFiles] = useState<any>({
    logoCompany: null, // Will hold {id: string, filename: string, path: string}
    logoClient: null,
    vatCertificate: null,
    tradeLicense: null,
  });


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
    supervisorUser: "yes",
    validationUser: "no",
    reportUser: "yes",

    // STEP 3
    ticketType: [],
    feeType:[],
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
    documentSubmitMethod: "",
  });

  // --- LOGO PREVIEW LOGIC (COMPANY) ---
  useEffect(() => {
    if (formData.logoCompany instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setCompanyLogoPreview(reader.result as string);
      reader.readAsDataURL(formData.logoCompany);
      return;
    }

    // FIX: Check if the object exists and has a PATH (Vercel Blob URL)
    if (existingFiles.logoCompany?.path) {
      // Use the path (Blob URL) directly as the src
      setCompanyLogoPreview(existingFiles.logoCompany.path);
      return;
    }

    setCompanyLogoPreview(null);
  }, [formData.logoCompany, existingFiles.logoCompany]);


  // --- LOGO PREVIEW LOGIC (CLIENT) ---
  useEffect(() => {
    if (formData.logoClient instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setClientLogoPreview(reader.result as string);
      reader.readAsDataURL(formData.logoClient);
      return;
    }

    // FIX: Check if the object exists and has a PATH (Vercel Blob URL)
    if (existingFiles.logoClient?.path) {
      // Use the path (Blob URL) directly as the src
      setClientLogoPreview(existingFiles.logoClient.path);
      return;
    }

    setClientLogoPreview(null);
  }, [formData.logoClient, existingFiles.logoClient]);


  // --- NEW: FETCH DATA IF EDIT MODE ---
  useEffect(() => {
    if (isEditMode) {
      const fetchLeadData = async () => {
        try {
          // Assuming you have a GET route that matches the PUT route path structure
          const res = await fetch(`/api/all-leads/${leadId}`);
          const data = await res.json();

          if (data.success && data.lead) {
            const l = data.lead;

            // --- NEW CHECK: IF COMPLETED, SET READ ONLY ---
            if (l.status === "completed") {
              setIsReadOnly(true);
            }

            // Map DB attachments to UI state keys
            const fileMap: any = {};
            if (l.attachments) {
              l.attachments.forEach((att: any) => {
                // Modified: We now look for 'path'
                if (att.filename) {
                    const fileObject = {
                        id: att._id || att.fileId,
                        filename: att.filename,
                        path: att.path // <--- THIS WILL NOW BE A VERCEL BLOB URL
                    };
                      
                    if (att.fieldname === "companyLogo")
                        fileMap.logoCompany = fileObject;
                    if (att.fieldname === "clientLogo")
                        fileMap.logoClient = fileObject;
                    if (att.fieldname === "vatCertificate")
                        fileMap.vatCertificate = fileObject;
                    if (att.fieldname === "tradeLicense")
                        fileMap.tradeLicense = fileObject;
                }
              });
              setExistingFiles((prev: any) => ({ ...prev, ...fileMap }));
            }

            // Populate Text Fields
            setFormData((prev: any) => ({
              ...prev,
              locationName: l.locationName || "",
              capacity: l.capacity || "",
              waitTime: l.waitTime || "",
              mapsUrl: l.mapsUrl || "",
              latitude: l.latitude || "",
              longitude: l.longitude || "",
              timing: l.timing || "",
              address: l.address || "",
              lobbies: l.lobbies || "",
              keyRooms: l.keyRooms || "",
              distance: l.distance || "",
              supervisorUser: l.supervisorUser || "yes",
              validationUser: l.validationUser || "no",
              reportUser: l.reportUser || "yes",
              ticketType: l.ticketType || "system-generated",
              feeType: l.feeType || "free",
              ticketPricing: l.ticketPricing || "",
              vatType: l.vatType || "inclusive",
              driverCount: l.driverCount || "",
              driverList: l.driverList || "",
              adminName: l.adminName || "",
              adminEmail: l.adminEmail || "",
              adminPhone: l.adminPhone || "",
              trainingRequired: l.trainingRequired || "yes",
              documentSubmitMethod: l.documentSubmitMethod || "",
            }));
          }
        } catch (error) {
          console.error("Failed to fetch lead data", error);
        }
      };
      fetchLeadData();
    }
  }, [leadId, isEditMode]);

  useEffect(() => {
    setIsClient(true);
  }, []);




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
  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
  ) => {
    // Prevent changes if read-only
    if (isReadOnly) return;

    const { name, value, type } = e.target;
    // Cast to HTMLInputElement to access .files property safely
    const files = (e.target as HTMLInputElement).files;

    if (type === "file" && files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const step5Schema = z.object({
    adminName: z.string().min(1, "Full name is required."),
    adminEmail: z.string().email("Enter a valid email address."),
    adminPhone: z
      .string()
      .regex(/^[0-9]+$/, "Only numbers allowed.")
      .min(8, "Phone number must be at least 8 digits.")
      .max(14, "Phone number cannot exceed 14 digits."),
  });

  const capacitySchema = z
    .number()
    .min(1, { message: "Capacity must be at least 1" })
    .max(1500, { message: "Capacity cannot exceed 1500" });
  const handleTicketTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev: any) => {
      // Ensure current is an array (safety check)
      const current = Array.isArray(prev.ticketType) ? prev.ticketType : [];
      
      if (checked) {
        // Add to array
        return { ...prev, ticketType: [...current, value] };
      } else {
        // Remove from array
        return { ...prev, ticketType: current.filter((item: string) => item !== value) };
      }
    });
  };
  const handleFeeTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev: any) => {
      // Ensure current is an array (safety check)
      const current = Array.isArray(prev.feeType) ? prev.feeType : [];
      
      if (checked) {
        // Add to array
        return { ...prev, feeType: [...current, value] };
      } else {
        // Remove from array
        return { ...prev, feeType: current.filter((item: string) => item !== value) };
      }
    });
  };
  // 1. Handle extracting Lat/Long when URL is pasted
  const handleMapUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    let newLat = formData.latitude;
    let newLng = formData.longitude;

    // Regex to find coordinates in Google Maps URL (looks for patterns like @25.123,55.123 or q=25.123,55.123)
    // Matches typical lat,long pattern
    const coordRegex = /(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/;
    const match = url.match(coordRegex);

    if (match) {
      // split the match to get lat and long
      // usually found as "25.276987,55.296249"
      const coords = match[0].split(",");
      if(coords.length === 2) {
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

  // 2. Handle generating URL when Lat or Long is typed
  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev: any) => {
      const newData = { ...prev, [name]: value };
      
      // Only generate URL if BOTH lat and long are present and URL is empty or auto-generated
      if (newData.latitude && newData.longitude) {
        newData.mapsUrl = `https://www.google.com/maps?q=${newData.latitude},${newData.longitude}`;
      }
      
      return newData;
    });
  };

  // --- NEW: TRIGGER REVIEW POPUP ---
  const handleReviewClick = () => {
     // Run validation for the last step before showing review
     if (!validateStep6()) {
        setWizardError("Please resolve the errors in the document section (Max size 500KB).");
        return;
     }
     setWizardError(""); // Clear errors
     setShowReviewModal(true); // Open the modal
  };
   const uploadPdfToBlob = async (finalRefId: string, finalFormData: any, finalExistingFiles: any) => {
    setIsPdfUploading(true);
    console.log("Starting PDF generation and upload process...");

    try {
      const blob = await pdf(
        <LeadPDFDocument 
            formData={finalFormData} 
            existingFiles={finalExistingFiles} // ✅ Pass it here
            referenceId={finalRefId} 
        />
      ).toBlob();

      if (!blob) throw new Error("Failed to generate PDF blob");

      // 2. Prepare form data for upload
      const filename = `Valet_Registration_${finalRefId}.pdf`;
      const file = new File([blob], filename, { type: "application/pdf" });
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("filename", filename);

      // 3. Send to our Next.js API route
      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) throw new Error(`Upload failed with status: ${res.status}`);

      const data = await res.json();
      if (data.success && data.url) {
        console.log("PDF uploaded successfully. URL:", data.url);
        setPdfUrl(data.url); // Save the Vercel Blob URL to state
        // Optional: If you wanted to save this URL back to your Mongo DB, you would do a second API call here to update the lead.
      } else {
        throw new Error(data.error || "Unknown upload error");
      }

    } catch (error) {
      console.error("Error during PDF upload flow:", error);
      // You might want to set a specific error state here if you want to show a retry button later
      setWizardError("Form submitted, but PDF generation failed. Please contact support.");
    } finally {
      setIsPdfUploading(false);
    }
  };
const handleFinalSubmit = async () => {
    // --- NEW CHECK: STOP SUBMIT IF READ ONLY ---
    if (isReadOnly) {
      setWizardError("This lead is marked as COMPLETED and cannot be edited.");
      window.scrollTo(0, 0);
      return;
    }
    
    // Final Validation Check before submitting (checks all, including file sizes)
    if (!validateStep6()) {
        setWizardError("Please resolve the errors in the document section (Max size 500KB).");
        window.scrollTo(0, 0);
        return;
    }

    setIsSubmitting(true);
    setWizardError(""); // Clear previous errors
    
    const formDataToSend = new FormData();

    // Append all text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Convert array to comma-separated string (e.g., "e-ticket, pre-printed")
        formDataToSend.append(key, value.join(", ")); 
      } else if (value !== null && typeof value !== "object") {
        formDataToSend.append(key, value as string);
      }
    });

    // Attach files 
    if (formData.logoCompany) formDataToSend.append("companyLogo", formData.logoCompany);
    if (formData.logoClient) formDataToSend.append("clientLogo", formData.logoClient);
    if (formData.vatCertificate) formDataToSend.append("vatCertificate", formData.vatCertificate);
    if (formData.tradeLicense) formDataToSend.append("tradeLicense", formData.tradeLicense);

    // --- SUBMISSION LOGIC ---
    let url = "/api/leads";
    let method = "POST";

    if (isEditMode) {
      url = `/api/all-leads/${leadId}`;
      method = "PUT";
    }

    try {
      // Submit request
      const res = await fetch(url, {
        method: method,
        body: formDataToSend,
      });

      // Fix: Prevent JSON parse error if server crashed
      if (!res.ok) {
        setWizardError("❌ Error submitting form. Server returned: " + res.status);
        setIsSubmitting(false); 
        window.scrollTo(0, 0); // Scroll to top to show error
        return;
      }

      const data = await res.json();

      if (data.success) {
       const finalRefId = data.referenceId ?? data.lead?.referenceId ?? referenceId;
        setReferenceId(finalRefId);
       try {
            // Keep the modal open so the user sees "Submitting..." while PDF generates
           await uploadPdfToBlob(finalRefId, formData, existingFiles);
        } catch (pdfError) {
            console.error("PDF Upload failed but Lead saved", pdfError);
            // Optional: You might want to warn the user here, 
            // but we usually proceed to success since the Lead is saved.
        }
        setShowReviewModal(false);
       

        // 3. Only show success state after everything is done
        setIsSubmitted(true);
        setWizardError(""); // Clear any errors on success

        if (!isEditMode) {
         
        }
      } else {
        // Show API error message in the div
        setWizardError("⚠️ Submission failed: " + data.message);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      setWizardError("⚠️ Network error. Please try again.");
      window.scrollTo(0, 0);
    }
    
    setIsSubmitting(false);
  };
// ... place this before handleFinalSubmit ...

  // --- NEW FUNCTION: Generate PDF Blob and Upload to Vercel ---

// ...
  const validateStep1 = () => {
    let newErrors: any = {};

    if (!formData.locationName.trim()) {
      newErrors.locationName = "Location name is required.";
    }

    try {
      capacitySchema.parse(Number(formData.capacity));
    } catch (err: any) {
      newErrors.capacity =
        err.errors?.[0]?.message || "Minimum 1 Slot Required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const validateStep2 = () => {
    return true; 
  };

  const validateStep3 = () => {
    return true; 
  };

  const validateStep4 = () => {
    return true;
  };
  const validateStep5 = () => {
    // Normalize values before validation
    const payload = {
      adminName: formData.adminName?.trim() || "",
      adminEmail: formData.adminEmail?.trim() || "",
      adminPhone: formData.adminPhone?.replace(/\D/g, "") || "",
    };

    const result = step5Schema.safeParse(payload);

    if (!result.success) {
      const formattedErrors: any = {};
      const zodErrors = result.error?.issues ?? []; 

      zodErrors.forEach((err) => {
        if (err.path[0]) {
          formattedErrors[err.path[0]] = err.message;
        }
      });

      setErrors((prev: any) => ({ ...prev, ...formattedErrors }));
      return false;
    }

    // Clear errors if valid
    setErrors((prev: any) => ({
      ...prev,
      adminName: "",
      adminEmail: "",
      adminPhone: "",
    }));

    return true;
  };

  const validateStep6 = () => {
    // ✅ Define Max Size (500KB)
    const MAX_FILE_SIZE = 500 * 1024; // 500KB in bytes

    // ✅ Zod Schema for File
    const fileSchema = z
      .custom<File>((file) => file instanceof File, "Invalid file")
      .refine((file) => file.size <= MAX_FILE_SIZE, {
        message: "File size must be less than 500KB.",
      });

    let newErrors: any = {};
    let isValid = true;

    // List of file fields to check
    const fileFields = ["logoCompany", "logoClient", "vatCertificate", "tradeLicense"];

    fileFields.forEach((field) => {
      // Only validate if a NEW file has been uploaded (it is a File object)
      if (formData[field] instanceof File) {
        const result = fileSchema.safeParse(formData[field]);
        if (!result.success) {
          // Extract error message
          newErrors[field] = result.error.issues[0].message;
          isValid = false;
        } else {
            newErrors[field] = ""; // Clear error if valid
        }
      } else {
        // Don't clear error if it was set dynamically by onChange
        if(!errors[field]) newErrors[field] = "";
      }
    });

    setErrors((prev: any) => ({ ...prev, ...newErrors }));
    return isValid;
  };
  const handleNext = () => {
    const validations: Record<number, () => boolean> = {
      1: validateStep1,
      2: validateStep2,
      3: validateStep3,
      4: validateStep4,
      5: validateStep5,
      6: validateStep6,
    };

    if (!validations[currentStep]()) {
      setWizardError("Please complete required fields before continuing.");
      return;
    }

    setWizardError(""); // Clear if valid
    setCurrentStep((prev) => prev + 1);
  };
 const pdfDocument = useMemo(() => {
  return (
    <LeadPDFDocument
      formData={formData}
      existingFiles={existingFiles} // ✅ Pass existing files here
      referenceId={referenceId}
    />
  );
}, [formData, existingFiles, referenceId]); // ✅ Add dependencies
  // --- MODIFIED FILE UPLOAD COMPONENT ---
  const FileUploadBlock = ({
    label,
    name,
    accept,
    file,
    setFormData,
    existingFileName,
    showPreview,
    previewUrl,
    error,
    setErrors, // ✅ Added setErrors prop
  }: {
    label: string;
    name: string;
    accept: string;
    file: any;
    setFormData: any;
    existingFileName: any;
    showPreview?: boolean;
    previewUrl?: string | null;
    error?: string;
    setErrors: any; // ✅ Type for setErrors
  }) => {
    // Typed useRef
    const fileRef = useRef<HTMLInputElement>(null);

    return (
      <div
        className={`border rounded-lg p-3 bg-gray-50 flex flex-col gap-2 ${
          isReadOnly ? "opacity-70 pointer-events-none" : ""
        } ${error ? "border-red-500 bg-red-50" : "border-gray-200"}`}
      >
       <div className="flex justify-between items-center">
            <label className={`text-sm font-medium ${error ? "text-red-600" : "text-gray-900"}`}>
                {label}
            </label>
            {/* ✅ Display the error message text */}
            {error && <span className="text-xs text-red-600 font-semibold">{error}</span>}
        </div>

        {/* Preview Container */}
        {showPreview && previewUrl && (
          <div className="flex justify-center items-center p-2 border border-gray-300 bg-white rounded-md">
            <img
              src={previewUrl}
              alt="Logo Preview"
              className="max-h-20 max-w-full object-contain"
            />
          </div>
        )}

        {/* Hidden input */}
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          name={name}
          disabled={isReadOnly} 
          onChange={(e: any) => {
            const selectedFile = e.target.files[0];
            
            // ✅ IMMEDIATE VALIDATION
            if (selectedFile) {
                // 500KB Limit
                if (selectedFile.size > 500 * 1024) {
                    setErrors((prev: any) => ({
                        ...prev,
                        [name]: "File size must be less than 500KB."
                    }));
                } else {
                    setErrors((prev: any) => ({
                        ...prev,
                        [name]: ""
                    }));
                }
                
                setFormData((prev: any) => ({
                    ...prev,
                    [name]: selectedFile,
                }));
            }
          }}
          className="hidden"
        />

        {/* Custom UI Button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isReadOnly} 
          className={`flex items-center justify-between border bg-white rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition ${
             error ? "border-red-300 text-red-700" : "border-gray-300"
          }`}
        >
          <span className="truncate text-left">
            {file
              ? `File selected: ${file.name}`
              : existingFileName
              ? `Current: ${existingFileName}`
              : "No file chosen"}
          </span>

          {file || existingFileName ? (
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
          ) : (
            <Upload className={`w-4 h-4 flex-shrink-0 ml-2 ${error ? "text-red-500" : "text-gray-500"}`} />
          )}
        </button>
      </div>
    );
  };

  return (
   <div className="
  min-h-screen 
  bg-white 
  flex 
  justify-center 
 items-start      // ✅ FIX 1: Aligns to top (prevents vertical jumping)
      pt-3            // ✅ Add padding from top so it doesn't touch edge
      pb-10            // Add padding at bottom
      px-4
">

  <div className="
    w-full 
    max-w-4xl 
    bg-white 
 
    border border-slate-300 
    shadow-lg
    
 
    px-4          
    sm:px-6        
    md:px-10  
    lg:px-16        
    xl:px-24        

    py-6
    min-h-[850px]  // ✅ FIX 2: Forces a tall height so card size doesn't shrink on short steps
        flex flex-col  // Enables flexbox for spacing
  ">

        {/* HEADER */}
        <div className="text-center  py-2">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/logo.png" 
              alt="Valet Lead Logo"
              className="w-40 sm:w-34 md:w-68 object-contain drop-shadow-md mb-3"
              style={{ maxWidth: "270px", height: "auto" }} 
            />
          </div>
          {!isSubmitted && (
            <>
              <div>
                {/* Eyebrow Label */}
                <div className="flex items-center justify-center flex-col gap-1">
                  <p className="uppercase text-sm sm:text-xl tracking-wider font-semibold text-[#ae5c83] px-4 py-1  ">
                    {isEditMode
                      ? "Edit Valet Parking Location"
                      : "New Valet Parking Location – Registration Form"}
                  </p>

                  {/* --- NEW: COMPLETED WARNING BANNER --- */}
                  {isReadOnly && (
                    <div className="mt-2 w-full max-w-sm bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md flex items-center justify-center gap-2 animate-in fade-in shadow-sm">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-bold">
                        Process Already Completed
                      </span>
                    </div>
                  )}
                </div>

                {/* Subtitle */}
                <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-xl mx-auto  leading-relaxed">
                  Please share the details below so we can configure your valet
                  parking automation.
                </p>
              </div>
            </>
          )}
        </div>
        {!isSubmitted && (
          <>
            {/* ALL FORM + TABS + PROGRESS */}

            {/* ---- Step Tabs Navigation ---- */}
            <div className="w-full py-2 px-0 mb-3">
              {/* Scroll wrapper */}
              <div
                className="
      w-full flex overflow-x-auto no-scrollbar scroll-smooth 
      rounded-lg border border-gray-300 bg-white shadow-md
    "
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {[
                  { label: "Location", icon: <MapPin size={14} /> },
                  { label: "On-Site Users", icon: <Users size={14} /> },
                  { label: "Pricing", icon: <Coins size={14} /> },
                  { label: "Drivers", icon: <CarFront size={14} /> },
                  { label: "Admin Setup", icon: <UserCog size={14} /> },
                  { label: "Documents", icon: <FileText size={14} /> },
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
            px-4 py-3 text-xs font-medium whitespace-nowrap
            transition-all duration-200 select-none
            border-r border-gray-300
            ${
              isActive
                ? "text-black bg-[#ae5c83] text-white font-semibold"
                : isCompleted
                ? "text-gray-700 hover:bg-gray-200"
                : "text-gray-500 hover:bg-gray-200"
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
              <div className="text-red-600 text-sm mb-3 bg-red-100 border border-red-300 px-3 py-2 rounded-lg">
                ⚠️ {wizardError}
              </div>
            )}

            {/* PROGRESS INDICATOR */}
            <div className="border-b pb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Step {currentStep} of 6
              </p>
              <div className="w-full bg-gray-200 h-1.5 mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#ae5c83] h-full rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                ></div>
              </div>
            </div>


           {/* STEP 1: LOCATION INFORMATION */}
            {currentStep === 1 && (
              <div
                className={`space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                  isReadOnly ? "pointer-events-none opacity-80" : ""
                }`}
              >
                
                {/* Section Heading */}
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Location Information
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Basic details about the property where valet parking will be operated.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Location Name (Standard Input) */}
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium text-gray-900">
                      Location Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="locationName"
                      disabled={isReadOnly}
                      placeholder="e.g. Grand Hyatt Dubai"
                      value={formData.locationName}
                      onChange={(e: any) => {
                        setFormData({ ...formData, locationName: e.target.value });
                        setErrors({ ...errors, locationName: "" });
                      }}
                      className={`input ${
                        errors.locationName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.locationName && (
                      <small className="text-red-500 text-xs">
                        {errors.locationName}
                      </small>
                    )}
                  </div>

                  {/* Parking Capacity */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Parking Capacity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      disabled={isReadOnly}
                      placeholder="Total number of parking slots"
                      value={formData.capacity}
                      onChange={(e: any) => {
                        setFormData({ ...formData, capacity: e.target.value });
                        setErrors({ ...errors, capacity: "" });
                      }}
                      className={`input ${
                        errors.capacity ? "border-red-500" : ""
                      }`}
                    />
                    {errors.capacity && (
                      <small className="text-red-500 text-xs">
                        {errors.capacity}
                      </small>
                    )}
                  </div>

                  {/* Waiting Time */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Average Waiting Time
                    </label>
                    <input
                      type="text"
                      name="waitTime"
                      disabled={isReadOnly}
                      placeholder="e.g., 10 – 15 mins"
                      value={formData.waitTime}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                   {/* Operation Timing */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Operation Timing
                    </label>
                    <input
                      type="text"
                      name="timing"
                      disabled={isReadOnly}
                      placeholder="e.g., 24 Hours / 10 AM – 2 AM"
                      value={formData.timing}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>

                 

                  {/* Latitude (Auto-fills URL) */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      disabled={isReadOnly}
                      placeholder="e.g., 25.2852"
                      value={formData.latitude}
                      onChange={handleCoordinateChange} // ✅ Custom Handler
                      className="input"
                    />
                  </div>

                  {/* Longitude (Auto-fills URL) */}
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      disabled={isReadOnly}
                      placeholder="e.g., 55.3598"
                      value={formData.longitude}
                      onChange={handleCoordinateChange} // ✅ Custom Handler
                      className="input"
                    />
                  </div>

                  {/* Google Maps Link (Auto-fills Coords) */}
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium text-gray-900">
                      Google Maps Location URL
                    </label>
                    <input
                      type="url"
                      name="mapsUrl"
                      disabled={isReadOnly}
                      placeholder="Paste Location Link "
                      value={formData.mapsUrl}
                      onChange={handleMapUrlChange} // ✅ Custom Handler
                      className="input"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium text-gray-900">
                      Location TRN / Registered Address
                    </label>
                    <textarea
                      rows={3}
                      name="address"
                      disabled={isReadOnly}
                      placeholder="TRN and full registered address"
                      value={formData.address}
                      onChange={handleChange}
                      className="textarea resize-none"
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="btn-primary flex items-center gap-2 pointer-events-auto"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          {/* STEP 2: ON-SITE USER SETUP */}
{currentStep === 2 && (
  <div
    className={`flex flex-col h-full min-h-[600px] animate-in fade-in slide-in-from-right-8 duration-500 ${
      isReadOnly ? "pointer-events-none opacity-80" : ""
    }`}
  >
    {/* Scrollable Content Area */}
    <div className="flex-1 space-y-4">
      <div className="space-y-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          On-Site User Setup
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Internal users + operational setup details.
        </p>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Number of lobbies */}
        <div>
          <label className="text-sm font-medium text-gray-900">
            Number of lobbies / entrances
          </label>
          <input
            type="number"
            name="lobbies"
            disabled={isReadOnly}
            placeholder="e.g., 2"
            value={formData.lobbies}
            onChange={handleChange}
            className="input w-full"
          />
        </div>

        {/* Number of key rooms */}
        <div>
          <label className="text-sm font-medium text-gray-900">
            Number of key control rooms
          </label>
          <input
            type="number"
            name="keyRooms"
            disabled={isReadOnly}
            placeholder="e.g., 1"
            value={formData.keyRooms}
            onChange={handleChange}
            className="input w-full"
          />
        </div>

        {/* Distance */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-900">
            Distance between lobby & key room
          </label>
          <input
            type="text"
            name="distance"
            disabled={isReadOnly}
            placeholder="e.g., 50 meters"
            value={formData.distance}
            onChange={handleChange}
            className="input w-full"
          />
        </div>

        {/* Radio Option: Supervisor */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Supervisor user required?
          </p>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="radio"
                name="supervisorUser"
                value="yes"
                disabled={isReadOnly}
                checked={formData.supervisorUser === "yes"}
                onChange={handleChange}
                className="w-4 h-4 accent-[#ae5c83]"
              />
              Yes
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="radio"
                name="supervisorUser"
                value="no"
                disabled={isReadOnly}
                checked={formData.supervisorUser === "no"}
                onChange={handleChange}
                className="w-4 h-4 accent-[#ae5c83]"
              />
              No
            </label>
          </div>
        </div>

        {/* Radio Option: Validation */}
        <div className="border rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Ticket validation user?
          </p>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="radio"
                name="validationUser"
                value="yes"
                disabled={isReadOnly}
                checked={formData.validationUser === "yes"}
                onChange={handleChange}
                className="w-4 h-4 accent-[#ae5c83]"
              />
              Yes
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="radio"
                name="validationUser"
                value="no"
                disabled={isReadOnly}
                checked={formData.validationUser === "no"}
                onChange={handleChange}
                className="w-4 h-4 accent-[#ae5c83]"
              />
              No
            </label>
          </div>
        </div>

        {/* Radio Option: Finance Report */}
        <div className="border rounded-lg p-3 bg-gray-50 md:col-span-2">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Finance report access?
          </p>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="radio"
                name="reportUser"
                value="yes"
                disabled={isReadOnly}
                checked={formData.reportUser === "yes"}
                onChange={handleChange}
                className="w-4 h-4 accent-[#ae5c83]"
              />
              Yes
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="radio"
                name="reportUser"
                value="no"
                disabled={isReadOnly}
                checked={formData.reportUser === "no"}
                onChange={handleChange}
                className="w-4 h-4 accent-[#ae5c83]"
              />
              No
            </label>
          </div>
        </div>
      </div>
    </div>

    {/* Fixed Navigation Buttons at Bottom */}
    <div className="pt-6 mt-auto  flex justify-between items-center">
      <button
        onClick={() => setCurrentStep((prev) => prev - 1)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-400 active:scale-[0.97] transition-all duration-200 shadow-sm bg-white hover:bg-gray-50"
      >
        ← Back
      </button>

      <button
        onClick={handleNext}
        className="btn-primary flex items-center gap-2 pointer-events-auto"
      >
        Next Step
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
)}
            {/* STEP 3: VALET TICKET & PRICING */}
{currentStep === 3 && (
  <div
    className={`flex flex-col h-full min-h-[600px] animate-in fade-in slide-in-from-right-8 duration-500 ${
      isReadOnly ? "pointer-events-none opacity-80" : ""
    }`}
  >
    {/* Scrollable Content Area */}
    <div className="flex-1 space-y-4">
      {/* Section Heading */}
      <div className="space-y-0">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          Valet Ticket & Pricing
        </h2>
        <p className="text-xs text-gray-500">
          Tell us how tickets are generated and how you charge guests.
        </p>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket Type */}
        <div className="md:col-span-2 bg-gray-50 rounded-lg border border-gray-100">
          <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2 p-2">
            Ticket Type <span className="text-gray-400 text-xs font-normal">(Select all that apply)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2 p-2">
            {[
              { id: "pre-printed-paper", label: "Pre-printed ticket paper" },
              { id: "pre-printed-plastic", label: "Pre-printed reusable plastic ticket" },
              { id: "system-generated", label: "System generated ticket" },
              { id: "e-ticket", label: "E-ticket" },
            ].map((type) => (
              <label key={type.id} className="flex items-center gap-2 cursor-pointer rounded transition">
                <input
                  type="checkbox"
                  name="ticketType"
                  value={type.id}
                  disabled={isReadOnly}
                  checked={formData.ticketType?.includes(type.id)}
                  onChange={handleTicketTypeChange}
                  className="w-4 h-4 text-[#ae5c83] rounded focus:ring-[#ae5c83] accent-[#ae5c83]"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Valet Fee Type */}
        <div className="md:col-span-2 bg-gray-50 rounded-lg border border-gray-100">
          <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2 p-2">
            Valet Fee Type <span className="text-gray-400 text-xs font-normal">(Select all that apply)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6 p-2">
            {[
              { id: "fixed", label: "Fixed fee" },
              { id: "hourly", label: "Hourly" },
              { id: "free", label: "Free (complimentary)" },
            ].map((fee) => (
              <label key={fee.id} className="flex items-center gap-2 cursor-pointer rounded transition">
                <input
                  type="checkbox"
                  name="feeType"
                  value={fee.id}
                  disabled={isReadOnly}
                  checked={formData.feeType?.includes(fee.id)}
                  onChange={handleFeeTypeChange}
                  className="w-4 h-4 text-[#ae5c83] rounded focus:ring-[#ae5c83] accent-[#ae5c83]"
                />
                <span className="text-sm text-gray-700">{fee.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ticket Pricing */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 p-1">
            Ticket Prices (AED)
            <Banknote className="w-4 h-4 text-gray-400" />
          </label>
          <textarea
            rows={2}
            name="ticketPricing"
            disabled={isReadOnly}
            placeholder="e.g. Standard: 50 AED, VIP: 100 AED..."
            value={formData.ticketPricing}
            onChange={handleChange}
            className="input w-full"
          />
          <p className="text-xs text-gray-400 mt-1">
            Mention separate pricing if applicable.
          </p>
        </div>

        {/* VAT Handling */}
        <div className="md:col-span-2 bg-gray-50 rounded-lg border border-gray-100">
          <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2 p-2">
            Tax Handling
          </label>
          <div className="flex flex-wrap gap-4 p-2">
            {['inclusive', 'exclusive'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="vatType"
                  value={type}
                  disabled={isReadOnly}
                  checked={formData.vatType === type}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#ae5c83]"
                />
                <span className="text-sm text-gray-700 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Fixed Action Buttons at Bottom */}
    <div className="pt-6 mt-auto  flex justify-between">
      <button
        onClick={() => setCurrentStep((prev) => prev - 1)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-400 active:scale-[0.97] transition-all duration-200 shadow-sm bg-white hover:bg-gray-50"
      >
        ← Back
      </button>

      <button
        onClick={handleNext}
        className="btn-primary flex items-center gap-2 pointer-events-auto"
      >
        Next Step
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
)}

            {/* STEP 4: DRIVERS / CVA TEAM */}
{currentStep === 4 && (
  <div
    className={`flex flex-col h-full min-h-[600px] animate-in fade-in slide-in-from-right-8 duration-500 ${
      isReadOnly ? "pointer-events-none opacity-80" : ""
    }`}
  >
    {/* Scrollable Content Area */}
    <div className="flex-1 space-y-3">
      {/* Section Heading */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-[#ae5c83]" />
          Drivers / CVA Team
        </h2>
        <p className="text-sm text-gray-500">
          Details of drivers who will be mapped to this location.
        </p>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Number of Drivers */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            Number of drivers
            <Users className="w-4 h-4 text-gray-400" />
          </label>

          <input
            type="number"
            name="driverCount"
            disabled={isReadOnly}
            placeholder="e.g. 15"
            value={formData.driverCount}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#ae5c83] focus:border-[#ae5c83] outline-none transition-all"
          />
        </div>

        {/* Drivers List */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            Drivers list (Employee ID & full name)
            <FileText className="w-4 h-4 text-gray-400" />
          </label>

          <textarea
            rows={6}
            name="driverList"
            disabled={isReadOnly}
            placeholder={`e.g.\n1001 - John Doe\n1002 - Jane Smith\n1003 - Ahmed Ali`}
            value={formData.driverList}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#ae5c83] focus:border-[#ae5c83] outline-none transition-all resize-none font-mono text-sm"
          />

          {/* Helper Note */}
          <div className="mt-2 flex gap-2 items-start p-3 bg-blue-50 text-red-700 text-sm rounded-md">
            <span className="mt-0.5">ℹ️</span>
            <p>
              If the list is too long, you may also share this as an
              attachment by email referencing this form.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Fixed Action Buttons at Bottom */}
    <div className="pt-6 mt-auto flex justify-between">
      <button
        onClick={() => setCurrentStep((prev) => prev - 1)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-400 active:scale-[0.97] transition-all duration-200 shadow-sm bg-white hover:bg-gray-50"
      >
        ← Back
      </button>

      <button
        onClick={handleNext}
        className="flex items-center gap-2 bg-[#ae5c83] hover:bg-[#964a6d] text-white px-6 py-2.5 rounded-lg font-medium transition-colors pointer-events-auto"
      >
        Next Step
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
)}

            {/* STEP 5: SUPER ADMIN CONTACT */}
{currentStep === 5 && (
  <div
    className={`flex flex-col h-full min-h-[600px] animate-in fade-in slide-in-from-right-8 duration-500 ${
      isReadOnly ? "pointer-events-none opacity-80" : ""
    }`}
  >
    {/* Scrollable Content Area */}
    <div className="flex-1 space-y-3">
      {/* Section Heading */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ShieldUser className="w-5 h-5 text-[#ae5c83]" />
          Super Admin Contact
        </h2>
        <p className="text-sm text-gray-500">
          Main person responsible for valet operations & application access.
        </p>
      </div>

      {/* ---- GRID WRAPPER ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex gap-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="adminName"
            disabled={isReadOnly}
            placeholder="e.g., Ayush Aggarwal"
            value={formData.adminName}
            onChange={(e: any) => {
              setFormData({ ...formData, adminName: e.target.value });
              setErrors((prev: any) => ({ ...prev, adminName: "" }));
            }}
            className={`input ${errors.adminName ? "border-red-500" : ""}`}
          />
          {errors.adminName && (
            <p className="text-xs text-red-500">{errors.adminName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="adminEmail"
            disabled={isReadOnly}
            placeholder="e.g., ayush@example.com"
            value={formData.adminEmail}
            onChange={(e: any) => {
              setFormData({ ...formData, adminEmail: e.target.value });
              setErrors((prev: any) => ({ ...prev, adminEmail: "" }));
            }}
            className={`input ${errors.adminEmail ? "border-red-500" : ""}`}
          />
          {errors.adminEmail && (
            <p className="text-xs text-red-500">{errors.adminEmail}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile / WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="adminPhone"
            disabled={isReadOnly}
            placeholder="e.g., 971521234567"
            value={formData.adminPhone}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, adminPhone: cleaned });
              setErrors((prev: any) => ({ ...prev, adminPhone: "" }));
            }}
            onKeyDown={(e) => {
              if (
                !/[0-9]/.test(e.key) &&
                !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
              ) {
                e.preventDefault();
              }
            }}
            className={`input ${errors.adminPhone ? "border-red-500" : ""}`}
          />
          {errors.adminPhone && (
            <p className="text-xs text-red-500">{errors.adminPhone}</p>
          )}
        </div>

        {/* Training Radio (full width row) */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 md:col-span-1">
          <label className="block font-medium text-gray-700 mb-3 flex items-center gap-2">
            Super admin will receive full application training
          </label>
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="trainingRequired"
                value="yes"
                disabled={isReadOnly}
                checked={formData.trainingRequired === "yes"}
                onChange={handleChange}
                className="text-[#ae5c83] focus:ring-[#ae5c83] accent-[#ae5c83]"
              />
              <span className="text-sm text-black">Yes, they will be trained</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="trainingRequired"
                value="no"
                disabled={isReadOnly}
                checked={formData.trainingRequired === "no"}
                onChange={handleChange}
                className="text-[#ae5c83] focus:ring-[#ae5c83] accent-[#ae5c83]"
              />
              <span className="text-sm text-black">No / different plan</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    {/* Fixed Navigation Buttons at Bottom */}
    <div className="pt-6 mt-auto  flex justify-between">
      <button
        onClick={() => setCurrentStep((prev) => prev - 1)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-400 active:scale-[0.97] transition-all duration-200 shadow-sm bg-white hover:bg-gray-50"
      >
        ← Back
      </button>

      <button
        onClick={handleNext}
        className="flex items-center gap-2 bg-[#ae5c83] hover:bg-[#964a6d] text-white px-6 py-2.5 rounded-lg font-medium transition-colors pointer-events-auto"
      >
        Next Step
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
)}

{currentStep === 6 && (
  <div
    className={`flex flex-col h-full min-h-[600px] animate-in fade-in slide-in-from-right-8 duration-500`}
  >
    {/* Scrollable Content Area */}
    <div className="flex-1 space-y-3">
      {/* Section Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          📎 Required Documents
        </h2>
        <p className="text-xs text-gray-500">
          Upload now or submit later via email/WhatsApp.
        </p>
      </div>

      {/* File Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-2 ${
          isReadOnly ? "pointer-events-none opacity-80" : ""
        }`}
      >
        {/* COMPANY LOGO - WITH PREVIEW */}
        <FileUploadBlock
          label="Company Logo (JPG/PNG)"
          name="logoCompany"
          file={formData.logoCompany}
          accept="image/png, image/jpeg"
          setFormData={setFormData}
          existingFileName={existingFiles.logoCompany?.filename}
          showPreview={true}
          previewUrl={companyLogoPreview}
          error={errors.logoCompany}
          setErrors={setErrors}
        />

        {/* CLIENT LOGO - WITH PREVIEW */}
        <FileUploadBlock
          label="Client Logo (JPG/PNG)"
          name="logoClient"
          file={formData.logoClient}
          accept="image/png, image/jpeg"
          setFormData={setFormData}
          existingFileName={existingFiles.logoClient?.filename}
          showPreview={true}
          previewUrl={clientLogoPreview}
          error={errors.logoClient}
          setErrors={setErrors}
        />

        {/* VAT CERTIFICATE */}
        <FileUploadBlock
          label="VAT Certificate (PDF)"
          name="vatCertificate"
          file={formData.vatCertificate}
          accept="application/pdf"
          setFormData={setFormData}
          existingFileName={existingFiles.vatCertificate?.filename}
          error={errors.vatCertificate}
          setErrors={setErrors}
        />

        {/* TRADE LICENSE */}
        <FileUploadBlock
          label="Trade License (PDF)"
          name="tradeLicense"
          file={formData.tradeLicense}
          accept="application/pdf"
          setFormData={setFormData}
          existingFileName={existingFiles.tradeLicense?.filename}
          error={errors.tradeLicense}
          setErrors={setErrors}
        />
      </div>

      {/* Notes Textarea */}
      <div className={isReadOnly ? "pointer-events-none opacity-80" : ""}>
        <label className="text-sm font-medium text-gray-900">
          How will you send documents?
        </label>

        <textarea
          rows={3}
          name="documentSubmitMethod"
          disabled={isReadOnly}
          placeholder="Example: We will email files within 24 hours."
          value={formData.documentSubmitMethod}
          onChange={handleChange}
          className="textarea w-full"
        />
      </div>
    </div>

    {/* Fixed Action Buttons at Bottom */}
    <div className="pt-6 mt-auto  flex justify-between">
      <button
        onClick={() => setCurrentStep((prev) => prev - 1)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-400 active:scale-[0.97] transition-all duration-200 shadow-sm bg-white hover:bg-gray-50"
      >
        ← Back
      </button>

      <button
        onClick={handleReviewClick}
        disabled={isReadOnly}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors pointer-events-auto shadow-sm active:scale-[0.97]
          ${
            isReadOnly
              ? "bg-gray-400 cursor-not-allowed text-gray-100"
              : "bg-[#ae5c83] hover:bg-[#964a6d] text-white"
          }`}
      >
        {isReadOnly ? "Locked (Completed)" : "Review & Submit"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
)}
          </>
        )}
{isSubmitted && (
  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300 h-full py-6 sm:py-12 px-4 ">
    {/* Increased max-width to lg for better spacing, added richer shadow */}
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
      
      {/* --- Top Section: Success & Reference --- */}
      {/* RESPONSIVE FIX: Reduced padding from p-8 to p-5 on mobile, back to p-8 on sm+ */}
      <div className="p-5 sm:p-8 text-center bg-white relative">
        {/* Success Icon & Title */}
        <div className="flex flex-col items-center">
          {/* RESPONSIVE FIX: Smaller icon on mobile (w-16 h-16 vs w-20 h-20) */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-green-100 mb-4 shadow-sm">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
          </div>
          {/* RESPONSIVE FIX: Smaller title on mobile */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {isEditMode ? "Update Successfull!" : "Submission Received!"}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2 leading-relaxed max-w-md mx-auto">
            {isEditMode ? (
              "The location details have been updated."
            ) : (
              "Your registration has been received. Our team will review the details and contact you shortly."
            )}
          </p>
        </div>

        {/* Prominent Reference Box */}
        {/* RESPONSIVE FIX: Adjusted margin and padding for mobile */}
        <div className="mt-6 sm:mt-8 bg-slate-50 rounded-xl p-4 sm:p-6 border-2 border-slate-100 relative text-center shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Reference ID
          </p>

          <div className="relative flex items-center justify-center gap-3">
             {/* RESPONSIVE FIX: Slightly smaller text on mobile to prevent overflow */}
             <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {referenceId}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referenceId || "");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-2 rounded-md hover:bg-slate-200 text-slate-500 transition-all"
              title="Copy Reference ID"
            >
              {copied ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
              )}
            </button>
          </div>
           <p className="text-xs text-gray-400 mt-3">
            Please quote this in future correspondence.
          </p>
        </div>
      </div>

      {/* --- Bottom Section: Actions (Gray Background) --- */}
      {/* RESPONSIVE FIX: Reduced padding from p-8 to p-5 on mobile */}
      <div className="p-5 sm:p-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
          Next Steps
        </h3>
        
        {/* ✅ Action Grid: Side-by-side on larger screens (already correct) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* ACTION 1: DOWNLOAD PDF */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
                <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center text-[#007bff] mb-3">
                    <Download size={20} />
                </div>
                <h4 className="font-semibold text-gray-900">Download PDF</h4>
                <p className="text-sm text-gray-500 mt-1 mb-4">Save a copy for your records.</p>
            </div>

            {isClient && (
            <PDFDownloadLink
                document={pdfDocument}
                fileName={`Valet_Registration_${referenceId || "New"}.pdf`}
                className="w-full text-decoration-none"
            >
                {({ loading }) => (
                <button
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all border bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400 shadow-sm active:scale-[0.98] ${loading ? "opacity-70 cursor-wait" : ""}`}
                >
                    {loading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 104 12z"></path></svg>
                        <span>Generating...</span>
                    </>
                    ) : (
                    <>Download PDF</>
                    )}
                </button>
                )}
            </PDFDownloadLink>
            )}
          </div>

          {/* ACTION 2: WHATSAPP SHARE (The Quick Response Box) */}
          <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
             {/* Decorative Background Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" className="absolute -right-4 -bottom-4 text-green-100/80 h-24 w-24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.025-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            
            <div className="relative z-10">
                <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center text-green-600 mb-3">
                    <MessageCircle size={20} />
                </div>
                <h4 className="font-bold text-green-900">Need a Quick Response?</h4>
                 {/* Instruction Step */}
                 <p className="text-sm text-green-800 mt-1 mb-4">
                  <span className="font-bold">Step 1:</span> Download PDF.<br/>
                  <span className="font-bold">Step 2:</span> Share via WhatsApp.
                </p>
            </div>

            <div className="relative z-10 mt-auto">
              {/* IMPORTANT: Ensure country code is included if needed (e.g. 97134382932) */}
             <a
                href={`https://wa.me/918921837945?text=${encodeURIComponent(
                  `Hi, here is the registration PDF for Ref ${referenceId}. You can view it here: ${pdfUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all bg-[#25D366] hover:bg-[#20bd5a] text-white border border-[#20bd5a] shadow-sm active:scale-[0.98]"
              >
                Share on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Standard "Go Home" button */}
        <div className="mt-8">
          <button
            onClick={() => router.push("/")}
            className="w-full bg-white text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium text-sm transition-all active:scale-[0.98] shadow-sm border border-gray-300 flex items-center justify-center gap-2"
          >
            <Home size={16}/> Go to Homepage
          </button>
        </div>

      </div>
    </div>
  </div>
)}
      </div>
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleFinalSubmit}
        formData={formData}
        existingFiles={existingFiles}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}