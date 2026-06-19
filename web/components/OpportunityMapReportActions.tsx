"use client";

import { OpportunityMapReport } from "@/components/OpportunityMapForm";
import type { OpportunityMap } from "@/types/opportunity-map";

interface Props {
  map: OpportunityMap;
}

export function OpportunityMapReportActions({ map }: Props) {
  const handlePrint = () => window.print();

  return (
    <>
      <div className="no-print" style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <button type="button" className="btn-primary" onClick={handlePrint}>
          Download PDF
        </button>
      </div>
      <OpportunityMapReport map={map} />
    </>
  );
}
