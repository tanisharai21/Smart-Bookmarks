"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";

interface BookmarkFormProps {
  userId: string;
}

export default function BookmarkForm({ userId }: BookmarkFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successAnim, setSuccessAnim] = useState(false);

  const supabase = createClient();

  // Ensure URL has a protocol prefix
  const normalizeUrl = (rawUrl: string): string => {
    const trimmed = rawUrl.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const isValidUrl = (rawUrl: string): boolean => {
    try {
      new URL(normalizeUrl(rawUrl));
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle) {
      setError("Please enter a title for your bookmark.");
      return;
    }

    if (!trimmedUrl) {
      setError("Please enter a URL.");
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setError("Please enter a valid URL (e.g. https://example.com).");
      return;
    }

    setIsSubmitting(true);

    const { error: insertError } = await supabase.from("bookmarks").insert({
      user_id: userId,
      title: trimmedTitle,
      url: normalizeUrl(trimmedUrl),
    });

    setIsSubmitting(false);

    if (insertError) {
      setError(`Failed to save bookmark: ${insertError.message}`);
      return;
    }

    // Success — clear form and show feedback
    setTitle("");
    setUrl("");
    setSuccessAnim(true);
    setTimeout(() => setSuccessAnim(false), 1500);
  };

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
          <svg
            className="w-3.5 h-3.5 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <h2 className="font-display font-semibold text-base text-slate-200">
          Add Bookmark
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title input */}
        <div>
          <label
            htmlFor="title"
            className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Next.js Documentation"
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600
              bg-ink-800/60 border border-white/[0.07] 
              focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 focus:bg-ink-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200"
          />
        </div>

        {/* URL input */}
        <div>
          <label
            htmlFor="url"
            className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider"
          >
            URL
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isSubmitting}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600
                bg-ink-800/60 border border-white/[0.07]
                focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 focus:bg-ink-800
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20">
            <svg
              className="w-4 h-4 text-danger flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || (!title.trim() && !url.trim())}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200
            flex items-center justify-center gap-2
            ${
              successAnim
                ? "bg-success text-ink-950 scale-[0.99]"
                : "bg-accent hover:bg-accent-light text-white hover:shadow-glow-sm active:scale-[0.98]"
            }
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:hover:shadow-none`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : successAnim ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Saved!
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              Save Bookmark
            </>
          )}
        </button>
      </form>
    </div>
  );
}
