import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";
import { UserProfile } from "../types";

export const mapFirebaseUserToProfile = (
  user: FirebaseUser,
  customName?: string
): UserProfile => {
  return {
    id: user.uid,
    name: user.displayName || customName || (user.email ? user.email.split("@")[0] : "Technician"),
    email: user.email || "",
    role: "Hardware & Laptop Technician",
    avatar: user.photoURL || undefined,
    createdAt: user.metadata.creationTime || new Date().toISOString(),
  };
};

// Sync user record to Firestore /users/{userId}
export const syncUserProfileToFirestore = async (
  profile: UserProfile
): Promise<void> => {
  try {
    const userRef = doc(db, "users", profile.id);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        displayName: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        userRef,
        {
          displayName: profile.name,
          email: profile.email,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn("Could not sync user profile to Firestore (may be offline or Firestore not initialized yet):", err);
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<UserProfile> => {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = mapFirebaseUserToProfile(credential.user);
  await syncUserProfileToFirestore(profile);
  return profile;
};

export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string
): Promise<UserProfile> => {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (name.trim()) {
    try {
      await updateProfile(credential.user, { displayName: name.trim() });
    } catch (e) {
      console.warn("Could not update display name:", e);
    }
  }
  const profile = mapFirebaseUserToProfile(credential.user, name.trim());
  await syncUserProfileToFirestore(profile);
  return profile;
};

export const signInWithGoogle = async (): Promise<UserProfile> => {
  const credential = await signInWithPopup(auth, googleProvider);
  const profile = mapFirebaseUserToProfile(credential.user);
  await syncUserProfileToFirestore(profile);
  return profile;
};

export const logOutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const onAuthStateChange = (callback: (user: UserProfile | null) => void) => {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const profile = mapFirebaseUserToProfile(fbUser);
      callback(profile);
    } else {
      callback(null);
    }
  });
};

