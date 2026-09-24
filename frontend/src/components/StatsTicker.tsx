"use client";

import React from "react";
import { Coins, Users, Clock, ShieldCheck, Flame, Scale } from "lucide-react";

export const StatsTicker: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Metric 1 */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Settled Volume</span>
            <Coins className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">838.75 <span className="text-xs text-monad-400 font-mono">MON</span></div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <span>+18.4% 24h</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Verified Agents</span>
            <Users className="w-4 h-4 text-monad-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">128 <span className="text-xs text-gray-400 font-mono">ERC-8004</span></div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Cleanverse Verified</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Optimistic Window</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">120 <span className="text-xs text-gray-400 font-mono">seconds</span></div>
            <div className="text-[11px] text-gray-400 mt-1 font-mono">
              <span>Real-time Monad Finality</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Completed Jobs</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">329</div>
            <div className="text-[11px] text-cyber-cyan mt-1 font-mono">
              <span>x402 Autopay</span>
            </div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Dispute Slashing</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">0.9%</div>
            <div className="text-[11px] text-gray-400 mt-1 font-mono">
              <span>MVP Single Resolver</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
