"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Bot, Sparkles, CheckCircle2 } from "lucide-react";
import type { AgentData } from "../lib/mockData";

interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (newAgent: AgentData) => void;
}

export const RegisterAgentModal: React.FC<RegisterAgentModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<AgentData["role"]>("Arbitrage");
  const [tagline, setTagline] = useState("");
  const [wallet, setWallet] = useState("0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db");
  const [requestCleanverse, setRequestCleanverse] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newAgent: AgentData = {
        id: Math.floor(Math.random() * 900) + 100,
        name: name || "MonadAutonomousSentinel",
        tagline: tagline || "Real-time AI agent operating on Monad parallel EVM",
        role,
        walletAddress: wallet as `0x${string}`,
        ownerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        isCleanverseVerified: requestCleanverse,
        cleanverseScore: requestCleanverse ? 96 : 40,
        nansenScore: 92,
        nansenLabels: ["Verified Agent", "Low Risk"],
        qwenModel: "Qwen 3.8 Max (Alibaba Cloud)",
        capabilities: ["Parallel EVM Execution", "x402 Autopay", "Onchain Analytics"],
        reputationScore: 95,
        totalCompletedJobs: 0,
        totalDisputedJobs: 0,
        totalEarnedMon: 0,
        avatarSeed: name,
      };

      onRegistered(newAgent);
      setIsSubmitting(false);
      onClose();
    }, 700);
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
            ERC-8004 Standard
          </span>
          <span className="text-xs text-gray-400 font-mono">Monad Metropolis</span>
        </div>

        <h2 className="text-2xl font-black text-white mb-1">
          Register Autonomous Agent
        </h2>
        <p className="text-xs text-gray-400 mb-6 font-mono">
          Mints an ERC-721 Agent Card identity token with Cleanverse Sybil-resistance badge
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-gray-300 block mb-1">Agent Name</label>
            <input
              type="text"
              required
              placeholder="e.g. LiquidMonad-Optimizer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-monad-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-gray-300 block mb-1">Specialization / Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AgentData["role"])}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-monad-500"
            >
              <option value="Arbitrage">Arbitrage & DEX Routing</option>
              <option value="Security">Security & Bytecode Auditing</option>
              <option value="Market Making">Market Making & Orderbook Sentinel</option>
              <option value="Yield Strategy">Yield Strategy & Collateral Rebalancing</option>
              <option value="Data Oracle">Data Oracle & Risk Attestation</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-mono text-gray-300 block mb-1">Tagline & Objective</label>
            <input
              type="text"
              required
              placeholder="e.g. High-frequency MEV searcher on Monad testnet"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-monad-500"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-gray-300 block mb-1">
              Operational Wallet Address (Dynamic Embedded / Viem)
            </label>
            <input
              type="text"
              required
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-monad-500"
            />
          </div>

          {/* Cleanverse integration check */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-white block">Cleanverse Identity Verification</span>
                <span className="text-[10px] text-gray-400 font-mono">Issue Sybil-resistant cryptographic proof</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={requestCleanverse}
              onChange={(e) => setRequestCleanverse(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
            />
          </div>

          {/* AI Model Badge */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300 font-mono">
            <Bot className="w-4 h-4 text-amber-400" />
            <span>AI Decision Engine: Alibaba Cloud Qwen 3.8 Max</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-monad-500 to-cyber-cyan text-white shadow-lg shadow-monad-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <span>Minting ERC-8004 Identity on Monad...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Mint ERC-8004 Identity Token</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
