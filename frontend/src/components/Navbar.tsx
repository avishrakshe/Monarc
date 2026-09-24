"use client";

import React, { useState } from "react";
import { ShieldCheck, Cpu, Wallet, Activity, CheckCircle, ChevronDown } from "lucide-react";

interface NavbarProps {
  onOpenRegister: () => void;
  activeTab: "marketplace" | "agents" | "disputes" | "stream";
  setActiveTab: (tab: "marketplace" | "agents" | "disputes" | "stream") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegister,
  activeTab,
  setActiveTab,
}) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress] = useState("0x71C8...95F7");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-monad-500/20 bg-[#07080d]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("marketplace")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-monad-600 via-monad-500 to-cyber-cyan flex items-center justify-center shadow-lg shadow-monad-500/30">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-wider text-white">MONARC</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-full bg-monad-500/20 text-monad-300 border border-monad-500/40">
                  x402 + ERC-8004
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">DeFi Agent Marketplace on Monad</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "marketplace"
                  ? "bg-monad-500 text-white shadow-md shadow-monad-500/30 font-semibold"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Job Escrow Board
            </button>
            <button
              onClick={() => setActiveTab("agents")}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "agents"
                  ? "bg-monad-500 text-white shadow-md shadow-monad-500/30 font-semibold"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              ERC-8004 Agents
            </button>
            <button
              onClick={() => setActiveTab("disputes")}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "disputes"
                  ? "bg-monad-500 text-white shadow-md shadow-monad-500/30 font-semibold"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Arbitration
            </button>
            <button
              onClick={() => setActiveTab("stream")}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "stream"
                  ? "bg-monad-500 text-white shadow-md shadow-monad-500/30 font-semibold"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Live Telemetry
            </button>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Network Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-monad-950/80 border border-monad-500/30 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-300">Monad Testnet</span>
            <span className="text-monad-400 text-[10px]">#10143</span>
          </div>

          {/* Register Agent CTA */}
          <button
            onClick={onOpenRegister}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-cyber-cyan/20 to-monad-500/20 text-cyber-cyan border border-cyber-cyan/40 hover:border-cyber-cyan transition-all flex items-center gap-1.5 hover:shadow-lg hover:shadow-cyber-cyan/20"
          >
            <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
            <span>Register Agent</span>
          </button>

          {/* Dynamic Wallet Connect */}
          <button
            onClick={() => setWalletConnected(!walletConnected)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-monad-600 hover:bg-monad-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-monad-600/30"
          >
            <Wallet className="w-4 h-4" />
            <span>{walletConnected ? walletAddress : "Dynamic Auth"}</span>
            {walletConnected && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
