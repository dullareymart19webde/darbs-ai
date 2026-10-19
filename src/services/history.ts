import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { ChatSession } from "../types";

export const fetchUserSessionsFromFirestore = async (
  userId: string
): Promise<ChatSession[] | null> => {
  if (!userId) return null;
  try {
    const sessionsRef = collection(db, "users", userId, "sessions");
    const q = query(sessionsRef, orderBy("updatedAtMs", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const sessions: ChatSession[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      sessions.push({
        id: docSnap.id,
        title: data.title || "Diagnostic Chat",
        createdAt: data.createdAt || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        updatedAt: data.updatedAt || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        persona: data.persona || "hardware_laptop",
        messages: Array.isArray(data.messages) ? data.messages : [],
      });
    });

    return sessions;
  } catch (error) {
    console.warn("Firestore fetchUserSessions warning (using local backup):", error);
    return null;
  }
};

export const saveSessionToFirestore = async (
  userId: string,
  session: ChatSession
): Promise<void> => {
  if (!userId || !session || !session.id) return;
  try {
    const sessionRef = doc(db, "users", userId, "sessions", session.id);
    await setDoc(
      sessionRef,
      {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        updatedAtMs: Date.now(),
        persona: session.persona,
        messages: session.messages || [],
        syncedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn(`Firestore saveSession error for session ${session.id}:`, error);
  }
};

export const deleteSessionFromFirestore = async (
  userId: string,
  sessionId: string
): Promise<void> => {
  if (!userId || !sessionId) return;
  try {
    const sessionRef = doc(db, "users", userId, "sessions", sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.warn(`Firestore deleteSession error for session ${sessionId}:`, error);
  }
};

export const clearAllSessionsFromFirestore = async (
  userId: string
): Promise<void> => {
  if (!userId) return;
  try {
    const sessionsRef = collection(db, "users", userId, "sessions");
    const snapshot = await getDocs(sessionsRef);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error) {
    console.warn("Firestore clearAllSessions error:", error);
  }
};

