export const statusMap = {
  affilie: { label: "Affilié", dot: "bg-[var(--green-text)]" },
  pret_entrant: { label: "Prêt entrant", dot: "bg-[var(--amber-text)]" },
  pret_sortant: { label: "Prêt sortant", dot: "bg-[var(--rust-text)]" },
};

export const catStyles = {
  "Seniors F": { bg: "var(--cat-seniors-bg)", text: "var(--cat-seniors-text)", initial: "SF" },
  U17: { bg: "var(--cat-u17-bg)", text: "var(--cat-u17-text)", initial: "U17" },
  U15: { bg: "var(--cat-u15-bg)", text: "var(--cat-u15-text)", initial: "U15" },
};

export const staffRoles = [
  "Entraîneur principal",
  "Entraîneur adjoint",
  "Kinésithérapeute",
  "Secrétaire du club",
  "Dirigeant",
  "Arbitre du club",
];

export const staffTeams = ["Toutes équipes", "Seniors F", "U17", "U15"];

export const dayOrder = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export function cotisTint(v) {
  if (v >= 80) return { fill: "var(--green-text)", text: "var(--green-text)" };
  if (v > 0) return { fill: "var(--amber-text)", text: "var(--amber-text)" };
  return { fill: "var(--rust-text)", text: "var(--rust-text)" };
}

export function initialsOf(name) {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}
