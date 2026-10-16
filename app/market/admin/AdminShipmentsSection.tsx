/* eslint-disable @next/next/no-img-element */
import { CircleCheck, RotateCcw, Truck } from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import { isSellerRole } from "../catalog";
import { formatCardDate, formatUsd } from "../format";
import { useMarket } from "../MarketContext";
import { AdminShellHeader, SellerRequiredPanel } from "./AdminShell";

export function AdminShipmentsSection() {
  const {
    activeShipmentGroups,
    loadShopShipments,
    markShipmentReceived,
    session,
    setShipmentView,
    shipmentBusyKey,
    shipmentHistoryGroups,
    shipmentsMessage,
    shipmentView,
    visibleShipmentGroups,
  } = useMarket();

  return (
    <section className="admin-band page-section" aria-label="Envios de Pullario">
      <AdminShellHeader />
      {isSellerRole(session?.role) ? (
        <div className="shipments-panel">
          <div className="shipment-view-tabs" aria-label="Estado de los envios">
            <button
              className={shipmentView === "active" ? "active" : ""}
              onClick={() => setShipmentView("active")}
              type="button"
            >
              Activos <span>{activeShipmentGroups.length}</span>
            </button>
            <button
              className={shipmentView === "history" ? "active" : ""}
              onClick={() => setShipmentView("history")}
              type="button"
            >
              Historial <span>{shipmentHistoryGroups.length}</span>
            </button>
            <button
              className="shipment-refresh"
              onClick={() => void loadShopShipments()}
              type="button"
            >
              <RotateCcw size={16} aria-hidden />
              Refrescar
            </button>
          </div>
          {shipmentsMessage && (
            <p className="admin-message">{shipmentsMessage}</p>
          )}
          <div className="shipment-group-list">
            {visibleShipmentGroups.length ? (
              visibleShipmentGroups.map((group) => (
                <article className="shipment-group" key={group.key}>
                  <div className="shipment-group-heading">
                    <span className="order-user-avatar" aria-hidden>
                      <Truck size={18} />
                    </span>
                    <div>
                      <span className="eyebrow">
                        {shipmentView === "active" ? "En camino" : "Recibido"}
                      </span>
                      <strong>{group.displayName || group.username}</strong>
                      <small>@{group.username}</small>
                    </div>
                    <div className="tracking-summary">
                      <small>Seguimiento</small>
                      <strong>{group.trackingNumber}</strong>
                    </div>
                  </div>
                  <div className="shipment-prizes">
                    {group.items.map((item) => (
                      <div className="shipment-prize" key={item.id}>
                        <img
                          src={cardImage(item.card)}
                          alt=""
                          onError={handleImageError(item.card.game)}
                        />
                        <span>
                          <strong>{item.card.name}</strong>
                          <small>{formatUsd.format(item.valueUsd)}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="shipment-group-footer">
                    <span>
                      <small>
                        {shipmentView === "active" ? "Enviado" : "Recibido"}
                      </small>
                      <strong>
                        {formatCardDate(
                          shipmentView === "active"
                            ? group.shippedAt
                            : group.deliveredAt,
                        )}
                      </strong>
                    </span>
                    {shipmentView === "active" && (
                      <button
                        className="primary-action compact"
                        disabled={shipmentBusyKey === group.key}
                        onClick={() =>
                          void markShipmentReceived(
                            group.items.map((item) => item.id),
                            group.key,
                          )
                        }
                        type="button"
                      >
                        <CircleCheck size={16} aria-hidden />
                        {shipmentBusyKey === group.key
                          ? "Confirmando"
                          : "Marcar como recibido"}
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-list">
                {shipmentView === "active"
                  ? "No hay envios activos en este momento."
                  : "Todavia no hay entregas confirmadas."}
              </p>
            )}
          </div>
        </div>
      ) : (
        <SellerRequiredPanel />
      )}
    </section>
  );
}
