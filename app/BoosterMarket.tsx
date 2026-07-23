"use client";

import {
  Archive,
  BarChart3,
  Check,
  ChevronRight,
  Dice5,
  Filter,
  Gauge,
  Gem,
  Info,
  LockKeyhole,
  PackageOpen,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type Franchise = "One Piece" | "Pokemon" | "Magic" | "Mixto";
type RarityKey = "common" | "uncommon" | "rare" | "ultra" | "secret" | "grail";

type Rarity = {
  key: RarityKey;
  label: string;
  odds: number;
  value: [number, number];
  color: string;
  cards: string[];
};

type Booster = {
  id: string;
  name: string;
  franchise: Franchise;
  price: number;
  targetMargin: number;
  hitLine: number;
  volatility: "Baja" | "Media" | "Alta" | "Muy alta";
  accent: string;
  description: string;
  inventory: number;
  rarities: Rarity[];
};

type Pull = {
  id: number;
  booster: Booster;
  rarity: Rarity;
  card: string;
  value: number;
  isHit: boolean;
};

const formatUsd = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const rarityOrder: RarityKey[] = [
  "common",
  "uncommon",
  "rare",
  "ultra",
  "secret",
  "grail",
];

const boosters: Booster[] = [
  {
    id: "grand-line",
    name: "Grand Line Chase",
    franchise: "One Piece",
    price: 18,
    targetMargin: 16,
    hitLine: 22,
    volatility: "Alta",
    accent: "#15c8ff",
    description:
      "Pool enfocado en alt arts, promos japonesas y hits premium de tripulaciones populares.",
    inventory: 126,
    rarities: [
      {
        key: "common",
        label: "Base / bulk",
        odds: 44,
        value: [1, 4],
        color: "#7d8796",
        cards: ["OP base foil", "Leader bulk", "Event foil"],
      },
      {
        key: "uncommon",
        label: "Foil jugable",
        odds: 26,
        value: [5, 10],
        color: "#36d184",
        cards: ["Staple foil", "Parallel comun", "Promo torneo"],
      },
      {
        key: "rare",
        label: "SR / promo",
        odds: 17,
        value: [11, 22],
        color: "#2f9cff",
        cards: ["SR meta", "Leader alt menor", "Promo sellada"],
      },
      {
        key: "ultra",
        label: "Alt art",
        odds: 9,
        value: [24, 55],
        color: "#a855f7",
        cards: ["Alt art character", "Leader paralelo", "SP art"],
      },
      {
        key: "secret",
        label: "Manga / SEC",
        odds: 3.5,
        value: [70, 180],
        color: "#f97316",
        cards: ["Secret rare", "Manga chase", "Alt leader top"],
      },
      {
        key: "grail",
        label: "Grail slab",
        odds: 0.5,
        value: [260, 520],
        color: "#facc15",
        cards: ["Graded grail", "Manga premium", "Case hit firmado"],
      },
    ],
  },
  {
    id: "kanto-vault",
    name: "Kanto Vault",
    franchise: "Pokemon",
    price: 14,
    targetMargin: 18,
    hitLine: 18,
    volatility: "Media",
    accent: "#ffcc33",
    description:
      "Pensado para coleccionistas: vintage ligero, full arts modernos y cartas gradables.",
    inventory: 204,
    rarities: [
      {
        key: "common",
        label: "Reverse / bulk",
        odds: 48,
        value: [1, 3],
        color: "#7d8796",
        cards: ["Reverse holo", "Rare holo", "Bulk seleccionado"],
      },
      {
        key: "uncommon",
        label: "Trainer / art rare",
        odds: 25,
        value: [4, 9],
        color: "#36d184",
        cards: ["Trainer gallery", "Illustration rare", "Promo blister"],
      },
      {
        key: "rare",
        label: "Full art",
        odds: 16,
        value: [10, 20],
        color: "#2f9cff",
        cards: ["Full art ex", "Secret trainer", "Promo sealed"],
      },
      {
        key: "ultra",
        label: "Alt chase",
        odds: 8,
        value: [24, 65],
        color: "#a855f7",
        cards: ["Alt art ex", "Starter premium", "Vintage holo played"],
      },
      {
        key: "secret",
        label: "High-end hit",
        odds: 2.5,
        value: [80, 220],
        color: "#f97316",
        cards: ["Secret rare top", "Slab 9", "Chase vintage"],
      },
      {
        key: "grail",
        label: "Vault hit",
        odds: 0.5,
        value: [300, 650],
        color: "#facc15",
        cards: ["Slab 10 grail", "Vintage chase", "Signed display card"],
      },
    ],
  },
  {
    id: "planeswalker",
    name: "Planeswalker Relics",
    franchise: "Magic",
    price: 22,
    targetMargin: 14,
    hitLine: 28,
    volatility: "Muy alta",
    accent: "#c084fc",
    description:
      "Mayor varianza: reserved-list accesible, serialized-style slots y staples commander.",
    inventory: 78,
    rarities: [
      {
        key: "common",
        label: "Bulk playable",
        odds: 40,
        value: [1, 5],
        color: "#7d8796",
        cards: ["Commander staple", "Foil bulk", "Rare low-end"],
      },
      {
        key: "uncommon",
        label: "Staple",
        odds: 24,
        value: [6, 12],
        color: "#36d184",
        cards: ["EDH staple", "Retro frame", "Promo pack rare"],
      },
      {
        key: "rare",
        label: "Mythic / rare",
        odds: 20,
        value: [13, 28],
        color: "#2f9cff",
        cards: ["Mythic playable", "Shock land", "Borderless rare"],
      },
      {
        key: "ultra",
        label: "Showcase",
        odds: 10,
        value: [32, 80],
        color: "#a855f7",
        cards: ["Borderless foil", "Commander chase", "Reserved-list LP"],
      },
      {
        key: "secret",
        label: "Serialized slot",
        odds: 5,
        value: [95, 260],
        color: "#f97316",
        cards: ["Serialized-style hit", "Dual-era relic", "Foil chase"],
      },
      {
        key: "grail",
        label: "Power relic",
        odds: 1,
        value: [360, 900],
        color: "#facc15",
        cards: ["Reserved-list grail", "Premium slab", "Collector trophy"],
      },
    ],
  },
  {
    id: "cross-tcg",
    name: "Cross-TCG Jackpot",
    franchise: "Mixto",
    price: 35,
    targetMargin: 12,
    hitLine: 45,
    volatility: "Muy alta",
    accent: "#ff4f7b",
    description:
      "El pack de alto ticket: cartas selladas, slabs y hits de varios TCG con probabilidad mas agresiva.",
    inventory: 42,
    rarities: [
      {
        key: "common",
        label: "Floor garantizado",
        odds: 32,
        value: [8, 14],
        color: "#7d8796",
        cards: ["Lote foil curado", "Promo sellada", "Rare bundle"],
      },
      {
        key: "uncommon",
        label: "Mini hit",
        odds: 26,
        value: [15, 26],
        color: "#36d184",
        cards: ["Full art", "Alt menor", "Staple premium"],
      },
      {
        key: "rare",
        label: "Hit",
        odds: 22,
        value: [30, 55],
        color: "#2f9cff",
        cards: ["Alt art", "Slab 8", "Sealed promo chase"],
      },
      {
        key: "ultra",
        label: "Major hit",
        odds: 13,
        value: [65, 135],
        color: "#a855f7",
        cards: ["Slab 9", "Secret chase", "Collector booster sealed"],
      },
      {
        key: "secret",
        label: "Case hit",
        odds: 6,
        value: [160, 360],
        color: "#f97316",
        cards: ["Slab 10", "Serialized premium", "Manga/high-end chase"],
      },
      {
        key: "grail",
        label: "Shelf breaker",
        odds: 1,
        value: [500, 1200],
        color: "#facc15",
        cards: ["Grail multi-TCG", "Sealed vintage", "Trophy slab"],
      },
    ],
  },
];

const filters: Array<Franchise | "Todos"> = [
  "Todos",
  "One Piece",
  "Pokemon",
  "Magic",
  "Mixto",
];

const pickByOdds = (booster: Booster): Rarity => {
  const roll = Math.random() * 100;
  let cursor = 0;

  for (const rarity of booster.rarities) {
    cursor += rarity.odds;
    if (roll <= cursor) {
      return rarity;
    }
  }

  return booster.rarities[booster.rarities.length - 1];
};

const randomValue = ([min, max]: [number, number]) =>
  Number((min + Math.random() * (max - min)).toFixed(2));

const expectedValue = (booster: Booster) =>
  booster.rarities.reduce((total, rarity) => {
    const midpoint = (rarity.value[0] + rarity.value[1]) / 2;
    return total + midpoint * (rarity.odds / 100);
  }, 0);

const hitChance = (booster: Booster) =>
  booster.rarities.reduce((total, rarity) => {
    const midpoint = (rarity.value[0] + rarity.value[1]) / 2;
    return midpoint >= booster.hitLine ? total + rarity.odds : total;
  }, 0);

const suggestedPrice = (booster: Booster, margin: number) => {
  const ev = expectedValue(booster);
  const operationsReserve = Math.max(1.25, booster.price * 0.045);
  return (ev + operationsReserve) / (1 - margin / 100);
};

const buildPull = (booster: Booster, id: number): Pull => {
  const rarity = pickByOdds(booster);
  const card = rarity.cards[Math.floor(Math.random() * rarity.cards.length)];
  const value = randomValue(rarity.value);

  return {
    id,
    booster,
    rarity,
    card,
    value,
    isHit: value >= booster.hitLine,
  };
};

export function BoosterMarket() {
  const [activeFilter, setActiveFilter] = useState<Franchise | "Todos">("Todos");
  const [selectedId, setSelectedId] = useState(boosters[0].id);
  const [quantity, setQuantity] = useState(1);
  const [margin, setMargin] = useState(16);
  const [pulls, setPulls] = useState<Pull[]>([]);

  const visibleBoosters = useMemo(
    () =>
      activeFilter === "Todos"
        ? boosters
        : boosters.filter((booster) => booster.franchise === activeFilter),
    [activeFilter],
  );

  const selectedBooster =
    boosters.find((booster) => booster.id === selectedId) ?? boosters[0];

  const selectedEv = expectedValue(selectedBooster);
  const selectedHitChance = hitChance(selectedBooster);
  const calculatedPrice = suggestedPrice(selectedBooster, margin);
  const recentValue = pulls.reduce((total, pull) => total + pull.value, 0);
  const spend = pulls.reduce((total, pull) => total + pull.booster.price, 0);

  const openBoosters = () => {
    const nextPulls = Array.from({ length: quantity }, (_, index) =>
      buildPull(selectedBooster, Date.now() + index),
    );

    setPulls((current) => [...nextPulls, ...current].slice(0, 18));
  };

  return (
    <main className="market-shell">
      <section className="market-hero" aria-labelledby="main-title">
        <div className="hero-copy">
          <div className="status-pill">
            <ShieldCheck size={16} aria-hidden />
            Odds visibles antes de abrir
          </div>
          <h1 id="main-title">HitShelf</h1>
          <p>
            Marketplace de boosters TCG con logica de case opening: el usuario
            elige el pack, ve rarezas, probabilidades, EV estimado y abre una
            carta fisica de inventario curado.
          </p>
          <div className="hero-actions" aria-label="Acciones principales">
            <a href="#boosters" className="primary-action">
              <PackageOpen size={18} aria-hidden />
              Elegir booster
            </a>
            <a href="#modelo" className="secondary-action">
              <BarChart3 size={18} aria-hidden />
              Ver modelo
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-label="Vista previa HitShelf">
          <Image
            src="/og.png"
            alt=""
            width={1200}
            height={630}
            priority
            sizes="(max-width: 1120px) 100vw, 58vw"
          />
          <div className="hero-odds">
            <span>Hit chance</span>
            <strong>{selectedHitChance.toFixed(1)}%</strong>
          </div>
        </div>
      </section>

      <section id="boosters" className="workspace-band" aria-label="Boosters">
        <div className="tool-header">
          <div>
            <span className="eyebrow">Inventario activo</span>
            <h2>Elegi el tipo de booster</h2>
          </div>
          <div className="filter-row" aria-label="Filtrar por TCG">
            <Filter size={17} aria-hidden />
            {filters.map((filter) => (
              <button
                className={filter === activeFilter ? "filter active" : "filter"}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="booster-grid">
          {visibleBoosters.map((booster) => {
            const isSelected = booster.id === selectedBooster.id;
            const ev = expectedValue(booster);
            const chance = hitChance(booster);

            return (
              <button
                className={isSelected ? "booster-card selected" : "booster-card"}
                key={booster.id}
                onClick={() => setSelectedId(booster.id)}
                style={{ "--accent": booster.accent } as React.CSSProperties}
                type="button"
              >
                <span className="booster-franchise">{booster.franchise}</span>
                <span className="pack-art" aria-hidden>
                  <span />
                </span>
                <span className="booster-name">{booster.name}</span>
                <span className="booster-copy">{booster.description}</span>
                <span className="booster-stats">
                  <span>
                    <small>Precio</small>
                    <strong>{formatUsd.format(booster.price)}</strong>
                  </span>
                  <span>
                    <small>Hit</small>
                    <strong>{chance.toFixed(1)}%</strong>
                  </span>
                  <span>
                    <small>EV</small>
                    <strong>{formatUsd.format(ev)}</strong>
                  </span>
                </span>
                <span className="select-line">
                  {isSelected ? (
                    <>
                      <Check size={16} aria-hidden />
                      Seleccionado
                    </>
                  ) : (
                    <>
                      Ver odds
                      <ChevronRight size={16} aria-hidden />
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="simulator-layout" aria-label="Simulador de apertura">
        <div className="opening-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Simulador</span>
              <h2>{selectedBooster.name}</h2>
            </div>
            <span className="price-token">
              {formatUsd.format(selectedBooster.price)}
            </span>
          </div>

          <div className="control-row">
            <label>
              Cantidad
              <span className="stepper" role="group" aria-label="Cantidad de boosters">
                {[1, 3, 5, 10].map((amount) => (
                  <button
                    className={amount === quantity ? "active" : ""}
                    key={amount}
                    onClick={() => setQuantity(amount)}
                    type="button"
                  >
                    {amount}
                  </button>
                ))}
              </span>
            </label>
            <button className="open-button" onClick={openBoosters} type="button">
              <Dice5 size={19} aria-hidden />
              Abrir ahora
            </button>
          </div>

          <div className="metric-strip">
            <div>
              <Gauge size={18} aria-hidden />
              <span>
                <small>Prob. hit</small>
                <strong>{selectedHitChance.toFixed(1)}%</strong>
              </span>
            </div>
            <div>
              <Gem size={18} aria-hidden />
              <span>
                <small>EV estimado</small>
                <strong>{formatUsd.format(selectedEv)}</strong>
              </span>
            </div>
            <div>
              <Trophy size={18} aria-hidden />
              <span>
                <small>Volatilidad</small>
                <strong>{selectedBooster.volatility}</strong>
              </span>
            </div>
          </div>

          <div className="pull-board" aria-live="polite">
            {pulls.length === 0 ? (
              <div className="empty-state">
                <Archive size={32} aria-hidden />
                <strong>Tus aperturas van a aparecer aca</strong>
                <span>
                  La simulacion usa las mismas probabilidades publicadas en el
                  panel de rarezas.
                </span>
              </div>
            ) : (
              pulls.map((pull) => (
                <article
                  className={pull.isHit ? "pull-card hit" : "pull-card"}
                  key={pull.id}
                  style={{ "--rarity": pull.rarity.color } as React.CSSProperties}
                >
                  <span className="card-shine" aria-hidden />
                  <span className="pull-rarity">{pull.rarity.label}</span>
                  <h3>{pull.card}</h3>
                  <div>
                    <strong>{formatUsd.format(pull.value)}</strong>
                    <small>{pull.booster.franchise}</small>
                  </div>
                  {pull.isHit && <span className="hit-badge">HIT</span>}
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="odds-panel" aria-label="Probabilidades del booster seleccionado">
          <div className="panel-heading compact">
            <div>
              <span className="eyebrow">Odds publicados</span>
              <h2>Pool de rarezas</h2>
            </div>
            <span className="inventory-token">{selectedBooster.inventory} cajas</span>
          </div>

          <div className="rarity-list">
            {selectedBooster.rarities
              .slice()
              .sort(
                (a, b) =>
                  rarityOrder.indexOf(b.key) - rarityOrder.indexOf(a.key),
              )
              .map((rarity) => (
                <div className="rarity-row" key={rarity.key}>
                  <div>
                    <span
                      className="rarity-dot"
                      style={{ background: rarity.color }}
                      aria-hidden
                    />
                    <strong>{rarity.label}</strong>
                    <small>
                      {formatUsd.format(rarity.value[0])} -{" "}
                      {formatUsd.format(rarity.value[1])}
                    </small>
                  </div>
                  <div className="odds-bar" aria-label={`${rarity.odds}%`}>
                    <span
                      style={{
                        width: `${Math.max(3, rarity.odds)}%`,
                        background: rarity.color,
                      }}
                    />
                  </div>
                  <strong>{rarity.odds}%</strong>
                </div>
              ))}
          </div>

          <div className="pool-preview">
            <h3>Cartas posibles</h3>
            {selectedBooster.rarities.flatMap((rarity) =>
              rarity.cards.slice(0, 2).map((card) => (
                <span key={`${rarity.key}-${card}`}>{card}</span>
              )),
            )}
          </div>
        </aside>
      </section>

      <section id="modelo" className="model-band" aria-label="Modelo de precio">
        <div className="model-copy">
          <span className="eyebrow">Motor comercial</span>
          <h2>Precio ligado al valor esperado y a la probabilidad del hit</h2>
          <p>
            La idea sana es publicar el inventario, asignar cada carta a una
            rareza, calcular el valor esperado del pool y definir el precio con
            margen, comisiones y reserva operativa. Los hits mas caros entran
            con menor probabilidad, y el booster sube si el pool tiene mas valor
            real.
          </p>
        </div>

        <div className="pricing-console">
          <div className="formula-line">
            <Scale size={20} aria-hidden />
            <span>Precio sugerido = (EV + reserva) / (1 - margen)</span>
          </div>
          <label className="slider-label">
            Margen objetivo: <strong>{margin}%</strong>
            <input
              aria-label="Margen objetivo"
              max="28"
              min="8"
              onChange={(event) => setMargin(Number(event.target.value))}
              type="range"
              value={margin}
            />
          </label>
          <div className="pricing-grid">
            <div>
              <small>Booster actual</small>
              <strong>{formatUsd.format(selectedBooster.price)}</strong>
            </div>
            <div>
              <small>Sugerido</small>
              <strong>{formatUsd.format(calculatedPrice)}</strong>
            </div>
            <div>
              <small>EV pool</small>
              <strong>{formatUsd.format(selectedEv)}</strong>
            </div>
            <div>
              <small>Ultimas aperturas</small>
              <strong>
                {pulls.length ? formatUsd.format(recentValue - spend) : "Sin datos"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-band" aria-label="Controles de confianza">
        <article>
          <LockKeyhole size={22} aria-hidden />
          <h3>Inventario bloqueado</h3>
          <p>
            Cada booster deberia consumir cartas de un pool cerrado antes de
            venderse, con stock y valores congelados por lote.
          </p>
        </article>
        <article>
          <Info size={22} aria-hidden />
          <h3>Odds auditables</h3>
          <p>
            Publica probabilidades, fecha de actualizacion, EV y reglas de
            desempate para evitar una experiencia opaca.
          </p>
        </article>
        <article>
          <ShoppingCart size={22} aria-hidden />
          <h3>Venta responsable</h3>
          <p>
            Antes de pagos reales conviene validar edad, terminos, jurisdiccion,
            contracargos, impuestos y si la mecanica califica como sorteo o azar.
          </p>
        </article>
      </section>
    </main>
  );
}
