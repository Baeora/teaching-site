import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatDate, formatShortDate, formatCurrency } from "./utils";

const BRAND = {
  primary: "#43b1cb",
  secondary: "#ffb935",
  ink: "#0d1827",
  body: "#1f2937",
  muted: "#6b7280",
  rule: "#e5e7eb",
  bg: "#ffffff",
  zebra: "#f8fafc",
};

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    color: BRAND.body,
    fontSize: 10.5,
    backgroundColor: BRAND.bg,
  },
  header: {
    backgroundColor: BRAND.ink,
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 24, height: 49, objectFit: "contain" },
  brandName: { color: "#fff", fontSize: 16, fontFamily: "Helvetica-Bold" },
  brandSub: { color: "#cbd5e1", fontSize: 9, marginTop: 2 },
  invoiceLabel: {
    color: BRAND.primary,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textAlign: "right",
  },
  invoiceNum: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    textAlign: "right",
  },
  invoiceDate: { color: "#cbd5e1", fontSize: 9, marginTop: 4, textAlign: "right" },
  accentBar: { height: 4, backgroundColor: BRAND.primary },

  body: { paddingHorizontal: 40, paddingTop: 28, paddingBottom: 40 },

  twoCol: { flexDirection: "row", gap: 32, marginBottom: 28 },
  col: { flex: 1 },
  colTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BRAND.muted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  colLine: { fontSize: 11, color: BRAND.body, marginBottom: 2 },
  colLineStrong: {
    fontSize: 12,
    color: BRAND.ink,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },

  table: {
    borderWidth: 1,
    borderColor: BRAND.rule,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 18,
  },
  tableHead: {
    backgroundColor: BRAND.ink,
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  th: {
    color: "#fff",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tr: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: BRAND.rule,
  },
  trAlt: { backgroundColor: BRAND.zebra },
  trFirst: { borderTopWidth: 0 },
  td: { fontSize: 10.5, color: BRAND.body },

  colDate: { width: "22%" },
  colDesc: { flex: 1 },
  colQty: { width: "12%", textAlign: "right" },
  colRate: { width: "20%", textAlign: "right" },
  colAmt: { width: "20%", textAlign: "right" },

  totalsBox: {
    alignSelf: "flex-end",
    width: "55%",
    marginBottom: 24,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  totalsLabel: { color: BRAND.muted, fontSize: 10.5 },
  totalsValue: { color: BRAND.body, fontSize: 10.5 },
  totalsTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: BRAND.ink,
    borderRadius: 6,
    marginTop: 4,
  },
  totalsTotalLabel: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  totalsTotalValue: {
    color: BRAND.primary,
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },

  panel: {
    borderWidth: 1,
    borderColor: BRAND.rule,
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BRAND.muted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  panelBody: { fontSize: 10.5, color: BRAND.body, lineHeight: 1.5 },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: "center",
    color: BRAND.muted,
    fontSize: 9,
  },
  footerAccent: { color: BRAND.primary, fontFamily: "Helvetica-Bold" },
});

export default function InvoicePDF({
  invoiceNumber,
  invoiceDate,
  studentName,
  parentName,
  dayLabel,
  timeSlot,
  monthLabel,
  lessons, // array of Date
  rate,
  paymentInstructions,
  notes,
  logoSrc,
  business,
}) {
  const total = (lessons?.length || 0) * rate;
  const billTo = parentName?.trim() ? parentName : studentName;

  return (
    <Document
      title={`Invoice ${invoiceNumber}`}
      author={business.name}
      subject={`Music lesson invoice for ${studentName}`}
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : null}
            <View>
              <Text style={styles.brandName}>{business.name}</Text>
              <Text style={styles.brandSub}>{business.tagline}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNum}>{invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>Issued {formatDate(invoiceDate)}</Text>
          </View>
        </View>
        <View style={styles.accentBar} />

        <View style={styles.body}>
          {/* Bill To + From */}
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Text style={styles.colTitle}>Bill To</Text>
              <Text style={styles.colLineStrong}>{billTo}</Text>
              {parentName?.trim() && (
                <Text style={styles.colLine}>For lessons with: {studentName}</Text>
              )}
              <Text style={styles.colLine}>
                {dayLabel}s · {timeSlot}
              </Text>
              <Text style={styles.colLine}>{monthLabel}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.colTitle}>From</Text>
              <Text style={styles.colLineStrong}>{business.name}</Text>
              <Text style={styles.colLine}>{business.contactName}</Text>
              <Text style={styles.colLine}>{business.email}</Text>
              <Text style={styles.colLine}>{business.phone}</Text>
              <Text style={styles.colLine}>{business.location}</Text>
            </View>
          </View>

          {/* Line items */}
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colDate]}>Date</Text>
              <Text style={[styles.th, styles.colDesc]}>Description</Text>
              <Text style={[styles.th, styles.colQty]}>Qty</Text>
              <Text style={[styles.th, styles.colRate]}>Rate</Text>
              <Text style={[styles.th, styles.colAmt]}>Amount</Text>
            </View>
            {lessons.map((d, i) => (
              <View
                key={i}
                style={[styles.tr, i === 0 && styles.trFirst, i % 2 === 1 && styles.trAlt]}
              >
                <Text style={[styles.td, styles.colDate]}>{formatShortDate(d)}</Text>
                <Text style={[styles.td, styles.colDesc]}>
                  60-minute private music lesson · {dayLabel} {timeSlot}
                </Text>
                <Text style={[styles.td, styles.colQty]}>1</Text>
                <Text style={[styles.td, styles.colRate]}>{formatCurrency(rate)}</Text>
                <Text style={[styles.td, styles.colAmt]}>{formatCurrency(rate)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Lessons</Text>
              <Text style={styles.totalsValue}>{lessons.length}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Rate</Text>
              <Text style={styles.totalsValue}>{formatCurrency(rate)}</Text>
            </View>
            <View style={styles.totalsTotal}>
              <Text style={styles.totalsTotalLabel}>Amount Due</Text>
              <Text style={styles.totalsTotalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          {/* Payment + Notes */}
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Payment Instructions</Text>
            <Text style={styles.panelBody}>{paymentInstructions}</Text>
          </View>

          {notes?.trim() ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Notes</Text>
              <Text style={styles.panelBody}>{notes}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.footer} fixed>
          Thank you for letting me be part of your music journey.{"  "}
          <Text style={styles.footerAccent}>{business.name}</Text>
          {"  ·  "}
          {business.email}
        </Text>
      </Page>
    </Document>
  );
}
