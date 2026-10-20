import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GEMINI_TEXT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.0-flash";
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "imagen-3.0-generate-002";

const IMAGE_ASPECT_RATIOS = ["1:1", "16:9", "4:3", "9:16"] as const;
const isImageAspectRatio = (
  value: unknown
): value is (typeof IMAGE_ASPECT_RATIOS)[number] =>
  IMAGE_ASPECT_RATIOS.some((aspectRatio) => aspectRatio === value);

app.use(express.json({ limit: "20mb" }));

// Helper to retrieve a GoogleGenAI client with custom key support
const getGeminiClient = (customKey?: string): GoogleGenAI => {
  const apiKey = (
    customKey ||
    process.env.GEMINI_API_KEY ||
    ""
  ).toString().trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
};

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    name: "DARBS Diagnostic Assistant API",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    defaultModel: GEMINI_TEXT_MODEL,
  });
});

// Offline Diagnostic Fallback Generator for Hardware & PC Repairs
function generateOfflineDiagnosticFallback(
  userQuery: string,
  persona: string = "hardware_laptop"
): string {
  const q = userQuery.toLowerCase();

  // 1. Performance, Lag, Slowness, High CPU/Disk
  if (
    q.includes("lag") ||
    q.includes("slow") ||
    q.includes("sluggish") ||
    q.includes("freeze") ||
    q.includes("stutter") ||
    q.includes("100% disk") ||
    q.includes("100% cpu") ||
    persona === "performance_storage"
  ) {
    return `### [DIAGNOSTIC REPORT] PC Performance & Lag Troubleshooting Protocol

I analyzed your report regarding system lag and slowness. Slowness is primarily caused by 100% disk utilization, thermal throttling, corrupt Windows component stores, or unoptimized startup services.

---

### Step-by-Step Diagnostic & Repair Protocol:

#### 1. [DIAGNOSE]: Check Resource Saturation
1. Press **Ctrl + Shift + Esc** to open **Task Manager**.
2. Select the **Processes** tab and click on the **CPU**, **Memory**, and **Disk** columns to check which process is utilizing over 80-100%.
3. Check the **Performance** tab -> **CPU**: Check if the clock speed is locked below **0.79 GHz** (which indicates severe thermal throttling or power adapter failure).

#### 2. [FIX]: Run Windows Component Integrity Repairs
Open **Command Prompt as Administrator** (**Win + S**, type \`cmd\`, right-click -> *Run as Administrator*):
\`\`\`cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
\`\`\`
*Wait for both scans to complete to 100%. If corrupted files are found, Windows will automatically replace them.*

#### 3. [FIX]: Clean Drive & Clear Temporary Files
Execute the following to purge accumulated temporary cache files that cause indexing lag:
\`\`\`cmd
cleanmgr /sagerun:1
\`\`\`
Or press **Win + R**, type \`temp\`, and delete unnecessary files. Repeat with \`%temp%\`.

#### 4. [TEST]: Inspect Storage Drive Health (SMART Status)
Check if a failing SSD or HDD is generating I/O wait latency:
\`\`\`cmd
wmic diskdrive get model,status
\`\`\`
*If status reports anything other than "OK", immediately back up your critical files.*

#### 5. [VERIFY]: Trim & Optimize Drives
In Windows PowerShell (Administrator):
\`\`\`powershell
Optimize-Volume -DriveLetter C -Defrag -Verbose
\`\`\`
*(For SSDs, this sends the TRIM command; for HDDs, it reorganizes fragmented sectors).*

---
> [NEXT STEP]: Reply with your CPU model, RAM amount, and whether your OS is installed on an SSD or HDD so DARBS can pinpoint specific tuning steps!`;
  }

  // 2. BSOD & System Crashes
  if (
    q.includes("bsod") ||
    q.includes("blue screen") ||
    q.includes("stop code") ||
    q.includes("crash") ||
    q.includes("minidump") ||
    persona === "windows_bsod"
  ) {
    return `### [DIAGNOSTIC GUIDE] Blue Screen (BSOD) Diagnostic & Recovery Guide

I analyzed your crash symptoms. Blue Screen errors typically stem from corrupt kernel files, faulty drivers (especially GPU/Wi-Fi), or defective RAM modules.

---

### Step-by-Step Fix Protocol:

#### 1. [FIX]: System File & Image Verification
Open **Command Prompt as Administrator** (**Win + S**, type \`cmd\`, right-click -> *Run as Administrator*):
\`\`\`cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
\`\`\`

#### 2. [TEST]: Test RAM for Memory Bit Flips
1. Press **Win + R**, type: \`mdsched.exe\`
2. Select **"Restart now and check for problems"**.
3. Let the diagnostic run its full pass after restart.

#### 3. [DIAGNOSE]: Analyze Minidump Logs
Locate crash dumps in: \`C:\\Windows\\Minidump\\\`
Use **BlueScreenView** or **WinDbg** to inspect the bugcheck code and pinpoint the exact \`.sys\` driver module causing the crash.

---
> [ADVISORY]: If the BSOD started after a recent update, boot into Safe Mode (**Shift + Restart** -> Troubleshoot -> Advanced -> Startup Settings) and roll back the affected driver in Device Manager.`;
  }

  // 3. Network & Wi-Fi issues
  if (
    q.includes("wifi") ||
    q.includes("wi-fi") ||
    q.includes("network") ||
    q.includes("internet") ||
    q.includes("dns") ||
    persona === "network_wifi"
  ) {
    return `### [DIAGNOSTIC REPORT] Network & Wi-Fi Troubleshooting Protocol

I analyzed your network connectivity issue. Drops and DNS failures are commonly caused by corrupt socket stacks, driver power management sleep states, or stale DNS caches.

---

### Network Reset Protocol:

#### 1. [FIX]: Reset TCP/IP Stack & Flush DNS
Open **Command Prompt as Administrator** and execute sequentially:
\`\`\`cmd
netsh winsock reset
netsh int ip reset
ipconfig /release
ipconfig /renew
ipconfig /flushdns
\`\`\`

#### 2. [FIX]: Disable Wi-Fi Adapter Sleep Mode
1. Press **Win + X** -> **Device Manager**.
2. Expand **Network adapters**, right-click your Wi-Fi card -> **Properties**.
3. In the **Power Management** tab, uncheck **"Allow the computer to turn off this device to save power"**.

---
> [VERIFY]: Restart your PC and router to test if ping latency and connection stability are restored.`;
  }

  // Universal Default Fallback
  return `### [DIAGNOSTIC REPORT] DARBS Diagnostic Analysis & System Troubleshooting

I have analyzed your request regarding **"${userQuery.slice(0, 80)}"**. Here is the recommended diagnostic workflow:

---

### Universal First-Response Diagnostic Protocol:

#### 1. [DIAGNOSE]: System Integrity Verification
Open **Command Prompt as Administrator** (**Win + S**, type \`cmd\`, right-click -> *Run as Administrator*):
\`\`\`cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
\`\`\`

#### 2. [TEST]: Event Viewer Diagnostics
1. Press **Win + X** -> select **Event Viewer**.
2. Navigate to **Windows Logs** -> **System**.
3. Filter by **Critical** and **Error** to locate the exact Event ID and faulting application.

---
> [NEXT STEP]: Please share your laptop/PC make, model, and any specific error codes displayed so DARBS can guide your next repair steps!`;
}

// Main Chat Endpoint returning standard JSON
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, persona, temperature, enableWebSearch } = req.body ?? {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const clientApiKey = (
      (req.headers["x-gemini-api-key"] as string) ||
      process.env.GEMINI_API_KEY ||
      ""
    ).toString().trim();

    // Prepare system instructions tailored to persona
    let systemInstruction = `You are DARBS (Diagnostic Assistant for Repair, Bugs and Support), an expert AI Technical Support Engineer and Laptop/PC Repair Specialist.
Your mission is to provide precise, structured, step-by-step diagnostic workflows, troubleshooting trees, command-line fixes, hardware guidance, and bug resolution for laptops, desktop computers, Windows/Linux/macOS systems, drivers, network issues, and peripherals.
Do not use emojis in your responses. Use clean markdown formatting, numbered lists, exact command code blocks, and structured technical tags like [DIAGNOSE], [TEST], [FIX], [VERIFY], [SAFETY WARNING].

CORE DIAGNOSTIC METHODOLOGY:
1. [DIAGNOSE]: Ask targeted clarifying questions or explain the root cause.
2. [TEST]: Guide the user to safely check Event Viewer, Task Manager, or Device Manager.
3. [FIX]: Provide clear, numbered steps and exact commands in code blocks.
4. [VERIFY]: Explain how to confirm the issue is resolved.
5. [HARDWARE SAFETY]: Warn clearly about physical risks (e.g., swollen lithium-ion battery, unplug power before opening laptop chassis).`;

    if (persona === "windows_bsod") {
      systemInstruction += " Focus deeply on Windows Blue Screen of Death stop codes, minidump analysis, and corrupt system files.";
    } else if (persona === "performance_storage") {
      systemInstruction += " Focus on diagnosing 100% disk usage, high CPU/RAM bottlenecks, startup programs, and thermal throttling.";
    } else if (persona === "network_wifi") {
      systemInstruction += " Focus on Wi-Fi dropouts, driver power management, DNS flushes, and TCP/IP stack resets.";
    } else if (persona === "driver_software") {
      systemInstruction += " Focus on clean GPU driver installation, audio driver glitches, and peripheral USB errors.";
    }

    const inputMessages = messages.slice(-12);
    const lastUserMessage =
      [...inputMessages].reverse().find((m) => m.role === "user")?.content || "";
    const fallbackQuery =
      typeof lastUserMessage === "string" ? lastUserMessage : "";
    const selectedPersona =
      typeof persona === "string" ? persona : "hardware_laptop";

    // If no API key is provided at all, return instant offline diagnostic guidance
    if (!clientApiKey) {
      const fallback = generateOfflineDiagnosticFallback(fallbackQuery, selectedPersona);
      return res.json({
        reply: `> [DIAGNOSTIC PROTOCOL: Built-in Hardware Bench Analysis]\n\n${fallback}`,
        sources: [],
        isOfflineMode: true,
      });
    }

    // Build standard multi-turn contents for @google/genai
    const contents = await Promise.all(
      inputMessages.map(async (msg) => {
        const parts: any[] = [];
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        if (msg.imageUrl && typeof msg.imageUrl === "string") {
          if (msg.imageUrl.startsWith("data:")) {
            const [meta, base64Data] = msg.imageUrl.split(",");
            const mimeType = meta.split(";")[0].replace("data:", "") || "image/png";
            parts.push({
              inlineData: {
                mimeType,
                data: base64Data,
              },
            });
          } else if (msg.imageUrl.startsWith("http")) {
            try {
              const imgRes = await fetch(msg.imageUrl, { signal: AbortSignal.timeout(8000) });
              if (imgRes.ok) {
                const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
                const arrayBuf = await imgRes.arrayBuffer();
                const b64 = Buffer.from(arrayBuf).toString("base64");
                parts.push({
                  inlineData: {
                    mimeType,
                    data: b64,
                  },
                });
              }
            } catch (imgErr) {
              console.warn("Could not fetch remote image for vision chat:", imgErr);
            }
          }
        }
        if (msg.audioUrl && typeof msg.audioUrl === "string" && msg.audioUrl.startsWith("data:")) {
          const [meta, base64Data] = msg.audioUrl.split(",");
          const mimeType = meta.split(";")[0].replace("data:", "") || "audio/webm";
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts: parts.length > 0 ? parts : [{ text: " " }],
        };
      })
    );

    const ai = new GoogleGenAI({ apiKey: clientApiKey });
    const modelsToTry = [GEMINI_TEXT_MODEL, "gemini-2.0-flash", "gemini-1.5-flash"];

    let responseText = "";
    let sources: any[] = [];
    let callSucceeded = false;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature:
              typeof temperature === "number"
                ? Math.max(0, Math.min(2, temperature))
                : 0.3,
            ...(enableWebSearch ? { tools: [{ googleSearch: {} }] } : {}),
          },
        });

        if (response.text) {
          responseText = response.text;
          callSucceeded = true;

          const chunks =
            response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (Array.isArray(chunks)) {
            sources = chunks
              .filter((c: any) => c.web?.uri)
              .map((c: any) => ({
                title: c.web?.title || c.web?.uri,
                url: c.web?.uri,
              }));
          }
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini attempt with ${model} failed:`, err?.message);
        const errMsg = err?.message || String(err);
        if (/401|unauthenticated|api key not valid|access_token_type_unsupported/i.test(errMsg)) {
          break; // Key itself is invalid, attempting other models will not resolve 401
        }
      }
    }

    if (callSucceeded && responseText) {
      return res.json({ reply: responseText, sources });
    }

    // If call failed due to 401 unauthenticated or quota exhaustion, provide expert fallback
    console.error("Gemini generation failed. Delivering offline diagnostic response:", lastError);
    const fallback = generateOfflineDiagnosticFallback(fallbackQuery, selectedPersona);
    const isAuthError =
      /401|unauthenticated|api key not valid|access_token_type_unsupported/i.test(
        lastError?.message || ""
      );

    const errorHeader = `> [DIAGNOSTIC PROTOCOL: Built-in Hardware Bench Analysis]\n\n`;

    return res.json({
      reply: `${errorHeader}${fallback}`,
      sources: [],
      isOfflineMode: true,
      authError: isAuthError,
    });
  } catch (error: any) {
    console.error("Critical error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "Failed to process the diagnostic chat request.",
    });
  }
});

// Image Generation Endpoint powered by Pollinations AI
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body ?? {};
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Image prompt is required." });
    }
    if (prompt.length > 4000) {
      return res.status(400).json({ error: "Image prompt must be 4,000 characters or fewer." });
    }
    if (!isImageAspectRatio(aspectRatio)) {
      return res.status(400).json({ error: "Unsupported image aspect ratio." });
    }

    let width = 1024;
    let height = 1024;
    if (aspectRatio === "16:9") {
      width = 1280;
      height = 720;
    } else if (aspectRatio === "4:3") {
      width = 1024;
      height = 768;
    } else if (aspectRatio === "9:16") {
      width = 720;
      height = 1280;
    }

    const seed = Math.floor(Math.random() * 10000000);
    const cleanPrompt = prompt.trim();
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const pollinationUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    // Attempt server-side fetch with timeout to return base64 data URI
    try {
      const response = await fetch(pollinationUrl, {
        signal: AbortSignal.timeout(15000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "image/jpeg";
        if (contentType.startsWith("image/")) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          return res.json({
            imageUrl: `data:${contentType};base64,${base64}`,
            caption: cleanPrompt,
            engine: "pollinations",
          });
        }
      }
    } catch (fetchErr: any) {
      console.warn("Pollinations server-side fetch notice, using direct URL:", fetchErr?.message);
    }

    // Direct URL fallback (client browser loads directly from Pollinations without server IP limit)
    return res.json({
      imageUrl: pollinationUrl,
      caption: cleanPrompt,
      engine: "pollinations_direct",
    });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    res.status(500).json({ error: error.message || "Failed to generate image." });
  }
});

// Text-To-Speech Endpoint
app.post("/api/text-to-speech", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const clientApiKey = (
      (req.headers["x-gemini-api-key"] as string) ||
      process.env.GEMINI_API_KEY ||
      ""
    ).toString().trim();

    if (!clientApiKey) {
      return res.status(503).json({ error: "Gemini API key is not configured." });
    }

    const cleanText = text.slice(0, 800);
    const ai = new GoogleGenAI({ apiKey: clientApiKey });

    // Use interactions.create if supported, otherwise return 503 so frontend uses Web Speech
    try {
      const response = await ai.interactions.create({
        model: GEMINI_TTS_MODEL,
        input: cleanText,
        response_format: { type: "audio" },
        generation_config: {
          speech_config: [{ voice: voiceName }],
        },
      });

      const audioPart = response.output_audio?.data;
      if (audioPart) {
        return res.json({
          audioBase64: audioPart,
          mimeType: response.output_audio?.mime_type || "audio/wav",
        });
      }
    } catch (err: any) {
      console.warn("Server TTS failed, client will use Web Speech API fallback:", err?.message);
    }

    return res.status(503).json({ error: "Server TTS not available. Fallback to browser speech." });
  } catch (error: any) {
    console.error("Error in /api/text-to-speech:", error);
    res.status(500).json({ error: error.message || "Failed to generate text-to-speech." });
  }
});

// Smart Analysis Tool Endpoint
app.post("/api/smart-tool", async (req, res) => {
  try {
    const { toolType, input } = req.body;
    if (typeof input !== "string" || !input.trim()) {
      return res.status(400).json({ error: "Input text required." });
    }

    const clientApiKey = (
      (req.headers["x-gemini-api-key"] as string) ||
      process.env.GEMINI_API_KEY ||
      ""
    ).toString().trim();

    let prompt = "";
    if (toolType === "enhance_prompt") {
      prompt = `Enhance and optimize the following hardware diagnostic query for maximum technical accuracy: "${input}"`;
    } else if (toolType === "summarize") {
      prompt = `Provide a concise executive diagnostic summary and prioritized action items for:\n\n${input}`;
    } else if (toolType === "code_explain") {
      prompt = `Analyze this system error log or script and detail the root cause and step-by-step fix:\n\n${input}`;
    } else if (toolType === "checklist") {
      prompt = `Create a structured hardware bench repair checklist with multimeter probing and component testing points for:\n\n${input}`;
    } else {
      prompt = `Analyze the following diagnostic content:\n\n${input}`;
    }

    if (!clientApiKey) {
      return res.json({
        result: `[DIAGNOSTIC PROTOCOL: Built-in Analysis]\n\nDiagnostic Assessment for: ${input.slice(0, 80)}\n\n1. Review System Event Logs for Critical Event IDs.\n2. Execute 'DISM /Online /Cleanup-Image /RestoreHealth' and 'sfc /scannow'.\n3. Verify thermal dissipation and hardware sensor metrics.`,
      });
    }

    const ai = new GoogleGenAI({ apiKey: clientApiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "You are a senior hardware diagnostics engineer. Do not use emojis in your response.",
        temperature: 0.2,
      },
    });

    if (response.text) {
      return res.json({ result: response.text });
    }

    return res.status(502).json({ error: "Gemini returned an empty result." });
  } catch (error: any) {
    console.error("Error in /api/smart-tool:", error);
    res.json({
      result: `[DIAGNOSTIC PROTOCOL: Built-in Analysis]\n\nDiagnostic Assessment for input: ${input.slice(0, 80)}\n\n1. Verify power delivery and rail voltages.\n2. Inspect kernel minidump files in C:\\Windows\\Minidump.\n3. Execute memory diagnostic via 'mdsched.exe'.`,
    });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const listenPort = PORT;

  const startListening = (port: number) => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`DARBS AI Server running on http://0.0.0.0:${port}`);
    }).on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${port} is already in use. Set PORT to a free port and restart so the frontend and API use the same port.`
        );
        process.exit(1);
      }

      console.error("Failed to start server:", error);
      process.exit(1);
    });
  };

  startListening(listenPort);
}

startServer();
