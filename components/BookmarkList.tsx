"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { Bookmark } from "@/types/bookmark";

interface BookmarkListProps {
  initialBookmarks: Bookmark[];
  userId: string;
}

// Skeleton loader for individual bookmark card
function BookmarkSkeleton() {
  return (
    <div className="glass-light rounded-xl p-4 shimmer">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-white/5 rounded w-2/3" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0" />
      </div>
    </div>
  );
}

// Individual bookmark card
function BookmarkCard({
  bookmark,
  onDelete,
}: {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const supabase = createClient();

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmark.id);

    if (error) {
      console.error("Delete error:", error.message);
      setIsDeleting(false);
    }
    // Realtime will handle the UI update via subscription
  };

  // Extract hostname for display
  const getHostname = (url: string): string => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  // Get favicon URL
  const getFaviconUrl = (url: string): string => {
    try {
      const { protocol, hostname } = new URL(url);
      return `${protocol}//${hostname}/favicon.ico`;
    } catch {
      return "";
    }
  };

  // Format relative time
  const getRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const hostname = getHostname(bookmark.url);
  const faviconUrl = getFaviconUrl(bookmark.url);

  return (
    <div
      className={`group glass-light rounded-xl p-4 hover-lift transition-all duration-300 border border-white/[0.05] hover:border-accent/20 hover:shadow-glow-sm
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      style={{ transition: "opacity 0.3s ease, transform 0.3s ease, border-color 0.2s ease, box-shadow 0.2s ease" }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: favicon + content */}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 flex-1 min-w-0 group/link"
        >
          {/* Favicon */}
          <div className="w-8 h-8 rounded-lg bg-ink-700 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/[0.06]">
            <img
              src={faviconUrl}
              alt=""
              className="w-4 h-4 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-slate-500 text-xs font-bold">${hostname[0]?.toUpperCase() ?? "?"}</span>`;
                }
              }}
            />
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-slate-200 truncate group-hover/link:text-accent transition-colors duration-150 mb-0.5">
              {bookmark.title}
            </p>
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3 h-3 text-slate-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span className="text-xs text-slate-600 truncate">{hostname}</span>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-700 flex-shrink-0">
                {getRelativeTime(bookmark.created_at)}
              </span>
            </div>
          </div>
        </a>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-8 h-8 rounded-lg flex items-center justify-center
            text-slate-700 hover:text-danger hover:bg-danger/10
            opacity-0 group-hover:opacity-100
            transition-all duration-150 flex-shrink-0
            disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Delete bookmark"
          title="Delete"
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="text-5xl mb-4">🔖</div>
      <h3 className="font-display font-semibold text-slate-300 mb-2">
        No bookmarks yet
      </h3>
      <p className="text-slate-600 text-sm max-w-xs mx-auto">
        Add your first bookmark above. They&apos;ll appear here instantly — even
        across multiple tabs.
      </p>
    </div>
  );
}

/**
 * BookmarkList — Client Component
 *
 * Manages the real-time bookmark list:
 * 1. Initializes with server-rendered data (fast first paint)
 * 2. Subscribes to Supabase Realtime for instant updates
 * 3. Filters changes by user_id for privacy
 * 4. Handles INSERT and DELETE events
 */
export default function BookmarkList({
  initialBookmarks,
  userId,
}: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "connected" | "error"
  >("connecting");
  const supabase = createClient();

  const handleDelete = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    // Update local state if initialBookmarks changes (e.g., navigation)
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  useEffect(() => {
    /**
     * Supabase Realtime Subscription
     *
     * Listens to postgres_changes on the bookmarks table,
     * filtered to the current user's rows only.
     *
     * Events:
     * - INSERT: New bookmark added → prepend to list
     * - DELETE: Bookmark removed → filter from list
     */
    const channel = supabase
      .channel(`bookmarks:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark;
          setBookmarks((prev) => {
            // Deduplicate — avoid adding if already present
            if (prev.some((b) => b.id === newBookmark.id)) return prev;
            return [newBookmark, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedId = payload.old.id as string;
          setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setRealtimeStatus("error");
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  return (
    <div>
      {/* Section header with realtime indicator */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-slate-300 text-sm uppercase tracking-wider">
          Saved Links
        </h2>

        {/* Realtime status indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              realtimeStatus === "connected"
                ? "bg-success animate-pulse-slow"
                : realtimeStatus === "error"
                  ? "bg-danger"
                  : "bg-slate-600 animate-pulse"
            }`}
          />
          <span className="text-xs text-slate-600">
            {realtimeStatus === "connected"
              ? "Live"
              : realtimeStatus === "error"
                ? "Offline"
                : "Connecting"}
          </span>
        </div>
      </div>

      {/* Bookmark cards */}
      {bookmarks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2.5">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Count footer */}
      {bookmarks.length > 0 && (
        <p className="text-center text-xs text-slate-700 mt-6">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""} total
        </p>
      )}
    </div>
  );
}
