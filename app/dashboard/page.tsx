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
    <div className="min-h-screen bg-gray-100">
    <Navbar user={user} />

    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white shadow-xl rounded-2xl p-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            My Bookmarks
          </h1>
          <p className="text-gray-500 text-sm">
            {initialBookmarks.length === 0
              ? "No bookmarks yet — add your first one below"
              : `${initialBookmarks.length} bookmark${
                  initialBookmarks.length !== 1 ? "s" : ""
                } saved`}
          </p>
        </div>

        {/* Add bookmark */}
        <BookmarkForm userId={user.id} />

        {/* Bookmark list */}
        <BookmarkList
          initialBookmarks={initialBookmarks}
          userId={user.id}
        />
      </div>
    </main>
  </div>
  );
}
