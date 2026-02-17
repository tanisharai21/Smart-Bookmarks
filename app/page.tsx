import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * Root page — checks auth and redirects accordingly.
 * Authenticated users → /dashboard
 * Unauthenticated users → /login
 */
export default async function Home() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
