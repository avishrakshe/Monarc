"use client";

import React, { useState } from "react";
import { X, Clock, AlertTriangle, CheckCircle2, Shield, ExternalLink, Bot, Scale } from "lucide-react";
import type { JobData } from "../lib/mockData";

interface JobDetailModalProps {
  job: JobData | null;
  onClose: () => void;
  onClaim: (jobId: number) => void;
  onDispute: (jobId: number, reason: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  onClaim,
  onDispute,
}) => {
  const [disputeInput, setDisputeInput] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative border border-monad-500/30 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold text-monad-400 bg-monad-950 px-2.5 py-1 rounded border border-monad-500/20">
            Escrow Job #{job.id}
          </span>
          <span className="text-xs text-gray-400 font-mono">Machine Payments Protocol (x402)</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mb-4 pr-8">
          {job.title}
        </h2>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 text-xs font-mono">
          <div>
            <span className="text-gray-400 block text-[11px]">Employer Agent</span>
            <span className="text-white font-semibold">{job.employerName}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Worker Agent</span>
            <span className="text-white font-semibold">{job.workerName}</span>
          </div>
        </div>

        {/* Escrow & Collateral Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 font-mono text-center">
          <div className="p-3 rounded-xl bg-monad-950/60 border border-monad-500/20">
            <span className="text-[10px] text-gray-400 block">Locked Payment</span>
            <span className="text-lg font-bold text-cyber-cyan">{job.paymentAmountMon} MON</span>
          </div>
          <div className="p-3 rounded-xl bg-monad-950/60 border border-monad-500/20">
            <span className="text-[10px] text-gray-400 block">Worker Stake</span>
            <span className="text-lg font-bold text-amber-400">{job.workerStakeDepositedMon} MON</span>
          </div>
          <div className="p-3 rounded-xl bg-monad-950/60 border border-monad-500/20">
            <span className="text-[10px] text-gray-400 block">Optimistic Window</span>
            <span className="text-lg font-bold text-white">{job.challengePeriodSeconds}s</span>
          </div>
        </div>

        {/* Job Specification */}
        <div className="mb-6">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Work Specification (Commitment Hash Verified)
          </h4>
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 font-mono leading-relaxed">
            {job.jobSpec}
          </div>
        </div>

        {/* Delivery Section */}
        {job.deliverySummary && (
          <div className="mb-6">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              <span>Qwen 3.8 Max Delivery Output</span>
            </h4>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 font-mono leading-relaxed mb-2">
              {job.deliverySummary}
            </div>
            {job.deliveryHash && (
              <div className="text-[11px] text-gray-400 font-mono flex items-center justify-between">
                <span>Proof Hash: <code className="text-monad-300">{job.deliveryHash.slice(0, 18)}...</code></span>
                <span className="text-emerald-400">Verified on Monad Parallel EVM</span>
              </div>
            )}
          </div>
        )}

        {/* Dispute Details if disputed */}
        {job.status === "DISPUTED" && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200 font-mono">
            <div className="flex items-center gap-2 font-bold mb-1 text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Active Arbitration Case</span>
            </div>
            <p className="mb-2">{job.disputeReason}</p>
            <div className="text-[11px] text-gray-400">
              Dispute Model: MVP Single Resolver ({job.disputeResolver || "Admin Resolver"}). Loser collateral will be slashed.
            </div>
          </div>
        )}

        {/* Dispute Input Form */}
        {showDisputeForm && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
            <label className="text-xs font-mono text-rose-300 block mb-2 font-semibold">
              Reason for Dispute (Challenge Window):
            </label>
            <textarea
              rows={3}
              value={disputeInput}
              onChange={(e) => setDisputeInput(e.target.value)}
              placeholder="State non-compliance with original specification..."
              className="w-full p-2.5 rounded-lg bg-black/60 border border-rose-500/30 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-rose-400 mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDisputeForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (disputeInput.trim()) {
                    onDispute(job.id, disputeInput.trim());
                    setShowDisputeForm(false);
                  }
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Confirm Dispute
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <div className="text-xs font-mono text-gray-400">
            Status: <span className="text-white font-bold">{job.status}</span>
          </div>

          <div className="flex items-center gap-2">
            {job.status === "DELIVERED" && !showDisputeForm && (
              <>
                <button
                  onClick={() => setShowDisputeForm(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Challenge Delivery</span>
                </button>
                <button
                  onClick={() => onClaim(job.id)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Auto-Release Payment ({job.paymentAmountMon} MON)</span>
                </button>
              </>
            )}

            {job.status === "SETTLED" && (
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>Job fully settled & feedback recorded onchain</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
