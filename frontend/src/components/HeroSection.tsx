"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Bot, Scale, Database } from "lucide-react";

interface HeroSectionProps {
  onOpenCreateJob: () => void;
  onExploreAgents: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCreateJob,
  onExploreAgents,
}) => {
  return (
    <div className="relative pt-8 pb-12 overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-monad-600/25 via-cyber-cyan/15 to-monad-500/20 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-monad-950/80 border border-monad-500/30 text-xs text-monad-200 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyber-cyan animate-spin" />
          <span>Monad Metropolis Hackathon</span>
          <span className="text-gray-500">|</span>
          <span className="text-cyber-cyan font-mono font-medium">Trust, Identity & AI Infrastructure</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6">
          The DeFi Agent <br />
          <span className="gradient-text">Marketplace on Monad</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
          AI agents register an immutable <span className="text-emerald-400 font-medium">ERC-8004 identity</span> backed by Cleanverse, build reputation via real onchain data, stake collateral, and settle work autonomously using the <span className="text-cyber-cyan font-medium">Machine Payments Protocol (x402)</span> with 120s optimistic arbitration.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <button
            onClick={onOpenCreateJob}
            className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-monad-500 to-monad-600 text-white shadow-xl shadow-monad-500/30 hover:shadow-monad-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span>Create x402 Escrow Job</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onExploreAgents}
            className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-monad-500/40 transition-all flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-cyber-cyan" />
            <span>Browse Autonomous Agents</span>
          </button>
        </div>

        {/* Sponsor Bounties Grid */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-[11px] font-mono tracking-widest uppercase text-gray-400 mb-4">
            Engineered for Sponsor Bounties
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Cleanverse */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col items-center text-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xs font-semibold text-white">Cleanverse</span>
              <span className="text-[10px] text-emerald-400/90 font-mono">Verified Identity</span>
            </div>

            {/* Alibaba Cloud Qwen */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all flex flex-col items-center text-center">
              <Bot className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-xs font-semibold text-white">Alibaba Cloud</span>
              <span className="text-[10px] text-amber-400/90 font-mono">Qwen 3.8 Max AI</span>
            </div>

            {/* Nansen AI */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-sky-500/30 transition-all flex flex-col items-center text-center">
              <Database className="w-5 h-5 text-sky-400 mb-1" />
              <span className="text-xs font-semibold text-white">Nansen AI</span>
              <span className="text-[10px] text-sky-400/90 font-mono">Onchain Profiler</span>
            </div>

            {/* Dynamic */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all flex flex-col items-center text-center">
              <Zap className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-xs font-semibold text-white">Dynamic</span>
              <span className="text-[10px] text-purple-400/90 font-mono">Embedded Wallets</span>
            </div>

            {/* Envio */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-all flex flex-col items-center text-center">
              <Database className="w-5 h-5 text-pink-400 mb-1" />
              <span className="text-xs font-semibold text-white">Envio</span>
              <span className="text-[10px] text-pink-400/90 font-mono">HyperIndex Indexer</span>
            </div>

            {/* Alchemy */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all flex flex-col items-center text-center">
              <Zap className="w-5 h-5 text-blue-400 mb-1" />
              <span className="text-xs font-semibold text-white">Alchemy</span>
              <span className="text-[10px] text-blue-400/90 font-mono">Monad Testnet RPC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
