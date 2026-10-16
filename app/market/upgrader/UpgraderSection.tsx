/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpDown,
  CircleCheck,
  LogIn,
  Search,
  Sparkles,
  Trophy,
  X,
} from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import { cardGames, gameLabels } from "../catalog";
import { formatPercent, formatUsd } from "../format";
import { useMarket } from "../MarketContext";

export function UpgraderSection() {
  const {
    chooseUpgraderPreset,
    filteredUpgraderTargets,
    ownedWonCards,
    playUpgrader,
    session,
    setAuthMode,
    setHomeAuthOpen,
    setUpgraderGame,
    setUpgraderMaxPrice,
    setUpgraderMinPrice,
    setUpgraderOutcome,
    setUpgraderPreset,
    setUpgraderQuery,
    setUpgraderTargetId,
    setUpgraderTargetQuantity,
    toggleUpgraderStake,
    upgraderChance,
    upgraderGame,
    upgraderLoading,
    upgraderMaxPrice,
    upgraderMinPrice,
    upgraderMultiplier,
    upgraderNeedleRef,
    upgraderOutcome,
    upgraderPlaying,
    upgraderPreset,
    upgraderQuery,
    upgraderRotation,
    upgraderStakeCards,
    upgraderStakeIds,
    upgraderStakeValue,
    upgraderTarget,
    upgraderTargetId,
    upgraderTargetMaxQuantity,
    upgraderTargetQuantity,
    upgraderTargetValue,
  } = useMarket();

  return (
    <section className="upgrader-page page-section" aria-labelledby="upgrader-title">
      <div className="upgrader-heading">
        <span className="eyebrow">Upgrader</span>
        <h1 id="upgrader-title">Convertí tus premios en uno mejor</h1>
        <p>
          Elegí premios de tu inventario y apostalos por un objetivo de mayor
          valor. Si la rueda cae en la zona violeta, ganás el upgrade.
        </p>
      </div>

      {!session && (
        <div className="upgrader-guest-notice">
          <div>
            <span className="eyebrow">Modo demostración</span>
            <strong>Iniciá sesión para apostar tus premios</strong>
            <p>Podés explorar los objetivos y ver cómo funciona la ruleta.</p>
          </div>
          <button
            className="primary-action compact"
            onClick={() => {
              setAuthMode("login");
              setHomeAuthOpen(true);
            }}
            type="button"
          >
            <LogIn size={17} aria-hidden />
            Entrar
          </button>
        </div>
      )}

      <>
          <div className="upgrader-layout">
            <section className="upgrader-panel upgrader-stake-panel">
              <div className="upgrader-panel-heading">
                <div>
                  <span>Tu apuesta</span>
                  <strong>{formatUsd.format(upgraderStakeValue)}</strong>
                </div>
                <small>{upgraderStakeCards.length}/20 elegidos</small>
              </div>
              <div className={`upgrader-selection-card selection-tray${upgraderStakeCards.length ? " filled" : ""}`}>
                <div className="upgrader-selection-copy">
                  <small>Premios seleccionados</small>
                  <strong>
                    {upgraderStakeCards.length
                      ? `${upgraderStakeCards.length} ${upgraderStakeCards.length === 1 ? "premio" : "premios"}`
                      : "Elegí qué querés apostar"}
                  </strong>
                  <span>
                    {upgraderStakeCards.length
                      ? formatUsd.format(upgraderStakeValue)
                      : "Tu selección aparecerá acá"}
                  </span>
                </div>
                {upgraderStakeCards.length ? (
                  <div className="upgrader-selection-strip">
                    {upgraderStakeCards.map((item) => (
                      <button
                        aria-label={`Quitar ${item.card.name} de la apuesta`}
                        className="upgrader-selection-thumb"
                        disabled={upgraderPlaying}
                        key={item.id}
                        onClick={() => toggleUpgraderStake(item.id)}
                        title={`Quitar ${item.card.name}`}
                        type="button"
                      >
                        <img
                          src={cardImage(item.card)}
                          alt=""
                          onError={handleImageError(item.card.game)}
                        />
                        <span aria-hidden><X size={13} /></span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="upgrader-selection-empty" aria-hidden>
                    <Trophy size={28} />
                    <span>Tus premios aparecerán acá</span>
                  </div>
                )}
              </div>
              <div className="upgrader-item-list">
                {ownedWonCards.length ? (
                  ownedWonCards.map((item) => {
                    const selected = upgraderStakeIds.includes(item.id);
                    return (
                      <button
                        aria-pressed={selected}
                        className={`upgrader-item${selected ? " selected" : ""}`}
                        disabled={upgraderPlaying}
                        key={item.id}
                        onClick={() => toggleUpgraderStake(item.id)}
                        type="button"
                      >
                        <img
                          src={cardImage(item.card)}
                          alt=""
                          onError={handleImageError(item.card.game)}
                        />
                        <span>
                          <strong>{item.card.name}</strong>
                          <small>{item.card.setName}</small>
                        </span>
                        <b>{formatUsd.format(item.valueUsd)}</b>
                        <CircleCheck size={19} aria-hidden />
                      </button>
                    );
                  })
                ) : (
                  <div className="upgrader-empty">
                    <Trophy size={28} aria-hidden />
                    <strong>
                      {session ? "No tenés premios activos" : "Tu inventario aparecerá acá"}
                    </strong>
                    <p>
                      {session
                        ? "Abrí una caja para conseguir tu primer premio."
                        : "Iniciá sesión para elegir los premios que querés apostar."}
                    </p>
                    {session && <Link href="/">Ver cajas</Link>}
                  </div>
                )}
              </div>
            </section>

            <section className="upgrader-center" aria-label="Ruleta Upgrader">
              <div
                className={`upgrader-wheel${upgraderPlaying ? " spinning" : ""}`}
                style={
                  { "--upgrade-chance": `${upgraderChance}%` } as CSSProperties
                }
              >
                <div className="upgrader-wheel-scale" aria-hidden />
                <div
                  className="upgrader-needle"
                  ref={upgraderNeedleRef}
                  style={{ transform: `rotate(${upgraderRotation}deg)` }}
                  aria-hidden
                >
                  <i />
                </div>
                <div className="upgrader-wheel-core">
                  <ArrowUpDown size={35} aria-hidden />
                  <strong>{formatPercent.format(upgraderChance)}%</strong>
                  <small>probabilidad</small>
                </div>
              </div>

              <div className="upgrader-values">
                <div>
                  <small>Apostás</small>
                  <strong>{formatUsd.format(upgraderStakeValue)}</strong>
                </div>
                <ArrowRight size={20} aria-hidden />
                <div>
                  <small>Podés ganar</small>
                  <strong>{formatUsd.format(upgraderTargetValue)}</strong>
                </div>
              </div>
              <div className="upgrader-multiplier">
                <span>{upgraderMultiplier ? `${upgraderMultiplier.toFixed(2)}x` : "0.00x"}</span>
                <small>Retorno teórico 90% · máximo 80%</small>
              </div>
              <div className="upgrader-presets" aria-label="Objetivos rápidos">
                {[1.5, 2, 5, 10].map((multiplier) => (
                  <button
                    className={upgraderPreset === multiplier ? "active" : ""}
                    disabled={!session || upgraderPlaying}
                    key={multiplier}
                    onClick={() => chooseUpgraderPreset(multiplier)}
                    type="button"
                  >
                    {multiplier}x
                  </button>
                ))}
              </div>
              <button
                className="primary-action upgrader-play"
                disabled={
                  upgraderPlaying ||
                  !session ||
                  !upgraderStakeIds.length ||
                  !upgraderTarget ||
                  upgraderChance <= 0
                }
                onClick={() => void playUpgrader()}
                type="button"
              >
                <Sparkles size={19} aria-hidden />
                {upgraderPlaying ? "Girando..." : "Intentar upgrade"}
              </button>
              <p className="upgrader-risk">
                Si no acertás, los premios apostados dejan de estar disponibles.
              </p>
            </section>

            <section className="upgrader-panel upgrader-target-panel">
              <div className="upgrader-panel-heading">
                <div>
                  <span>Premio objetivo</span>
                  <strong>{formatUsd.format(upgraderTargetValue)}</strong>
                </div>
                <small>{filteredUpgraderTargets.length} disponibles</small>
              </div>
              <div className={`upgrader-selection-card selection-tray${upgraderTarget ? " filled" : ""}`}>
                <div className="upgrader-selection-copy">
                  <small>Premio que podés ganar</small>
                  <strong>
                    {upgraderTarget?.card.name ?? "Elegí un premio objetivo"}
                  </strong>
                  <span>
                    {upgraderTarget
                      ? formatUsd.format(upgraderTargetValue)
                      : "Tu objetivo aparecerá acá"}
                  </span>
                </div>
                {upgraderTarget ? (
                  <div className="upgrader-target-selection-row">
                    <div className="upgrader-selection-strip target-strip">
                    <button
                      aria-label={`Quitar ${upgraderTarget.card.name} como objetivo`}
                      className="upgrader-selection-thumb"
                      disabled={upgraderPlaying}
                      onClick={() => {
                        setUpgraderOutcome(null);
                        setUpgraderTargetId(null);
                      }}
                      title={`Quitar ${upgraderTarget.card.name}`}
                      type="button"
                    >
                      <img
                        src={cardImage(upgraderTarget.card)}
                        alt=""
                        onError={handleImageError(upgraderTarget.card.game)}
                      />
                      <span aria-hidden><X size={13} /></span>
                    </button>
                    </div>
                    <div className="upgrader-target-quantity">
                      <small>Cantidad</small>
                      <div>
                        <button
                          aria-label="Quitar una unidad"
                          disabled={upgraderPlaying || upgraderTargetQuantity <= 1}
                          onClick={() =>
                            setUpgraderTargetQuantity((current) =>
                              Math.max(1, current - 1),
                            )
                          }
                          type="button"
                        >
                          −
                        </button>
                        <input
                          aria-label="Cantidad del premio objetivo"
                          disabled={upgraderPlaying}
                          inputMode="numeric"
                          max={upgraderTargetMaxQuantity}
                          min="1"
                          onChange={(event) => {
                            const quantity = Number(event.target.value);
                            if (Number.isFinite(quantity)) {
                              setUpgraderTargetQuantity(
                                Math.min(
                                  upgraderTargetMaxQuantity,
                                  Math.max(1, Math.floor(quantity)),
                                ),
                              );
                            }
                          }}
                          type="number"
                          value={upgraderTargetQuantity}
                        />
                        <button
                          aria-label="Agregar una unidad"
                          disabled={
                            upgraderPlaying ||
                            upgraderTargetQuantity >= upgraderTargetMaxQuantity
                          }
                          onClick={() =>
                            setUpgraderTargetQuantity((current) =>
                              Math.min(upgraderTargetMaxQuantity, current + 1),
                            )
                          }
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <em>Máximo disponible: {upgraderTargetMaxQuantity}</em>
                    </div>
                  </div>
                ) : (
                  <div className="upgrader-selection-empty" aria-hidden>
                    <Sparkles size={28} />
                    <span>El premio aparecerá acá</span>
                  </div>
                )}
              </div>
              <div className="upgrader-target-tools">
                <div className="stock-type-tabs" aria-label="Filtrar objetivos por juego">
                  <button
                    className={upgraderGame === "mixed" ? "active" : ""}
                    onClick={() => setUpgraderGame("mixed")}
                    type="button"
                  >
                    Todos
                  </button>
                  {cardGames.map((game) => (
                    <button
                      className={upgraderGame === game ? "active" : ""}
                      key={game}
                      onClick={() => setUpgraderGame(game)}
                      type="button"
                    >
                      {gameLabels[game]}
                    </button>
                  ))}
                </div>
                <label className="upgrader-search">
                  <Search size={17} aria-hidden />
                  <input
                    onChange={(event) => setUpgraderQuery(event.target.value)}
                    placeholder="Buscar premio"
                    value={upgraderQuery}
                  />
                </label>
                <div className="upgrader-price-filters">
                  <label>
                    <span>Precio mínimo</span>
                    <input
                      inputMode="decimal"
                      min="0"
                      onChange={(event) => {
                        setUpgraderPreset(null);
                        setUpgraderTargetId(null);
                        setUpgraderMinPrice(event.target.value);
                      }}
                      placeholder="0"
                      step="0.01"
                      type="number"
                      value={upgraderMinPrice}
                    />
                  </label>
                  <label>
                    <span>Precio máximo</span>
                    <input
                      inputMode="decimal"
                      min="0"
                      onChange={(event) => {
                        setUpgraderPreset(null);
                        setUpgraderTargetId(null);
                        setUpgraderMaxPrice(event.target.value);
                      }}
                      placeholder="Sin límite"
                      step="0.01"
                      type="number"
                      value={upgraderMaxPrice}
                    />
                  </label>
                </div>
              </div>
              <div className="upgrader-item-list">
                {upgraderLoading ? (
                  <div className="upgrader-empty" role="status">
                    <span className="mini-spinner" aria-hidden />
                    <strong>Cargando premios</strong>
                  </div>
                ) : filteredUpgraderTargets.length ? (
                  filteredUpgraderTargets.map((item) => {
                    const selected = item.id === upgraderTargetId;
                    return (
                      <button
                        aria-pressed={selected}
                        className={`upgrader-item${selected ? " selected" : ""}`}
                        disabled={upgraderPlaying}
                        key={item.id}
                        onClick={() => {
                          setUpgraderOutcome(null);
                          setUpgraderTargetId(item.id);
                        }}
                        type="button"
                      >
                        <img
                          src={cardImage(item.card)}
                          alt=""
                          onError={handleImageError(item.card.game)}
                        />
                        <span>
                          <strong>{item.card.name}</strong>
                          <small>{item.card.setName}</small>
                        </span>
                        <b>{formatUsd.format(item.card.priceUsd ?? 0)}</b>
                        <CircleCheck size={19} aria-hidden />
                      </button>
                    );
                  })
                ) : (
                  <div className="upgrader-empty">
                    <Search size={27} aria-hidden />
                    <strong>No hay objetivos para ese filtro</strong>
                    <p>Elegí una apuesta menor o cambiá la búsqueda.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {upgraderOutcome && (
            <article
              className={`upgrader-outcome ${upgraderOutcome.won ? "won" : "lost"}`}
              role="status"
            >
              {upgraderOutcome.target?.card && (
                <img
                  src={cardImage(upgraderOutcome.target.card)}
                  alt=""
                  onError={handleImageError(upgraderOutcome.target.card.game)}
                />
              )}
              <div>
                <span>{upgraderOutcome.won ? "Upgrade conseguido" : "No salió"}</span>
                <h2>
                  {upgraderOutcome.won
                    ? `${upgraderOutcome.targetQuantity && upgraderOutcome.targetQuantity > 1 ? `${upgraderOutcome.targetQuantity} × ` : ""}${upgraderOutcome.target?.card.name ?? "Premio"}`
                    : "La rueda quedó fuera de la zona ganadora"}
                </h2>
                <p>
                  Probabilidad {formatPercent.format(upgraderOutcome.chance ?? 0)}%
                  {upgraderOutcome.won
                    ? " · El premio ya está en tu inventario."
                    : " · Podés volver a intentarlo con otros premios."}
                </p>
              </div>
              {upgraderOutcome.won && (
                <Link className="secondary-action compact" href="/profile">
                  <Trophy size={17} aria-hidden />
                  Ver inventario
                </Link>
              )}
            </article>
          )}
      </>
    </section>
  );
}
