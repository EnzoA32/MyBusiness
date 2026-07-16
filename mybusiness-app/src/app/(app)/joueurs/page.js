"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClub } from "@/lib/club-context";
import { statusMap, catStyles, cotisTint, staffTeams } from "@/lib/domain";
import AddPersonModal from "@/components/AddPersonModal";
import PersonDrawer from "@/components/PersonDrawer";
import { Search, Plus, ChevronRight, Mail, Phone, Shield } from "lucide-react";

const CATEGORIES = ["Seniors F", "U17", "U15"];

export default function JoueursPage() {
  const club = useClub();
  const supabase = createClient();

  const [mode, setMode] = useState("joueurs"); // "joueurs" | "staff"
  const [players, setPlayers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [grouped, setGrouped] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null); // { person, type }

  useEffect(() => {
    let active = true;
    async function load() {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("mybusiness_players").select("*").eq("club_id", club.id).order("name"),
        supabase.from("mybusiness_staff").select("*").eq("club_id", club.id).order("name"),
      ]);
      if (!active) return;
      setPlayers(p || []);
      setStaff(s || []);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [club.id, supabase]);

  const filteredPlayers = useMemo(() => {
    let list = players.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    if (category !== "all") list = list.filter((p) => p.category === category);
    return list;
  }, [players, query, category]);

  const filteredStaff = useMemo(
    () => staff.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
    [staff, query]
  );

  const ok = filteredPlayers.filter((p) => p.cotis >= 80).length;
  const late = filteredPlayers.filter((p) => p.cotis === 0).length;
  const mid = filteredPlayers.length - ok - late;

  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-[var(--brand-green-deep)]">Effectif du club</div>
      <h1 className="mb-5 text-[28px] font-extrabold tracking-tight">
        {mode === "joueurs" ? "Joueurs" : "Staff"}
      </h1>

      {mode === "joueurs" && (
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat label="Affiliés" value={filteredPlayers.length} tone="ink" />
          <MiniStat label="À jour" value={ok} tone="green" />
          <MiniStat label="Échelonnées" value={mid} tone="amber" />
          <MiniStat label="Impayées" value={late} tone="rust" />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex rounded-full border border-[var(--line-strong)] bg-neutral-50 p-1">
          <button
            onClick={() => setMode("joueurs")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${mode === "joueurs" ? "bg-[var(--side-dark-a)] text-white" : "text-[var(--text-soft)]"}`}
          >
            Joueurs
          </button>
          <button
            onClick={() => setMode("staff")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${mode === "staff" ? "bg-[var(--side-dark-a)] text-white" : "text-[var(--text-soft)]"}`}
          >
            Staff
          </button>
        </div>

        {mode === "joueurs" && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input w-auto rounded-full"
            style={{ height: 40 }}
          >
            <option value="all">Toutes catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}

        <div className="flex h-10 items-center gap-2 rounded-full border border-[var(--line-strong)] bg-neutral-50 px-3.5">
          <Search size={13} className="text-[var(--text-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "joueurs" ? "Rechercher un joueur" : "Rechercher un membre du staff"}
            className="w-44 bg-transparent text-xs outline-none"
          />
        </div>

        {mode === "joueurs" && (
          <button
            onClick={() => setGrouped((g) => !g)}
            className="h-10 rounded-full border border-[var(--line-strong)] px-4 text-xs font-semibold text-[var(--ink)]"
          >
            {grouped ? "Voir tout" : "Grouper par équipe"}
          </button>
        )}

        <button
          onClick={() => setModalOpen(true)}
          className="ml-auto flex h-10 items-center gap-2 rounded-full bg-[var(--brand-green)] px-4 text-xs font-bold text-[var(--side-dark-b)]"
        >
          <Plus size={14} />
          {mode === "joueurs" ? "Ajouter un affilié" : "Ajouter un membre du staff"}
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-[var(--text-soft)]">Chargement...</p>
      ) : mode === "joueurs" ? (
        <PlayersList
          players={filteredPlayers}
          grouped={grouped && category === "all"}
          onSelect={(p) => setSelected({ person: p, type: "player" })}
        />
      ) : (
        <StaffList staff={filteredStaff} onSelect={(s) => setSelected({ person: s, type: "staff" })} />
      )}

      <AddPersonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={mode === "staff" ? "staff" : "joueur"}
        onPlayerAdded={(p) => setPlayers((prev) => [...prev, p])}
        onStaffAdded={(s) => {
          setStaff((prev) => [...prev, s]);
          setMode("staff");
        }}
      />

      {selected && (
        <PersonDrawer person={selected.person} type={selected.type} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const tones = {
    ink: "bg-[var(--side-dark-a)] text-white",
    green: "bg-[var(--green-tint)] text-[var(--green-text)]",
    amber: "bg-[var(--amber-tint)] text-[var(--amber-text)]",
    rust: "bg-[var(--rust-tint)] text-[var(--rust-text)]",
  };
  return (
    <div className="glass-card flex items-center gap-3 rounded-[20px] p-4">
      <div className={`flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold ${tones[tone]}`} style={{ width: 38, height: 38 }}>
        {value}
      </div>
      <span className="text-xs text-[var(--text-soft)]">{label}</span>
    </div>
  );
}

function PlayersList({ players, grouped, onSelect }) {
  if (players.length === 0) {
    return <EmptyState text="Aucun joueur ne correspond à ces filtres." />;
  }

  if (!grouped) {
    return (
      <div className="glass-card divide-y divide-[var(--line)] overflow-hidden rounded-[20px]">
        {players.map((p) => (
          <PlayerRow key={p.id} player={p} onClick={() => onSelect(p)} />
        ))}
      </div>
    );
  }

  return (
    <>
      {CATEGORIES.filter((c) => players.some((p) => p.category === c)).map((cat) => {
        const list = players.filter((p) => p.category === cat);
        const ok = list.filter((p) => p.cotis >= 80).length;
        const late = list.filter((p) => p.cotis === 0).length;
        const mid = list.length - ok - late;
        return (
          <div key={cat} className="mb-5">
            <div className="mb-2 flex items-baseline justify-between px-1">
              <div>
                <span className="font-bold">{cat}</span>{" "}
                <span className="text-xs text-[var(--text-faint)]">{list.length} joueuses</span>
              </div>
              <div className="text-xs font-semibold text-[var(--text-soft)]">
                {ok} à jour · {mid} échelonnées · {late} impayées
              </div>
            </div>
            <div className="glass-card divide-y divide-[var(--line)] overflow-hidden rounded-[20px]">
              {list.map((p) => (
                <PlayerRow key={p.id} player={p} onClick={() => onSelect(p)} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

function PlayerRow({ player, onClick }) {
  const s = statusMap[player.status];
  const cs = catStyles[player.category] || { bg: "#eee", text: "#555", initial: "?" };
  const t = cotisTint(player.cotis);
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3.5 px-4.5 py-2.5 text-left hover:bg-neutral-50" style={{ padding: "11px 18px" }}>
      <div className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: cs.bg, color: cs.text, width: 34, height: 34 }}>
        {cs.initial}
      </div>
      <div className="min-w-0 flex-[1.6]">
        <div className="truncate text-sm font-semibold">{player.name}</div>
        <div className="text-[11px] font-semibold text-[var(--text-faint)]">
          #{player.number} · {player.category}
        </div>
      </div>
      <div className="hidden flex-[1.5] truncate text-xs text-[var(--text-soft)] md:block">{player.email}</div>
      <div className="hidden flex-1 truncate text-xs text-[var(--text-soft)] md:block">{player.phone}</div>
      <div className="flex w-28 flex-shrink-0 items-center gap-1.5 text-xs">
        <span className="h-2 w-2 rounded-full" style={{ background: `var(--${s.dot.includes("green") ? "green" : s.dot.includes("amber") ? "amber" : "rust"}-text)` }} />
        {s.label}
      </div>
      <div className="flex w-32 flex-shrink-0 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full rounded-full" style={{ width: `${player.cotis}%`, background: t.fill }} />
        </div>
        <span className="w-8 text-right text-[11.5px] font-bold" style={{ color: t.text }}>
          {player.cotis}%
        </span>
      </div>
      <ChevronRight size={14} className="flex-shrink-0 text-[var(--text-faint)]" />
    </button>
  );
}

function StaffList({ staff, onSelect }) {
  if (staff.length === 0) {
    return <EmptyState text="Aucun membre du staff ne correspond à ces filtres." />;
  }
  return (
    <div className="glass-card divide-y divide-[var(--line)] overflow-hidden rounded-[20px]">
      {staff.map((s) => (
        <StaffRow key={s.id} member={s} onClick={() => onSelect(s)} />
      ))}
    </div>
  );
}

function StaffRow({ member, onClick }) {
  const active = member.status === "actif";
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3.5 px-4.5 py-2.5 text-left hover:bg-neutral-50" style={{ padding: "11px 18px" }}>
      <div className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--cat-u17-bg)] text-xs font-bold text-[var(--cat-u17-text)]" style={{ width: 34, height: 34 }}>
        {member.name.split(" ").map((p) => p[0]).join("").toUpperCase()}
      </div>
      <div className="min-w-0 flex-[1.6]">
        <div className="truncate text-sm font-semibold">{member.name}</div>
        <div className="text-[11px] font-semibold text-[var(--text-faint)]">{member.team}</div>
      </div>
      <div className="hidden flex-[1.5] items-center gap-1.5 truncate text-xs text-[var(--text-soft)] md:flex">
        <Mail size={11} /> {member.email}
      </div>
      <div className="hidden flex-1 items-center gap-1.5 truncate text-xs text-[var(--text-soft)] md:flex">
        <Phone size={11} /> {member.phone}
      </div>
      <div className="w-40 flex-shrink-0">
        <div className="text-xs font-semibold">{member.role}</div>
        {member.diploma && <div className="text-[10.5px] text-[var(--text-faint)]">{member.diploma}</div>}
      </div>
      <div className="flex w-20 flex-shrink-0 items-center gap-1.5 text-xs">
        <span className={`h-2 w-2 rounded-full ${active ? "bg-[var(--green-text)]" : "bg-[var(--rust-text)]"}`} />
        {active ? "Actif" : "Inactif"}
      </div>
      <ChevronRight size={14} className="flex-shrink-0 text-[var(--text-faint)]" />
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div className="glass-card rounded-[20px] py-14 text-center text-sm text-[var(--text-soft)]">
      <Shield size={24} className="mx-auto mb-2.5 text-[var(--text-faint)]" />
      {text}
    </div>
  );
}
