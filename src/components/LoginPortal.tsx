import React, { useState } from "react";
import {
  Lock,
  Mail,
  User,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { UserProfile } from "../types";
import { BrandLogo } from "./BrandLogo";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
} from "../services/auth";

interface LoginPortalProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFriendlyErrorMessage = (err: any): string => {
    const code = err?.code || "";
    const msg = err?.message || "";
    if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
      return "Invalid email or password. Please verify your credentials.";
    }
    if (code === "auth/email-already-in-use") {
      return "An account with this email is already registered. Please log in.";
    }
    if (code === "auth/weak-password") {
      return "Password is too weak. Please choose at least 6 characters.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Google sign-in was canceled. Please try again.";
    }
    if (code === "auth/cancelled-popup-request") {
      return "Only one sign-in window can be open at a time.";
    }
    if (code === "auth/unauthorized-domain") {
      return "Authentication domain is not authorized. Please check your cloud configuration.";
    }
    return msg || "Authentication failed. Please check your network and try again.";
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const user = await signInWithGoogle();
      try {
        localStorage.setItem("darbs_auth_user", JSON.stringify(user));
      } catch (e) {}
      setSuccessMessage(`Welcome, ${user.name}! Connecting to DARBS...`);
      setTimeout(() => {
        onLogin(user);
      }, 300);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(getFriendlyErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setPasswordError(false);

    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please provide a valid technician email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must contain at least 6 characters.");
      setPasswordError(true);
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError("Please enter your Technician or User name.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please verify.");
        setPasswordError(true);
        return;
      }

      setIsSubmitting(true);
      try {
        const user = await signUpWithEmail(name.trim(), cleanEmail, password);
        try {
          localStorage.setItem("darbs_auth_user", JSON.stringify(user));
        } catch (e) {}
        setSuccessMessage("Technician account created successfully! Opening DARBS...");
        setTimeout(() => {
          onLogin(user);
        }, 300);
      } catch (err: any) {
        console.error("Email sign up error:", err);
        setError(getFriendlyErrorMessage(err));
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        const user = await signInWithEmail(cleanEmail, password);
        try {
          localStorage.setItem("darbs_auth_user", JSON.stringify(user));
        } catch (e) {}
        setSuccessMessage("Technician credentials verified. Opening DARBS...");
        setTimeout(() => {
          onLogin(user);
        }, 300);
      } catch (err: any) {
        console.error("Email sign in error:", err);
        setPasswordError(true);
        setError(getFriendlyErrorMessage(err));
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070e1b] px-4 py-8 text-slate-100">
      {/* Background Tech Grid & Glow Accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-600/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-slate-900/60 blur-[100px]" />
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Main Auth Container */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-3xl border border-slate-800 bg-[#0a1224]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header Brand */}
          <div className="text-center">
            <div className="mx-auto mb-4 relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/25 ring-2 ring-cyan-400/50 overflow-hidden">
              <BrandLogo />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0a1224] z-10">
                <Shield className="h-2.5 w-2.5 text-white" />
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black tracking-wider text-white">DARBS</h1>
            </div>
            
            <p className="mt-1 text-xs text-slate-400">
              Diagnostic Assistant for Repair, Bugs and Support
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 flex rounded-xl border border-slate-800 bg-slate-950/70 p-1">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                !isSignUp
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                isSignUp
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/50 bg-red-950/50 p-3 text-xs text-red-200 flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/90 py-2.5 px-4 text-xs md:text-sm font-semibold text-slate-100 shadow-md hover:bg-slate-800 hover:border-cyan-500/50 transition-all disabled:opacity-60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                />
              </svg>
              <span>{isSignUp ? "Sign up with Google" : "Sign in with Google"}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute bg-[#0a1224] px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              or use email
            </span>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Technician Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    placeholder="e.g. Rey Mart"
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    required={isSignUp}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3.5 text-xs md:text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  placeholder="tech@darbs.io"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3.5 text-xs md:text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {passwordError && (
                  <span className="text-[10px] text-red-400 font-medium animate-pulse">
                    Check password
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock
                  className={`absolute left-3.5 top-3 h-4 w-4 transition-colors ${
                    passwordError ? "text-red-400" : "text-slate-400"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(false);
                    if (error) setError(null);
                  }}
                  required
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-xs md:text-sm text-slate-100 transition-all placeholder:text-slate-600 ${
                    passwordError
                      ? "border-red-500/90 bg-red-950/20 ring-1 ring-red-500/50 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      : "border-slate-800 bg-slate-900/90 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    placeholder="••••••••"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    required={isSignUp}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3.5 text-xs md:text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 px-4 text-xs md:text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Register Technician Account" : "Sign In to DARBS"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
