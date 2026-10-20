import React from "react";
import {
  Zap,
  Activity,
  Wifi,
  Thermometer,
  Camera,
  Wrench,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { UserProfile } from "../types";

interface EmptyChatStateProps {
  currentUser: UserProfile | null;
  onSelectStarter: (prompt: string) => void;
  onUploadPhotoClick: () => void;
  onOpenPhotoStudio: () => void;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({
  currentUser,
  onSelectStarter,
  onUploadPhotoClick,
  onOpenPhotoStudio,
}) => {
  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "Technician";

  const STARTER_CARDS = [
    {
      id: "lag",
      icon: Activity,
      title: "PC is Laggy & Freezing",
      description: "Diagnose 100% disk usage, high CPU/RAM bottlenecks, and background services.",
      prompt: "My PC is running very slow, lagging, and freezing. How do I diagnose high CPU, RAM, or 100% disk usage?",
      badge: "Performance",
      color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300",
    },
    {
      id: "bsod",
      icon: Zap,
      title: "Blue Screen (BSOD) Error",
      description: "Decode stop codes, analyze minidumps, and run Windows SFC & DISM repair.",
      prompt: "My computer encountered a Blue Screen (BSOD) crash. How do I read minidump logs and fix corrupt system files?",
      badge: "Kernel / BSOD",
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300",
    },
    {
      id: "wifi",
      icon: Wifi,
      title: "Wi-Fi Dropping Out",
      description: "Fix frequent disconnects, flush DNS cache, and reset the TCP/IP stack.",
      prompt: "My Wi-Fi keeps disconnecting and dropping internet access. How can I reset network stack and fix driver power saving?",
      badge: "Network",
      color: "from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-300",
    },
    {
      id: "thermal",
      icon: Thermometer,
      title: "Overheating & Loud Fan",
      description: "Diagnose thermal throttling, loud fan bearings, and CPU heat dissipation.",
      prompt: "My laptop is overheating with the fan spinning at maximum speed. How do I test temperatures and check thermal throttling?",
      badge: "Hardware",
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
    },
    {
      id: "photo",
      icon: Camera,
      title: "Inspect Hardware Photo",
      description: "Upload a photo of motherboard traces, burnt ICs, or error screens for visual AI analysis.",
      action: "upload_photo",
      badge: "Visual AI",
      color: "from-purple-500/20 to-cyan-500/20 border-purple-500/30 text-purple-300",
    },
    {
      id: "schematic",
      icon: Wrench,
      title: "Generate Hardware Schematic",
      description: "Generate technical component diagrams, PCB pinouts, or bench repair schematics.",
      action: "open_studio",
      badge: "Schematics",
      color: "from-sky-500/20 to-indigo-500/20 border-sky-500/30 text-sky-300",
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-3 mb-8">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/20 border border-cyan-400/40">
          <BrandLogo className="h-full w-full object-contain" />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-[#070e1b]">
            <Sparkles className="h-2.5 w-2.5 text-[#070e1b]" />
          </span>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Welcome back, {firstName}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto mt-1">
            What laptop or PC issue would you like DARBS to diagnose today?
          </p>
        </div>
      </div>

      {/* Quick Diagnostic Starter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
        {STARTER_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => {
                if (card.action === "upload_photo") {
                  onUploadPhotoClick();
                } else if (card.action === "open_studio") {
                  onOpenPhotoStudio();
                } else if (card.prompt) {
                  onSelectStarter(card.prompt);
                }
              }}
              className={`group flex flex-col justify-between rounded-2xl border bg-gradient-to-br ${card.color} p-4 text-left shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-pointer`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-xs">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700/50">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {card.description}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-400 group-hover:text-cyan-300 pt-2 border-t border-slate-800/40 transition-colors">
                <span>Start Diagnosis</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Helpful Hint */}
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        <span>
          Tip: You can attach hardware photos or click the microphone to describe strange sounds.
        </span>
      </div>
    </div>
  );
};
