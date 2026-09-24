"use client";

import React, { useState } from "react";
import { Scale, AlertTriangle, ShieldCheck, CheckCircle2, UserX, Info, ExternalLink } from "lucide-react";
import type { JobData } from "../lib/mockData";

interface DisputePanelProps {
  jobs: JobData[];
  onResolveDispute: (jobId: number, favorWorker: boolean, notes: string) => void;
}

export const DisputePanel: React.FC<DisputePanelProps> = ({
  jobs,
  onResolveDispute,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const disputedJobs = jobs.filter((j) => j.status === "DISPUTED");
  const selectedJob = disputedJobs.find((j) => j.id === selectedJobId) || disputedJobs[0];

  const handleResolution = (favorWorker: boolean) => {
    if (!selectedJob) return;
    setIsProcessing(true);

    setTimeout(() => {
      onResolveDispute(
        selectedJob.id,
        favorWorker,
        resolutionNotes || (favorWorker ? "Delivery confirmed compliant" : "Collateral slashed for non-compliance")
      );
      setIsProcessing(false);
      setResolutionNotes("");
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-8 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 font-mono leading-relaxed">
          <strong className="text-white font-bold block mb-1">
            MVP Arbitration Scoping Notice:
          </strong>
          Monarc implements optimistic settlement where deliveries start a fixed 120s challenge window. If undisputed, funds auto-release. If disputed, a single env-configured resolver address decides manually and the loser is slashed.{" "}
          <span className="text-white font-semibold">Decentralized arbiter pool is on the roadmap.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Disputed Cases List */}
        <div className="glass-panel rounded-2xl p-5 border border-monad-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              <span>Pending Disputes</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {disputedJobs.length} Active
            </span>
          </div>

          {disputedJobs.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs font-mono">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
              <span>No pending disputes. All jobs settled smoothly.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {disputedJobs.map((j) => (
                <div
                  key={j.id}
                  onClick={() => setSelectedJobId(j.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                    selectedJob?.id === j.id
                      ? "bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-900/20"
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-rose-400 font-bold">Case #{j.id}</span>
                    <span className="text-gray-400">{j.paymentAmountMon} MON</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate mb-1">{j.title}</h4>
                  <div className="text-[11px] text-gray-400 font-mono">
                    Initiator: {j.employerName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Arbitration Ruling Chamber */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-monad-500/20">
          {selectedJob ? (
            <div>
              <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
                <div>
                  <span className="text-xs font-mono text-gray-400">Arbitration Docket</span>
                  <h3 className="text-lg font-bold text-white">Dispute Case #{selectedJob.id}</h3>
                </div>
                <div className="text-right text-xs font-mono">
                  <span className="text-gray-400 block">Total At Stake</span>
                  <span className="text-cyber-cyan font-bold text-sm">
                    {(selectedJob.paymentAmountMon + selectedJob.workerStakeDepositedMon).toFixed(2)} MON
                  </span>
                </div>
              </div>

              {/* Dispute statement */}
              <div className="mb-5 p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <span className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider block mb-1">
                  Dispute Claim Filed
                </span>
                <p className="text-xs text-rose-200 font-mono leading-relaxed">
                  {selectedJob.disputeReason}
                </p>
              </div>

              {/* Job spec & delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                    Original Job Specification
                  </span>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 font-mono h-32 overflow-y-auto">
                    {selectedJob.jobSpec}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                    Submitted Delivery Output
                  </span>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 font-mono h-32 overflow-y-auto">
                    {selectedJob.deliverySummary}
                  </div>
                </div>
              </div>

              {/* Resolver Notes Input */}
              <div className="mb-6">
                <label className="text-xs font-mono text-gray-300 block mb-1">
                  Resolver Rationale & Findings:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invariant analysis shows worker satisfied SLA bounds within tolerance..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-monad-500"
                />
              </div>

              {/* Decision Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <button
                  disabled={isProcessing}
                  onClick={() => handleResolution(true)}
                  className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-1 hover:shadow-lg hover:shadow-emerald-600/20"
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Rule in Favor of Worker</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-normal">
                    Releases {selectedJob.paymentAmountMon} MON + returns worker collateral
                  </span>
                </button>

                <button
                  disabled={isProcessing}
                  onClick={() => handleResolution(false)}
                  className="p-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-1 hover:shadow-lg hover:shadow-rose-600/20"
                >
                  <div className="flex items-center gap-1.5">
                    <UserX className="w-4 h-4 text-rose-400" />
                    <span>Rule in Favor of Employer (SLASH)</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-normal">
                    Refunds employer + slashes {selectedJob.workerStakeRequiredMon} MON collateral
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500 text-xs font-mono">
              Select a dispute docket on the left to review evidence and arbitrate
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
