import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ProposalPDF from "./ProposalPDF";
import { FileText } from "lucide-react";

interface QuotationTriggerProps {
  clientName: string;
  industry: string;
  proposedBudget: string;
  serviceType: string;
}

export default function QuotationTrigger({
  clientName,
  industry,
  proposedBudget,
  serviceType,
}: QuotationTriggerProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button className="flex items-center space-x-2 text-[10px] font-mono border border-zinc-800 bg-[#111] text-zinc-500 px-3 py-1.5 rounded cursor-not-allowed">
        <FileText className="w-3.5 h-3.5 animate-pulse" />
        <span>Initializing Renderer...</span>
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <ProposalPDF
          clientName={clientName}
          industry={industry}
          proposedBudget={proposedBudget}
          serviceType={serviceType}
        />
      }
      fileName={`Proposal_${clientName.replace(/\s+/g, "_")}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className={`flex items-center space-x-2 text-[10px] font-mono border border-[#00E5FF]/20 bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 text-[#00E5FF] hover:border-[#00E5FF]/50 px-3 py-1.5 rounded transition-all ${
            loading ? "cursor-wait opacity-65" : "cursor-pointer"
          }`}
        >
          <FileText className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Compiling Document..." : "Generate Formal Quote"}</span>
        </button>
      )}
    </PDFDownloadLink>
  );
}
