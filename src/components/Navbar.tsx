import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  LogOut,
  Terminal,
  Camera,
  Cpu,
  ChevronDown,
  Sparkles,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { AppSettings, DashboardTab, UserProfile } from "../types";
import { BrandLogo } from "./BrandLogo";

interface NavbarProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenDeleteModal: () => void;
  onOpenExitModal: () => void;
  settings: AppSettings;
  onToggleSpeech: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewChat,
  onToggleSidebar,
  onOpenDeleteModal,
  onOpenExitModal,
  settings,
  onToggleSpeech,
  currentUser,
  onLogout,
  activeTab,
  onSelectTab,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-[#070e1b]/95 px-3 md:px-5 backdrop-blur-md text-slate-100">
      {/* Left side: Brand Logo & Sidebar Toggle */}
      <div className="flex items-center gap-2.5 md:gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800/80 hover:text-cyan-400 transition-colors"
          title="Toggle Navigation & History"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand with DARBS Image Logo & active status dot */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab("chat")}>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25 overflow-hidden border border-cyan-400/40 group">
            <BrandLogo className="h-full w-full object-contain transition-transform group-hover:scale-105 duration-300" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070e1b] animate-pulse z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wide text-white text-base md:text-lg">
                DARBS
              </span>
              <span className="hidden xl:inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                Laptop Diagnostics
              </span>
            </div>
            <p className="hidden xl:block text-[10px] text-slate-400 tracking-tight">
              Diagnostic Assistant for Repair, Bugs and Support
            </p>
          </div>
        </div>
      </div>

      {/* Center: Dashboard Main Navigation Tabs */}
      <nav className="flex items-center rounded-2xl border border-slate-800 bg-slate-950/80 p-1 shadow-inner">
        <button
          type="button"
          onClick={() => onSelectTab("chat")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "chat"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
          title="Diagnostic Chat Workspace"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Diagnostic Chat</span>
          <span className="sm:hidden">Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("image_studio")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "image_studio"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
          title="Hardware Photo & Diagram Generator"
        >
          <Camera className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Photo Studio</span>
          <span className="sm:hidden">Studio</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("smart_tools")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "smart_tools"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
          title="Technical Diagnostic Utilities"
        >
          <Cpu className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Smart Tools</span>
          <span className="sm:hidden">Tools</span>
        </button>
      </nav>

      {/* Right side controls: New Chat, Gemini Key Status, Technician Profile Dropdown */}
      <div className="flex items-center gap-2">
        {/* New Chat Session Button (prominent on chat view) */}
        {activeTab === "chat" && (
          <button
            id="btn-navbar-new-chat"
            onClick={onNewChat}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors"
            title="Start New Diagnostic Chat"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">New Chat</span>
          </button>
        )}

        {/* Technician Profile & Quick Settings Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-1.5 pl-2 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80 transition-colors"
            title="Technician Account & Quick Settings"
          >
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden border border-cyan-500/40 bg-slate-800 text-white font-bold text-xs shadow-xs">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <BrandLogo alt="User avatar" />
              )}
            </div>

            <div className="hidden xl:block text-left pr-1 leading-tight">
              <span className="block text-xs font-semibold text-slate-100 truncate max-w-[110px]">
                {currentUser?.name || "Technician"}
              </span>
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Profile Menu Popover */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-800 bg-[#0a1224] p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50">
              {/* Technician Info */}
              <div className="pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-800 text-white font-bold text-xs">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BrandLogo alt="User avatar" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-xs text-white truncate">
                      {currentUser?.name || "Technician"}
                    </p>
                    <p className="text-[10px] text-cyan-400 truncate">
                      {currentUser?.email || currentUser?.role || "Support Specialist"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="py-2 space-y-1 text-xs">
                {/* Voice Reading Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    onToggleSpeech();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {settings.speechEnabled ? (
                      <Volume2 className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-slate-400" />
                    )}
                    <span>Voice Reading</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      settings.speechEnabled
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {settings.speechEnabled ? "ON" : "OFF"}
                  </span>
                </button>

                {/* Clear Chat History */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenDeleteModal();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-amber-400" />
                    <span>Clear Chat History</span>
                  </div>
                </button>
              </div>

              {/* Sign Out Action */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl border border-red-900/40 bg-red-950/30 px-2.5 py-2 text-xs font-semibold text-red-300 hover:bg-red-900/40 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
