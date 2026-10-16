/* eslint-disable @next/next/no-img-element */
import { Boxes, RotateCcw, TriangleAlert, Truck } from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import { cardStatusLabels, itemTypeOf, prizeTypeLabels } from "../catalog";
import { SortControl } from "../components/SortControl";
import { formatCardDate, formatUsd } from "../format";
import { useMarket } from "../MarketContext";

export function InventoryPanel() {
  const {
    inventoryActiveOnly,
    inventoryPriceSort,
    loadWonCards,
    ownedWonCardsValue,
    profilePrizeView,
    sellWonCard,
    session,
    setInventoryActiveOnly,
    setInventoryPriceSort,
    setProfilePrizeView,
    setProfileSectionView,
    showCardDetails,
    userWithdrawalGroups,
    visibleInventoryCards,
    withdrawWonCard,
    wonCardBusyId,
  } = useMarket();

  return (
    <section className="inventory-panel" aria-label="Inventario de premios">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Inventario</span>
          <h2>Tus premios</h2>
        </div>
        <button
          className="secondary-action compact"
          onClick={() => void loadWonCards()}
          type="button"
        >
          <RotateCcw size={16} aria-hidden />
          Refrescar
        </button>
      </div>
      <div className="shipment-view-tabs profile-prize-tabs">
        <button
          className={profilePrizeView === "inventory" ? "active" : ""}
          onClick={() => setProfilePrizeView("inventory")}
          type="button"
        >
          <Boxes size={16} aria-hidden />
          Inventario
        </button>
        <button
          className={profilePrizeView === "shipments" ? "active" : ""}
          onClick={() => setProfilePrizeView("shipments")}
          type="button"
        >
          <Truck size={16} aria-hidden />
          Retiros y envios
        </button>
      </div>
      {!session?.hasShippingAddress && (
        <div className="profile-address-alert" role="status">
          <TriangleAlert size={20} aria-hidden />
          <span>
            <strong>Completa tu domicilio para retirar premios</strong>
            <small>
              Falta: {(
                session?.shippingAddressMissing ?? ["datos obligatorios"]
              ).join(", ")}.
            </small>
          </span>
          <button
            className="secondary-action compact"
            onClick={() => setProfileSectionView("personal")}
            type="button"
          >
            Completar datos
          </button>
        </div>
      )}
      {profilePrizeView === "inventory" ? (
        <>
          <div className="profile-inventory-value">
            <small>Valor disponible</small>
            <strong>{formatUsd.format(ownedWonCardsValue)}</strong>
          </div>
          <div className="inventory-toolbar">
            <label className="switch-control">
              <input
                checked={inventoryActiveOnly}
                onChange={(event) => setInventoryActiveOnly(event.target.checked)}
                role="switch"
                type="checkbox"
              />
              <span className="switch-track" aria-hidden>
                <span />
              </span>
              <span>Solo activos</span>
            </label>
            <SortControl
              ariaLabel="Ordenar inventario por precio"
              onChange={(value) =>
                setInventoryPriceSort(value as "price-desc" | "price-asc")
              }
              options={[
                { value: "price-desc", label: "Mayor a menor" },
                { value: "price-asc", label: "Menor a mayor" },
              ]}
              value={inventoryPriceSort}
            />
          </div>
          <div className="inventory-list">
            {visibleInventoryCards.length ? (
              visibleInventoryCards.map((cardItem) => (
                <article
                  className={`inventory-card ${itemTypeOf(cardItem.card)}`}
                  key={cardItem.id}
                >
                  <button
                    className="won-card-image"
                    onClick={() => showCardDetails(cardItem.card)}
                    type="button"
                  >
                    <img
                      src={cardImage(cardItem.card)}
                      alt=""
                      onError={handleImageError(cardItem.card.game)}
                    />
                  </button>
                  <div>
                    <div className="inventory-card-tags">
                      <span className={`status-chip ${cardItem.status}`}>
                        {cardStatusLabels[cardItem.status]}
                      </span>
                      <span className={`prize-type-chip ${itemTypeOf(cardItem.card)}`}>
                        {prizeTypeLabels[itemTypeOf(cardItem.card)]}
                      </span>
                    </div>
                    <strong>{cardItem.card.name}</strong>
                    <small>
                      {cardItem.packName} - {formatUsd.format(cardItem.valueUsd)}
                    </small>
                    <small>
                      {cardItem.card.setName}
                      {cardItem.card.number ? ` #${cardItem.card.number}` : ""}
                    </small>
                    <small>Ganada: {formatCardDate(cardItem.acquiredAt)}</small>
                  </div>
                  {(cardItem.status === "owned" ||
                    cardItem.status === "waiting_stock") && (
                    <div className="won-card-actions">
                      <button
                        className="sell-action"
                        disabled={wonCardBusyId === cardItem.id}
                        onClick={() => void sellWonCard(cardItem.id)}
                        type="button"
                      >
                        Vender
                      </button>
                      <button
                        className={
                          cardItem.status === "waiting_stock"
                            ? "retry-action"
                            : "withdraw-action"
                        }
                        disabled={wonCardBusyId === cardItem.id}
                        onClick={() => void withdrawWonCard(cardItem.id)}
                        type="button"
                      >
                        {cardItem.status === "waiting_stock" ? (
                          <RotateCcw size={16} aria-hidden />
                        ) : (
                          <Truck size={16} aria-hidden />
                        )}
                        {cardItem.status === "waiting_stock"
                          ? "Reintentar retiro"
                          : "Retirar"}
                      </button>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="empty-list">
                {inventoryActiveOnly
                  ? "No tenes premios activos para vender o retirar."
                  : "No hay premios en tu inventario."}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="shipment-group-list profile-shipment-list">
          {userWithdrawalGroups.map((group) => (
            <article className="shipment-group" key={group.key}>
              <div className="shipment-group-heading">
                <span className="order-user-avatar" aria-hidden>
                  <Truck size={18} />
                </span>
                <div>
                  <span className="eyebrow">
                    {group.shipmentStatus === "delivered"
                      ? "Recibido"
                      : group.shipmentStatus === "shipped"
                        ? "En camino"
                        : "Preparando envio"}
                  </span>
                  <strong>
                    {group.items.length === 1
                      ? "1 premio en este paquete"
                      : `${group.items.length} premios en este paquete`}
                  </strong>
                </div>
                <div className="tracking-summary">
                  <small>Numero de seguimiento</small>
                  <strong>{group.trackingNumber || "Pendiente de asignar"}</strong>
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
                    {group.shipmentStatus === "delivered"
                      ? "Recibido"
                      : group.shipmentStatus === "shipped"
                        ? "Enviado"
                        : "Retiro solicitado"}
                  </small>
                  <strong>
                    {formatCardDate(
                      group.deliveredAt ??
                        group.shippedAt ??
                        group.items[0]?.acquiredAt,
                    )}
                  </strong>
                </span>
                <strong>
                  {formatUsd.format(
                    group.items.reduce(
                      (total, item) => total + item.valueUsd,
                      0,
                    ),
                  )}
                </strong>
              </div>
            </article>
          ))}
          {!userWithdrawalGroups.length && (
            <p className="empty-list">Todavia no tenes retiros confirmados.</p>
          )}
        </div>
      )}
    </section>
  );
}
