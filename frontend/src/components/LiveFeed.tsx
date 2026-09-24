"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, Bot, CheckCircle2, Zap, ArrowRight, CornerDownRight } from "lucide-react";

interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: "IDENTITY" | "ESCROW" | "AI_REASONING" | "SUB_HIRE" | "SETTLEMENT";
  title: string;
  detail: string;
  badge: string;
  badgeColor: string;
}

const INITIAL_EVENTS: TelemetryEvent[] = [
  {
    id: "evt-1",
    timestamp: "12:44:11",
    type: "SETTLEMENT",
    title: "Job #1003 Settled via x402 Auto-Release",
    detail: "Released 3.5 MON payment + 0.75 MON collateral to BytecodeSecurity-Auditor upon 120s window expiry.",
    badge: "x402 Autopay",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "evt-2",
    timestamp: "12:44:09",
    type: "AI_REASONING",
    title: "Qwen 3.8 Max Synthesized Delivery Proof",
    detail: "Calculated optimal AMM cross-tick liquidity distribution with 0.00015 MON gas overhead.",
    badge: "Qwen 3.8 Max",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "evt-3",
    timestamp: "12:44:06",
    type: "SUB_HIRE",
    title: "Autonomous Sub-Hiring Triggered",
    detail: "MonadArbitrage-Alpha sub-hired KuruOrderbook-Sentinel for limit order verification (0.35 MON escrow).",
    badge: "Sub-Hire",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  {
    id: "evt-4",
    timestamp: "12:44:02",
    type: "IDENTITY",
    title: "Cleanverse Sybil Check Passed",
    detail: "Verified cryptographic identity attestation for Agent #2 (Score: 99/100).",
    badge: "Cleanverse",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "evt-5",
    timestamp: "12:43:58",
    type: "ESCROW",
    title: "x402 Escrow Created",
    detail: "Locked 1.25 MON in PaymentSettlement.sol for DEX routing task on Monad testnet.",
    badge: "Monad #10143",
    badgeColor: "text-cyber-cyan bg-cyan-500/10 border-cyan-500/30",
  },
];

export const LiveFeed: React.FC = () => {
  const [events, setEvents] = useState<TelemetryEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0] || "";

      const simulatedTypes = [
        {
          type: "AI_REASONING" as const,
          title: "Qwen 3.8 Max Risk Evaluation",
          detail: "Evaluated 4 DEX routing candidates. Optimal parallel execution path found.",
          badge: "Qwen 3.8 Max",
          badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        },
        {
          type: "SETTLEMENT" as const,
          title: "Optimistic 120s Countdown Milestone",
          detail: "Job #1002 challenge window reached 0 disputes. Executed claimPayment().",
          badge: "x402 Autopay",
          badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        },
        {
          type: "ESCROW" as const,
          title: "Collateral Deposited by Worker Agent",
          detail: "Deposited 0.25 MON worker stake collateral into PaymentSettlement contract.",
          badge: "Monad #10143",
          badgeColor: "text-cyber-cyan bg-cyan-500/10 border-cyan-500/30",
        },
      ];

      const chosen = simulatedTypes[Math.floor(Math.random() * simulatedTypes.length)]!;
      const newEvt: TelemetryEvent = {
        id: `evt-${Date.now()}`,
        timestamp: timeStr,
        ...chosen,
      };

      setEvents((prev) => [newEvt, ...prev.slice(0, 7)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="glass-panel rounded-2xl p-6 border border-monad-500/20">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span>Live Agent Telemetry Feed</span>
              <span className="text-xs text-gray-400 font-normal">Streaming onchain activity</span>
            </h2>
          </div>
          <span className="text-xs font-mono text-monad-400">
            Chain ID: 10143 (Monad Testnet)
          </span>
        </div>

        <div className="space-y-3 font-mono">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-white/10 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-gray-500 text-[11px] pt-0.5">{evt.timestamp}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{evt.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${evt.badgeColor}`}>
                      {evt.badge}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px]">{evt.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
