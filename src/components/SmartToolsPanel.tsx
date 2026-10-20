import React, { useState } from "react";
import {
  FileText,
  Code2,
  Copy,
  Check,
  Send,
  RefreshCw,
  Terminal,
  AlertCircle,
  Wrench,
  CheckSquare,
  Cpu,
} from "lucide-react";

interface SmartToolsPanelProps {
  onSendResultToChat: (text: string) => void;
}

export const SmartToolsPanel: React.FC<SmartToolsPanelProps> = ({
  onSendResultToChat,
}) => {
  const [activeTool, setActiveTool] = useState<
    "code_explain" | "summarize" | "flashcards" | "enhance_prompt"
  >("code_explain");

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tools = [
    {
      id: "code_explain",
      title: "Error & Log Analyzer",
      desc: "Decode Windows stop codes, dump logs, and error scripts",
      icon: Terminal,
      color: "text-cyan-400 bg-cyan-950/50 border-cyan-800/40",
      placeholder: "Paste Windows Event Viewer log, BSOD stop code (e.g., 0x000000D1), PowerShell error, or driver crash trace...",
      actionLabel: "Analyze Diagnostic Log",
    },
    {
      id: "summarize",
      title: "Executive Summarizer",
      desc: "Distill diagnostic reports and hardware scans into key actions",
      icon: FileText,
      color: "text-blue-400 bg-blue-950/50 border-blue-800/40",
      placeholder: "Paste lengthy hardware diagnostic output, SMART disk report, memory test log, or benchmark results...",
      actionLabel: "Generate Executive Summary",
    },
    {
      id: "flashcards",
      title: "Repair Bench Checklist",
      desc: "Turn symptoms into numbered step-by-step repair checklists",
      icon: CheckSquare,
      color: "text-emerald-400 bg-emerald-950/50 border-emerald-800/40",
      placeholder: "Enter the laptop model and reported hardware defect (e.g., 'Dell XPS 15 9500 not charging from USB-C, swollen battery')...",
      actionLabel: "Generate Repair Protocol",
    },
    {
      id: "enhance_prompt",
      title: "Diagnostic Optimizer",
      desc: "Refine symptom descriptions into technical diagnostic prompts",
      icon: Wrench,
      color: "text-indigo-400 bg-indigo-950/50 border-indigo-800/40",
      placeholder: "Enter informal problem description (e.g. 'Laptop screen goes black when I move the hinge')...",
      actionLabel: "Optimize Diagnostic Prompt",
    },
  ] as const;

  const currentToolConfig = tools.find((t) => t.id === activeTool) || tools[0];

  const handleExecute = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const customKey = localStorage.getItem("darbs_custom_gemini_key") || "";
      const response = await fetch("/api/smart-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customKey ? { "x-gemini-api-key": customKey } : {}),
        },
        body: JSON.stringify({ toolType: activeTool, input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Smart tool execution failed.");
      }

      setOutput(data.result);
    } catch (err: any) {
      console.error("Smart tool error:", err);
      setError(err.message || "Failed to process diagnostic tool request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy smart-tool result:", err);
      setError("Could not copy the result. Check clipboard permissions.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-[#0a1224]/90 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-md">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              DARBS Technical Diagnostic Utilities
            </h1>
            <p className="text-xs text-slate-400">
              Specialized utilities for log decoding, executive summaries, bench repair protocols, and symptom query enhancement.
            </p>
          </div>
        </div>
      </div>

      {/* Tool Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id);
                setOutput("");
                setError(null);
              }}
              className={`flex flex-col text-left p-4 rounded-2xl border transition-all ${
                isActive
                  ? "border-cyan-500 bg-[#0c1833] shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-500/50"
                  : "border-slate-800 bg-[#0a1224]/80 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 border ${t.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-bold text-xs text-white">{t.title}</span>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {t.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Execution Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a1224]/80 p-5 md:p-6 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <currentToolConfig.icon className="h-4 w-4 text-cyan-400" />
              <span>{currentToolConfig.title} Input</span>
            </label>
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <textarea
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentToolConfig.placeholder}
            className="flex-1 w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs md:text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-mono transition-all resize-none"
          />

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleExecute}
              disabled={isLoading || !input.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 px-4 text-xs md:text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing Diagnostic Telemetry...</span>
                </>
              ) : (
                <>
                  <currentToolConfig.icon className="h-4 w-4" />
                  <span>{currentToolConfig.actionLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="rounded-3xl border border-slate-800 bg-[#0a1224]/80 p-5 md:p-6 shadow-xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Diagnostic Output & Protocol</span>
            </label>
            {output && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-xs md:text-sm font-mono overflow-y-auto max-h-[380px] leading-relaxed">
            {output ? (
              <pre className="whitespace-pre-wrap font-sans text-slate-200">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Terminal className="h-8 w-8 text-slate-700" />
                <p className="text-xs">Results will render here upon analysis.</p>
                <p className="text-[11px] text-slate-600 max-w-xs">
                  Paste error logs or hardware symptoms in the left panel and click analyze.
                </p>
              </div>
            )}
          </div>

          {output && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSendResultToChat(`[DIAGNOSTIC UTILITY: ${currentToolConfig.title}]\n\n${output}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 py-3 px-4 text-xs md:text-sm font-semibold text-cyan-300 hover:bg-cyan-600 hover:text-white transition-all shadow-md"
              >
                <Send className="h-4 w-4" />
                <span>Send Result to Diagnostic Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
