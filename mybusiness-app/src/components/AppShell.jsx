"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClubContext } from "@/lib/club-context";
import {
  Home,
  Users,
  CalendarDays,
  Receipt,
  FileText,
  Settings,
  ShieldHalf,
  LogOut,
  Star,
} from "lucide-react";

const NAV_TOP = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/joueurs", label: "Joueurs", icon: Users },
  { href: "/horaire", label: "Horaire", icon: CalendarDays },
];
const NAV_MID = [
  { href: "/cotisations", label: "Cotisations", icon: Receipt },
  { href: "/documents", label: "Documents", icon: FileText },
];

function AppShellInner({ club, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="bg-blobs relative min-h-screen overflow-x-hidden p-5">
      <div className="relative z-10 mx-auto flex max-w-[1400px] items-start gap-5">
        {/* sidebar */}
        <div className="sticky top-5 flex flex-shrink-0 flex-col items-center gap-3.5">
          <Link
            href="/dashboard"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-green)] text-[var(--side-dark-b)] shadow-[0_10px_24px_-8px_rgba(101,235,139,0.6)]"
          >
            <Star size={19} />
          </Link>

          <div className="flex w-14 flex-col items-center gap-1.5 rounded-full bg-[rgba(21,23,20,0.92)] px-0 py-3 shadow-[0_20px_40px_-18px_rgba(10,20,12,0.45)] backdrop-blur-xl">
            <SideIcon href="/club" icon={ShieldHalf} active={pathname === "/club"} standalone />
            <div className="my-1 flex flex-col gap-1.5">
              {NAV_TOP.map((item) => (
                <SideIcon
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  active={pathname.startsWith(item.href)}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              {NAV_MID.map((item) => (
                <SideIcon
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  active={pathname.startsWith(item.href)}
                />
              ))}
            </div>
            <div className="mt-2">
              <SideIcon
                href="/parametres"
                icon={Settings}
                active={pathname === "/parametres"}
              />
            </div>
          </div>
        </div>

        {/* main */}
        <div className="min-w-0 flex-1 rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_24px_60px_-30px_rgba(20,30,20,0.25)] backdrop-blur-2xl md:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--brand-green)] text-[var(--side-dark-b)]">
                <Star size={13} />
              </span>
              MyBusiness
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white/90 px-4 py-1.5 text-xs font-semibold">
                <span
                  className="flex h-6.5 w-6.5 items-center justify-center overflow-hidden rounded-full bg-[#fdeceb] text-[11px] text-[#8a2f28]"
                  style={{ width: 26, height: 26 }}
                >
                  {club.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={club.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ShieldHalf size={12} />
                  )}
                </span>
                {club.name}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[var(--side-dark-a)] px-4 py-1.5 text-xs font-semibold text-white">
                <span
                  className="flex items-center justify-center rounded-full bg-white/15 text-[11px]"
                  style={{ width: 26, height: 26 }}
                >
                  {club.representative?.[0]?.toUpperCase() || "?"}
                </span>
                {club.representative || "Représentant"}
              </div>
              <button
                onClick={handleLogout}
                disabled={signingOut}
                title="Se déconnecter"
                className="flex h-9.5 w-9.5 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white/90 text-[var(--text-soft)] transition hover:border-transparent hover:bg-[var(--rust-tint)] hover:text-[var(--rust-text)]"
                style={{ width: 38, height: 38 }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

// wrap the whole thing so `children` has access to the club via context
export default function AppShell(props) {
  return (
    <ClubContext.Provider value={props.club}>
      <AppShellInner {...props} />
    </ClubContext.Provider>
  );
}

function SideIcon({ href, icon: Icon, active, standalone }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center rounded-full transition ${
        active ? "bg-white text-[var(--side-dark-b)]" : "text-white/55 hover:text-white"
      }`}
      style={{ width: standalone ? 42 : 38, height: standalone ? 42 : 38 }}
    >
      <Icon size={standalone ? 17 : 15} />
    </Link>
  );
}
