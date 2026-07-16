"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useClub } from "@/lib/club-context";
import Donut from "@/components/Donut";
import { Users, Check, Clock, AlertCircle, Plus, CalendarDays, FileText, Bell, CalendarCheck } from "lucide-react";

const CATEGORIES = ["Seniors F", "U17", "U15"];

export default function DashboardPage() {
  const club = useClub();
  const supabase = createClient();

  const [players, setPlayers] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [nextSession, setNextSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [{ data: p }, { data: r }, { data: d }, { data: s }] = await Promise.all([
        supabase.from("mybusiness_players").select("*").eq("club_id", club.id),
        supabase.from("mybusiness_reminders").select("*").eq("club_id", club.id).order("id"),
        supabase.from("mybusiness_documents").select("*").eq("club_id", club.id),
        supabase.from("mybusiness_sessions").select("*").eq("club_id", club.id).limit(1),
      ]);
      if (!active) return;
      setPlayers(p || []);
      setReminders(r || []);
      setDocuments(d || []);
      setNextSession((s && s[0]) || null);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [club.id, supabase]);

  const total = players.length;
  const ok = players.filter((p) => p.cotis >= 80).length;
  const late = players.filter((p) => p.cotis === 0).length;
  const mid = total - ok - late;
  const nextReminder = reminders.find((r) => !r.done);

  async function toggleReminder(r) {
    setReminders((prev) => prev.map((x) => (x.id === r.id ? { ...x, done: !x.done } : x)));
    await supabase.from("mybusiness_reminders").update({ done: !r.done }).eq("id", r.id);
  }

  async function addReminder() {
    const label = window.prompt("Nouveau rappel :");
    if (!label?.trim()) return;
    const { data } = await supabase
      .from("mybusiness_reminders")
      .insert({ club_id: club.id, label: label.trim(), due: "—", done: false })
      .select()
      .single();
    if (data) setReminders((prev) => [...prev, data]);
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-[var(--text-soft)]">Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-[var(--brand-green-deep)]">
        {new Date().toLocaleDateString("fr-BE", { weekday: "long", day: "2-digit", month: "long" })}
      </div>
      <h1 className="mb-5 text-[28px] font-extrabold tracking-tight">Dashboard</h1>

      <div className="mb-4 flex flex-wrap gap-2.5">
        <Chip icon={CalendarCheck}>
          {nextSession
            ? `${nextSession.day} · ${nextSession.time_range} · ${nextSession.category}`
            : "Aucune séance planifiée"}
        </Chip>
        <Chip icon={Bell} muted>
          {nextReminder ? nextReminder.label : "Aucun rappel en attente"}
        </Chip>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Users} tone="ink" label="Affiliés" value={total} />
        <StatCard icon={Check} tone="green" label="À jour" value={ok} />
        <StatCard icon={Clock} tone="amber" label="Échelonnées" value={mid} />
        <StatCard icon={AlertCircle} tone="rust" label="Impayées" value={late} />
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-[2fr_1fr]">
        <Card title="Cotisations par catégorie">
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const list = players.filter((p) => p.category === cat);
              const n = list.length || 1;
              const cOk = list.filter((p) => p.cotis >= 80).length;
              const cLate = list.filter((p) => p.cotis === 0).length;
              const cMid = list.length - cOk - cLate;
              return (
                <div key={cat}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-semibold">{cat}</span>
                    <span className="font-semibold text-[var(--text-faint)]">
                      {list.length} joueuses
                    </span>
                  </div>
                  <div className="flex h-3.5 overflow-hidden rounded-lg bg-neutral-100">
                    <div style={{ width: `${(cOk / n) * 100}%`, background: "#1fd97a" }} />
                    <div style={{ width: `${(cMid / n) * 100}%`, background: "#ffcd1f" }} />
                    <div style={{ width: `${(cLate / n) * 100}%`, background: "#ff4d4d" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Répartition globale">
          <div className="flex items-center gap-4">
            <Donut
              segments={[
                { value: total ? Math.round((ok / total) * 100) : 0, color: "#0fa860" },
                { value: total ? Math.round((mid / total) * 100) : 0, color: "#d68a00" },
                { value: total ? Math.round((late / total) * 100) : 0, color: "#e0403a" },
              ]}
              centerValue={total}
              centerLabel="affiliés"
            />
            <div className="flex-1 space-y-2">
              <LegendRow color="#0fa860" label="À jour" value={ok} />
              <LegendRow color="#d68a00" label="Échelonnées" value={mid} />
              <LegendRow color="#e0403a" label="Impayées" value={late} />
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card title="Rappels" action={<button onClick={addReminder}><Plus size={14} /></button>}>
          <div>
            {reminders.length === 0 && (
              <p className="py-2 text-xs text-[var(--text-faint)]">Aucun rappel pour le moment.</p>
            )}
            {reminders.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2.5 border-b border-[var(--line)] py-2 text-xs last:border-none"
              >
                <button
                  onClick={() => toggleReminder(r)}
                  className={`flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full border ${
                    r.done
                      ? "border-[var(--vivid-green)] bg-[var(--vivid-green)] text-[#0a2015]"
                      : "border-[var(--line-strong)]"
                  }`}
                  style={{ width: 18, height: 18 }}
                >
                  {r.done && <Check size={10} />}
                </button>
                <span className={r.done ? "flex-1 text-[var(--text-faint)] line-through" : "flex-1"}>
                  {r.label}
                </span>
                <span className="text-[10.5px] font-semibold text-[var(--text-faint)]">{r.due}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Documents"
          action={
            <Link href="/documents" className="text-[11.5px] text-[var(--text-soft)] hover:text-[var(--ink)]">
              Gérer
            </Link>
          }
        >
          <div>
            {documents.length === 0 && (
              <p className="py-2 text-xs text-[var(--text-faint)]">Aucun document ajouté.</p>
            )}
            {documents.slice(0, 4).map((d) => (
              <div key={d.id} className="flex items-center gap-2.5 border-b border-[var(--line)] py-2 last:border-none">
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm"
                  style={{ background: d.bg || "#f1f1ef", color: d.color || "#5a5f58", width: 32, height: 32 }}
                >
                  <FileText size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{d.name}</div>
                  <div className="text-[10.5px] text-[var(--text-faint)]">{d.date_info}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    d.status === "ok"
                      ? "bg-[var(--green-tint)] text-[var(--green-text)]"
                      : "bg-[var(--amber-tint)] text-[var(--amber-text)]"
                  }`}
                >
                  {d.status === "ok" ? "À jour" : "À renouveler"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Raccourcis">
          <div className="flex flex-col gap-2">
            <QuickLink href="/joueurs" icon={Users} label="Joueurs" />
            <QuickLink href="/horaire" icon={CalendarDays} label="Horaire" />
            <QuickLink href="/documents" icon={FileText} label="Documents" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, tone, label, value }) {
  const tones = {
    ink: "bg-[var(--side-dark-a)] text-white",
    green: "bg-[var(--green-tint)] text-[var(--green-text)]",
    amber: "bg-[var(--amber-tint)] text-[var(--amber-text)]",
    rust: "bg-[var(--rust-tint)] text-[var(--rust-text)]",
  };
  return (
    <div className="glass-card flex items-center gap-3 rounded-[20px] p-4">
      <div className={`flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-xl ${tones[tone]}`} style={{ width: 38, height: 38 }}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-[11px] text-[var(--text-soft)]">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}

function Card({ title, action, children }) {
  return (
    <div className="glass-card rounded-[22px] p-4.5" style={{ padding: 18 }}>
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-sm font-bold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Chip({ icon: Icon, muted, children }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${
        muted ? "bg-neutral-100 text-[var(--text-soft)]" : "bg-[var(--green-tint)] text-[var(--green-text)]"
      }`}
    >
      <Icon size={13} />
      {children}
    </div>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: color }} />
      {label}
      <span className="ml-auto font-bold">{value}</span>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-full bg-[var(--side-dark-a)] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--side-dark-b)]"
    >
      <Icon size={14} className="text-[var(--brand-green)]" />
      {label}
    </Link>
  );
}
