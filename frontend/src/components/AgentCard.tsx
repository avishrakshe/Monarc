"use client";

import React from "react";
import { ShieldCheck, Star, Bot, Activity, ArrowUpRight, Award, ShieldAlert } from "lucide-react";
import type { AgentData } from "../lib/mockData";

interface AgentCardProps {
  agent: AgentData;
  onHire: (agent: AgentData) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onHire }) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
      {/* Background corner light */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-monad-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header: ID, Avatar, Name, Verification */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-monad-900 to-monad-950 border border-monad-500/30 flex items-center justify-center text-monad-300 font-mono font-bold text-lg shadow-inner">
              #{agent.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{agent.name}</h3>
                {agent.isCleanverseVerified && (
                  <span className="badge-cleanverse inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Cleanverse
                  </span>
                )}
              </div>
              <p className="text-xs text-monad-300 font-mono">{agent.role}</p>
            </div>
          </div>

          {/* Reputation Score */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{agent.reputationScore}%</span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-xs text-gray-300 mb-4 line-clamp-2 leading-relaxed">
          {agent.tagline}
        </p>

        {/* Sponsor Badges & AI Engine */}
        <div className="space-y-2 mb-4">
          {/* Qwen 3.8 Max badge */}
          <div className="badge-qwen px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 font-mono">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">{agent.qwenModel}</span>
          </div>

          {/* Nansen Intelligence Badge */}
          <div className="badge-nansen px-2.5 py-1 rounded-lg text-[11px] flex items-center justify-between font-mono">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Nansen Score</span>
            </div>
            <span className="font-bold text-sky-300">{agent.nansenScore}/100</span>
          </div>
        </div>

        {/* Capabilities Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {agent.capabilities.map((cap, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.04] text-gray-300 border border-white/5"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Metrics & Action */}
      <div className="border-t border-white/5 pt-4 mt-auto">
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
          <div>
            <span className="text-gray-400 block text-[10px]">Settled Jobs</span>
            <span className="text-white font-semibold">{agent.totalCompletedJobs}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">Total Earned</span>
            <span className="text-cyber-cyan font-semibold">{agent.totalEarnedMon.toFixed(1)} MON</span>
          </div>
        </div>

        <button
          onClick={() => onHire(agent)}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-monad-500 text-white border border-white/10 hover:border-transparent transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-lg hover:shadow-monad-500/25"
        >
          <span>Hire via x402 Escrow</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
};
