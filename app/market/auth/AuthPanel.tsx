import Link from "next/link";
import {
  LockKeyhole,
  LogIn,
  Settings,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from "../../MaterialIcons";
import { isSellerRole, roleLabels } from "../catalog";
import { useMarket } from "../MarketContext";

export function AuthPanel() {
  const {
    authMessage,
    authMode,
    loginEmail,
    loginPassword,
    loginUsername,
    logout,
    session,
    setAuthMode,
    setLoginEmail,
    setLoginPassword,
    setLoginUsername,
    submitAuth,
  } = useMarket();

  return session ? (
    <div className="auth-panel logged-in">
      <span className="eyebrow">Sesion activa</span>
      <h3>{session.displayName || session.username}</h3>
      <p>{roleLabels[session.role]}</p>
      <div className="auth-actions">
        <Link className="secondary-action compact" href="/profile">
          <User size={17} aria-hidden />
          Mi cuenta
        </Link>
        {isSellerRole(session.role) && (
          <Link className="primary-action compact" href="/admin">
            <Settings size={17} aria-hidden />
            Abrir administrador
          </Link>
        )}
        <button className="secondary-action compact" onClick={logout} type="button">
          <LockKeyhole size={17} aria-hidden />
          Salir
        </button>
      </div>
      {authMessage && <p className="admin-message">{authMessage}</p>}
    </div>
  ) : (
    <form
      className="auth-panel"
      onSubmit={(event) => {
        event.preventDefault();
        void submitAuth();
      }}
    >
      <div className="auth-switch" aria-label="Modo de acceso">
        <button
          className={authMode === "login" ? "active" : ""}
          onClick={() => setAuthMode("login")}
          type="button"
        >
          <LogIn size={16} aria-hidden />
          Entrar
        </button>
        <button
          className={authMode === "register" ? "active" : ""}
          onClick={() => setAuthMode("register")}
          type="button"
        >
          <UserPlus size={16} aria-hidden />
          Registrarse
        </button>
      </div>
      <label>
        Usuario
        <input
          autoComplete="username"
          onChange={(event) => setLoginUsername(event.target.value)}
          value={loginUsername}
        />
      </label>
      {authMode === "register" && (
        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setLoginEmail(event.target.value)}
            type="email"
            value={loginEmail}
          />
        </label>
      )}
      <label>
        Password
        <input
          autoComplete={
            authMode === "register" ? "new-password" : "current-password"
          }
          onChange={(event) => setLoginPassword(event.target.value)}
          type="password"
          value={loginPassword}
        />
      </label>
      <button
        className="primary-action compact"
        disabled={!loginUsername.trim() || !loginPassword.trim()}
        type="submit"
      >
        {authMode === "register" ? (
          <UserPlus size={17} aria-hidden />
        ) : (
          <ShieldCheck size={17} aria-hidden />
        )}
        {authMode === "register" ? "Crear cuenta" : "Iniciar sesion"}
      </button>
      {authMessage && <p className="admin-message">{authMessage}</p>}
    </form>
  );
}

export function AuthModal() {
  const { homeAuthOpen, session, setHomeAuthOpen } = useMarket();

  if (!homeAuthOpen || session) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onKeyDown={(event) => {
        if (event.key === "Escape") setHomeAuthOpen(false);
      }}
      role="presentation"
    >
      <article
        aria-label="Acceso a Pullario"
        aria-modal="true"
        className="utility-modal home-auth-modal"
        role="dialog"
      >
        <button
          aria-label="Cerrar acceso"
          className="modal-close"
          onClick={() => setHomeAuthOpen(false)}
          type="button"
        >
          <X size={18} aria-hidden />
        </button>
        <AuthPanel />
      </article>
    </div>
  );
}
