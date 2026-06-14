import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface ProposalPDFProps {
  clientName: string;
  industry: string;
  proposedBudget: string;
  serviceType: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: "#18181b",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#18181b",
    paddingBottom: 20,
    marginBottom: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brandBlock: {
    display: "flex",
    flexDirection: "column",
  },
  wordmarkMain: {
    fontSize: 16,
    letterSpacing: 2,
    color: "#000000",
  },
  wordmarkSub: {
    fontSize: 9,
    letterSpacing: 1,
    color: "#71717a",
    marginTop: 4,
  },
  metaBlock: {
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
  },
  docType: {
    fontSize: 11,
    letterSpacing: 1,
    color: "#000000",
  },
  metaDate: {
    fontSize: 8,
    color: "#71717a",
    marginTop: 4,
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#71717a",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  clientSection: {
    marginBottom: 35,
  },
  clientName: {
    fontSize: 22,
    color: "#000000",
    marginBottom: 4,
  },
  clientIndustry: {
    fontSize: 11,
    color: "#71717a",
  },
  scopeSection: {
    marginBottom: 35,
  },
  scopeTable: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 2,
  },
  scopeHeader: {
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    padding: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scopeHeaderText: {
    fontSize: 9,
    color: "#27272a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scopeRow: {
    padding: 12,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scopeDesc: {
    fontSize: 11,
    color: "#18181b",
  },
  scopeQty: {
    fontSize: 11,
    color: "#71717a",
  },
  financialSection: {
    marginBottom: 40,
    backgroundColor: "#f4f4f5",
    padding: 20,
    borderRadius: 2,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  financialLabel: {
    fontSize: 11,
    color: "#27272a",
    letterSpacing: 0.5,
  },
  financialAmount: {
    fontSize: 20,
    color: "#000000",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 15,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#a1a1aa",
    maxWidth: "70%",
    lineHeight: 1.3,
  },
  contactText: {
    fontSize: 7,
    color: "#71717a",
    textAlign: "right",
  },
  contactBlock: {
    display: "flex",
    flexDirection: "column",
  },
});

export default function ProposalPDF({ clientName, industry, proposedBudget, serviceType }: ProposalPDFProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandBlock}>
              <Text style={styles.wordmarkMain}>B-CORE DIGITAL</Text>
              <Text style={styles.wordmarkSub}>SEVEN WORKSPACE ECOSYSTEM</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.docType}>FORMAL PROPOSAL</Text>
              <Text style={styles.metaDate}>DATE: {currentDate}</Text>
            </View>
          </View>

          {/* Client Details */}
          <View style={styles.clientSection}>
            <Text style={styles.sectionTitle}>Prepared For</Text>
            <Text style={styles.clientName}>{clientName}</Text>
            <Text style={styles.clientIndustry}>{industry}</Text>
          </View>

          {/* Scope of Work */}
          <View style={styles.scopeSection}>
            <Text style={styles.sectionTitle}>Scope of Services</Text>
            <View style={styles.scopeTable}>
              <View style={styles.scopeHeader}>
                <Text style={styles.scopeHeaderText}>Service Line</Text>
                <Text style={styles.scopeHeaderText}>Allocation</Text>
              </View>
              <View style={styles.scopeRow}>
                <Text style={styles.scopeDesc}>{serviceType}</Text>
                <Text style={styles.scopeQty}>Fixed Deliverable</Text>
              </View>
            </View>
          </View>

          {/* Financials */}
          <View style={styles.financialSection}>
            <Text style={styles.financialLabel}>PROPOSED INVESTMENT</Text>
            <Text style={styles.financialAmount}>{proposedBudget}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            CONFIDENTIALITY NOTICE: The contents of this document are proprietary and intellectual property of B-Core Digital. Unauthorized distribution is strictly prohibited under legal covenant.
          </Text>
          <View style={styles.contactBlock}>
            <Text style={styles.contactText}>operations@b-core.digital</Text>
            <Text style={styles.contactText}>b-core.digital</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
