import React from "react";
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
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-[#070e1b]/95 px-3 md:px-5 backdrop-blur-md text-slate-100">
      {/* Left side: Brand Logo & Sidebar Toggle */}
      <div className="flex items-center gap-2.5 md:gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
          title="Toggle Navigation & History"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand with DARBS Image Logo & pulsing active status dot */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25 overflow-hidden border border-cyan-400/40 group">
            <BrandLogo className="h-full w-full object-contain transition-transform group-hover:scale-105 duration-300" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070e1b] animate-pulse z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wide text-white text-lg md:text-xl">
                DARBS
              </span>
              <span className="hidden xl:inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                Diagnostic Assistant
              </span>
            </div>
            <p className="hidden xl:block text-[10px] text-slate-400 tracking-tight">
              Diagnostic Assistant for Repair, Bugs and Support
            </p>
          </div>
        </div>
      </div>

      {/* Center: Dashboard Main Navigation Tabs */}
      <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-950/80 p-1 shadow-inner">
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
          <span className="hidden sm:inline">Photo Generator</span>
          <span className="sm:hidden">Photos</span>
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
      </div>

      {/* Right side controls: New Chat, Delete History, Read/Speech Toggle, User Badge, Exit/Logout */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* New Chat Session (Available on Chat tab) */}
        {activeTab === "chat" && (
          <button
            id="btn-navbar-new-chat"
            onClick={onNewChat}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors"
            title="New Diagnostic Chat"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden lg:inline">New Chat</span>
          </button>
        )}

        {/* Delete History Button */}
        {activeTab === "chat" && (
          <button
            id="btn-navbar-delete-history"
            onClick={onOpenDeleteModal}
            className="rounded-lg border border-red-900/60 bg-red-950/40 p-2 text-red-400 hover:bg-red-900/60 hover:text-red-300 transition-colors"
            title="Delete Chat History"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        {/* Speaking Read Button (Turn On / Off) */}
        <button
          id="btn-navbar-toggle-speech"
          onClick={onToggleSpeech}
          className={`flex items-center gap-1 rounded-lg p-2 transition-colors ${
            settings.speechEnabled
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
          title={
            settings.speechEnabled
              ? "Voice Reading is ON (Click to turn OFF)"
              : "Voice Reading is OFF (Click to turn ON)"
          }
        >
          {settings.speechEnabled ? (
            <Volume2 className="h-4 w-4 text-cyan-300" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>

        {/* User Profile Avatar with sign-out option */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <div
              className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-cyan-500/40 bg-slate-800 text-white font-bold text-xs shadow-sm"
              title={`${currentUser.name} (${currentUser.email || currentUser.role})`}
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <BrandLogo alt={`${currentUser.name} avatar`} />
              )}
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
