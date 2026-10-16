import Link from "next/link";
import {
  Database,
  LogIn,
  PackageOpen,
  Settings,
  Trophy,
  Truck,
  User,
} from "../../MaterialIcons";
import {
  cardGames,
  gameLabels,
  isSellerRole,
  prizeItemTypes,
  prizeTypeShortLabels,
} from "../catalog";
import { useMarket } from "../MarketContext";

export function AdminNavigation() {
  const { session, view } = useMarket();

  return isSellerRole(session?.role) ? (
    <nav className="admin-nav" aria-label="Secciones de administracion">
      <Link className={view === "admin" ? "active" : ""} href="/admin">
        <Settings size={16} aria-hidden />
        Resumen
      </Link>
      <Link
        className={view === "admin-stock" ? "active" : ""}
        href="/admin/stock"
      >
        <Database size={16} aria-hidden />
        Stock
      </Link>
      <Link
        className={view === "admin-packs" ? "active" : ""}
        href="/admin/packs"
      >
        <PackageOpen size={16} aria-hidden />
        Cajas
      </Link>
      <Link
        className={view === "admin-orders" ? "active" : ""}
        href="/admin/orders"
      >
        <Trophy size={16} aria-hidden />
        Pedidos
      </Link>
      <Link
        className={view === "admin-shipments" ? "active" : ""}
        href="/admin/shipments"
      >
        <Truck size={16} aria-hidden />
        Envios activos
      </Link>
      <Link
        className={view === "admin-users" ? "active" : ""}
        href="/admin/users"
      >
        <User size={16} aria-hidden />
        Inventarios
      </Link>
    </nav>
  ) : null;
}

export function AdminShellHeader() {
  const { adminMessage, view } = useMarket();

  return (
    <div className="admin-intro">
      <span className="eyebrow">
        Administrador local
      </span>
      <h1>
        {view === "admin-stock"
          ? "Gestionar stock"
          : view === "admin-packs"
            ? "Crear cajas"
            : view === "admin-orders"
              ? "Envios pendientes"
              : view === "admin-shipments"
                ? "Envios activos"
                : view === "admin-users"
                  ? "Inventarios de usuarios"
              : "Panel administrador"}
      </h1>
      <p>
        {view === "admin-stock"
          ? "Carga cartas y productos sellados al stock y separalos por TCG antes de armar cajas."
          : view === "admin-packs"
            ? "Arma y edita cajas usando unicamente premios disponibles en tu stock."
            : view === "admin-orders"
              ? "Gestiona unicamente los retiros confirmados que todavia deben enviarse."
              : view === "admin-shipments"
                ? "Sigue los paquetes despachados y guarda la confirmacion cuando el usuario los recibe."
                : view === "admin-users"
                  ? "Busca usuarios y revisa el historial completo de premios de cada cuenta."
              : "Administra stock, cajas publicadas y premios ganados por usuarios desde secciones separadas."}
      </p>
      <AdminNavigation />
      {view === "admin-packs" && adminMessage && (
        <p className="admin-message">{adminMessage}</p>
      )}
    </div>
  );
}

export function SellerRequiredPanel() {
  return (
    <div className="login-panel">
      <span className="eyebrow">Administracion protegida</span>
      <h3>Entra como administrador desde la pagina principal</h3>
      <Link className="primary-action compact" href="/">
        <LogIn size={17} aria-hidden />
        Ir al login
      </Link>
    </div>
  );
}

export function StockFilterControls() {
  const {
    setStockGameFilter,
    setStockPrizeFilter,
    shopStock,
    stockCountsByGame,
    stockCountsByType,
    stockGameFilter,
    stockPrizeFilter,
  } = useMarket();

  return (
    <div className="stock-filter-stack">
      <div className="stock-type-tabs" aria-label="Filtro de stock por TCG">
        <button
          className={stockGameFilter === "mixed" ? "active" : ""}
          onClick={() => setStockGameFilter("mixed")}
          type="button"
        >
          Todos <span>{shopStock.length}</span>
        </button>
        {cardGames.map((game) => (
          <button
            className={stockGameFilter === game ? "active" : ""}
            key={game}
            onClick={() => setStockGameFilter(game)}
            type="button"
          >
            {gameLabels[game]} <span>{stockCountsByGame[game]}</span>
          </button>
        ))}
      </div>
      <div className="stock-type-tabs" aria-label="Filtro por tipo de premio">
        <button
          className={stockPrizeFilter === "all" ? "active" : ""}
          onClick={() => setStockPrizeFilter("all")}
          type="button"
        >
          Todo tipo
        </button>
        {prizeItemTypes.map((itemType) => (
          <button
            className={stockPrizeFilter === itemType ? "active" : ""}
            key={itemType}
            onClick={() => setStockPrizeFilter(itemType)}
            type="button"
          >
            {prizeTypeShortLabels[itemType]}{" "}
            <span>{stockCountsByType[itemType]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
