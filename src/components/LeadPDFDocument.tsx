import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#ae5c83",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "uppercase",
  },
  reference: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ae5c83",
    marginBottom: 8,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 4,
  },
  label: {
    width: "40%",
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "bold",
  },
  value: {
    width: "60%",
    fontSize: 10,
    color: "#111827",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: "center",
    color: "#9CA3AF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
});

interface LeadPDFProps {
  formData: any;
  referenceId: string | null;
}

// Format arrays (like ticket types)
const formatValue = (val: any) => {
  if (Array.isArray(val)) return val.join(", ");
  if (!val) return "-";
  return val;
};

// Format file objects
const formatFile = (file: any) => {
    if(file instanceof File) return file.name;
    // Handle existing file structure from DB if necessary
    if(file && file.filename) return file.filename;
    return "Not Attached";
}

export const LeadPDFDocument = ({ formData, referenceId }: LeadPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>Registration Summary</Text>
            <Text style={styles.reference}>Ref: {referenceId || "PENDING"}</Text>
            <Text style={styles.reference}>Date: {new Date().toLocaleDateString()}</Text>
        </View>
        {/* You can add a static logo image here if you have a public URL for it */}
        {/* <Image src="https://your-domain.com/logo.png" style={{width: 50, height: 50}} /> */}
      </View>

      {/* Section 1: Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Location Information</Text>
        <View style={styles.row}><Text style={styles.label}>Location Name:</Text><Text style={styles.value}>{formData.locationName}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Capacity:</Text><Text style={styles.value}>{formData.capacity}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Wait Time:</Text><Text style={styles.value}>{formData.waitTime}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Timing:</Text><Text style={styles.value}>{formData.timing}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Coordinates:</Text><Text style={styles.value}>{formData.latitude}, {formData.longitude}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Address:</Text><Text style={styles.value}>{formData.address}</Text></View>
      </View>

      {/* Section 2: Operations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. On-Site Setup</Text>
        <View style={styles.row}><Text style={styles.label}>Lobbies:</Text><Text style={styles.value}>{formData.lobbies}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Key Rooms:</Text><Text style={styles.value}>{formData.keyRooms}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Supervisor:</Text><Text style={styles.value}>{formData.supervisorUser}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Validator:</Text><Text style={styles.value}>{formData.validationUser}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Reports:</Text><Text style={styles.value}>{formData.reportUser}</Text></View>
      </View>

      {/* Section 3: Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Pricing & Tickets</Text>
        <View style={styles.row}><Text style={styles.label}>Ticket Type:</Text><Text style={styles.value}>{formatValue(formData.ticketType)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Fee Type:</Text><Text style={styles.value}>{formatValue(formData.feeType)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Pricing:</Text><Text style={styles.value}>{formData.ticketPricing}</Text></View>
        <View style={styles.row}><Text style={styles.label}>VAT Handling:</Text><Text style={styles.value}>{formData.vatType}</Text></View>
      </View>

      {/* Section 4: Admin & Drivers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Admin & Drivers</Text>
        <View style={styles.row}><Text style={styles.label}>Driver Count:</Text><Text style={styles.value}>{formData.driverCount}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Admin Name:</Text><Text style={styles.value}>{formData.adminName}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Admin Email:</Text><Text style={styles.value}>{formData.adminEmail}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Admin Phone:</Text><Text style={styles.value}>{formData.adminPhone}</Text></View>
      </View>
      
       {/* Section 5: Documents (Filenames only) */}
       <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Attached Documents</Text>
        <View style={styles.row}><Text style={styles.label}>Company Logo:</Text><Text style={styles.value}>{formatFile(formData.logoCompany)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Client Logo:</Text><Text style={styles.value}>{formatFile(formData.logoClient)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>VAT Cert:</Text><Text style={styles.value}>{formatFile(formData.vatCertificate)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Trade License:</Text><Text style={styles.value}>{formatFile(formData.tradeLicense)}</Text></View>
      </View>

      <Text style={styles.footer}>Generated automatically by Valet System • {new Date().getFullYear()}</Text>
    </Page>
  </Document>
);