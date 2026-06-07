import { FormEvent, useState } from "react";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import type { AuthState } from "../state/authStore";
import { signIn, signUp } from "../state/authStore";

type AuthPanelProps = {
  auth: AuthState;
};

export function AuthPanel({ auth }: AuthPanelProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const working = auth.status === "working";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "signin") void signIn(email, password);
    else void signUp(email, password, displayName || "Neon Founder");
  }

  if (auth.user) {
    return (
      <section className="glass-panel auth-panel" aria-labelledby="auth-title">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Cloud save</p>
            <h2 id="auth-title">Signed in</h2>
          </div>
          <ShieldCheck aria-hidden="true" className="panel-icon" />
        </div>
        <p className="inline-note">Your board can sync to your player profile.</p>
      </section>
    );
  }

  return (
    <section className="glass-panel auth-panel" aria-labelledby="auth-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Player profile</p>
          <h2 id="auth-title">{mode === "signin" ? "Sign in" : "Create profile"}</h2>
        </div>
        {mode === "signin" ? <LogIn aria-hidden="true" className="panel-icon" /> : <UserPlus aria-hidden="true" className="panel-icon" />}
      </div>

      <div className="segmented auth-mode" role="group" aria-label="Authentication mode">
        <button type="button" className={mode === "signin" ? "is-active" : ""} onClick={() => setMode("signin")}>
          Sign in
        </button>
        <button type="button" className={mode === "signup" ? "is-active" : ""} onClick={() => setMode("signup")}>
          Create
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <label htmlFor="auth-display-name">
            Founder name
            <input
              id="auth-display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Neon Founder"
              aria-label="Founder name"
            />
          </label>
        ) : null}
        <label htmlFor="auth-email">
          Email
          <input id="auth-email" value={email} type="email" onChange={(event) => setEmail(event.target.value)} required aria-label="Email" />
        </label>
        <label htmlFor="auth-password">
          Password
          <input
            id="auth-password"
            value={password}
            type="password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            required
            aria-label="Password"
          />
        </label>
        <button type="submit" className="primary-button" disabled={working}>
          {mode === "signin" ? <LogIn aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
          {working ? "Working" : mode === "signin" ? "Sign in" : "Create profile"}
        </button>
      </form>

      <p className="trust-note">
        Sign-in is handled securely by Supabase. If you have used another service from the same provider, the same account may work here.
      </p>
      {auth.message ? <p className="success-note">{auth.message}</p> : null}
      {auth.error ? <p className="error-note">{auth.error}</p> : null}
    </section>
  );
}
