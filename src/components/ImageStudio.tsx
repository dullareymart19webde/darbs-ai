import React, { useState } from "react";
import {
  Camera,
  Download,
  Send,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Cpu,
  Layers,
  Terminal,
  ZoomIn,
  Wrench,
  Maximize2,
  X,
} from "lucide-react";

interface ImageStudioProps {
  onSendImageToChat: (imageUrl: string, prompt: string) => void;
}

const STYLE_PRESETS = [
  {
    id: "hardware_photo",
    label: "Hardware Lab Photo",
    desc: "Real workbench laboratory photograph",
    prefix: "Ultra-sharp high-definition real workbench laboratory photography of computer hardware: ",
  },
  {
    id: "pcb_schematic",
    label: "PCB Schematic & Blueprint",
    desc: "Technical circuit blueprint & pinout",
    prefix: "Clean precision technical circuit schematic, PCB layout and electrical pinout diagram of: ",
  },
  {
    id: "thermal_render",
    label: "3D Thermal & Airflow",
    desc: "Heat dissipation & fan airflow visualization",
    prefix: "Detailed 3D technical render showing thermal heat dissipation, copper heatpipes, and cooling fan airflow in: ",
  },
  {
    id: "micro_macro",
    label: "Microscopic Solder / SMD",
    desc: "Inspection of solder pads & capacitors",
    prefix: "Microscopic laboratory macro inspection of electronic solder joints, traces, SMD components, and capacitors: ",
  },
  {
    id: "diagram_vector",
    label: "Technical Architecture",
    desc: "Clean component block diagram",
    prefix: "Clean, modern, high-contrast technical block diagram and architecture layout of: ",
  },
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Widescreen (16:9)" },
  { value: "4:3", label: "Standard (4:3)" },
  { value: "9:16", label: "Vertical (9:16)" },
];

const QUICK_STARTERS = [
  "Dual copper heatpipe laptop cooling heatsink with radial blower fans",
  "Burnt ceramic SMD capacitor on laptop motherboard power rail",
  "M.2 NVMe SSD with aluminum thermal heatsink and thermal pad",
  "Microscopic view of solder bridge on QFN IC chip pins",
  "Laptop motherboard VRM power delivery stage with MOSFETs and chokes",
  "RAM DDR5 SODIMM module with gold edge contacts and memory chips",
];

export const ImageStudio: React.FC<ImageStudioProps> = ({
  onSendImageToChat,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("hardware_photo");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeLightbox, setActiveLightbox] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<
    { id: string; url: string; prompt: string; timestamp: string }[]
  >([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setError(null);
    setIsGenerating(true);

    const styleObj = STYLE_PRESETS.find((s) => s.id === selectedStyle);
    const fullPrompt = styleObj ? `${styleObj.prefix}${prompt.trim()}` : prompt.trim();

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, aspectRatio }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate technical photo.");
      }

      const newImg = {
        id: `img-${Date.now()}`,
        url: data.imageUrl,
        prompt: prompt.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setGeneratedImages((prev) => [newImg, ...prev]);
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError(err.message || "Failed to generate photo. Please check API configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      if (imageUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `${filename || "darbs-diagnostic-photo"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${filename || "darbs-diagnostic-photo"}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }
    } catch (e) {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-[#0a1224]/90 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 shadow-md">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              DARBS Technical Photo & Diagram Generator
            </h1>
            <p className="text-xs text-slate-400">
              Generate photorealistic hardware components, motherboard schematics, thermal airflow models, and microscopic repair visual guides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <Cpu className="h-3.5 w-3.5" />
          <span>Pollinations AI Visual Engine</span>
        </div>
      </div>

      {/* Main Studio Generator Card */}
      <div className="rounded-3xl border border-slate-800 bg-[#0a1224]/80 p-5 md:p-6 shadow-xl space-y-5">
        {/* Style Preset Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Select Technical Preset</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {STYLE_PRESETS.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span className="font-semibold text-xs text-white">{style.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{style.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Aspect Ratio
          </label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => setAspectRatio(ratio.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                  aspectRatio === ratio.value
                    ? "border-cyan-500 bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                    : "border-slate-800 bg-slate-900/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Starters */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Diagnostic Prompts:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_STARTERS.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(starter)}
                className="text-[11px] rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300 hover:border-cyan-500/50 hover:bg-cyan-950/30 hover:text-cyan-300 transition-all text-left truncate max-w-full"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Hardware Component or Diagram Description:
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the hardware component, damage symptom, circuit, or diagram in detail (e.g., 'Laptop motherboard showing shorted VRM MOSFET near CPU socket with scorched mark')..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5 text-xs md:text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        {/* Error Notice */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-xs md:text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Rendering Hardware Visual...</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                <span>Generate Photo / Diagram</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <span>Generated Visuals Gallery ({generatedImages.length})</span>
          </h2>
          {generatedImages.length > 0 && (
            <button
              onClick={() => setGeneratedImages([])}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear Gallery
            </button>
          )}
        </div>

        {generatedImages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-[#0a1224]/40 p-10 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-slate-500">
              <Camera className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-slate-400">No generated photos yet</p>
            <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
              Select a technical style, enter a component description above, and generate high-resolution diagnostic images.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {generatedImages.map((img) => (
              <div
                key={img.id}
                className="group flex flex-col rounded-2xl border border-slate-800 bg-[#0a1224] overflow-hidden shadow-xl hover:border-cyan-500/40 transition-all"
              >
                {/* Image Container with Hover Overlay */}
                <div
                  className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                  onClick={() => setActiveLightbox(img.url)}
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-semibold backdrop-blur-xs transition-opacity">
                    <Maximize2 className="h-4 w-4" />
                    <span>View Fullscreen</span>
                  </div>
                </div>

                {/* Info & Action Toolbar */}
                <div className="flex flex-col flex-1 p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed">
                      {img.prompt}
                    </p>
                    <span className="text-[10px] text-slate-500 shrink-0">{img.timestamp}</span>
                  </div>

                  {/* Buttons: Send to Diagnostic Chat, Download, Copy */}
                  <div className="mt-auto pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSendImageToChat(img.url, `Please inspect and diagnose this hardware diagram / component photo: "${img.prompt}"`)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600/20 border border-cyan-500/40 py-2 px-3 text-xs font-semibold text-cyan-300 hover:bg-cyan-600 hover:text-white transition-all shadow-sm"
                      title="Send this photo directly to Diagnostic Chat for analysis"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Analyze in Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(img.url, `darbs-${img.id}`)}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                      title="Download image"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(img.id, img.url)}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                      title="Copy Image URL"
                    >
                      {copiedId === img.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-800 transition-colors"
              title="Close image"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={activeLightbox}
              alt="Hardware visual"
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
