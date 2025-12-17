"use client";
import { useState, useEffect,useMemo } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { LeadPDFDocument } from "@/components/LeadPDFDocument"; // Adjust path
import { Download } from "lucide-react"; // Import Download icon
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
        const ref = data.referenceId ?? data.lead?.referenceId ?? referenceId;
        setReferenceId(ref);
        setIsSubmitted(true);
        setShowReviewModal(false);
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

  const validateStep1 = () => {
    let newErrors: any = {};

    if (!formData.locationName.trim()) {
      newErrors.locationName = "Location name is required.";
    }

    try {
      capacitySchema.parse(Number(formData.capacity));
    } catch (err: any) {
      newErrors.capacity =
        err.errors?.[0]?.message || "Invalid capacity number";
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
      referenceId={referenceId}
    />
  );
}, [referenceId]); // 👈 IMPORTANT
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
            {currentStep === 2 && (
              <div
                className={`space-y-3 animate-in fade-in slide-in-from-right-8 duration-500 ${
                  isReadOnly ? "pointer-events-none opacity-80" : ""
                }`}
              >
                {/* Header */}
                <div className="space-y-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    On-Site User Setup
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Internal users + operational setup details.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Inputs */}
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
                      className="input"
                    />
                  </div>

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
                      className="input"
                    />
                  </div>

                  <div>
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
                      className="input"
                    />
                  </div>

                  {/* Radios */}
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900 mb-1">
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
                          className="w-4 h-4 "
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
                          className="w-4 h-4"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900 mb-1">
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
                          className="w-4 h-4"
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
                          className="w-4 h-4"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm font-medium text-gray-900 mb-1">
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
                          className="w-4 h-4"
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
                          className="w-4 h-4"
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-2 flex justify-between items-center">
                  <button
 onClick={() => setCurrentStep((prev) => prev - 1)}
 className="
   flex items-center gap-2 
   px-4 py-2 rounded-lg 
   text-sm font-medium
   border border-gray-400 
   active:scale-[0.97]
   transition-all duration-200
   shadow-sm
 "
>
 ← Back
</button>

                  <button
                    onClick={handleNext}
                    className="btn-primary flex gap-2 pointer-events-auto"
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
                className={`space-y-4 animate-in fade-in slide-in-from-right-8 duration-500 ${
                  isReadOnly ? "pointer-events-none opacity-80" : ""
                }`}
              >
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
                  <div className="md:col-span-2  bg-gray-50 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      Ticket Type <span className="text-gray-400 text-xs font-normal">(Select all that apply)</span>
                    </label>

                    {/* Grid Layout for Multiple Choice */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2">
                      
                      {/* Option 1: Pre-printed Paper */}
                      <label className={`flex items-center gap-2 cursor-pointer  rounded transition  ${
                        formData.ticketType?.includes("pre-printed-paper") 
                          ? "" 
                          : ""
                      }`}>
                        <input
                          type="checkbox"
                          name="ticketType"
                          value="pre-printed-paper"
                          disabled={isReadOnly}
                          checked={formData.ticketType?.includes("pre-printed-paper")}
                          onChange={handleTicketTypeChange}
                        
                          className="w-4 h-4 text-[#ae5c83] rounded focus:ring-[#ae5c83] accent-[#ae5c83]"
                        />
                        <span className="text-sm text-gray-700">
                          Pre-printed ticket paper
                        </span>
                      </label>

                      {/* Option 2: Pre-printed Plastic */}
                      <label className={`flex items-center gap-2 cursor-pointer  rounded transition  ${
                        formData.ticketType?.includes("pre-printed-plastic") 
                          ? "" 
                          : ""
                      }`}>
                        <input
                          type="checkbox"
                          name="ticketType"
                          value="pre-printed-plastic"
                          disabled={isReadOnly}
                          checked={formData.ticketType?.includes("pre-printed-plastic")}
                          onChange={handleTicketTypeChange}
                          className="w-4 h-4 text-[#ae5c83] rounded focus:ring-[#ae5c83] accent-[#ae5c83]"
                        />
                        <span className="text-sm text-gray-700">
                          Pre-printed reusable plastic ticket
                        </span>
                      </label>

                      {/* Option 3: System Generated */}
                      <label className={`flex items-center gap-2 cursor-pointer  rounded transition  ${
                        formData.ticketType?.includes("system-generated") 
                          ? "" 
                          : ""
                      }`}>
                        <input
                          type="checkbox"
                          name="ticketType"
                          value="system-generated"
                          disabled={isReadOnly}
                          checked={formData.ticketType?.includes("system-generated")}
                          onChange={handleTicketTypeChange}
                          className="w-4 h-4 text-[#ae5c83] rounded focus:ring-[#ae5c83] accent-[#ae5c83]"
                        />
                        <span className="text-sm text-gray-700">
                          System generated ticket
                        </span>
                      </label>

                      {/* Option 4: E-Ticket */}
                      <label className={`flex items-center gap-2 cursor-pointer  rounded transition  ${
                        formData.ticketType?.includes("e-ticket") 
                          ? "" 
                          : ""
                      }`}>
                        <input
                          type="checkbox"
                          name="ticketType"
                          value="e-ticket"
                          disabled={isReadOnly}
                          checked={formData.ticketType?.includes("e-ticket")}
                          onChange={handleTicketTypeChange}
                          className="w-4 h-4 text-[#ae5c83] rounded focus:ring-[#ae5c83] accent-[#ae5c83]"
                        />
                        <span className="text-sm text-gray-700">
                          E-ticket
                        </span>
                      </label>

                    </div>
                  </div>

                  {/* Valet Fee Type */}
                  <div className="md:col-span-2  bg-gray-50 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      Valet Fee Type <span className="text-gray-400 text-xs font-normal">(Select all that apply)</span>
                    </label>

                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6">

                      
                      {/* Option 1: Fixed Fee */}
                      <label className={`flex items-center gap-2 cursor-pointer  rounded transition  ${
                        formData.feeType?.includes("fixed") 
                          ? "" 
                          : ""
                      }`}>
                        <input
                          type="checkbox"
                          name="feeType"
                          value="fixed"
                          disabled={isReadOnly}
                          checked={formData.feeType?.includes("fixed")}
                          onChange={handleFeeTypeChange}
                          className="w-4 h-4 text-[#ae5c83] rounded focus:ring-[#ae5c83] accent-[#ae5c83]"
                        />
                        <span className="text-sm text-gray-700">Fixed fee</span>
                      </label>

                      {/* Option 2: Hourly */}
                      <label className={`flex items-center gap-2 cursor-pointer  rounded transition  ${
                        formData.feeType?.includes("hourly") 
                          ? "" 
                          : ""
                      }`}>
                        <input
                          type="checkbox"
                          name="feeType"
                          value="hourly"
                          disabled={isReadOnly}
                          checked={formData.feeType?.includes("hourly")}
                          onChange={handleFeeTypeChange}
                          className="w-4 h-4 text-[#ae5c83] rounded focus:ring-[#ae5c83] accent-[#ae5c83]"
                        />
                        <span className="text-sm text-gray-700">Hourly</span>
                      </label>

                      {/* Option 3: Free */}
                      <label className={`flex items-center gap-2 cursor-pointer rounded transition  ${
                        formData.feeType?.includes("free") 
                          ? "" 
                          : ""
                      }`}>
                        <input
                          type="checkbox"
                          name="feeType"
                          value="free"
                          disabled={isReadOnly}
                          checked={formData.feeType?.includes("free")}
                          onChange={handleFeeTypeChange}
                          className="w-4 h-4 text-[#ae5c83] rounded focus:ring-[#ae5c83] accent-[#ae5c83]"
                        />
                        <span className="text-sm text-gray-700">
                          Free (complimentary)
                        </span>
                      </label>

                    </div>
                  </div>

                  {/* Ticket Pricing */}
                  <div className="md:col-span-2 ">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
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
                      className="input"
                    />

                    <p className="text-xs text-gray-400 mt-1">
                      Mention separate pricing if applicable.
                    </p>
                  </div>

                  {/* VAT Handling */}
                  <div className="md:col-span-2 bg-gray-50 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                      Tax Handling
                    </label>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="vatType"
                          value="inclusive"
                          disabled={isReadOnly}
                          checked={formData.vatType === "inclusive"}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Inclusive</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="vatType"
                          value="exclusive"
                          disabled={isReadOnly}
                          checked={formData.vatType === "exclusive"}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Exclusive</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-2 flex justify-between">
                  <button
 onClick={() => setCurrentStep((prev) => prev - 1)}
 className="
   flex items-center gap-2 
   px-4 py-2 rounded-lg 
   text-sm font-medium
   border border-gray-400 
   active:scale-[0.97]
   transition-all duration-200
   shadow-sm
 "
>
 ← Back
</button>

                  <button
                    onClick={handleNext}
                    className="btn-primary pointer-events-auto"
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
                className={`space-y-3 animate-in fade-in slide-in-from-right-8 duration-500 ${
                  isReadOnly ? "pointer-events-none opacity-80" : ""
                }`}
              >
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

                {/* Step Action Buttons */}
                <div className="pt-2 flex justify-between">
                  <button
 onClick={() => setCurrentStep((prev) => prev - 1)}
 className="
   flex items-center gap-2 
   px-4 py-2 rounded-lg 
   text-sm font-medium
   border border-gray-400 
   active:scale-[0.97]
   transition-all duration-200
   shadow-sm
 "
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
                className={`space-y-3 animate-in fade-in slide-in-from-right-8 duration-500 ${
                  isReadOnly ? "pointer-events-none opacity-80" : ""
                }`}
              >
                {/* Section Heading */}
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <ShieldUser className="w-5 h-5 text-[#ae5c83]" />
                    Super Admin Contact
                  </h2>
                  <p className="text-sm text-gray-500">
                    Main person responsible for valet operations & application
                    access.
                  </p>
                </div>

                {/* ---- NEW GRID WRAPPER ---- */}
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
                      className={`input ${
                        errors.adminName ? "border-red-500" : ""
                      }`}
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
                      className={`input ${
                        errors.adminEmail ? "border-red-500" : ""
                      }`}
                    />
                    {errors.adminEmail && (
                      <p className="text-xs text-red-500">
                        {errors.adminEmail}
                      </p>
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
                        // Remove anything that isn't a number
                        const cleaned = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, adminPhone: cleaned });
                        setErrors((prev: any) => ({
                          ...prev,
                          adminPhone: "",
                        }));
                      }}
                      onKeyDown={(e) => {
                        // Allow: digits, Backspace, Delete, Tab, Arrow keys
                        if (
                          !/[0-9]/.test(e.key) &&
                          !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(
                            e.key
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={`input ${
                        errors.adminPhone ? "border-red-500" : ""
                      }`}
                    />

                    {errors.adminPhone && (
                      <p className="text-xs text-red-500">
                        {errors.adminPhone}
                      </p>
                    )}
                  </div>

                  {/* Training Radio (full width row) */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 md:col-span-1">
                    <label className="block font-medium text-gray-700 mb-3 flex items-center gap-2">
                      Super admin will receive full application training
                    </label>

                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Yes Option */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="trainingRequired"
                          value="yes"
                          disabled={isReadOnly}
                          checked={formData.trainingRequired === "yes"}
                          onChange={handleChange}
                          className="text-[#ae5c83] focus:ring-[#ae5c83]"
                        />
                        <span className="text-sm text-black">
                          Yes, they will be trained
                        </span>
                      </label>

                      {/* No Option */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="trainingRequired"
                          value="no"
                          disabled={isReadOnly}
                          checked={formData.trainingRequired === "no"}
                          onChange={handleChange}
                          className="text-[#ae5c83] focus:ring-[#ae5c83]"
                        />
                        <span className="text-sm text-black">
                          No / different plan
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-2 flex justify-between">
                   <button
 onClick={() => setCurrentStep((prev) => prev - 1)}
 className="
   flex items-center gap-2 
   px-4 py-2 rounded-lg 
   text-sm font-medium
   border border-gray-400 
   active:scale-[0.97]
   transition-all duration-200
   shadow-sm
 "
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

            {/* STEP 6: REQUIRED DOCUMENTS */}
            {currentStep === 6 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-8 duration-500">

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
                    setErrors={setErrors} // ✅ Passed setErrors
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
                    setErrors={setErrors} // ✅ Passed setErrors
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
                    setErrors={setErrors} // ✅ Passed setErrors
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
                    setErrors={setErrors} // ✅ Passed setErrors
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
                    className="textarea"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-4">
                  <button
 onClick={() => setCurrentStep((prev) => prev - 1)}
 className="
   flex items-center gap-2 
   px-4 py-2 rounded-lg 
   text-sm font-medium
   border border-gray-400 
   active:scale-[0.97]
   transition-all duration-200
   shadow-sm
 "
>
 ← Back
</button>

                 <button
  onClick={handleReviewClick} // <--- NEW: Opens modal instead of submitting directly
  disabled={isReadOnly} 
  className={`px-6 py-3 rounded-lg text-sm shadow-sm transition-all
    ${isReadOnly
       ? "bg-gray-400 cursor-not-allowed text-gray-100"
       : "bg-[#ae5c83] hover:bg-[#ae5c83] text-white"
     }`}
>
  {isReadOnly
    ? "Locked (Completed)"
    : "Review & Submit"} {/* Changed text to be clearer */}
</button>
                </div>
              </div>
            )}
          </>
        )}
{isSubmitted && (
  <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 h-full py-8">
    <div className="w-full max-w-md rounded-lg p-6 text-center bg-white shadow-md border border-gray-200">
        
      {/* Success Icon */}
      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-50 mx-auto mb-4 shadow-sm">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">
        {isEditMode ? "Update Successful" : "Submission Successful"}
      </h2>

      {/* Subtitle */}
      <p className="text-gray-600 text-sm mt-2 leading-relaxed">
        {isEditMode ? (
          "The location details have been successfully updated."
        ) : (
          "Your registration has been received. Our team will review the details and contact you shortly."
        )}
      </p>

      {/* Reference Box */}
      <div className="mt-5 rounded-lg bg-gray-50 p-4 border border-gray-200 relative text-left">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Reference Number
        </p>

        <p className="text-2xl font-bold text-gray-900 mt-1 font-mono tracking-tight">
          {referenceId}
        </p>

        <button
          onClick={() => {
            navigator.clipboard.writeText(referenceId || "");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="absolute top-4 right-4 text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium"
        >
          {copied ? (
            <>
              <CheckCircle size={14} className="text-green-600" /> Copied
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg> Copy
            </>
          )}
        </button>
      </div>

      {/* Reminder */}
      <p className="text-xs text-gray-500 mt-2 text-left">
        Please quote this reference number in future correspondence.
      </p>

      {/* Buttons Section - Changed to grid-cols-2 for two columns */}
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full">

        
        {/* ✅ PDF DOWNLOAD BUTTON (Only renders on client) */}
        {isClient && (
          <PDFDownloadLink
  document={pdfDocument}
  fileName={`Valet_Registration_${referenceId || "New"}.pdf`}


            className="w-full text-decoration-none"
          >
            {({ blob, url, loading, error }) => (
              <button
                disabled={loading}
                className={`
                  w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md font-medium text-sm transition-all border
                  ${loading 
                    ? "bg-gray-50 text-gray-400 cursor-wait border-gray-400" 
                    : "bg-white text-gray-700 border-gray-400 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100"
                  }
                `}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 104 12z"></path>
                    </svg>
                    <span className="truncate">Generating...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} className="flex-shrink-0" /> 
                    {/* Changed text here */}
                    <span className="truncate">Download PDF</span>
                  </>
                )}
              </button>
            )}
          </PDFDownloadLink>
        )}

        {/* Go Home Button */}
        <button
          onClick={() => router.push("/")}
          className="
            w-full
            bg-[#ae5c83] hover:bg-[#923c63] 
            px-3 py-2.5 
            rounded-md
            text-white font-medium text-sm
            shadow-sm hover:shadow
            transition-all duration-200
            active:scale-[0.98]
            flex items-center justify-center gap-2
          "
        >
          <span className="truncate">Go to Homepage</span>
        </button>
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
