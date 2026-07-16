import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function AppLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: club } = await supabase
    .from("mybusiness_clubs")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!club) {
    // Signed in but no club row (shouldn't normally happen — signup creates one).
    redirect("/login");
  }

  return <AppShell club={club}>{children}</AppShell>;
}
