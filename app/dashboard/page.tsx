import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import Navbar from "@/components/Navbar";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkList from "@/components/BookmarkList";
import type { Bookmark } from "@/types/bookmark";

/**
 * Dashboard Page — Server Component
 *
 * Responsibilities:
 * 1. Verify user is authenticated (redirect to /login if not)
 * 2. Fetch initial bookmarks server-side for fast first render
 * 3. Render client components (BookmarkForm, BookmarkList) with initial data
 *
 * Real-time updates are handled client-side in BookmarkList.
 */
export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  // Get authenticated user (secure — uses getUser, not getSession)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch initial bookmarks server-side
  const { data: bookmarks, error: fetchError } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("Error fetching bookmarks:", fetchError.message);
  }

  const initialBookmarks: Bookmark[] = bookmarks ?? [];

  return (
    <div className="min-h-screen bg-ink-950 bg-grid relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-radial-glow pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Navbar */}
      <Navbar user={user} />

      {/* Main content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-8 animate-in" style={{ animationDelay: "0.1s" }}>
          <h1 className="font-display text-3xl font-bold text-gradient mb-1">
            My Bookmarks
          </h1>
          <p className="text-slate-500 text-sm">
            {initialBookmarks.length === 0
              ? "No bookmarks yet — add your first one below"
              : `${initialBookmarks.length} bookmark${initialBookmarks.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>

        {/* Add bookmark form */}
        <div className="mb-8 animate-in" style={{ animationDelay: "0.15s" }}>
          <BookmarkForm userId={user.id} />
        </div>

        {/* Bookmark list with realtime */}
        <div className="animate-in" style={{ animationDelay: "0.2s" }}>
          <BookmarkList
            initialBookmarks={initialBookmarks}
            userId={user.id}
          />
        </div>
      </main>
    </div>
  );
}
