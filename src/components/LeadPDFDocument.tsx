import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Link,
  Font,
} from "@react-pdf/renderer";

// Register standard font (using Helvetica default for widest compatibility)

/* -------------------- STYLES (PROFESSIONAL INDUSTRY STANDARD) -------------------- */

const colors = {
  primary: "#ae5c83", // Brand color
  textDark: "#111827", // Near black for headers/values
  textMedium: "#4B5563", // Dark gray for labels
  textLight: "#6B7280", // Medium gray for secondary info
  borderSubtle: "#E5E7EB", // Light gray borders
  bgLight: "#F9FAFB", // Very light gray backgrounds
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    // Standard A4 margins
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.textDark,
    flexDirection: "column",
  },

  /* Header - MODIFIED */
  header: {
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: 40,
  borderBottomWidth: 2,
  borderBottomColor: colors.primary,
  paddingBottom: 0,
  marginBottom: 14,
},
  headerContent: {
      flexDirection: 'column',
      // Removed marginTop and justifyContent center as parent handles alignment now
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: "uppercase",
    color: colors.primary,
    marginBottom: 2, // Reduced margin slightly
    letterSpacing: 0.5,
  },
  ref: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 2,
    fontWeight: 'medium',
  },
  logo: {
  width: 140,
  height: 90,
  objectFit: "contain",
  marginTop: -10,
},

  /* Sections */
  sectionContainer: {
      flexGrow: 1,
  },
  section: {
    marginBottom: 25,
  },
  /* Section Title - MODIFIED to "Light Box" style */
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white, // White text for contrast
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    // Box styling
    backgroundColor: colors.primary, // Brand color background
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },

  /* Rows */
  row: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 4,
  },
  label: {
    width: "35%",
    color: colors.textMedium,
    fontSize: 9.5,
    fontWeight: 'bold',
    lineHeight: 1.2,
  },
  value: {
    width: "65%",
    fontSize: 10,
    color: colors.textDark,
    flexWrap: 'wrap',
    lineHeight: 1.4,
  },
  monoValue: {
    fontFamily: 'Courier',
    fontSize: 9,
  },

  /* Main Layout Grid */
  grid: {
    flexDirection: "row",
    gap: 35,
  },
  col: {
    flex: 1,
  },

  /* --- Documents Section Grid Layout --- */
  docSection: {
      marginTop: 10, // Reduced margin top slightly due to new heading style
      paddingTop: 20,
      borderTopWidth: 2,
      borderTopColor: colors.borderSubtle,
      marginBottom: 20,
  },
  docGrid: {
      flexDirection: 'row',
      gap: 25,
      marginBottom: 15,
  },
  docLeftCol: {
      flex: 0.55,
  },
  docRightCol: {
      flex: 0.45,
      justifyContent: 'flex-start',
      paddingTop: 5,
  },

  /* Image Styles */
  imageBox: {
    flexDirection: "row",
    gap: 15,
  },
  imagePreviewContainer: {
      alignItems: 'center',
  },
  imagePreview: {
    width: 90,
    height: 65,
    objectFit: "contain",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 8,
    backgroundColor: colors.bgLight,
    borderRadius: 4,
  },
  imageLabel: {
      fontSize: 8.5,
      color: colors.textLight,
      marginTop: 6,
      fontWeight: 'bold',
      textAlign: 'center',
  },

  /* Document Links Stack */
  docStack: {
    flexDirection: 'column',
    gap: 12,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  docLabel: {
      width: "40%",
      color: colors.textMedium,
      fontSize: 9.5,
      fontWeight: 'bold',
  },
  docValue: {
      width: "60%",
      fontSize: 10,
      color: colors.textDark,
      flexWrap: 'wrap',
  },

  /* Links */
  link: {
    color: "#2563EB",
    textDecoration: "none",
  },

  /* Submission Note Box */
  noteBox: {
      padding: 15,
      backgroundColor: colors.bgLight,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.borderSubtle
  },

  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8.5,
    color: colors.textLight,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 12,
  },
});

/* -------------------- HELPERS -------------------- */

const text = (v: any) => (v ? String(v) : "-");

const arrayText = (v: any) =>
  Array.isArray(v) && v.length ? v.map(i => i.replace(/-/g, ' ')).join(", ") : "-";

const resolveFile = (file: any) => {
  if (!file) return null;
  if (file.path && typeof file.path === 'string') {
    return { isUploaded: true, name: file.filename, src: file.path };
  }
  if (typeof File !== 'undefined' && file instanceof File) {
      if (file.type.startsWith('image/')) {
         return { isUploaded: false, isImage: true, name: file.name, src: file };
      }
      return { isUploaded: false, isImage: false, name: file.name, src: null };
  }
  if (file.name) {
       return { isUploaded: false, isImage: false, name: file.name, src: null };
  }
  return null;
};

/* -------------------- COMPONENT -------------------- */

interface LeadPDFProps {
  formData: any;
  existingFiles?: any;
  referenceId: string | null;
}

export const LeadPDFDocument = ({ formData,existingFiles, referenceId }: LeadPDFProps) => {
  const companyLogo = resolveFile(formData.logoCompany || existingFiles?.logoCompany);
  const clientLogo = resolveFile(formData.logoClient || existingFiles?.logoClient);
  const vat = resolveFile(formData.vatCertificate || existingFiles?.vatCertificate);
  const trade = resolveFile(formData.tradeLicense || existingFiles?.tradeLicense);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>

        {/* HEADER - MODIFIED LAYOUT */}
        <View style={styles.header}>
          {/* Logo placed first (Left side) */}
          <Image src="/logo.png" style={styles.logo} />

          {/* Text content second (Right side) */}
          <View style={styles.headerContent}>
            <Text style={styles.title}>Varlet Location Registration</Text>
            <Text style={styles.ref}>Reference ID: {referenceId || "PENDING"}</Text>
            <Text style={styles.ref}>
              Submission Date: {new Date().toLocaleDateString([], {year: 'numeric', month: 'long', day: 'numeric'})}
            </Text>
          </View>
        </View>

        {/* MAIN CONTENT CONTAINER */}
        <View style={styles.sectionContainer}>
            <View style={styles.grid}>

            {/* --- LEFT COLUMN --- */}
            <View style={styles.col}>
                <View style={styles.section}>
                {/* Heading styles updated to "light box" automatically via stylesheet */}
                <Text style={styles.sectionTitle}>Location Details</Text>
                <View style={styles.row}><Text style={styles.label}>Location Name:</Text><Text style={styles.value}>{text(formData.locationName)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Parking Capacity:</Text><Text style={styles.value}>{text(formData.capacity)} Slots</Text></View>
                <View style={styles.row}><Text style={styles.label}>Avg Wait Time:</Text><Text style={styles.value}>{text(formData.waitTime)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Operation Timing:</Text><Text style={styles.value}>{text(formData.timing)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Registered Address:</Text><Text style={styles.value}>{text(formData.address)}</Text></View>
                {formData.latitude && formData.longitude && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Coordinates:</Text>
                        <Text style={{...styles.value, ...styles.monoValue}}>{text(formData.latitude)}, {text(formData.longitude)}</Text>
                    </View>
                )}
                </View>

                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Site Configuration</Text>
                <View style={styles.row}><Text style={styles.label}>No. of Lobbies:</Text><Text style={styles.value}>{text(formData.lobbies)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Key Rooms:</Text><Text style={styles.value}>{text(formData.keyRooms)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Lobby Distance:</Text><Text style={styles.value}>{text(formData.distance)}</Text></View>
                </View>

                 <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Roles & Access</Text>
                <View style={styles.row}><Text style={styles.label}>Supervisor Required:</Text><Text style={{...styles.value, textTransform: 'capitalize'}}>{text(formData.supervisorUser)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Validator Required:</Text><Text style={{...styles.value, textTransform: 'capitalize'}}>{text(formData.validationUser)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Finance Access:</Text><Text style={{...styles.value, textTransform: 'capitalize'}}>{text(formData.reportUser)}</Text></View>
                </View>
            </View>

            {/* --- RIGHT COLUMN --- */}
            <View style={styles.col}>
                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pricing & Ticket Setup</Text>
                <View style={styles.row}><Text style={styles.label}>Ticket Types:</Text><Text style={{...styles.value, textTransform: 'capitalize'}}>{arrayText(formData.ticketType)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Fee Structure:</Text><Text style={{...styles.value, textTransform: 'capitalize'}}>{arrayText(formData.feeType)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Tax Handling:</Text><Text style={{...styles.value, textTransform: 'capitalize'}}>{text(formData.vatType)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Pricing Details:</Text><Text style={styles.value}>{text(formData.ticketPricing)}</Text></View>
                </View>

                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Super Admin Contact</Text>
                <View style={styles.row}><Text style={styles.label}>Full Name:</Text><Text style={styles.value}>{text(formData.adminName)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Email Address:</Text><Text style={styles.value}>{text(formData.adminEmail)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Mobile Number:</Text><Text style={styles.value}>{text(formData.adminPhone)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Training Required:</Text><Text style={{...styles.value, textTransform: 'capitalize'}}>{text(formData.trainingRequired)}</Text></View>
                </View>

                <View style={styles.section}>
                <Text style={styles.sectionTitle}>Driver Team</Text>
                 <View style={styles.row}><Text style={styles.label}>Driver Count:</Text><Text style={styles.value}>{text(formData.driverCount)}</Text></View>
                  <View style={{...styles.row, borderBottomWidth: 0}}>
                    <Text style={styles.label}>Driver List:</Text>
                    <Text style={{...styles.value, ...styles.monoValue, fontSize: 9}}>{text(formData.driverList)}</Text>
                  </View>
                </View>
            </View>
            </View>
        </View>


        {/* DOCUMENTS & LOGOS SECTION */}
        <View style={styles.docSection} wrap={false}>
          <Text style={styles.sectionTitle}>Attachments & Submission</Text>

          <View style={styles.docGrid}>
            {/* LEFT COL: Logos */}
            <View style={styles.docLeftCol}>
                <View style={styles.imageBox}>
                    {companyLogo?.src && (
                        <View style={styles.imagePreviewContainer}>
                            <Image src={companyLogo.src} style={styles.imagePreview} />
                            <Text style={styles.imageLabel}>Company Logo</Text>
                        </View>
                    )}
                    {clientLogo?.src && (
                        <View style={styles.imagePreviewContainer}>
                            <Image src={clientLogo.src} style={styles.imagePreview} />
                            <Text style={styles.imageLabel}>Client Logo</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* RIGHT COL: Certificates */}
            <View style={styles.docRightCol}>
                <View style={styles.docStack}>
                    {vat && (
                        <View style={styles.docRow}>
                        <Text style={styles.docLabel}>VAT Certificate:</Text>
                        {vat.isUploaded && vat.src ? (
                            <Link src={vat.src} style={styles.link}> {vat.name}</Link>
                        ) : (
                            <Text style={styles.docValue}>{vat.name}</Text>
                        )}
                        </View>
                    )}
                    {trade && (
                        <View style={styles.docRow}>
                        <Text style={styles.docLabel}>Trade License:</Text>
                        {trade.isUploaded && trade.src ? (
                            <Link src={trade.src} style={styles.link}>{trade.name}</Link>
                        ) : (
                            <Text style={styles.docValue}> {trade.name}</Text>
                        )}
                        </View>
                    )}
                </View>
            </View>
          </View>

           {/* Submission Note Box */}
           <View style={styles.noteBox}>
             <Text style={{...styles.label, marginBottom: 4, color: colors.textDark}}>Submission Method Note:</Text>
             <Text style={{fontSize: 9.5, color: colors.textMedium, fontStyle: 'italic'}}>{text(formData.documentSubmitMethod)}</Text>
           </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Official Registration Record • Generated by VarletParking• {new Date().getFullYear()}
        </Text>

      </Page>
    </Document>
  );
};