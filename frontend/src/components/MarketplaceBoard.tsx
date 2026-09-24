"use client";

import React, { useState } from "react";
import { Clock, Shield, Coins, AlertTriangle, CheckCircle2, ArrowRight, Filter, Search } from "lucide-react";
import type { JobData } from "../lib/mockData";

interface MarketplaceBoardProps {
  jobs: JobData[];
  onSelectJob: (job: JobData) => void;
  onCreateJob: () => void;
}

export const MarketplaceBoard: React.FC<MarketplaceBoardProps> = ({
  jobs,
  onSelectJob,
  onCreateJob,
}) => {
  const [filter, setFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredJobs = jobs.filter((job) => {
    if (filter !== "ALL" && job.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        job.title.toLowerCase().includes(term) ||
        job.employerName.toLowerCase().includes(term) ||
        job.workerName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>x402 Payment Settlement Escrows</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-monad-500/20 text-monad-300 font-mono border border-monad-500/30">
              {jobs.length} Total
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time agent-to-agent escrow with 120-second optimistic challenge window on Monad testnet
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search jobs, agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-monad-500 w-48 sm:w-60 font-mono"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-mono">
            {["ALL", "DELIVERED", "SETTLED", "DISPUTED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filter === st
                    ? "bg-monad-500 text-white font-semibold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Create Escrow CTA */}
          <button
            onClick={onCreateJob}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-monad-600 hover:bg-monad-500 text-white transition-all shadow-md shadow-monad-600/30"
          >
            + New Escrow
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => onSelectJob(job)}
            className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: ID, Title, Agents */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold text-monad-400 bg-monad-950 px-2 py-0.5 rounded border border-monad-500/20">
                  Job #{job.id}
                </span>
                <span className="text-xs text-gray-400 font-mono">{job.createdAt}</span>

                {/* Status Badges */}
                {job.status === "DELIVERED" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Challenge Active ({job.timeRemainingSeconds ?? 84}s)
                  </span>
                )}
                {job.status === "SETTLED" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Settled & Autopaid
                  </span>
                )}
                {job.status === "DISPUTED" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Disputed (In Arbitration)
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white mb-2 line-clamp-1">
                {job.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-[11px]">Employer:</span>
                  <span className="text-white font-medium">{job.employerName}</span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-[11px]">Worker:</span>
                  <span className="text-white font-medium">{job.workerName}</span>
                </div>
              </div>
            </div>

            {/* Right: Payment, Stake, CTA */}
            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
              <div className="text-right">
                <div className="text-sm sm:text-base font-black text-cyber-cyan font-mono">
                  {job.paymentAmountMon} MON
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  Stake: {job.workerStakeRequiredMon} MON
                </div>
              </div>

              <button className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-monad-500/20 text-monad-300 border border-white/10 hover:border-monad-500/40 transition-all flex items-center gap-1">
                <span>Inspect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
