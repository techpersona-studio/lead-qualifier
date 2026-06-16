import type { QualificationResult } from "@/types/lead";

const GRADE_COLOR: Record<string, string> = {
  A: "text-green-600",
  B: "text-blue-600",
  C: "text-yellow-600",
  D: "text-red-600",
};

interface Props {
  result: QualificationResult;
}

export function QualificationResultCard({ result }: Props) {
  return (
    <div className="rounded-2xl border p-6 space-y-4">
      <div className="flex items-center gap-4">
        <span className={`text-5xl font-bold ${GRADE_COLOR[result.grade]}`}>{result.grade}</span>
        <div>
          <p className="text-2xl font-semibold">{result.score}/100</p>
          <p className="text-gray-500">{result.recommendedAction}</p>
        </div>
      </div>
      <p className="text-gray-700">{result.summary}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {(["fit", "intent", "budget", "urgency"] as const).map((dim) => (
          <div key={dim} className="flex justify-between border rounded px-3 py-2">
            <span className="capitalize text-gray-500">{dim}</span>
            <span className="font-medium">{result[dim]}/10</span>
          </div>
        ))}
      </div>
      {result.flags.length > 0 && (
        <ul className="text-sm space-y-1">
          {result.flags.map((f, i) => (
            <li key={i} className="text-gray-600">
              • {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
