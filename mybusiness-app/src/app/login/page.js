"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clubName, setClubName] = useState("");
  const [repName, setRepName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!email || !password || (mode === "signup" && (!clubName || !repName))) {
      setError("Merci de compléter les champs requis.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authErr) throw authErr;

        if (!authData.session) {
          setNotice(
            "Compte créé — vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi."
          );
          setMode("login");
          setLoading(false);
          return;
        }

        const { data: club, error: clubErr } = await supabase
          .from("mybusiness_clubs")
          .insert({ owner_id: authData.user.id, name: clubName, representative: repName })
          .select()
          .single();
        if (clubErr) throw clubErr;

        if (logoFile) {
          const path = `${club.id}/logo_${Date.now()}_${logoFile.name}`;
          const { error: upErr } = await supabase.storage.from("logos").upload(path, logoFile);
          if (!upErr) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("logos").getPublicUrl(path);
            await supabase.from("mybusiness_clubs").update({ logo_url: publicUrl }).eq("id", club.id);
          }
        }
      } else {
        const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
        if (authErr) throw authErr;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-blobs relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="glass-card relative z-10 w-[380px] max-w-[90vw] rounded-[28px] p-8 backdrop-blur-2xl">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-green)] text-lg font-extrabold text-[var(--side-dark-b)]">
          ★
        </div>
        <h1 className="text-xl font-extrabold">Onze+ MyBusiness</h1>
        <p className="mb-5 mt-1 text-sm text-[var(--text-soft)]">
          Le portail de gestion de votre club
        </p>

        <div className="mb-5 flex rounded-full border border-[var(--line-strong)] bg-neutral-50 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              mode === "login" ? "bg-[var(--side-dark-a)] text-white" : "text-[var(--text-soft)]"
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              mode === "signup" ? "bg-[var(--side-dark-a)] text-white" : "text-[var(--text-soft)]"
            }`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <>
              <Field label="Nom du club">
                <input
                  className="input"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="Rus Hensies"
                />
              </Field>
              <Field label="Votre nom">
                <input
                  className="input"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="Josiah S."
                />
              </Field>
              <Field label="Logo du club (facultatif)">
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 flex-shrink-0 rounded-2xl bg-[var(--side-dark-a)] bg-cover bg-center text-[var(--brand-green)]"
                    style={logoPreview ? { backgroundImage: `url(${logoPreview})` } : {}}
                  />
                  <label className="cursor-pointer rounded-full border border-[var(--line-strong)] px-4 py-2 text-xs font-semibold text-[var(--text-soft)] hover:border-neutral-400">
                    Choisir une image
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                </div>
              </Field>
            </>
          )}

          <Field label="Adresse email">
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@club.be"
            />
          </Field>
          <Field label="Mot de passe">
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && <p className="text-sm text-[var(--rust-text)]">{error}</p>}
          {notice && <p className="text-sm text-[var(--green-text)]">{notice}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-full bg-[var(--brand-green)] py-2.5 text-sm font-bold text-[var(--side-dark-b)] transition hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Un instant..." : "Accéder au portail"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--text-soft)]">{label}</label>
      {children}
    </div>
  );
}
