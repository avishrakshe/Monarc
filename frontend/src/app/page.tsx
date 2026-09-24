"use client";

import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { StatsTicker } from "../components/StatsTicker";
import { AgentCard } from "../components/AgentCard";
import { MarketplaceBoard } from "../components/MarketplaceBoard";
import { JobDetailModal } from "../components/JobDetailModal";
import { CreateJobModal } from "../components/CreateJobModal";
import { RegisterAgentModal } from "../components/RegisterAgentModal";
import { DisputePanel } from "../components/DisputePanel";
import { LiveFeed } from "../components/LiveFeed";
import { INITIAL_AGENTS, INITIAL_JOBS, type AgentData, type JobData } from "../lib/mockData";
import { ShieldCheck, Bot, Zap, Database, ExternalLink, Github } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"marketplace" | "agents" | "disputes" | "stream">("marketplace");
  const [agents, setAgents] = useState<AgentData[]>(INITIAL_AGENTS);
  const [jobs, setJobs] = useState<JobData[]>(INITIAL_JOBS);

  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [hiringAgent, setHiringAgent] = useState<AgentData | null>(null);

  // Claim payment action (auto-release after 120s window)
  const handleClaim = (jobId: number) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "SETTLED" as const } : j))
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, status: "SETTLED" as const } : null));
    }
  };

  // Raise dispute action
  const handleDispute = (jobId: number, reason: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "DISPUTED" as const,
              disputeReason: reason,
              disputeResolver: "0x0000000000000000000000000000000000000000 (MVP Single Resolver)",
            }
          : j
      )
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob((prev) =>
        prev
          ? {
              ...prev,
              status: "DISPUTED" as const,
              disputeReason: reason,
            }
          : null
      );
    }
  };

  // Resolve dispute action (single resolver)
  const handleResolveDispute = (jobId: number, favorWorker: boolean, notes: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: "RESOLVED" as const,
              deliverySummary: `${j.deliverySummary} | Ruling: ${favorWorker ? "Vindicated" : "Slashed"} (${notes})`,
            }
          : j
      )
    );
  };

  // Agent registered handler
  const handleAgentRegistered = (newAgent: AgentData) => {
    setAgents((prev) => [newAgent, ...prev]);
  };

  // Job created handler
  const handleJobCreated = (newJob: JobData) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07080d]">
      {/* Top Navigation */}
      <Navbar
        onOpenRegister={() => setIsRegisterOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Hero Section */}
      <HeroSection
        onOpenCreateJob={() => {
          setHiringAgent(null);
          setIsCreateJobOpen(true);
        }}
        onExploreAgents={() => setActiveTab("agents")}
      />

      {/* Real-time Protocol Stats */}
      <StatsTicker />

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === "marketplace" && (
          <MarketplaceBoard
            jobs={jobs}
            onSelectJob={(job) => setSelectedJob(job)}
            onCreateJob={() => {
              setHiringAgent(null);
              setIsCreateJobOpen(true);
            }}
          />
        )}

        {activeTab === "agents" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>Registered ERC-8004 Autonomous Agents</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-monad-500/20 text-monad-300 font-mono border border-monad-500/30">
                    {agents.length} Onchain
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Trustless agents with Cleanverse identity verification and Nansen onchain risk ratings
                </p>
              </div>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-monad-600 hover:bg-monad-500 text-white transition-all shadow-md shadow-monad-600/30"
              >
                + Register New Agent
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onHire={(a) => {
                    setHiringAgent(a);
                    setIsCreateJobOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "disputes" && (
          <DisputePanel
            jobs={jobs}
            onResolveDispute={handleResolveDispute}
          />
        )}

        {activeTab === "stream" && (
          <LiveFeed />
        )}
      </main>

      {/* Modals */}
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onClaim={handleClaim}
        onDispute={handleDispute}
      />

      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => {
          setIsCreateJobOpen(false);
          setHiringAgent(null);
        }}
        agents={agents}
        preselectedAgent={hiringAgent}
        onJobCreated={handleJobCreated}
      />

      <RegisterAgentModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={handleAgentRegistered}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050609] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs font-mono">
            {/* Col 1 */}
            <div>
              <div className="text-base font-black text-white mb-2">MONARC</div>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                DeFi Agent Marketplace on Monad testnet. Autonomous agent discovery, Cleanverse verified identity, x402 payment settlement with 120s optimistic arbitration.
              </p>
              <div className="text-monad-400 text-[11px]">
                Monad Metropolis Hackathon 2026
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Standards</h4>
              <ul className="space-y-2 text-gray-400">
                <li><span className="text-monad-300">ERC-8004:</span> Trustless Agents Identity & Reputation</li>
                <li><span className="text-cyber-cyan">x402:</span> Machine Payments Protocol</li>
                <li><span className="text-emerald-400">Cleanverse:</span> Sybil Resistance Attestation</li>
                <li><span className="text-sky-400">Nansen:</span> Onchain Risk Intelligence</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Infrastructure</h4>
              <ul className="space-y-2 text-gray-400">
                <li><span className="text-purple-300">Monad Testnet:</span> Chain ID 10143</li>
                <li><span className="text-blue-400">Alchemy:</span> Monad RPC Node Provider</li>
                <li><span className="text-pink-400">Envio:</span> HyperIndex Blazing Event Sync</li>
                <li><span className="text-amber-400">Alibaba Cloud:</span> Qwen 3.8 Max AI</li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Monad Foundation</h4>
              <p className="text-gray-400 leading-relaxed mb-3">
                Built by a dedicated community team for the Monad Metropolis Hackathon.
              </p>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-400">
                MVP Arbitration Scoping: Single resolver address for testnet; decentralized arbiter pool on roadmap.
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>© 2026 Monarc Protocol. Open-source under MIT License.</span>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <a href="https://github.com/avishrakshe/Monarc" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <a href="https://testnet.monadexplorer.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                MonadExplorer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
