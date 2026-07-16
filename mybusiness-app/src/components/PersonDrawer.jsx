"use client";

import { X, Mail, Phone, MapPin } from "lucide-react";
import { statusMap, catStyles, cotisTint } from "@/lib/domain";

export default function PersonDrawer({ person, type, onClose }) {
  if (!person) return null;

  const isStaff = type === "staff";
  const s = !isStaff ? statusMap[person.status] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-[rgba(10,25,15,0.4)]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="h-full w-[380px] max-w-[92vw] overflow-y-auto bg-white p-6">
        <div className="mb-5 flex justify-end">
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200">
            <X size={15} />
          </button>
        </div>

        {isStaff ? <StaffHeader person={person} /> : <PlayerHeader person={person} status={s} />}

        <Section title="Contact">
          <Row icon={Mail} label="Email" value={person.email} />
          <Row icon={Phone} label="Téléphone" value={person.phone} />
          {!isStaff && <Row icon={MapPin} label="Adresse" value={person.address} />}
        </Section>

        {isStaff ? (
          <Section title="Fonction">
            <Row label="Rôle" value={person.role} />
            <Row label="Équipe assignée" value={person.team} />
            <Row label="Diplôme" value={person.diploma || "—"} />
          </Section>
        ) : (
          <>
            <Section title="Club">
              <Row label="Catégorie" value={person.category} />
              <Row label="Numéro de licence" value={person.licence} />
              <Row label="Date de naissance" value={person.birth} />
              <Row label="N° de maillot" value={`#${person.number}`} />
            </Section>
            <CotisationSection cotis={person.cotis} />
          </>
        )}
      </div>
    </div>
  );
}

function PlayerHeader({ person, status }) {
  const cs = catStyles[person.category] || { bg: "#eee", text: "#555", initial: "?" };
  return (
    <>
      <div
        className="mb-2.5 flex h-14 w-14 items-center justify-center rounded-full text-lg font-extrabold"
        style={{ background: cs.bg, color: cs.text }}
      >
        {cs.initial}
      </div>
      <div className="text-lg font-bold">{person.name}</div>
      <span
        className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{ background: "var(--green-tint)", color: "var(--green-text)" }}
      >
        {status?.label}
      </span>
    </>
  );
}

function StaffHeader({ person }) {
  return (
    <>
      <div className="mb-2.5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--cat-u17-bg)] text-lg font-extrabold text-[var(--cat-u17-text)]">
        {person.name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .toUpperCase()}
      </div>
      <div className="text-lg font-bold">{person.name}</div>
      <span
        className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          person.status === "actif"
            ? "bg-[var(--green-tint)] text-[var(--green-text)]"
            : "bg-[var(--rust-tint)] text-[var(--rust-text)]"
        }`}
      >
        {person.status === "actif" ? "Actif" : "Inactif"}
      </span>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-5 border-t border-[var(--line)] pt-4">
      <h4 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-faint)]">{title}</h4>
      {children}
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="flex items-center gap-2 text-[var(--text-soft)]">
        {Icon && <Icon size={13} />}
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function CotisationSection({ cotis }) {
  const t = cotisTint(cotis);
  return (
    <div className="mt-5 border-t border-[var(--line)] pt-4">
      <h4 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-faint)]">Cotisation</h4>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full" style={{ width: `${cotis}%`, background: t.fill }} />
      </div>
      <Row label="Payé" value={<span style={{ color: t.text }}>{cotis}%</span>} />
      <div className="flex justify-between py-1 text-xs text-[var(--text-soft)]">
        <span>Tranche 1 - Sept.</span>
        <span className="font-semibold text-[var(--green-text)]">Payée</span>
      </div>
      <div className="flex justify-between py-1 text-xs text-[var(--text-soft)]">
        <span>Tranche 2 - Déc.</span>
        <span className={cotis >= 66 ? "font-semibold text-[var(--green-text)]" : ""}>
          {cotis >= 66 ? "Payée" : "En attente"}
        </span>
      </div>
      <div className="flex justify-between py-1 text-xs text-[var(--text-soft)]">
        <span>Tranche 3 - Mars</span>
        <span className={cotis >= 100 ? "font-semibold text-[var(--green-text)]" : ""}>
          {cotis >= 100 ? "Payée" : "En attente"}
        </span>
      </div>
    </div>
  );
}
