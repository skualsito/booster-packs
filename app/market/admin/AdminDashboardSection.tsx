import Link from "next/link";
import {
  Database,
  PackageOpen,
  Trophy,
  Truck,
  User,
} from "../../MaterialIcons";
import { isSellerRole } from "../catalog";
import { useMarket } from "../MarketContext";
import { AdminShellHeader, SellerRequiredPanel } from "./AdminShell";

export function AdminDashboardSection() {
  const {
    activeShipments,
    adminUsers,
    sellerPacks,
    session,
    shopStock,
    stockCountsByGame,
    withdrawnOrderCount,
  } = useMarket();

  return (
    <section className="admin-band page-section" aria-label="Panel administrador">
      <AdminShellHeader />
      {isSellerRole(session?.role) ? (
        <div className="admin-dashboard-grid">
          <Link className="admin-dashboard-card" href="/admin/stock">
            <Database size={30} aria-hidden />
            <span className="eyebrow">Stock</span>
            <strong>{shopStock.length} productos cargados</strong>
            <small>
              One Piece {stockCountsByGame["one-piece"]} - Pokemon{" "}
              {stockCountsByGame.pokemon} - Magic {stockCountsByGame.magic}
            </small>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/packs">
            <PackageOpen size={30} aria-hidden />
            <span className="eyebrow">Cajas</span>
            <strong>{sellerPacks.length} cajas publicadas</strong>
            <small>Crear, editar y normalizar probabilidades.</small>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/orders">
            <Trophy size={30} aria-hidden />
            <span className="eyebrow">Pedidos</span>
            <strong>{withdrawnOrderCount} retiros por enviar</strong>
            <small>Confirma despachos y registra numeros de seguimiento.</small>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/shipments">
            <Truck size={30} aria-hidden />
            <span className="eyebrow">Envios activos</span>
            <strong>{activeShipments.length} premios en camino</strong>
            <small>Confirma recepciones y consulta entregas anteriores.</small>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/users">
            <User size={30} aria-hidden />
            <span className="eyebrow">Inventarios</span>
            <strong>{adminUsers.length} usuarios cargados</strong>
            <small>Busca cuentas y revisa premios activos o historicos.</small>
          </Link>
        </div>
      ) : (
        <SellerRequiredPanel />
      )}
    </section>
  );
}
