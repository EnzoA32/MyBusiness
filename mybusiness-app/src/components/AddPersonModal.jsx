"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClub } from "@/lib/club-context";
import Modal from "@/components/Modal";
import { staffRoles, staffTeams } from "@/lib/domain";

export default function AddPersonModal({ open, onClose, defaultType, onPlayerAdded, onStaffAdded }) {
  const club = useClub();
  const supabase = createClient();

  const [type, setType] = useState(defaultType || "joueur");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Seniors F");
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState("affilie");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState(staffRoles[0]);
  const [team, setTeam] = useState(staffTeams[0]);
  const [diploma, setDiploma] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setNumber("");
    setAddress("");
    setDiploma("");
  }

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    const name = `${firstName.trim()} ${lastName.trim()}`;

    if (type === "staff") {
      const { data, error } = await supabase
        .from("mybusiness_staff")
        .insert({
          club_id: club.id,
          name,
          role,
          team,
          email: email || "—",
          phone: phone || "—",
          status: "actif",
          diploma: diploma.trim(),
        })
        .select()
        .single();
      setSaving(false);
      if (error) return alert(error.message);
      onStaffAdded(data);
    } else {
      const { data, error } = await supabase
        .from("mybusiness_players")
        .insert({
          club_id: club.id,
          name,
          number: parseInt(number) || 0,
          category,
          status,
          cotis: 0,
          email: email || "—",
          phone: phone || "—",
          address: address || "—",
          birth: "—",
          licence: "—",
        })
        .select()
        .single();
      setSaving(false);
      if (error) return alert(error.message);
      onPlayerAdded(data);
    }

    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajouter un affilié">
      <div className="mb-4 flex rounded-full border border-[var(--line-strong)] bg-neutral-50 p-1">
        <button
          onClick={() => setType("joueur")}
          className={`flex-1 rounded-full py-1.5 text-xs font-semibold ${
            type === "joueur" ? "bg-[var(--side-dark-a)] text-white" : "text-[var(--text-soft)]"
          }`}
        >
          Joueur
        </button>
        <button
          onClick={() => setType("staff")}
          className={`flex-1 rounded-full py-1.5 text-xs font-semibold ${
            type === "staff" ? "bg-[var(--side-dark-a)] text-white" : "text-[var(--text-soft)]"
          }`}
        >
          Staff
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom">
          <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Chloé" />
        </Field>
        <Field label="Nom">
          <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dubois" />
        </Field>
      </div>

      {type === "staff" ? (
        <>
          <Field label="Fonction">
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              {staffRoles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Équipe assignée">
            <select className="input" value={team} onChange={(e) => setTeam(e.target.value)}>
              {staffTeams.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Diplôme de coach (facultatif)">
            <input className="input" value={diploma} onChange={(e) => setDiploma(e.target.value)} placeholder="Ex. UEFA B, ADEPS 1..." />
          </Field>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Catégorie">
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Seniors F</option>
                <option>U17</option>
                <option>U15</option>
              </select>
            </Field>
            <Field label="N° de maillot">
              <input className="input" type="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="10" />
            </Field>
          </div>
          <Field label="Statut">
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="affilie">Affilié</option>
              <option value="pret_entrant">Prêt entrant</option>
              <option value="pret_sortant">Prêt sortant</option>
            </select>
          </Field>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Email">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@mail.com" />
        </Field>
        <Field label="Téléphone">
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0470 00 00 00" />
        </Field>
      </div>

      {type === "joueur" && (
        <Field label="Adresse">
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rue, numéro, localité" />
        </Field>
      )}

      <div className="mt-4 flex justify-end gap-2.5">
        <button onClick={onClose} className="rounded-full border border-[var(--line-strong)] px-4.5 py-2 text-xs font-semibold text-[var(--text-soft)]" style={{ padding: "0 18px", height: 38 }}>
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-[var(--brand-green)] px-4.5 py-2 text-xs font-bold text-[var(--side-dark-b)] disabled:opacity-60"
          style={{ padding: "0 18px", height: 38 }}
        >
          {saving ? "..." : "Ajouter"}
        </button>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-3.5">
      <label className="mb-1.5 block text-xs text-[var(--text-soft)]">{label}</label>
      {children}
    </div>
  );
}
