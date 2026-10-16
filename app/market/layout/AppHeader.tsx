import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  Home,
  Info,
  LockKeyhole,
  LogIn,
  PackageOpen,
  Search,
  Settings,
  ShieldCheck,
  Trophy,
  User,
  Wallet,
} from "../../MaterialIcons";
import { isSellerRole } from "../catalog";
import { formatUsd } from "../format";
import { useMarket } from "../MarketContext";

export function AppHeader() {
  const {
    loadWonCards,
    logout,
    ownedWonCardsValue,
    session,
    setAuthMode,
    setHomeAuthOpen,
    setWalletOpen,
    setWonCardsOpen,
    view,
  } = useMarket();

  return (
    <header className="app-header">
      <Link className="brand-link" href="/">
        <PackageOpen size={20} aria-hidden />
        Pullario
      </Link>
      <nav className="app-nav" aria-label="Navegacion principal">
        <div className="nav-cluster nav-pages">
          <Link className={view === "home" ? "active" : ""} href="/">
            <Home size={16} aria-hidden />
            Cajas
          </Link>
          <Link
            className={view === "upgrader" ? "active" : ""}
            href="/upgrader"
          >
            <ArrowUpDown size={16} aria-hidden />
            Upgrader
          </Link>
          <Link
            className={view === "changer" ? "active" : ""}
            href="/changer"
          >
            <ArrowRight size={16} aria-hidden />
            Changer
          </Link>
          <Link className={view === "cards" ? "active" : ""} href="/cards">
            <Search size={16} aria-hidden />
            Cartas
          </Link>
          <Link href="/#como-funciona">
            <Info size={16} aria-hidden />
            Guia
          </Link>
          <Link href="/#confianza">
            <ShieldCheck size={16} aria-hidden />
            Confianza
          </Link>
        </div>
        {session && (
          <div className="nav-cluster nav-session">
            <button
              className="nav-value nav-value-wins"
              onClick={() => {
                setWonCardsOpen(true);
                void loadWonCards();
              }}
              type="button"
            >
              <Trophy size={17} aria-hidden />
              <span>
                <strong>{formatUsd.format(ownedWonCardsValue)}</strong>
                <small>Premios ganados</small>
              </span>
            </button>
            <button
              className="nav-value nav-value-wallet"
              onClick={() => setWalletOpen(true)}
              type="button"
            >
              <Wallet size={17} aria-hidden />
              <span>
                <strong>{formatUsd.format(session.balanceUsd ?? 0)}</strong>
                <small>Cartera</small>
              </span>
            </button>
            <Link
              className={`nav-user ${view === "profile" ? "active" : ""}`}
              href="/profile"
            >
              <User size={16} aria-hidden />
              <span>{session.displayName || session.username}</span>
            </Link>
          </div>
        )}
        {!session && (
          <div className="nav-cluster nav-auth">
            <button
              className="nav-login-button"
              onClick={() => {
                setAuthMode("login");
                setHomeAuthOpen(true);
              }}
              type="button"
            >
              <LogIn size={16} aria-hidden />
              Entrar
            </button>
          </div>
        )}
        {(isSellerRole(session?.role) || session) && (
          <div className="nav-cluster nav-tools">
            {isSellerRole(session?.role) && (
              <Link
                className={view.startsWith("admin") ? "active" : ""}
                href="/admin"
              >
                <Settings size={16} aria-hidden />
                Admin
              </Link>
            )}
            {session && (
              <button
                aria-label="Cerrar sesion"
                className="nav-icon-button"
                onClick={logout}
                type="button"
              >
                <LockKeyhole size={16} aria-hidden />
                <span>Salir</span>
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
