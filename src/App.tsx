import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ChatMessageItem } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { DeleteHistoryModal } from "./components/DeleteHistoryModal";
import { ExitModal } from "./components/ExitModal";
import { LoginPortal } from "./components/LoginPortal";
import { GeminiKeyModal } from "./components/GeminiKeyModal";
import { ImageStudio } from "./components/ImageStudio";
import { SmartToolsPanel } from "./components/SmartToolsPanel";
import { BrandLogo } from "./components/BrandLogo";
import { AppSettings, ChatMessage, ChatSession, DashboardTab, PersonaType, UserProfile } from "./types";
import { speechController } from "./utils/speech";
import { RotateCcw, LogOut } from "lucide-react";
import { onAuthStateChange, logOutUser } from "./services/auth";
import {
  fetchUserSessionsFromFirestore,
  saveSessionToFirestore,
  deleteSessionFromFirestore,
  clearAllSessionsFromFirestore,
} from "./services/history";

const INITIAL_SETTINGS: AppSettings = {
  persona: "hardware_laptop",
  temperature: 0.7,
  enableWebSearch: false,
  speechEnabled: true,
  voiceName: "Kore",
  speechRate: 1.0,
  theme: "dark",
};

const createNewSession = (title?: string): ChatSession => {
  const id = `session-${Date.now()}`;
  return {
    id,
    title: title || "New Diagnostic Chat",
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    persona: "hardware_laptop",
    messages: [
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Hello! I'm **DARBS** (*Diagnostic Assistant for Repair, Bugs & Support*), your Laptop & PC Technical Support Specialist.

I can help diagnose, troubleshoot, maintain, and repair problems with your PC or laptop — including system crashes, Windows errors, Wi-Fi issues, driver corruption, and hardware diagnostics.

**Diagnostic Modules Available:**
- **Performance & Storage**: Troubleshoot high CPU/RAM/Disk utilization, storage bottlenecks, and background services
- **BSOD & Kernel Crashes**: Analyze stop codes, read minidump logs, and execute system integrity repairs (SFC/DISM)
- **Network & Connectivity**: Diagnose WLAN adapter drops, reset network stacks, and resolve DNS routing issues
- **Hardware & Thermals**: Inspect component temperatures, thermal throttling, fan behavior, and battery wear
- **Photo Inspection**: Upload images of hardware components, motherboard traces, or screen error codes
- **Voice Diagnostics**: Record audio describing strange physical noises, coil whine, or fan bearing rattle`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ],
  };
};

export default function App() {
  // Authentication State: Require valid registered account authentication before opening DARBS
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved =
        localStorage.getItem("darbs_auth_user") ||
        sessionStorage.getItem("darbs_auth_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse auth user", e);
    }
    return null;
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("darbs_diagnostic_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse saved sessions", e);
      }
    }
    return [createNewSession("Welcome to DARBS")];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || "session-1";
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("darbs_app_settings");
    if (saved) {
      try {
        return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return INITIAL_SETTINGS;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isExitedView, setIsExitedView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("chat");
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        setCurrentUser(user);
        localStorage.setItem("darbs_auth_user", JSON.stringify(user));
        // Retrieve synced chat history from Firestore
        const cloudSessions = await fetchUserSessionsFromFirestore(user.id);
        if (cloudSessions && cloudSessions.length > 0) {
          setSessions(cloudSessions);
          setCurrentSessionId(cloudSessions[0].id);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync sessions to localStorage & Firestore
  useEffect(() => {
    localStorage.setItem("darbs_diagnostic_sessions", JSON.stringify(sessions));
    if (currentUser && currentSession) {
      saveSessionToFirestore(currentUser.id, currentSession);
    }
  }, [sessions, currentUser, currentSessionId]);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem("darbs_app_settings", JSON.stringify(settings));
  }, [settings]);

  // Subscribe to speech controller state
  useEffect(() => {
    const unsubscribe = speechController.subscribe((speaking, id) => {
      setSpeakingMessageId(speaking ? id : null);
    });
    return () => {
      unsubscribe();
      speechController.stop();
    };
  }, []);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isLoading]);

  // Handler: User Logout
  const handleLogout = async () => {
    speechController.stop();
    try {
      await logOutUser();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    localStorage.removeItem("darbs_auth_user");
    sessionStorage.removeItem("darbs_auth_user");
    setCurrentUser(null);
    setIsExitedView(false);
  };

  // Handler: Start New Diagnostic Chat Session
  const handleNewChat = () => {
    speechController.stop();
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsExitedView(false);
    if (currentUser) {
      saveSessionToFirestore(currentUser.id, newSession);
    }
  };

  // Handler: Select Session
  const handleSelectSession = (sessionId: string) => {
    speechController.stop();
    setCurrentSessionId(sessionId);
    setIsExitedView(false);
  };

  // Handler: Delete single session
  const handleDeleteSession = (sessionId: string) => {
    speechController.stop();
    if (currentUser) {
      deleteSessionFromFirestore(currentUser.id, sessionId);
    }
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const fresh = createNewSession();
        setCurrentSessionId(fresh.id);
        if (currentUser) {
          saveSessionToFirestore(currentUser.id, fresh);
        }
        return [fresh];
      }
      if (currentSessionId === sessionId) {
        setCurrentSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Handler: Clear all sessions / Delete history
  const handleClearAllSessions = () => {
    speechController.stop();
    if (currentUser) {
      clearAllSessionsFromFirestore(currentUser.id);
    }
    const freshSession = createNewSession("New Diagnostic Session");
    setSessions([freshSession]);
    setCurrentSessionId(freshSession.id);
    localStorage.removeItem("darbs_diagnostic_sessions");
    if (currentUser) {
      saveSessionToFirestore(currentUser.id, freshSession);
    }
    setIsDeleteModalOpen(false);
  };

  // Handler: Toggle Global Speech Setting
  const handleToggleGlobalSpeech = () => {
    if (settings.speechEnabled) {
      speechController.stop();
      setSettings((prev) => ({ ...prev, speechEnabled: false }));
    } else {
      setSettings((prev) => ({ ...prev, speechEnabled: true }));
    }
  };

  // Handler: Toggle Speech for specific message
  const handleToggleMessageSpeech = (text: string, messageId: string) => {
    if (speakingMessageId === messageId) {
      speechController.stop();
    } else {
      speechController.speak(
        text,
        messageId,
        settings.speechRate || 1.0,
        settings.voiceName || "Kore"
      );
    }
  };

  // Handler: Send Message to DARBS with optional Photo and Voice Note
  const handleSendMessage = async (
    text: string,
    imageUrl?: string,
    audioData?: { url: string; duration: number }
  ) => {
    if ((!text.trim() && !imageUrl && !audioData) || isLoading) return;

    speechController.stop();

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: text || (imageUrl ? "Attached diagnostic photo for inspection" : "Voice Note"),
      timestamp,
      imageUrl,
      audioUrl: audioData?.url,
      audioDuration: audioData?.duration,
      isVoiceMessage: !!audioData,
    };

    // Update session title if first user message
    let sessionTitle = currentSession.title;
    if (
      currentSession.messages.length === 1 &&
      (currentSession.title.startsWith("New Diagnostic") ||
        currentSession.title.startsWith("Welcome to DARBS"))
    ) {
      const summaryText = text || (imageUrl ? "Photo Diagnosis" : "Voice Diagnostic");
      sessionTitle = summaryText.slice(0, 32) + (summaryText.length > 32 ? "..." : "");
    }

    const updatedMessages = [...currentSession.messages, userMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: sessionTitle,
              updatedAt: timestamp,
              messages: updatedMessages,
            }
          : s
      )
    );

    setIsLoading(true);

    // Call /api/chat with multimodal context (messages + attached image)
    try {
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
        imageUrl: m.imageUrl,
        audioUrl: m.audioUrl,
      }));

      const customKey = localStorage.getItem("darbs_custom_gemini_key") || "";
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customKey ? { "x-gemini-api-key": customKey } : {}),
        },
        body: JSON.stringify({
          messages: historyPayload,
          persona: settings.persona,
          temperature: settings.temperature,
          enableWebSearch: settings.enableWebSearch,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response from DARBS.");
      }

      const assistantMsgId = `msg-assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sources: data.sources || [],
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                updatedAt: assistantMsg.timestamp,
                messages: [...s.messages, assistantMsg],
              }
            : s
        )
      );

      // If speech is globally enabled or user used voice message, speak reply
      if (settings.speechEnabled || !!audioData) {
        speechController.speak(
          data.reply,
          assistantMsgId,
          settings.speechRate || 1.0,
          settings.voiceName || "Kore"
        );
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMsg: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        role: "assistant",
        content: `Diagnostic Error: ${
          error.message ||
          "Failed to communicate with DARBS engine. Please verify your connection."
        }`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, errorMsg] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <LoginPortal
        onLogin={async (user) => {
          setCurrentUser(user);
          localStorage.setItem("darbs_auth_user", JSON.stringify(user));
          const cloudSessions = await fetchUserSessionsFromFirestore(user.id);
          if (cloudSessions && cloudSessions.length > 0) {
            setSessions(cloudSessions);
            setCurrentSessionId(cloudSessions[0].id);
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070e1b] text-slate-100 font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={() => setIsDeleteModalOpen(true)}
        settings={settings}
        onOpenExitModal={() => setIsExitModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSelectPersona={(persona) => setSettings((prev) => ({ ...prev, persona }))}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#070e1b]">
        <Navbar
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
          onOpenExitModal={() => setIsExitModalOpen(true)}
          onOpenGeminiModal={() => setIsGeminiModalOpen(true)}
          settings={settings}
          onToggleSpeech={handleToggleGlobalSpeech}
          currentUser={currentUser}
          onLogout={handleLogout}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Exited Workspace Screen, Photo Generator, Smart Tools, or Active Diagnostic Chat */}
        {isExitedView ? (
          <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-4 rounded-3xl border border-slate-800 bg-[#0b1429] p-8 shadow-2xl">
              <div className="mx-auto relative flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden border border-cyan-400/40 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                <BrandLogo />
              </div>
              <h2 className="text-xl font-bold text-white">
                DARBS Session Closed
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Diagnostic Assistant for Repair, Bugs and Support has been safely closed. Your diagnostic history is preserved locally.
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={() => setIsExitedView(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 px-4 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-md"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Resume Diagnostic Session</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-900/60 bg-red-950/40 py-2.5 px-4 text-xs font-semibold text-red-300 hover:bg-red-900/50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out to Login Portal</span>
                </button>
              </div>
            </div>
          </main>
        ) : activeTab === "image_studio" ? (
          <main className="flex flex-1 flex-col overflow-hidden">
            <ImageStudio
              onSendImageToChat={(imageUrl, prompt) => {
                setActiveTab("chat");
                handleSendMessage(prompt, imageUrl);
              }}
            />
          </main>
        ) : activeTab === "smart_tools" ? (
          <main className="flex flex-1 flex-col overflow-hidden">
            <SmartToolsPanel
              onSendResultToChat={(result) => {
                setActiveTab("chat");
                handleSendMessage(result);
              }}
            />
          </main>
        ) : (
          <main className="flex flex-1 flex-col overflow-hidden">
            {/* Chat messages viewport */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
              {currentSession?.messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  settings={settings}
                  isSpeaking={speakingMessageId === msg.id}
                  onToggleMessageSpeech={handleToggleMessageSpeech}
                  onOpenGeminiModal={() => setIsGeminiModalOpen(true)}
                />
              ))}

              {/* Loading Indicator when DARBS is analyzing */}
              {isLoading && (
                <div className="flex gap-4 p-4 md:px-6 bg-[#070e1b]">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-cyan-400/40 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white animate-pulse shadow-md shadow-cyan-500/20">
                    <BrandLogo />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-bold text-white">DARBS</span>
                    <span className="text-cyan-300">
                      is analyzing hardware diagnostics & logs...
                    </span>
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer with Photo Upload & Voice Note */}
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              settings={settings}
              onToggleWebSearch={() =>
                setSettings((prev) => ({
                  ...prev,
                  enableWebSearch: !prev.enableWebSearch,
                }))
              }
              onSelectPrompt={(p) => handleSendMessage(p)}
              showStarterChips={currentSession?.messages.length <= 1}
            />
          </main>
        )}
      </div>

      {/* Delete History Confirmation Modal */}
      <DeleteHistoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleClearAllSessions}
      />

      {/* Exit Dashboard Modal */}
      <ExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirmExit={() => {
          speechController.stop();
          setIsExitModalOpen(false);
          setIsExitedView(true);
        }}
        onResetSession={() => {
          handleClearAllSessions();
          setIsExitModalOpen(false);
          setIsExitedView(false);
        }}
      />

      {/* Gemini Engine Configuration Modal */}
      <GeminiKeyModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        onKeySaved={() => {
          // Key updated in localStorage
        }}
      />
    </div>
  );
}
