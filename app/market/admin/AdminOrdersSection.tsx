/* eslint-disable @next/next/no-img-element */
import { RotateCcw, Send, User, X } from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import {
  isSellerRole,
  itemTypeOf,
  orderStatusLabels,
  prizeTypeLabels,
} from "../catalog";
import { formatCardDate, formatUsd } from "../format";
import { useMarket } from "../MarketContext";
import { AdminShellHeader, SellerRequiredPanel } from "./AdminShell";

export function AdminOrdersSection() {
  const {
    groupedShopOrders,
    loadShopOrders,
    ordersMessage,
    selectedShipmentIds,
    selectedShipmentsReady,
    selectedShipmentUserId,
    session,
    setSelectedShipmentIds,
    setShippingModalOpen,
    shippingOrders,
    toggleShipmentSelection,
    withdrawnOrderCount,
  } = useMarket();

  return (
    <section className="admin-band page-section" aria-label="Pedidos de Pullario">
      <AdminShellHeader />
      {isSellerRole(session?.role) ? (
        <div className="orders-panel">
          <div className="admin-metrics wide shipping-metrics">
            <span>
              <small>Retiros activos</small>
              <strong>{withdrawnOrderCount}</strong>
            </span>
            <span>
              <small>Usuarios</small>
              <strong>{groupedShopOrders.length}</strong>
            </span>
          </div>
          <div className="shipping-toolbar">
            <div>
              <strong>{selectedShipmentIds.length} seleccionados</strong>
              <small>
                Selecciona premios de un mismo usuario para armar un paquete.
              </small>
            </div>
            <div className="shipping-toolbar-actions">
              <button
                className="secondary-action compact"
                onClick={() => void loadShopOrders()}
                type="button"
              >
                <RotateCcw size={16} aria-hidden />
                Refrescar
              </button>
              <button
                className="primary-action compact"
                disabled={!selectedShipmentsReady || shippingOrders}
                onClick={() => setShippingModalOpen(true)}
                type="button"
              >
                <Send size={16} aria-hidden />
                {shippingOrders ? "Confirmando" : "Marcar como enviados"}
              </button>
            </div>
          </div>
          {ordersMessage && <p className="admin-message">{ordersMessage}</p>}
          <div className="order-list grouped-orders">
            {groupedShopOrders.length ? (
              groupedShopOrders.map((group) => (
                <section className="order-user-group" key={group.userId}>
                  <div className="order-user-heading">
                    <span className="order-user-avatar" aria-hidden>
                      <User size={18} />
                    </span>
                    <span>
                      <strong>{group.displayName || group.username}</strong>
                      {group.displayName && <small>@{group.username}</small>}
                    </span>
                    <span className="order-user-count">
                      {group.orders.length} {group.orders.length === 1 ? "premio" : "premios"}
                    </span>
                    <button
                      className="group-select-action"
                      onClick={() => {
                        const groupIds = group.orders.map((order) => order.id);
                        const allSelected = groupIds.every((id) =>
                          selectedShipmentIds.includes(id),
                        );
                        setSelectedShipmentIds(allSelected ? [] : groupIds);
                      }}
                      type="button"
                    >
                      {group.orders.every((order) =>
                        selectedShipmentIds.includes(order.id),
                      )
                        ? "Quitar seleccion"
                        : "Seleccionar todos"}
                    </button>
                  </div>
                  <div className="order-user-items">
                    {group.orders.map((order) => (
                      <article
                        className={`order-card ${itemTypeOf(order.card)}`}
                        key={order.id}
                      >
                        <label className="shipment-checkbox">
                          <input
                            checked={selectedShipmentIds.includes(order.id)}
                            disabled={Boolean(
                              selectedShipmentUserId &&
                                selectedShipmentUserId !== order.userId,
                            )}
                            onChange={() => toggleShipmentSelection(order.id)}
                            type="checkbox"
                          />
                          <span aria-hidden />
                          <span className="sr-only">
                            Seleccionar retiro de {order.card.name}
                          </span>
                        </label>
                        <img
                          src={cardImage(order.card)}
                          alt=""
                          onError={handleImageError(order.card.game)}
                        />
                        <div>
                          <span className={`status-chip ${order.status}`}>
                            {orderStatusLabels[order.status]}
                          </span>
                          <span
                            className={`prize-type-chip ${itemTypeOf(order.card)}`}
                          >
                            {prizeTypeLabels[itemTypeOf(order.card)]}
                          </span>
                          <strong>{order.card.name}</strong>
                          <small>
                            {order.packName} - {formatUsd.format(order.valueUsd)}
                          </small>
                          <small>Ganada: {formatCardDate(order.acquiredAt)}</small>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <p className="empty-list">
                No hay retiros confirmados pendientes de envio.
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

export function ShippingModal() {
  const {
    markSelectedOrdersShipped,
    selectedShipmentIds,
    setShipmentTrackingNumber,
    setShippingModalOpen,
    shipmentTrackingNumber,
    shippingModalOpen,
    shippingOrders,
  } = useMarket();

  if (!shippingModalOpen) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onKeyDown={(event) => {
        if (event.key === "Escape" && !shippingOrders) {
          setShippingModalOpen(false);
        }
      }}
      role="presentation"
    >
      <article
        aria-labelledby="shipping-modal-title"
        aria-modal="true"
        className="utility-modal shipping-modal"
        role="dialog"
      >
        <button
          aria-label="Cerrar confirmacion de envio"
          className="modal-close"
          disabled={shippingOrders}
          onClick={() => setShippingModalOpen(false)}
          type="button"
        >
          <X size={18} aria-hidden />
        </button>
        <span className="eyebrow">Confirmar despacho</span>
        <h2 id="shipping-modal-title">
          {selectedShipmentIds.length}{" "}
          {selectedShipmentIds.length === 1 ? "premio" : "premios"}
        </h2>
        <p>
          El mismo numero de seguimiento se aplicara a todos los premios
          seleccionados de este usuario.
        </p>
        <label>
          Numero de seguimiento
          <input
            autoFocus
            onChange={(event) =>
              setShipmentTrackingNumber(event.target.value)
            }
            placeholder="Ej: AR123456789"
            type="text"
            value={shipmentTrackingNumber}
          />
        </label>
        <div className="shipping-modal-actions">
          <button
            className="secondary-action compact"
            disabled={shippingOrders}
            onClick={() => setShippingModalOpen(false)}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="primary-action compact"
            disabled={
              shippingOrders || shipmentTrackingNumber.trim().length < 3
            }
            onClick={() => void markSelectedOrdersShipped()}
            type="button"
          >
            <Send size={16} aria-hidden />
            {shippingOrders ? "Confirmando" : "Confirmar envio"}
          </button>
        </div>
      </article>
    </div>
  );
}
