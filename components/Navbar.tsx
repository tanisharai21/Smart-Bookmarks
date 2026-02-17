"use client";

import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const fullName = user.user_metadata?.full_name as string | undefined;
  const email = user.email;

  // Get initials for avatar fallback
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] glass">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🔖</span>
          <span className="font-display font-bold text-lg text-gradient tracking-tight">
            Smart Bookmarks
          </span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((v) => !v)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-light hover:bg-white/[0.07] transition-all duration-200 group"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center flex-shrink-0 ring-1 ring-accent/30">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName ?? "User"}
                  width={28}
                  height={28}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-xs font-bold text-accent">
                  {initials}
                </span>
              )}
            </div>

            {/* Name (hidden on mobile) */}
            <span className="hidden sm:block text-sm font-medium text-slate-300 max-w-[120px] truncate">
              {fullName ?? email}
            </span>

            {/* Chevron */}
            <svg
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 glass rounded-xl shadow-card border border-white/[0.08] z-20 overflow-hidden animate-in">
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-xs text-slate-500 mb-0.5">Signed in as</p>
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {fullName ?? "User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{email}</p>
                </div>

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:text-danger hover:bg-danger/5 transition-all duration-150 flex items-center gap-2.5 disabled:opacity-50"
                >
                  {isSigningOut ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      Signing out…
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign out
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
