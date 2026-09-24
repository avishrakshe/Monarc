"use client";

import React, { useState } from "react";
import { X, ArrowRight, ShieldAlert, Sparkles, Coins } from "lucide-react";
import type { AgentData, JobData } from "../lib/mockData";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentData[];
  preselectedAgent?: AgentData | null;
  onJobCreated: (newJob: JobData) => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  agents,
  preselectedAgent,
  onJobCreated,
}) => {
  const [targetAgentId, setTargetAgentId] = useState<number>(
    preselectedAgent?.id || agents[0]?.id || 1
  );
  const [title, setTitle] = useState("");
  const [jobSpec, setJobSpec] = useState("");
  const [paymentMon, setPaymentMon] = useState("1.5");
  const [stakeMon, setStakeMon] = useState("0.3");
  const [challengeSeconds, setChallengeSeconds] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetAgent = agents.find((a) => a.id === targetAgentId) || agents[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newJob: JobData = {
        id: Math.floor(Math.random() * 8000) + 2000,
        title: title || "Automated DeFi Arbitrage & Liquidity Balancing",
        employerAgentId: 99,
        workerAgentId: targetAgent?.id || 1,
        employerName: "Marketplace-Client (You)",
        workerName: targetAgent?.name || "TargetAgent",
        paymentAmountMon: parseFloat(paymentMon),
        workerStakeRequiredMon: parseFloat(stakeMon),
        workerStakeDepositedMon: parseFloat(stakeMon),
        challengePeriodSeconds: challengeSeconds,
        timeRemainingSeconds: challengeSeconds,
        status: "DELIVERED",
        jobSpec: jobSpec || "Standard high-throughput routing & invariant check on Monad testnet.",
        deliveryHash: `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
        deliverySummary: `Autonomous delivery generated via Qwen 3.8 Max. Verified invariant correctness on Monad parallel EVM.`,
        createdAt: "Just now",
      };

      onJobCreated(newJob);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 relative border border-monad-500/30">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold text-cyber-cyan bg-cyber-cyan/10 px-2.5 py-1 rounded border border-cyber-cyan/30">
            x402 Protocol
          </span>
          <span className="text-xs text-gray-400 font-mono">Monad Testnet</span>
        </div>

        <h2 className="text-2xl font-black text-white mb-1">
          Create Agent Escrow Job
        </h2>
        <p className="text-xs text-gray-400 mb-6 font-mono">
          Locks payment MON into smart contract with 120s optimistic challenge window
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-gray-300 block mb-1">Select Target Worker Agent</label>
            <select
              value={targetAgentId}
              onChange={(e) => setTargetAgentId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-monad-500"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  #{agent.id} - {agent.name} ({agent.role} - Rep: {agent.reputationScore}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-gray-300 block mb-1">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Cross-DEX arbitrage routing simulation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-monad-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-gray-300 block mb-1">Specification & Acceptance Criteria</label>
            <textarea
              rows={3}
              required
              placeholder="Detail required deliverables, invariants, and performance bounds..."
              value={jobSpec}
              onChange={(e) => setJobSpec(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-monad-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">Payment Escrow (MON)</label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                required
                value={paymentMon}
                onChange={(e) => setPaymentMon(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-monad-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">Required Worker Stake</label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                required
                value={stakeMon}
                onChange={(e) => setStakeMon(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-monad-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-gray-300 block mb-1">
              Optimistic Challenge Window (Seconds)
            </label>
            <input
              type="number"
              min="30"
              max="86400"
              value={challengeSeconds}
              onChange={(e) => setChallengeSeconds(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-monad-500"
            />
            <span className="text-[10px] text-gray-500 font-mono block mt-1">
              Default: 120s for real-time sub-hiring finality on Monad
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-monad-500 to-monad-600 text-white shadow-lg shadow-monad-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <span>Broadcasting Escrow to Monad Testnet...</span>
            ) : (
              <>
                <Coins className="w-4 h-4" />
                <span>Deposit & Lock {paymentMon} MON Escrow</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
