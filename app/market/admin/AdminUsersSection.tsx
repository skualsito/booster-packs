/* eslint-disable @next/next/no-img-element */
import { Boxes, Search, Truck, User } from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import { cardStatusLabels, isSellerRole, itemTypeOf } from "../catalog";
import { SortControl } from "../components/SortControl";
import { formatCardDate, formatUsd } from "../format";
import { useMarket } from "../MarketContext";
import { AdminShellHeader, SellerRequiredPanel } from "./AdminShell";

export function AdminUsersSection() {
  const {
    adminInventoryActiveOnly,
    adminInventoryMaxPrice,
    adminInventoryMinPrice,
    adminInventorySort,
    adminUserQuery,
    adminUsers,
    adminUsersLoading,
    adminUsersMessage,
    adminUserView,
    adminUserWithdrawalGroups,
    loadAdminUserCards,
    loadAdminUsers,
    selectedAdminUser,
    session,
    setAdminInventoryActiveOnly,
    setAdminInventoryMaxPrice,
    setAdminInventoryMinPrice,
    setAdminInventorySort,
    setAdminUserQuery,
    setAdminUserView,
    visibleAdminUserCards,
  } = useMarket();

  return (
    <section
      className="admin-band page-section"
      aria-label="Inventarios de usuarios"
    >
      <AdminShellHeader />
      {isSellerRole(session?.role) ? (
        <div className="admin-users-layout">
          <aside className="admin-user-browser">
            <form
              className="admin-user-search"
              onSubmit={(event) => {
                event.preventDefault();
                void loadAdminUsers(adminUserQuery);
              }}
            >
              <label>
                Buscar usuario
                <input
                  onChange={(event) => setAdminUserQuery(event.target.value)}
                  placeholder="Usuario, nombre o email"
                  type="search"
                  value={adminUserQuery}
                />
              </label>
              <button className="primary-action compact" type="submit">
                <Search size={16} aria-hidden />
                Buscar
              </button>
            </form>
            <div className="admin-user-list">
              {adminUsers.map((user) => (
                <button
                  className={selectedAdminUser?.id === user.id ? "active" : ""}
                  key={user.id}
                  onClick={() => void loadAdminUserCards(user)}
                  type="button"
                >
                  <span className="order-user-avatar" aria-hidden>
                    <User size={17} />
                  </span>
                  <span>
                    <strong>{user.displayName || user.username}</strong>
                    <small>@{user.username}</small>
                  </span>
                </button>
              ))}
              {!adminUsers.length && !adminUsersLoading && (
                <p className="empty-list">No se encontraron usuarios.</p>
              )}
            </div>
          </aside>

          <div className="admin-user-inventory">
            {selectedAdminUser ? (
              <>
                <div className="admin-user-inventory-heading">
                  <div>
                    <span className="eyebrow">Inventario</span>
                    <h2>
                      {selectedAdminUser.displayName || selectedAdminUser.username}
                    </h2>
                    <small>@{selectedAdminUser.username}</small>
                  </div>
                  <div className="admin-user-totals">
                    <div className="admin-user-value">
                      <small>Total gastado</small>
                      <strong>
                        {formatUsd.format(
                          Number(selectedAdminUser.spentValueUsd) || 0,
                        )}
                      </strong>
                    </div>
                    <div className="admin-user-value">
                      <small>Valor retirado</small>
                      <strong>
                        {formatUsd.format(
                          Number(selectedAdminUser.withdrawnValueUsd) || 0,
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="shipment-view-tabs admin-user-view-tabs">
                  <button
                    className={adminUserView === "inventory" ? "active" : ""}
                    onClick={() => setAdminUserView("inventory")}
                    type="button"
                  >
                    <Boxes size={16} aria-hidden />
                    Inventario
                  </button>
                  <button
                    className={adminUserView === "shipments" ? "active" : ""}
                    onClick={() => setAdminUserView("shipments")}
                    type="button"
                  >
                    <Truck size={16} aria-hidden />
                    Retiros y envios
                  </button>
                </div>
                {adminUserView === "inventory" ? (
                  <>
                    <div className="admin-inventory-filters">
                      <label className="switch-control">
                        <input
                          checked={adminInventoryActiveOnly}
                          onChange={(event) =>
                            setAdminInventoryActiveOnly(event.target.checked)
                          }
                          role="switch"
                          type="checkbox"
                        />
                        <span className="switch-track" aria-hidden>
                          <span />
                        </span>
                        <span>Solo activos</span>
                      </label>
                      <label>
                        Precio minimo
                        <input
                          inputMode="decimal"
                          onChange={(event) =>
                            setAdminInventoryMinPrice(event.target.value)
                          }
                          placeholder="0"
                          type="text"
                          value={adminInventoryMinPrice}
                        />
                      </label>
                      <label>
                        Precio maximo
                        <input
                          inputMode="decimal"
                          onChange={(event) =>
                            setAdminInventoryMaxPrice(event.target.value)
                          }
                          placeholder="Sin limite"
                          type="text"
                          value={adminInventoryMaxPrice}
                        />
                      </label>
                      <SortControl
                        ariaLabel="Ordenar inventario del usuario"
                        onChange={(value) =>
                          setAdminInventorySort(
                            value as typeof adminInventorySort,
                          )
                        }
                        options={[
                          { value: "date-desc", label: "Mas recientes" },
                          { value: "date-asc", label: "Mas antiguos" },
                          { value: "price-desc", label: "Mayor precio" },
                          { value: "price-asc", label: "Menor precio" },
                        ]}
                        value={adminInventorySort}
                      />
                    </div>
                    <div className="admin-user-card-list">
                      {visibleAdminUserCards.map((item) => (
                        <article
                          className={`inventory-card ${itemTypeOf(item.card)}`}
                          key={item.id}
                        >
                          <img
                            src={cardImage(item.card)}
                            alt=""
                            onError={handleImageError(item.card.game)}
                          />
                          <div>
                            <span className={`status-chip ${item.status}`}>
                              {cardStatusLabels[item.status]}
                            </span>
                            <strong>{item.card.name}</strong>
                            <small>
                              {item.packName} - {formatUsd.format(item.valueUsd)}
                            </small>
                            <small>Ganada: {formatCardDate(item.acquiredAt)}</small>
                          </div>
                        </article>
                      ))}
                      {!visibleAdminUserCards.length && !adminUsersLoading && (
                        <p className="empty-list">
                          No hay premios que coincidan con estos filtros.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="shipment-group-list admin-user-shipments">
                    {adminUserWithdrawalGroups.map((group) => (
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
                                  : "Pendiente de envio"}
                            </span>
                            <strong>
                              {group.items.length === 1
                                ? "1 premio en este paquete"
                                : `${group.items.length} premios en este paquete`}
                            </strong>
                          </div>
                          <div className="tracking-summary">
                            <small>Numero de seguimiento</small>
                            <strong>
                              {group.trackingNumber || "Pendiente de asignar"}
                            </strong>
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
                    {!adminUserWithdrawalGroups.length && !adminUsersLoading && (
                      <p className="empty-list">
                        Este usuario todavia no tiene retiros confirmados.
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="admin-user-empty">
                <User size={24} aria-hidden />
                <h2>Selecciona un usuario</h2>
                <p>Su inventario y sus filtros apareceran en este panel.</p>
              </div>
            )}
            {adminUsersMessage && (
              <p className="admin-message">{adminUsersMessage}</p>
            )}
          </div>
        </div>
      ) : (
        <SellerRequiredPanel />
      )}
    </section>
  );
}
