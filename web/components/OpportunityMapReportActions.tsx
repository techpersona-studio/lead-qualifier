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
      <div className="no-print omr-actions">
        <button type="button" className="btn-brand" onClick={handlePrint}>
          Download PDF
        </button>
      </div>
      <OpportunityMapReport map={map} />
    </>
  );
}
