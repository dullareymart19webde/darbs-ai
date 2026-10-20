import React, { useState, useEffect } from "react";
import {
  X,
  KeyRound,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  Cpu,
  RefreshCw,
} from "lucide-react";

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("darbs_custom_gemini_key") || "";
      setApiKey(stored);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) {
      setTestResult({
        success: false,
        message: "Please enter an API key to test.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/verify-gemini-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": keyToTest,
        },
        body: JSON.stringify({ apiKey: keyToTest }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `API Key verified successfully! Model active: ${data.model || "gemini-2.5-flash"}.`,
        });
      } else {
        setTestResult({
          success: false,
          message:
            data.error ||
            "Verification failed. Please verify this key in Google AI Studio.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to reach verification endpoint.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const clean = apiKey.trim();
    if (clean) {
      localStorage.setItem("darbs_custom_gemini_key", clean);
      onKeySaved(clean);
    } else {
      localStorage.removeItem("darbs_custom_gemini_key");
      onKeySaved("");
    }
    onClose();
  };

  const handleClearKey = () => {
    localStorage.removeItem("darbs_custom_gemini_key");
    setApiKey("");
    setTestResult(null);
    onKeySaved("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-[#091122] p-6 shadow-2xl text-slate-100 dark:border-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/40 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Gemini AI Engine Settings
            </h3>
            <p className="text-xs text-slate-400">
              Configure Google Gemini API for live diagnostic inference
            </p>
          </div>
        </div>

        {/* Diagnostic Engine Status */}
        <div className="my-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Active Core Model:</span>
            <span className="font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              gemini-2.5-flash
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">API Key Source:</span>
            <span className="font-semibold text-slate-200">
              {apiKey.trim()
                ? "Custom Technician Key (Browser)"
                : "Server Environment (Render / .env.local)"}
            </span>
          </div>
        </div>

        {/* API Key Input Form */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
              >
                <span>Get Free API Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (testResult) setTestResult(null);
                }}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-10 text-xs md:text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div
              className={`rounded-xl border p-3 text-xs flex items-center gap-2 animate-in fade-in ${
                testResult.success
                  ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                  : "border-red-500/40 bg-red-950/40 text-red-300"
              }`}
            >
              {testResult.success ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Render Deployment Guidance Note */}
          <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Render Deployment Configuration</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              To permanently enable Gemini for all technicians without pasting keys, open your <strong>Render Dashboard</strong> &gt; your <strong>Web Service</strong> &gt; <strong>Environment</strong>, and add <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono">GEMINI_API_KEY</code> with your key starting with <code className="text-slate-300 font-mono">AIzaSy...</code>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
          <div>
            {apiKey.trim() && (
              <button
                type="button"
                onClick={handleClearKey}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-colors"
                title="Remove custom key from browser"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Reset Key</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting || !apiKey.trim()}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 transition-colors disabled:opacity-50"
            >
              {isTesting ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>{isTesting ? "Testing..." : "Test Key"}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 transition-all"
            >
              <span>Save &amp; Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

