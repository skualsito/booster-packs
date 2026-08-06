/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Boxes,
  ChevronDown,
  CircleCheck,
  CircleX,
  Database,
  Dice5,
  Eye,
  Info,
  LockKeyhole,
  LogIn,
  Home,
  PackageOpen,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Truck,
  TriangleAlert,
  User,
  UserPlus,
  Wallet,
  X,
} from "./MaterialIcons";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, SyntheticEvent } from "react";
import type {
  CardGame,
  CardLanguageGroup,
  ExternalCard,
  PrizeItemType,
} from "./lib/card-search";

type PackGame = CardGame | "mixed";
type UserRole = "user" | "admin";

type PackItem = {
  slotId: string;
  card: ExternalCard;
  probability: number;
};

type BoosterPack = {
  id: string;
  name: string;
  series: string;
  game: PackGame;
  price: number;
  accent: string;
  items: PackItem[];
  createdBy: "demo" | "admin";
  shopId?: number;
  shopSlug?: string;
  shopName?: string;
};

type SearchState = {
  game: CardGame;
  query: string;
  setName: string;
  number: string;
  rarity: string;
  results: ExternalCard[];
  error: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  page: number;
  sort: "relevance" | "price-asc" | "price-desc" | "number-desc";
};

type SearchResponse = {
  cards?: ExternalCard[];
  meta?: {
    hasMore?: boolean;
    page?: number;
    total?: number;
  };
  error?: string;
};

type VariantsResponse = {
  groups?: CardLanguageGroup[];
  error?: string;
};

type SelectedCardDetails = {
  card: ExternalCard;
};

type PacksResponse = {
  packs?: BoosterPack[];
  error?: string;
};

type SavePackResponse = {
  pack?: BoosterPack;
  error?: string;
};

type ShopStockItem = {
  id: number;
  card: ExternalCard;
  quantity: number;
};

type ShopStockResponse = {
  stock?: ShopStockItem[] | ShopStockItem;
  deleted?: boolean;
  error?: string;
};

type UserCardItem = {
  id: number;
  packId?: string;
  packName: string;
  card: ExternalCard;
  valueUsd: number;
  status: "owned" | "waiting_stock" | "sold" | "withdrawn" | "upgraded" | "changed";
  shipmentStatus?: "pending" | "shipped" | "delivered";
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  acquiredAt?: string;
};

type UserCardsResponse = {
  cards?: UserCardItem[];
  totalValueUsd?: number;
  ownedValueUsd?: number;
  lifetimeValueUsd?: number;
  error?: string;
};

type UpgraderOptionsResponse = {
  inventory?: UserCardItem[];
  targets?: ShopStockItem[];
  rtp?: number;
  maxChance?: number;
  error?: string;
};

type UpgraderPlayResponse = {
  runId?: string;
  won?: boolean;
  chance?: number;
  roll?: number;
  stakeValueUsd?: number;
  target?: ShopStockItem;
  targetQuantity?: number;
  awardedUserCardId?: number | null;
  awardedUserCardIds?: number[];
  error?: string;
};

type ChangerPlayResponse = {
  runId?: string;
  stakeValueUsd?: number;
  targetValueUsd?: number;
  refundUsd?: number;
  awardedUserCardIds?: number[];
  targets?: Array<{
    stockId: number;
    quantity: number;
    card: ExternalCard;
    unitValueUsd: number;
  }>;
  user?: LoginResponse["user"];
  error?: string;
};

type ShopOrderItem = {
  id: number;
  userId: number;
  username: string;
  displayName?: string;
  packId?: string;
  packName: string;
  card: ExternalCard;
  valueUsd: number;
  status: "owned" | "waiting_stock" | "sold" | "withdrawn";
  shipmentStatus?: "pending" | "shipped" | "delivered";
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  acquiredAt?: string;
};

type ShopOrdersResponse = {
  orders?: ShopOrderItem[];
  reservedCount?: number;
  waitingStockCount?: number;
  withdrawnCount?: number;
  soldCount?: number;
  error?: string;
};

type ShipOrdersResponse = {
  ok?: boolean;
  shippedCount?: number;
  error?: string;
};

type ShopShipmentsResponse = {
  active?: ShopOrderItem[];
  history?: ShopOrderItem[];
  error?: string;
};

type DeliverShipmentResponse = {
  ok?: boolean;
  deliveredCount?: number;
  error?: string;
};

type AdminUserSummary = {
  id: number;
  username: string;
  displayName?: string;
  email?: string;
  prizeCount: number;
  activeCount: number;
  spentValueUsd: number;
  withdrawnValueUsd: number;
};

type AdminUsersResponse = {
  users?: AdminUserSummary[];
  error?: string;
};

type AdminUserCardsResponse = {
  user?: Pick<AdminUserSummary, "id" | "username" | "displayName" | "email">;
  cards?: UserCardItem[];
  error?: string;
};

type WalletResponse = {
  user?: LoginResponse["user"];
  valueUsd?: number;
  error?: string;
};

type OpenPackResponse = {
  item?: PackItem;
  userCardId?: number;
  user?: LoginResponse["user"];
  error?: string;
};

type RecentDrop = {
  id: number;
  username: string;
  displayName?: string;
  packId?: string;
  packName: string;
  packPrice: number;
  card: ExternalCard;
  valueUsd: number;
  acquiredAt?: string;
};

type RecentDropsResponse = {
  drops?: RecentDrop[];
  error?: string;
};

type LoginResponse = {
  token?: string;
  user?: {
    id: number;
    username: string;
    role: UserRole;
    displayName?: string;
    email?: string;
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    street?: string;
    streetNumber?: string;
    floor?: string;
    apartment?: string;
    addressReference?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    hasShippingAddress?: boolean;
    shippingAddressMissing?: string[];
    balanceUsd?: number;
  };
  error?: string;
};

type SessionAuth = {
  token: string;
  id: number;
  username: string;
  role: UserRole;
  displayName?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  street?: string;
  streetNumber?: string;
  floor?: string;
  apartment?: string;
  addressReference?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  hasShippingAddress?: boolean;
  shippingAddressMissing?: string[];
  balanceUsd?: number;
};

type ApiStatus = "checking" | "online" | "offline";
type AppView =
  | "home"
  | "pack"
  | "admin"
  | "admin-stock"
  | "admin-packs"
  | "admin-orders"
  | "admin-shipments"
  | "admin-users"
  | "profile"
  | "cards"
  | "upgrader"
  | "changer";

type RouletteCard = PackItem & {
  spinKey: string;
};

type RouletteState = {
  packId?: string;
  items: RouletteCard[];
  targetIndex: number;
  offset: number;
  phase: "idle" | "spinning" | "done";
  runId: number;
  result?: PackItem;
};

const AUTH_STORAGE_KEY = "pullario-session-v1";
const LEGACY_AUTH_STORAGE_KEY = "hitshelf-session-v1";
const LOCAL_API_BASE = (
  process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:3004"
).replace(/\/$/, "");
const ROULETTE_CARD_WIDTH = 164;
const ROULETTE_GAP = 10;
const ROULETTE_STRIDE = ROULETTE_CARD_WIDTH + ROULETTE_GAP;
const HIT_PROBABILITY_THRESHOLD = 10;
const UPGRADER_LANDING_INSET = 0.2;
const HIT_CELEBRATION_PIECES = Array.from({ length: 28 }, (_, index) => ({
  color: ["#ffcf4a", "#73e4d7", "#ff7897", "#8dde72"][index % 4],
  delay: `${(index % 7) * 55}ms`,
  left: `${4 + ((index * 37) % 92)}%`,
  rotation: `${(index * 47) % 180}deg`,
}));

const safeUpgraderLandingPercent = (
  roll: number,
  chance: number,
  won: boolean,
) => {
  const safeChance = Math.min(100, Math.max(0, chance));

  if (won) {
    const normalizedRoll = safeChance > 0 ? Math.min(1, roll / safeChance) : 0.5;
    return (
      safeChance *
      (UPGRADER_LANDING_INSET +
        normalizedRoll * (1 - UPGRADER_LANDING_INSET * 2))
    );
  }

  const lossSize = Math.max(0, 100 - safeChance);
  const normalizedRoll =
    lossSize > 0 ? Math.min(1, Math.max(0, (roll - safeChance) / lossSize)) : 0.5;
  return (
    safeChance +
    lossSize *
      (UPGRADER_LANDING_INSET +
        normalizedRoll * (1 - UPGRADER_LANDING_INSET * 2))
  );
};

const formatUsd = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const formatPercent = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
});

const formatDateTime = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatCardDate = (value?: string) => {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Sin fecha" : formatDateTime.format(date);
};

const gameLabels: Record<PackGame, string> = {
  "one-piece": "One Piece",
  pokemon: "Pokemon",
  magic: "Magic",
  mixed: "Mixto",
};

const gameAccents: Record<PackGame, string> = {
  "one-piece": "#15c8ff",
  pokemon: "#ffcc33",
  magic: "#c084fc",
  mixed: "#ff4f7b",
};

const cardGames: CardGame[] = ["one-piece", "pokemon", "magic"];
const argentinaProvinces = [
  "Buenos Aires",
  "Ciudad Autonoma de Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Cordoba",
  "Corrientes",
  "Entre Rios",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquen",
  "Rio Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucuman",
];

const prizeItemTypes: PrizeItemType[] = ["card", "sealed-pack", "sealed-box"];

const prizeTypeLabels: Record<PrizeItemType, string> = {
  card: "Carta",
  "sealed-pack": "Sobre sellado",
  "sealed-box": "Caja sellada",
};

const prizeTypeShortLabels: Record<PrizeItemType, string> = {
  card: "Cartas",
  "sealed-pack": "Sobres",
  "sealed-box": "Cajas",
};

const itemTypeOf = (card: ExternalCard): PrizeItemType =>
  card.itemType ?? "card";

const isCardPrize = (card: ExternalCard) => itemTypeOf(card) === "card";

const roleLabels: Record<UserRole, string> = {
  user: "Usuario registrado",
  admin: "Administrador",
};

const cardStatusLabels: Record<UserCardItem["status"], string> = {
  owned: "Disponible",
  waiting_stock: "Esperando stock",
  sold: "Vendida",
  withdrawn: "Retirada",
  upgraded: "Usada en Upgrader",
  changed: "Usada en Changer",
};

const orderStatusLabels: Record<UserCardItem["status"], string> = {
  owned: "Ganada",
  waiting_stock: "Esperando stock",
  sold: "Vendida",
  withdrawn: "Retiro confirmado",
  upgraded: "Usada en Upgrader",
  changed: "Usada en Changer",
};

const isSellerRole = (role?: UserRole) => role === "admin";

const fallbackImages: Record<CardGame, string> = {
  "one-piece": "https://optcgapi.com/media/static/Card_Images/OP01-001.jpg",
  pokemon: "https://images.pokemontcg.io/base1/4_hires.png",
  magic:
    "https://cards.scryfall.io/normal/front/7/7/77bdf609-2d7e-4bdb-a9fd-8b5eeebd6e0e.jpg?1562738291",
};

const fallbackSealedImage = "/favicon.svg";

const makeCard = (card: ExternalCard): ExternalCard => card;

const demoPacks: BoosterPack[] = [
  {
    id: "demo-romance-dawn",
    name: "Romance Dawn Chase",
    series: "OP-01 Romance Dawn",
    game: "one-piece",
    price: 18,
    accent: gameAccents["one-piece"],
    createdBy: "demo",
    items: [
      {
        slotId: "op-zoro-manga",
        probability: 0.05,
        card: makeCard({
          id: "OP01-001-p1",
          game: "one-piece",
          name: "Roronoa Zoro (Manga)",
          setName: "Romance Dawn",
          number: "OP01-001",
          rarity: "Leader Parallel",
          imageUrl: "https://optcgapi.com/media/static/Card_Images/OP01-001_p1.jpg",
          priceUsd: 1983.33,
          priceSource: "OPTCG API market",
          updatedAt: "2026-07-22",
        }),
      },
      {
        slotId: "op-zoro-leader",
        probability: 4.2,
        card: makeCard({
          id: "OP01-001",
          game: "one-piece",
          name: "Roronoa Zoro (001)",
          setName: "Romance Dawn",
          number: "OP01-001",
          rarity: "L",
          imageUrl: "https://optcgapi.com/media/static/Card_Images/OP01-001.jpg",
          priceUsd: 6.05,
          priceSource: "OPTCG API market",
          updatedAt: "2026-07-22",
        }),
      },
      {
        slotId: "op-perona",
        probability: 16,
        card: makeCard({
          id: "OP01-077",
          game: "one-piece",
          name: "Perona",
          setName: "Romance Dawn",
          number: "OP01-077",
          rarity: "UC",
          imageUrl: "https://optcgapi.com/media/static/Card_Images/OP01-077.jpg",
          priceUsd: 0.96,
          priceSource: "OPTCG API market",
          updatedAt: "2026-07-22",
        }),
      },
      {
        slotId: "op-diable-jambe",
        probability: 26,
        card: makeCard({
          id: "ST01-016",
          game: "one-piece",
          name: "Diable Jambe",
          setName: "Starter Deck 1: Straw Hat Crew",
          number: "ST01-016",
          rarity: "C",
          imageUrl: "https://optcgapi.com/media/static/Card_Images/ST01-016.jpg",
          priceUsd: 0.42,
          priceSource: "OPTCG API market",
          updatedAt: "2026-07-23",
        }),
      },
      {
        slotId: "op-don-egghead",
        probability: 53.75,
        card: makeCard({
          id: "don-egghead",
          game: "one-piece",
          name: "DON!! Card (Egghead)",
          setName: "DON!! Cards",
          number: "DON",
          rarity: "DON!!",
          imageUrl:
            "https://optcgapi.com/media/static/Card_Images/DON_Card_Egghead_-_The_Azure_Seas_Seven_OP14_img.jpg",
          priceUsd: 0.46,
          priceSource: "OPTCG API market",
          updatedAt: "2026-07-23",
        }),
      },
    ],
  },
  {
    id: "demo-kanto",
    name: "Kanto Vault",
    series: "Pokemon Vintage + Modern",
    game: "pokemon",
    price: 14,
    accent: gameAccents.pokemon,
    createdBy: "demo",
    items: [
      {
        slotId: "pk-blaines-charizard",
        probability: 0.08,
        card: makeCard({
          id: "gym2-2",
          game: "pokemon",
          name: "Blaine's Charizard",
          setName: "Gym Challenge",
          number: "2",
          rarity: "Rare Holo",
          imageUrl: "https://images.pokemontcg.io/gym2/2_hires.png",
          priceUsd: 573.82,
          priceSource: "PokemonTCG.io / TCGplayer",
          updatedAt: "2026/07/23",
        }),
      },
      {
        slotId: "pk-base-charizard",
        probability: 0.12,
        card: makeCard({
          id: "base1-4",
          game: "pokemon",
          name: "Charizard",
          setName: "Base",
          number: "4",
          rarity: "Rare Holo",
          imageUrl: "https://images.pokemontcg.io/base1/4_hires.png",
          priceUsd: 399.99,
          priceSource: "PokemonTCG.io / sample",
          updatedAt: "local",
        }),
      },
      {
        slotId: "pk-pikachu",
        probability: 18,
        card: makeCard({
          id: "base1-58",
          game: "pokemon",
          name: "Pikachu",
          setName: "Base",
          number: "58",
          rarity: "Common",
          imageUrl: "https://images.pokemontcg.io/base1/58_hires.png",
          priceUsd: 2.42,
          priceSource: "PokemonTCG.io / sample",
          updatedAt: "local",
        }),
      },
      {
        slotId: "pk-energy",
        probability: 81.8,
        card: makeCard({
          id: "base1-98",
          game: "pokemon",
          name: "Fire Energy",
          setName: "Base",
          number: "98",
          rarity: "Common",
          imageUrl: "https://images.pokemontcg.io/base1/98_hires.png",
          priceUsd: 0.35,
          priceSource: "PokemonTCG.io / sample",
          updatedAt: "local",
        }),
      },
    ],
  },
  {
    id: "demo-cross",
    name: "Cross-TCG Jackpot",
    series: "Mixed hits",
    game: "mixed",
    price: 35,
    accent: gameAccents.mixed,
    createdBy: "demo",
    items: [
      {
        slotId: "mix-zoro",
        probability: 0.12,
        card: makeCard({
          id: "mix-op-zoro",
          game: "one-piece",
          name: "Roronoa Zoro (Manga)",
          setName: "Romance Dawn",
          number: "OP01-001",
          rarity: "Leader Parallel",
          imageUrl: "https://optcgapi.com/media/static/Card_Images/OP01-001_p1.jpg",
          priceUsd: 1983.33,
          priceSource: "OPTCG API market",
          updatedAt: "2026-07-22",
        }),
      },
      {
        slotId: "mix-charizard",
        probability: 0.22,
        card: makeCard({
          id: "mix-charizard",
          game: "pokemon",
          name: "Blaine's Charizard",
          setName: "Gym Challenge",
          number: "2",
          rarity: "Rare Holo",
          imageUrl: "https://images.pokemontcg.io/gym2/2_hires.png",
          priceUsd: 573.82,
          priceSource: "PokemonTCG.io / TCGplayer",
          updatedAt: "2026/07/23",
        }),
      },
      {
        slotId: "mix-bolt",
        probability: 9.66,
        card: makeCard({
          id: "mix-lightning-bolt",
          game: "magic",
          name: "Lightning Bolt",
          setName: "Magic",
          number: "various",
          rarity: "Common",
          imageUrl:
            "https://cards.scryfall.io/normal/front/7/7/77bdf609-2d7e-4bdb-a9fd-8b5eeebd6e0e.jpg?1562738291",
          priceUsd: 6.31,
          priceSource: "Scryfall sample",
          updatedAt: "local",
        }),
      },
      {
        slotId: "mix-floor",
        probability: 90,
        card: makeCard({
          id: "mix-don",
          game: "one-piece",
          name: "DON!! Card (Egghead)",
          setName: "DON!! Cards",
          number: "DON",
          rarity: "DON!!",
          imageUrl:
            "https://optcgapi.com/media/static/Card_Images/DON_Card_Egghead_-_The_Azure_Seas_Seven_OP14_img.jpg",
          priceUsd: 0.46,
          priceSource: "OPTCG API market",
          updatedAt: "2026-07-23",
        }),
      },
    ],
  },
];

const newSearchState = (game: CardGame, query: string): SearchState => ({
  game,
  query,
  setName: "",
  number: "",
  rarity: "",
  results: [],
  error: "",
  loading: false,
  loadingMore: false,
  hasMore: false,
  page: 0,
  sort: "relevance",
});

const localApiUrl = (path: string) => `${LOCAL_API_BASE}${path}`;

const parseSessionAuth = (raw: string | null): SessionAuth | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SessionAuth;
    return parsed?.token &&
      parsed?.username &&
      (parsed.role === "user" || parsed.role === "admin")
      ? parsed
      : null;
  } catch {
    return null;
  }
};

const localImageUrl = (imageUrl: string) =>
  imageUrl.startsWith("https://www.onepiece-cardgame.com/")
    ? `/api/images/proxy?url=${encodeURIComponent(imageUrl)}`
    : imageUrl;

const cardImage = (card: ExternalCard) =>
  card.imageUrl
    ? localImageUrl(card.imageUrl)
    : isCardPrize(card)
      ? fallbackImages[card.game]
      : fallbackSealedImage;

const handleImageError =
  (game: CardGame, itemType: PrizeItemType = "card") =>
  (event: SyntheticEvent<HTMLImageElement>) => {
    const fallback =
      itemType === "card" ? fallbackImages[game] : fallbackSealedImage;

    if (event.currentTarget.src !== fallback) {
      event.currentTarget.src = fallback;
    }
  };

const languageLabelForCard = (card: ExternalCard) => {
  if (card.languageLabel) {
    return card.languageLabel;
  }

  if (card.id.startsWith("onepiece-jp:") || card.id.startsWith("tcgdex:ja:")) {
    return "Japones";
  }

  if (card.id.startsWith("tcgdex:zh-cn:")) {
    return "Chino simplificado";
  }

  if (card.id.startsWith("tcgdex:zh-tw:")) {
    return "Chino tradicional";
  }

  return "Ingles";
};

const singleCardLanguageGroup = (card: ExternalCard): CardLanguageGroup => ({
  language: card.language ?? "en",
  label: languageLabelForCard(card),
  cards: [card],
});

const variantLoadingSteps = (game: CardGame) =>
  game === "pokemon"
    ? [
        "Ubicando set y numero exacto",
        "Buscando equivalencia japonesa",
        "Buscando chino tradicional",
        "Buscando chino simplificado",
        "Validando especie e ilustracion",
        "Cruzando precios",
      ]
    : game === "one-piece"
      ? [
          "Ubicando print exacto",
          "Buscando version inglesa",
          "Buscando version japonesa",
          "Consultando precio japones",
          "Cruzando imagenes y fuentes",
        ]
      : [
          "Ubicando print exacto",
          "Buscando versiones",
          "Cruzando precios",
        ];

const packProbabilityTotal = (pack: Pick<BoosterPack, "items">) =>
  pack.items.reduce((total, item) => total + Math.max(0, item.probability), 0);

const normalizedProbability = (
  item: PackItem,
  pack: Pick<BoosterPack, "items">,
) => {
  const total = packProbabilityTotal(pack);
  return total > 0 ? (Math.max(0, item.probability) / total) * 100 : 0;
};

const packExpectedValue = (pack: Pick<BoosterPack, "items">) => {
  const total = packProbabilityTotal(pack);
  if (!total) {
    return 0;
  }

  return pack.items.reduce((ev, item) => {
    const price = item.card.priceUsd ?? 0;
    return ev + price * (Math.max(0, item.probability) / total);
  }, 0);
};

const packHitChance = (pack: BoosterPack) =>
  pack.items.reduce((total, item) => {
    const price = item.card.priceUsd ?? 0;
    return price >= pack.price ? total + normalizedProbability(item, pack) : total;
  }, 0);

const topItem = (pack: BoosterPack) =>
  [...pack.items].sort((a, b) => (b.card.priceUsd ?? 0) - (a.card.priceUsd ?? 0))[0];

const TARGET_PAYOUT_RATE = 0.7;
const MAX_PRICE_WEIGHT_EXPONENT = 8;
const PREMIUM_PROBABILITY_MASS = 12;
const PREMIUM_EV_FLOOR_RATE = 0.015;
const PREMIUM_PRICE_WEIGHT_EXPONENT = 2;
const MINIMUM_ITEM_PROBABILITY = 0.01;

const weightedPick = (items: PackItem[]) => {
  const total = items.reduce(
    (sum, item) => sum + Math.max(0, item.probability),
    0,
  );

  if (total <= 0) {
    return items[0];
  }

  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Math.max(0, item.probability);
    if (roll <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
};

const roundProbabilities = (probabilities: number[]) => {
  if (!probabilities.length) {
    return probabilities;
  }

  const minimum = Math.min(
    MINIMUM_ITEM_PROBABILITY,
    Number((100 / probabilities.length).toFixed(3)),
  );
  const rounded = probabilities.map((probability) =>
    Math.max(minimum, Number(Math.max(0, probability).toFixed(3))),
  );
  let adjustment = Number(
    (100 - rounded.reduce((sum, probability) => sum + probability, 0)).toFixed(
      3,
    ),
  );

  if (adjustment > 0) {
    const targetIndex = rounded.reduce(
      (bestIndex, probability, index) =>
        probability > rounded[bestIndex] ? index : bestIndex,
      0,
    );
    rounded[targetIndex] = Number(
      (rounded[targetIndex] + adjustment).toFixed(3),
    );
    adjustment = 0;
  }

  if (adjustment < 0) {
    const indexesByProbability = rounded
      .map((probability, index) => ({ index, probability }))
      .sort((a, b) => b.probability - a.probability);

    for (const { index } of indexesByProbability) {
      const removable = Number((rounded[index] - minimum).toFixed(3));
      const amount = Math.min(removable, Math.abs(adjustment));

      if (amount > 0) {
        rounded[index] = Number((rounded[index] - amount).toFixed(3));
        adjustment = Number((adjustment + amount).toFixed(3));
      }

      if (adjustment === 0) {
        break;
      }
    }
  }

  return rounded;
};

const premiumItemCount = (itemCount: number) => {
  if (itemCount >= 14) return 5;
  if (itemCount >= 7) return 3;
  if (itemCount >= 4) return 2;
  return Math.min(1, Math.max(0, itemCount - 1));
};

const tieredProbabilities = (
  items: PackItem[],
  targetEv: number,
  exponent = 0,
) => {
  const pricedItems = items
    .map((item, index) => ({
      index,
      price: Math.max(item.card.priceUsd ?? 0, 0.05),
    }))
    .sort((a, b) => b.price - a.price);
  const premiumCount = premiumItemCount(items.length);
  const premiumItems = pricedItems.slice(0, premiumCount);
  const regularItems = pricedItems.slice(premiumCount);
  const probabilities = Array.from({ length: items.length }, () => 0);

  if (!regularItems.length) {
    return probabilities.map(() => 100 / items.length);
  }

  const premiumWeights = premiumItems.map(
    (item) => 1 / Math.pow(item.price, PREMIUM_PRICE_WEIGHT_EXPONENT),
  );
  const premiumShareTotal = premiumWeights.reduce(
    (total, weight) => total + weight,
    0,
  );
  const premiumAveragePrice = premiumShareTotal
    ? premiumItems.reduce(
        (total, item, index) =>
          total + item.price * (premiumWeights[index] ?? 0),
        0,
      ) / premiumShareTotal
    : 0;
  const premiumExpectedValueBudget =
    targetEv * (PREMIUM_EV_FLOOR_RATE / TARGET_PAYOUT_RATE);
  const premiumExpectedValuePerMass = premiumAveragePrice / 100;
  const minimumPremiumMass =
    premiumExpectedValuePerMass > 0
      ? premiumExpectedValueBudget / premiumExpectedValuePerMass
      : 0;
  const cheapestRegularPrice = Math.min(
    ...regularItems.map((item) => item.price),
  );
  const maximumProfitablePremiumMass =
    premiumAveragePrice > cheapestRegularPrice
      ? ((targetEv - cheapestRegularPrice) /
          (premiumAveragePrice - cheapestRegularPrice)) *
        100
      : PREMIUM_PROBABILITY_MASS;
  const premiumMass = Math.max(
    Math.min(PREMIUM_PROBABILITY_MASS, minimumPremiumMass),
    Math.min(
      PREMIUM_PROBABILITY_MASS,
      Math.max(0, maximumProfitablePremiumMass * 0.85),
    ),
  );

  premiumItems.forEach((item, index) => {
    probabilities[item.index] =
      premiumShareTotal > 0
        ? (premiumMass * (premiumWeights[index] ?? 0)) / premiumShareTotal
        : 0;
  });

  const cheapRank = new Map(
    [...regularItems]
      .sort((a, b) => a.price - b.price)
      .slice(0, 3)
      .map((item, index) => [item.index, index]),
  );
  const cheapTierWeights = [4, 3, 2.2];
  const regularWeights = regularItems.map((item) => {
    const rank = cheapRank.get(item.index);
    const tierWeight = rank === undefined ? 1 : cheapTierWeights[rank];
    return tierWeight / Math.pow(item.price, exponent);
  });
  const regularWeightTotal = regularWeights.reduce(
    (total, weight) => total + weight,
    0,
  );
  const regularMass = 100 - premiumMass;

  regularItems.forEach((item, index) => {
    probabilities[item.index] =
      regularWeightTotal > 0
        ? (regularWeights[index] / regularWeightTotal) * regularMass
        : regularMass / regularItems.length;
  });

  return probabilities;
};

const expectedValueFromProbabilities = (
  items: PackItem[],
  probabilities: number[],
) =>
  items.reduce(
    (ev, item, index) =>
      ev + (item.card.priceUsd ?? 0) * ((probabilities[index] ?? 0) / 100),
    0,
  );

const normalizeItems = (items: PackItem[], packPrice = 0) => {
  if (!items.length) {
    return items;
  }

  const targetEv = Math.max(0, packPrice) * TARGET_PAYOUT_RATE;

  if (!targetEv) {
    const probabilities = roundProbabilities(tieredProbabilities(items, 0));

    return items.map((item, index) => ({
      ...item,
      probability: probabilities[index] ?? 0,
    }));
  }

  let bestProbabilities = tieredProbabilities(items, targetEv);

  if (expectedValueFromProbabilities(items, bestProbabilities) > targetEv) {
    let low = 0;
    let high = MAX_PRICE_WEIGHT_EXPONENT;
    bestProbabilities = tieredProbabilities(items, targetEv, high);

    for (let attempt = 0; attempt < 28; attempt += 1) {
      const exponent = (low + high) / 2;
      const probabilities = tieredProbabilities(items, targetEv, exponent);
      const ev = expectedValueFromProbabilities(items, probabilities);

      if (ev > targetEv) {
        low = exponent;
      } else {
        high = exponent;
        bestProbabilities = probabilities;
      }
    }
  }

  const probabilities = roundProbabilities(bestProbabilities);

  return items.map((item, index) => ({
    ...item,
    probability: probabilities[index] ?? 0,
  }));
};

export function BoosterMarket({
  initialPackId,
  view = "home",
}: {
  initialPackId?: string;
  view?: AppView;
}) {
  const [selectedPackId, setSelectedPackId] = useState(
    initialPackId ?? demoPacks[0].id,
  );
  const [savedPacks, setSavedPacks] = useState<BoosterPack[]>([]);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [session, setSession] = useState<SessionAuth | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [homeAuthOpen, setHomeAuthOpen] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminSaving, setAdminSaving] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileFullName, setProfileFullName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileStreet, setProfileStreet] = useState("");
  const [profileStreetNumber, setProfileStreetNumber] = useState("");
  const [profileFloor, setProfileFloor] = useState("");
  const [profileApartment, setProfileApartment] = useState("");
  const [profileAddressReference, setProfileAddressReference] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileProvince, setProfileProvince] = useState("");
  const [profilePostalCode, setProfilePostalCode] = useState("");
  const [profileCountry, setProfileCountry] = useState("Argentina");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSectionView, setProfileSectionView] = useState<
    "personal" | "inventory"
  >("personal");
  const [publicSearch, setPublicSearch] = useState<SearchState>(
    newSearchState("one-piece", ""),
  );
  const [adminSearch, setAdminSearch] = useState<SearchState>(
    newSearchState("pokemon", ""),
  );
  const [selectedCard, setSelectedCard] = useState<SelectedCardDetails | null>(
    null,
  );
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState("50");
  const [walletMessage, setWalletMessage] = useState("");
  const [walletSaving, setWalletSaving] = useState(false);
  const [wonCardsOpen, setWonCardsOpen] = useState(false);
  const [wonCards, setWonCards] = useState<UserCardItem[]>([]);
  const [wonCardsMessage, setWonCardsMessage] = useState("");
  const [wonCardsMessageTone, setWonCardsMessageTone] = useState<
    "info" | "success" | "warning" | "error"
  >("info");
  const [wonCardBusyId, setWonCardBusyId] = useState<number | null>(null);
  const [upgraderTargets, setUpgraderTargets] = useState<ShopStockItem[]>([]);
  const [upgraderStakeIds, setUpgraderStakeIds] = useState<number[]>([]);
  const [upgraderTargetId, setUpgraderTargetId] = useState<number | null>(null);
  const [upgraderTargetQuantity, setUpgraderTargetQuantity] = useState(1);
  const [upgraderQuery, setUpgraderQuery] = useState("");
  const [upgraderGame, setUpgraderGame] = useState<PackGame>("mixed");
  const [upgraderPreset, setUpgraderPreset] = useState<number | null>(null);
  const [upgraderMinPrice, setUpgraderMinPrice] = useState("");
  const [upgraderMaxPrice, setUpgraderMaxPrice] = useState("");
  const [upgraderLoading, setUpgraderLoading] = useState(false);
  const [upgraderPlaying, setUpgraderPlaying] = useState(false);
  const [upgraderRotation, setUpgraderRotation] = useState(0);
  const [upgraderOutcome, setUpgraderOutcome] =
    useState<UpgraderPlayResponse | null>(null);
  const upgraderTimerRef = useRef<number | null>(null);
  const [changerTargets, setChangerTargets] = useState<ShopStockItem[]>([]);
  const [changerStakeIds, setChangerStakeIds] = useState<number[]>([]);
  const [changerTargetQuantities, setChangerTargetQuantities] = useState<Record<number, number>>({});
  const [changerQuery, setChangerQuery] = useState("");
  const [changerGame, setChangerGame] = useState<PackGame>("mixed");
  const [changerLoading, setChangerLoading] = useState(false);
  const [changerSaving, setChangerSaving] = useState(false);
  const [changerOutcome, setChangerOutcome] = useState<ChangerPlayResponse | null>(null);
  const [inventoryActiveOnly, setInventoryActiveOnly] = useState(false);
  const [inventoryPriceSort, setInventoryPriceSort] = useState<
    "price-desc" | "price-asc"
  >("price-desc");
  const [profilePrizeView, setProfilePrizeView] = useState<
    "inventory" | "shipments"
  >("inventory");
  const [shopStock, setShopStock] = useState<ShopStockItem[]>([]);
  const [stockMessage, setStockMessage] = useState("");
  const [stockBusyId, setStockBusyId] = useState<number | null>(null);
  const [stockEditor, setStockEditor] = useState<ShopStockItem | null>(null);
  const [stockEditPrice, setStockEditPrice] = useState("");
  const [stockEditImageUrl, setStockEditImageUrl] = useState("");
  const [stockEditError, setStockEditError] = useState("");
  const [stockEditSaving, setStockEditSaving] = useState(false);
  const [stockQuantityDrafts, setStockQuantityDrafts] = useState<
    Record<number, string>
  >({});
  const [stockGameFilter, setStockGameFilter] = useState<PackGame>("mixed");
  const [stockPrizeFilter, setStockPrizeFilter] = useState<PrizeItemType | "all">(
    "all",
  );
  const [packStockGameFilter, setPackStockGameFilter] =
    useState<PackGame>("mixed");
  const [packPrizeFilter, setPackPrizeFilter] = useState<PrizeItemType | "all">(
    "all",
  );
  const [sealedType, setSealedType] = useState<Exclude<PrizeItemType, "card">>(
    "sealed-pack",
  );
  const [sealedGame, setSealedGame] = useState<CardGame>("one-piece");
  const [sealedName, setSealedName] = useState("");
  const [sealedSetName, setSealedSetName] = useState("");
  const [sealedPrice, setSealedPrice] = useState(0);
  const [sealedImageUrl, setSealedImageUrl] = useState("");
  const [sealedQuantity, setSealedQuantity] = useState(1);
  const [sealedQuery, setSealedQuery] = useState("");
  const [sealedResults, setSealedResults] = useState<ExternalCard[]>([]);
  const [sealedSearchLoading, setSealedSearchLoading] = useState(false);
  const [sealedSearchError, setSealedSearchError] = useState("");
  const [manualSealedOpen, setManualSealedOpen] = useState(false);
  const [shopOrders, setShopOrders] = useState<ShopOrderItem[]>([]);
  const [ordersMessage, setOrdersMessage] = useState("");
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<number[]>([]);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shipmentTrackingNumber, setShipmentTrackingNumber] = useState("");
  const [shippingOrders, setShippingOrders] = useState(false);
  const [activeShipments, setActiveShipments] = useState<ShopOrderItem[]>([]);
  const [shipmentHistory, setShipmentHistory] = useState<ShopOrderItem[]>([]);
  const [shipmentView, setShipmentView] = useState<"active" | "history">(
    "active",
  );
  const [shipmentsMessage, setShipmentsMessage] = useState("");
  const [shipmentBusyKey, setShipmentBusyKey] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserSummary[]>([]);
  const [adminUserQuery, setAdminUserQuery] = useState("");
  const [selectedAdminUser, setSelectedAdminUser] =
    useState<AdminUserSummary | null>(null);
  const [adminUserCards, setAdminUserCards] = useState<UserCardItem[]>([]);
  const [adminUsersMessage, setAdminUsersMessage] = useState("");
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminInventoryActiveOnly, setAdminInventoryActiveOnly] =
    useState(false);
  const [adminInventoryMinPrice, setAdminInventoryMinPrice] = useState("");
  const [adminInventoryMaxPrice, setAdminInventoryMaxPrice] = useState("");
  const [adminInventorySort, setAdminInventorySort] = useState<
    "price-desc" | "price-asc" | "date-desc" | "date-asc"
  >("date-desc");
  const [adminUserView, setAdminUserView] = useState<
    "inventory" | "shipments"
  >("inventory");
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("Caja personalizada");
  const [draftSeries, setDraftSeries] = useState("Mi serie local");
  const [draftGame, setDraftGame] = useState<PackGame>("mixed");
  const [draftPrice, setDraftPrice] = useState(20);
  const [draftItems, setDraftItems] = useState<PackItem[]>([]);
  const [draftPriceSort, setDraftPriceSort] = useState<
    "price-desc" | "price-asc"
  >("price-desc");
  const [recentDrops, setRecentDrops] = useState<RecentDrop[]>([]);
  const [recentDropsLoading, setRecentDropsLoading] = useState(false);
  const [openingPack, setOpeningPack] = useState(false);
  const [roulette, setRoulette] = useState<RouletteState>({
    items: [],
    targetIndex: 0,
    offset: 0,
    phase: "idle",
    runId: 0,
  });
  const [celebratingRunId, setCelebratingRunId] = useState<number | null>(null);
  const spinTimers = useRef<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rouletteTrackRef = useRef<HTMLDivElement | null>(null);
  const rouletteTickFrameRef = useRef<number | null>(null);
  const upgraderNeedleRef = useRef<HTMLDivElement | null>(null);
  const upgraderTickFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!wonCardsMessage) {
      return;
    }

    const timer = window.setTimeout(() => setWonCardsMessage(""), 8000);
    return () => window.clearTimeout(timer);
  }, [wonCardsMessage]);

  useEffect(() => {
    const storedSession = parseSessionAuth(
      localStorage.getItem(AUTH_STORAGE_KEY) ??
        localStorage.getItem(LEGACY_AUTH_STORAGE_KEY),
    );

    if (!storedSession) {
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedSession));
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    setSession(storedSession);
    setProfileDisplayName(storedSession.displayName ?? "");
    setProfileEmail(storedSession.email ?? "");
    setProfileFullName(storedSession.fullName ?? "");
    setProfilePhone(storedSession.phone ?? "");
    setProfileStreet(storedSession.street ?? storedSession.addressLine1 ?? "");
    setProfileStreetNumber(storedSession.streetNumber ?? "");
    setProfileFloor(storedSession.floor ?? "");
    setProfileApartment(storedSession.apartment ?? "");
    setProfileAddressReference(
      storedSession.addressReference ?? storedSession.addressLine2 ?? "",
    );
    setProfileCity(storedSession.city ?? "");
    setProfileProvince(storedSession.province ?? "");
    setProfilePostalCode(storedSession.postalCode ?? "");
    setProfileCountry(storedSession.country?.trim() || "Argentina");

    void fetch(localApiUrl("/api/me"), {
      headers: { Authorization: `Bearer ${storedSession.token}` },
    })
      .then(async (response) => {
        const payload = (await response.json()) as LoginResponse;

        if (!response.ok || !payload.user) {
          if (response.status === 401) {
            setSession(null);
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
          return;
        }

        const refreshedSession: SessionAuth = {
          ...storedSession,
          ...payload.user,
          token: storedSession.token,
        };
        setSession(refreshedSession);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshedSession));
        setProfileDisplayName(refreshedSession.displayName ?? "");
        setProfileEmail(refreshedSession.email ?? "");
        setProfileFullName(refreshedSession.fullName ?? "");
        setProfilePhone(refreshedSession.phone ?? "");
        setProfileStreet(
          refreshedSession.street ?? refreshedSession.addressLine1 ?? "",
        );
        setProfileStreetNumber(refreshedSession.streetNumber ?? "");
        setProfileFloor(refreshedSession.floor ?? "");
        setProfileApartment(refreshedSession.apartment ?? "");
        setProfileAddressReference(
          refreshedSession.addressReference ??
            refreshedSession.addressLine2 ??
            "",
        );
        setProfileCity(refreshedSession.city ?? "");
        setProfileProvince(refreshedSession.province ?? "");
        setProfilePostalCode(refreshedSession.postalCode ?? "");
        setProfileCountry(refreshedSession.country?.trim() || "Argentina");
      })
      .catch(() => undefined);
  }, []);

  const loadDbPacks = useCallback(async () => {
    setApiStatus("checking");

    try {
      const response = await fetch(localApiUrl("/api/packs"));
      const payload = (await response.json()) as PacksResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudieron cargar las cajas.");
      }

      setSavedPacks(payload.packs ?? []);
      setApiStatus("online");
      return payload.packs ?? [];
    } catch {
      setApiStatus("offline");
      return [];
    }
  }, []);

  const loadWonCards = useCallback(async () => {
    if (!session) {
      return [];
    }

    try {
      const response = await fetch(localApiUrl("/api/me/cards"), {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const payload = (await response.json()) as UserCardsResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo leer tus cartas.");
      }

      setWonCards(payload.cards ?? []);
      return payload.cards ?? [];
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo leer tus cartas.",
      );
      return [];
    }
  }, [session]);

  const loadUpgraderOptions = useCallback(async () => {
    setUpgraderLoading(true);
    try {
      const response = await fetch(localApiUrl("/api/upgrader"), {
        headers: session
          ? { Authorization: `Bearer ${session.token}` }
          : undefined,
      });
      const payload = (await response.json()) as UpgraderOptionsResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo cargar el Upgrader.");
      }

      if (session) {
        setWonCards((current) => {
          const history = current.filter(
            (item) => item.status !== "owned" && item.status !== "waiting_stock",
          );
          return [...(payload.inventory ?? []), ...history];
        });
      }
      setUpgraderTargets(payload.targets ?? []);
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo cargar el Upgrader.",
      );
    } finally {
      setUpgraderLoading(false);
    }
  }, [session]);

  const loadChangerOptions = useCallback(async () => {
    setChangerLoading(true);
    try {
      const response = await fetch(localApiUrl("/api/changer"), {
        headers: session
          ? { Authorization: `Bearer ${session.token}` }
          : undefined,
      });
      const payload = (await response.json()) as UpgraderOptionsResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo cargar el Changer.");
      }

      if (session) {
        setWonCards((current) => {
          const history = current.filter(
            (item) => item.status !== "owned" && item.status !== "waiting_stock",
          );
          return [...(payload.inventory ?? []), ...history];
        });
      }
      setChangerTargets(payload.targets ?? []);
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo cargar el Changer.",
      );
    } finally {
      setChangerLoading(false);
    }
  }, [session]);

  const loadShopStock = useCallback(async () => {
    if (!session || !isSellerRole(session.role)) {
      return [];
    }

    try {
      const response = await fetch(localApiUrl("/api/admin/stock"), {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const payload = (await response.json()) as ShopStockResponse;

      if (!response.ok || payload.error || !Array.isArray(payload.stock)) {
        throw new Error(payload.error ?? "No se pudo leer el stock.");
      }

      setShopStock(payload.stock);
      setStockMessage("");
      return payload.stock;
    } catch (error) {
      setStockMessage(
        error instanceof Error ? error.message : "No se pudo leer el stock.",
      );
      return [];
    }
  }, [session]);

  const loadShopOrders = useCallback(async () => {
    if (!session || !isSellerRole(session.role)) {
      return [];
    }

    try {
      const response = await fetch(localApiUrl("/api/admin/orders"), {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const payload = (await response.json()) as ShopOrdersResponse;

      if (!response.ok || payload.error || !Array.isArray(payload.orders)) {
        throw new Error(payload.error ?? "No se pudieron leer los pedidos.");
      }

      setShopOrders(payload.orders);
      setOrdersMessage("");
      const activeOrderIds = new Set(payload.orders.map((order) => order.id));
      setSelectedShipmentIds((current) =>
        current.filter((orderId) => activeOrderIds.has(orderId)),
      );
      return payload.orders;
    } catch (error) {
      setOrdersMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron leer los pedidos.",
      );
      return [];
    }
  }, [session]);

  const toggleShipmentSelection = (orderId: number) => {
    const targetOrder = shopOrders.find((order) => order.id === orderId);

    if (!targetOrder) {
      return;
    }

    setSelectedShipmentIds((current) => {
      if (current.includes(orderId)) {
        return current.filter((id) => id !== orderId);
      }

      const selectedUserId = shopOrders.find(
        (order) => order.id === current[0],
      )?.userId;

      return selectedUserId && selectedUserId !== targetOrder.userId
        ? [orderId]
        : [...current, orderId];
    });
  };

  const markSelectedOrdersShipped = async () => {
    if (
      !session ||
      !isSellerRole(session.role) ||
      !selectedShipmentsReady ||
      shipmentTrackingNumber.trim().length < 3
    ) {
      return;
    }

    setShippingOrders(true);
    setOrdersMessage("");

    try {
      const response = await fetch(localApiUrl("/api/admin/orders/ship"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipments: selectedShipmentIds.map((id) => ({
            id,
            trackingNumber: shipmentTrackingNumber.trim(),
          })),
        }),
      });
      const payload = (await response.json()) as ShipOrdersResponse;

      if (!response.ok || payload.error || !payload.ok) {
        throw new Error(payload.error ?? "No se pudieron confirmar los envios.");
      }

      const shippedCount = payload.shippedCount ?? selectedShipmentIds.length;
      setSelectedShipmentIds([]);
      setShipmentTrackingNumber("");
      setShippingModalOpen(false);
      await loadShopOrders();
      setOrdersMessage(
        `${shippedCount} ${shippedCount === 1 ? "retiro marcado" : "retiros marcados"} como enviado.`,
      );
    } catch (error) {
      setOrdersMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron confirmar los envios.",
      );
    } finally {
      setShippingOrders(false);
    }
  };

  const loadShopShipments = useCallback(async () => {
    if (!session || !isSellerRole(session.role)) {
      return;
    }

    try {
      const response = await fetch(localApiUrl("/api/admin/shipments"), {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const payload = (await response.json()) as ShopShipmentsResponse;

      if (
        !response.ok ||
        payload.error ||
        !Array.isArray(payload.active) ||
        !Array.isArray(payload.history)
      ) {
        throw new Error(payload.error ?? "No se pudieron leer los envios.");
      }

      setActiveShipments(payload.active);
      setShipmentHistory(payload.history);
      setShipmentsMessage("");
    } catch (error) {
      setShipmentsMessage(
        error instanceof Error ? error.message : "No se pudieron leer los envios.",
      );
    }
  }, [session]);

  const markShipmentReceived = async (ids: number[], shipmentKey: string) => {
    if (!session || !isSellerRole(session.role) || !ids.length) {
      return;
    }

    setShipmentBusyKey(shipmentKey);
    setShipmentsMessage("");

    try {
      const response = await fetch(localApiUrl("/api/admin/shipments/deliver"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      const payload = (await response.json()) as DeliverShipmentResponse;

      if (!response.ok || payload.error || !payload.ok) {
        throw new Error(payload.error ?? "No se pudo confirmar la entrega.");
      }

      await loadShopShipments();
      setShipmentsMessage("Entrega confirmada y guardada en el historial.");
    } catch (error) {
      setShipmentsMessage(
        error instanceof Error ? error.message : "No se pudo confirmar la entrega.",
      );
    } finally {
      setShipmentBusyKey(null);
    }
  };

  const loadAdminUsers = useCallback(
    async (query = "") => {
      if (!session || !isSellerRole(session.role)) {
        return;
      }

      setAdminUsersLoading(true);
      setAdminUsersMessage("");

      try {
        const params = new URLSearchParams({ query: query.trim() });
        const response = await fetch(
          localApiUrl(`/api/admin/users?${params.toString()}`),
          { headers: { Authorization: `Bearer ${session.token}` } },
        );
        const payload = (await response.json()) as AdminUsersResponse;

        if (!response.ok || payload.error || !Array.isArray(payload.users)) {
          throw new Error(payload.error ?? "No se pudieron leer los usuarios.");
        }

        const normalizedUsers = payload.users.map((user) => ({
          ...user,
          spentValueUsd: Number.isFinite(Number(user.spentValueUsd))
            ? Number(user.spentValueUsd)
            : 0,
          withdrawnValueUsd: Number.isFinite(Number(user.withdrawnValueUsd))
            ? Number(user.withdrawnValueUsd)
            : 0,
        }));

        setAdminUsers(normalizedUsers);
        setSelectedAdminUser((currentUser) => {
          if (!currentUser) {
            return null;
          }

          return (
            normalizedUsers.find((user) => user.id === currentUser.id) ??
            currentUser
          );
        });
      } catch (error) {
        setAdminUsersMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron leer los usuarios.",
        );
      } finally {
        setAdminUsersLoading(false);
      }
    },
    [session],
  );

  const loadAdminUserCards = async (user: AdminUserSummary) => {
    if (!session || !isSellerRole(session.role)) {
      return;
    }

    setSelectedAdminUser(user);
    setAdminUserCards([]);
    setAdminUsersLoading(true);
    setAdminUsersMessage("");

    try {
      const response = await fetch(
        localApiUrl(`/api/admin/users/${encodeURIComponent(user.id)}/cards`),
        { headers: { Authorization: `Bearer ${session.token}` } },
      );
      const payload = (await response.json()) as AdminUserCardsResponse;

      if (!response.ok || payload.error || !Array.isArray(payload.cards)) {
        throw new Error(payload.error ?? "No se pudo leer el inventario.");
      }

      setAdminUserCards(payload.cards);
    } catch (error) {
      setAdminUsersMessage(
        error instanceof Error ? error.message : "No se pudo leer el inventario.",
      );
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const loadRecentDrops = useCallback(async (packId: string) => {
    if (!packId.trim()) {
      setRecentDrops([]);
      return [];
    }

    setRecentDropsLoading(true);

    try {
      const params = new URLSearchParams({ packId, limit: "12" });
      const response = await fetch(localApiUrl(`/api/drops?${params.toString()}`));
      const payload = (await response.json()) as RecentDropsResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudieron leer las caidas.");
      }

      setRecentDrops(payload.drops ?? []);
      return payload.drops ?? [];
    } catch {
      setRecentDrops([]);
      return [];
    } finally {
      setRecentDropsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDbPacks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDbPacks]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadWonCards();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadWonCards, session]);

  useEffect(() => {
    if (view !== "upgrader") {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadUpgraderOptions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadUpgraderOptions, session, view]);

  useEffect(() => {
    if (view !== "changer") return;
    const timer = window.setTimeout(() => void loadChangerOptions(), 0);
    return () => window.clearTimeout(timer);
  }, [loadChangerOptions, session, view]);

  useEffect(() => {
    setChangerStakeIds([]);
    setChangerTargetQuantities({});
    setChangerOutcome(null);
  }, [session?.id]);

  useEffect(
    () => () => {
      if (upgraderTimerRef.current !== null) {
        window.clearTimeout(upgraderTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isSellerRole(session?.role)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadShopStock();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadShopStock, session?.role]);

  useEffect(() => {
    if (!isSellerRole(session?.role)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadShopOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadShopOrders, session?.role]);

  useEffect(() => {
    if (
      !isSellerRole(session?.role) ||
      (view !== "admin-shipments" && view !== "admin")
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadShopShipments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadShopShipments, session?.role, view]);

  useEffect(() => {
    if (
      !isSellerRole(session?.role) ||
      (view !== "admin-users" && view !== "admin")
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadAdminUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAdminUsers, session?.role, view]);

  useEffect(() => {
    return () => {
      spinTimers.current.forEach((timer) => window.clearTimeout(timer));
      if (rouletteTickFrameRef.current !== null) {
        window.cancelAnimationFrame(rouletteTickFrameRef.current);
      }
      if (upgraderTickFrameRef.current !== null) {
        window.cancelAnimationFrame(upgraderTickFrameRef.current);
      }
      if (audioContextRef.current) {
        const audioContext = audioContextRef.current;
        audioContextRef.current = null;
        if (audioContext.state !== "closed") {
          void audioContext.close();
        }
      }
    };
  }, []);

  const packs = useMemo(
    () => (savedPacks.length ? savedPacks : demoPacks),
    [savedPacks],
  );
  const sellerPacks = isSellerRole(session?.role) ? savedPacks : [];
  const activePackId = view === "pack" && initialPackId ? initialPackId : selectedPackId;
  const selectedPackExists = packs.some((pack) => pack.id === activePackId);
  const selectedPack = packs.find((pack) => pack.id === activePackId) ?? packs[0];
  const selectedTopItem = topItem(selectedPack);
  const heroShowcaseItems = [...selectedPack.items]
    .sort((a, b) => (b.card.priceUsd ?? 0) - (a.card.priceUsd ?? 0))
    .slice(0, 4);
  const rouletteBelongsToSelectedPack = roulette.packId === selectedPack.id;
  const visibleRouletteItems = rouletteBelongsToSelectedPack ? roulette.items : [];
  const visibleRouletteOffset = rouletteBelongsToSelectedPack ? roulette.offset : 0;
  const visibleRoulettePhase = rouletteBelongsToSelectedPack
    ? roulette.phase
    : "idle";
  const visibleRouletteResult = rouletteBelongsToSelectedPack
    ? roulette.result
    : undefined;
  const visibleRouletteRunId = rouletteBelongsToSelectedPack
    ? roulette.runId
    : 0;
  useEffect(() => {
    if (selectedPack.createdBy === "demo") {
      setRecentDrops([]);
      return;
    }

    const timer = window.setTimeout(() => {
      void loadRecentDrops(selectedPack.id);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRecentDrops, selectedPack.createdBy, selectedPack.id]);

  const idleRouletteItems = useMemo(() => {
    if (!selectedPack.items.length) {
      return [];
    }

    const seed = Array.from(selectedPack.id).reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    );
    const orderedItems = [...selectedPack.items].sort((first, second) => {
      const firstScore = Array.from(`${first.slotId}-${seed}`).reduce(
        (total, character) => (total * 31 + character.charCodeAt(0)) % 2147483647,
        7,
      );
      const secondScore = Array.from(`${second.slotId}-${seed}`).reduce(
        (total, character) => (total * 31 + character.charCodeAt(0)) % 2147483647,
        7,
      );

      return firstScore - secondScore;
    });
    const previewLength = Math.max(10, orderedItems.length);
    const previewItems = Array.from({ length: previewLength }, (_, index) =>
      index < orderedItems.length
        ? orderedItems[index]
        : orderedItems[(seed + index * 7) % orderedItems.length],
    );

    return previewItems.map((item, index) => ({
      ...item,
      spinKey: `idle-${selectedPack.id}-${index}`,
    }));
  }, [selectedPack]);
  const draftProbabilityTotal = draftItems.reduce(
    (total, item) => total + Math.max(0, item.probability),
    0,
  );
  const draftExpectedValue = packExpectedValue({ items: draftItems });
  const draftMargin = draftPrice - draftExpectedValue;
  const ownedWonCards = session
    ? wonCards.filter(
        (item) => item.status === "owned" || item.status === "waiting_stock",
      )
    : [];
  const ownedWonCardsValue = ownedWonCards.reduce(
    (total, item) => total + Math.max(0, item.valueUsd),
    0,
  );
  const upgraderStakeCards = ownedWonCards.filter((item) =>
    upgraderStakeIds.includes(item.id),
  );
  const upgraderStakeValue = Number(
    upgraderStakeCards
      .reduce((total, item) => total + Math.max(0, item.valueUsd), 0)
      .toFixed(2),
  );
  const upgraderTarget =
    upgraderTargets.find((item) => item.id === upgraderTargetId) ?? null;
  const upgraderTargetMaxQuantity = Math.min(
    20,
    Math.max(1, upgraderTarget?.quantity ?? 1),
  );
  const upgraderTargetValue = Number(
    (
      Number(upgraderTarget?.card.priceUsd ?? 0) * upgraderTargetQuantity
    ).toFixed(2),
  );
  const upgraderChance =
    upgraderStakeValue > 0 && upgraderTargetValue > upgraderStakeValue
      ? Math.min(
          80,
          (upgraderStakeValue / upgraderTargetValue) * 100 * 0.9,
        )
      : 0;
  const upgraderMultiplier =
    upgraderStakeValue > 0 && upgraderTargetValue > 0
      ? upgraderTargetValue / upgraderStakeValue
      : 0;
  const parsedUpgraderMinPrice = Number(upgraderMinPrice);
  const parsedUpgraderMaxPrice = Number(upgraderMaxPrice);
  const effectiveUpgraderMinPrice =
    upgraderMinPrice.trim() && Number.isFinite(parsedUpgraderMinPrice)
      ? Math.max(0, parsedUpgraderMinPrice)
      : 0;
  const effectiveUpgraderMaxPrice =
    upgraderMaxPrice.trim() && Number.isFinite(parsedUpgraderMaxPrice)
      ? Math.max(0, parsedUpgraderMaxPrice)
      : Number.POSITIVE_INFINITY;

  useEffect(() => {
    setUpgraderTargetQuantity(1);
  }, [upgraderTargetId]);

  useEffect(() => {
    if (upgraderPreset === null) {
      return;
    }

    setUpgraderMinPrice(
      upgraderStakeValue > 0
        ? String(Number((upgraderStakeValue * upgraderPreset).toFixed(2)))
        : "",
    );
    setUpgraderMaxPrice("");
    setUpgraderTargetId(null);
  }, [upgraderPreset, upgraderStakeValue]);

  const filteredUpgraderTargets = upgraderTargets.filter((item) => {
    const price = Number(item.card.priceUsd ?? 0);
    const maximumTargetValue = price * Math.min(20, Math.max(1, item.quantity));
    const repeatsStake = upgraderStakeCards.some(
      (stake) =>
        stake.card.id === item.card.id &&
        stake.card.game === item.card.game &&
        itemTypeOf(stake.card) === itemTypeOf(item.card),
    );
    const gameMatches =
      upgraderGame === "mixed" || item.card.game === upgraderGame;
    const query = upgraderQuery.trim().toLocaleLowerCase("es");
    const queryMatches =
      !query ||
      item.card.name.toLocaleLowerCase("es").includes(query) ||
      item.card.setName.toLocaleLowerCase("es").includes(query);

    return (
      !repeatsStake &&
      maximumTargetValue > upgraderStakeValue &&
      price >= effectiveUpgraderMinPrice &&
      price <= effectiveUpgraderMaxPrice &&
      gameMatches &&
      queryMatches
    );
  });
  const changerStakeCards = ownedWonCards.filter((item) =>
    changerStakeIds.includes(item.id),
  );
  const changerStakeValue = Number(
    changerStakeCards
      .reduce((total, item) => total + Math.max(0, item.valueUsd), 0)
      .toFixed(2),
  );
  const changerSelectedTargets = changerTargets
    .map((item) => ({
      item,
      quantity: changerTargetQuantities[item.id] ?? 0,
    }))
    .filter((selection) => selection.quantity > 0);
  const changerTargetUnits = changerSelectedTargets.reduce(
    (total, selection) => total + selection.quantity,
    0,
  );
  const changerTargetValue = Number(
    changerSelectedTargets
      .reduce(
        (total, selection) =>
          total + Number(selection.item.card.priceUsd ?? 0) * selection.quantity,
        0,
      )
      .toFixed(2),
  );
  const changerRefund = Number(
    Math.max(0, changerStakeValue - changerTargetValue).toFixed(2),
  );
  const filteredChangerTargets = changerTargets.filter((item) => {
    const query = changerQuery.trim().toLocaleLowerCase("es");
    return (
      (changerGame === "mixed" || item.card.game === changerGame) &&
      (!query ||
        item.card.name.toLocaleLowerCase("es").includes(query) ||
        item.card.setName.toLocaleLowerCase("es").includes(query))
    );
  });
  const visibleInventoryCards = wonCards
    .filter(
      (item) =>
        item.status !== "withdrawn" &&
        (!inventoryActiveOnly ||
          item.status === "owned" ||
          item.status === "waiting_stock"),
    )
    .sort((left, right) =>
      inventoryPriceSort === "price-desc"
        ? right.valueUsd - left.valueUsd
        : left.valueUsd - right.valueUsd,
    );
  const userWithdrawalGroups = Object.values(
    wonCards
      .filter((item) => item.status === "withdrawn")
      .reduce<
        Record<
          string,
          {
            key: string;
            trackingNumber?: string;
            shipmentStatus: "pending" | "shipped" | "delivered";
            shippedAt?: string;
            deliveredAt?: string;
            items: UserCardItem[];
          }
        >
      >((groups, item) => {
        const shipmentStatus = item.shipmentStatus ?? "pending";
        const key = item.trackingNumber
          ? `tracking:${item.trackingNumber}`
          : `pending:${shipmentStatus}`;
        const group = groups[key] ?? {
          key,
          trackingNumber: item.trackingNumber,
          shipmentStatus,
          shippedAt: item.shippedAt,
          deliveredAt: item.deliveredAt,
          items: [],
        };

        group.items.push(item);
        group.shipmentStatus = shipmentStatus;
        group.shippedAt = item.shippedAt ?? group.shippedAt;
        group.deliveredAt = item.deliveredAt ?? group.deliveredAt;
        groups[key] = group;
        return groups;
      }, {}),
  ).sort((left, right) => {
    const leftDate =
      left.deliveredAt ?? left.shippedAt ?? left.items[0]?.acquiredAt ?? "";
    const rightDate =
      right.deliveredAt ?? right.shippedAt ?? right.items[0]?.acquiredAt ?? "";
    return rightDate.localeCompare(leftDate);
  });
  const sortedDraftItems = [...draftItems].sort((left, right) => {
    const leftPrice = left.card.priceUsd ?? 0;
    const rightPrice = right.card.priceUsd ?? 0;

    return draftPriceSort === "price-desc"
      ? rightPrice - leftPrice
      : leftPrice - rightPrice;
  });
  const withdrawnOrderCount = shopOrders.filter(
    (item) => item.status === "withdrawn",
  ).length;
  const filteredShopStock = shopStock.filter((item) => {
    const gameMatches =
      stockGameFilter === "mixed" || item.card.game === stockGameFilter;
    const typeMatches =
      stockPrizeFilter === "all" || itemTypeOf(item.card) === stockPrizeFilter;

    return gameMatches && typeMatches;
  });
  const packBuilderStock = shopStock.filter((item) => {
    if (item.quantity <= 0) {
      return false;
    }

    const gameMatches =
      draftGame === "mixed" || item.card.game === draftGame;
    const filterMatches =
      packStockGameFilter === "mixed" ||
      item.card.game === packStockGameFilter;
    const typeMatches =
      packPrizeFilter === "all" || itemTypeOf(item.card) === packPrizeFilter;

    return gameMatches && filterMatches && typeMatches;
  }).sort(
    (left, right) =>
      (right.card.priceUsd ?? 0) - (left.card.priceUsd ?? 0),
  );
  const groupedShopOrders = Object.values(
    shopOrders.reduce<
      Record<
        string,
        {
          userId: number;
          username: string;
          displayName?: string;
          orders: ShopOrderItem[];
        }
      >
    >((groups, order) => {
      const key = String(order.userId);
      const group = groups[key] ?? {
        userId: order.userId,
        username: order.username,
        displayName: order.displayName,
        orders: [],
      };

      group.orders.push(order);
      groups[key] = group;
      return groups;
    }, {}),
  ).sort((left, right) =>
    (left.displayName || left.username).localeCompare(
      right.displayName || right.username,
    ),
  );
  const selectedShipmentsReady = selectedShipmentIds.length > 0;
  const selectedShipmentUserId = shopOrders.find(
    (order) => order.id === selectedShipmentIds[0],
  )?.userId;
  const groupShipmentItems = (items: ShopOrderItem[]) =>
    Object.values(
      items.reduce<
        Record<
          string,
          {
            key: string;
            userId: number;
            username: string;
            displayName?: string;
            trackingNumber: string;
            shippedAt?: string;
            deliveredAt?: string;
            items: ShopOrderItem[];
          }
        >
      >((groups, item) => {
        const trackingNumber = item.trackingNumber || "Sin seguimiento";
        const key = `${item.userId}:${trackingNumber}`;
        const group = groups[key] ?? {
          key,
          userId: item.userId,
          username: item.username,
          displayName: item.displayName,
          trackingNumber,
          shippedAt: item.shippedAt,
          deliveredAt: item.deliveredAt,
          items: [],
        };

        group.items.push(item);
        groups[key] = group;
        return groups;
      }, {}),
    );
  const activeShipmentGroups = groupShipmentItems(activeShipments);
  const shipmentHistoryGroups = groupShipmentItems(shipmentHistory);
  const minAdminPrice = Number(adminInventoryMinPrice);
  const maxAdminPrice = Number(adminInventoryMaxPrice);
  const visibleAdminUserCards = adminUserCards
    .filter((item) => {
      const activeMatches =
        !adminInventoryActiveOnly ||
        item.status === "owned" ||
        item.status === "waiting_stock";
      const minMatches =
        !adminInventoryMinPrice.trim() ||
        (Number.isFinite(minAdminPrice) && item.valueUsd >= minAdminPrice);
      const maxMatches =
        !adminInventoryMaxPrice.trim() ||
        (Number.isFinite(maxAdminPrice) && item.valueUsd <= maxAdminPrice);

      return activeMatches && minMatches && maxMatches;
    })
    .sort((left, right) => {
      if (adminInventorySort === "price-desc") {
        return right.valueUsd - left.valueUsd;
      }
      if (adminInventorySort === "price-asc") {
        return left.valueUsd - right.valueUsd;
      }

      const leftDate = new Date(left.acquiredAt ?? 0).getTime();
      const rightDate = new Date(right.acquiredAt ?? 0).getTime();
      return adminInventorySort === "date-desc"
        ? rightDate - leftDate
        : leftDate - rightDate;
    });
  const adminUserWithdrawalGroups = Object.values(
    adminUserCards
      .filter((item) => item.status === "withdrawn")
      .reduce<
        Record<
          string,
          {
            key: string;
            trackingNumber?: string;
            shipmentStatus: "pending" | "shipped" | "delivered";
            shippedAt?: string;
            deliveredAt?: string;
            items: UserCardItem[];
          }
        >
      >((groups, item) => {
        const shipmentStatus = item.shipmentStatus ?? "pending";
        const key = item.trackingNumber
          ? `tracking:${item.trackingNumber}`
          : `pending:${shipmentStatus}`;
        const group = groups[key] ?? {
          key,
          trackingNumber: item.trackingNumber,
          shipmentStatus,
          shippedAt: item.shippedAt,
          deliveredAt: item.deliveredAt,
          items: [],
        };

        group.items.push(item);
        groups[key] = group;
        return groups;
      }, {}),
  ).sort((left, right) => {
    const leftDate = new Date(
      left.deliveredAt ?? left.shippedAt ?? left.items[0]?.acquiredAt ?? 0,
    ).getTime();
    const rightDate = new Date(
      right.deliveredAt ?? right.shippedAt ?? right.items[0]?.acquiredAt ?? 0,
    ).getTime();
    return rightDate - leftDate;
  });
  const stockCountsByGame = cardGames.reduce(
    (counts, game) => ({
      ...counts,
      [game]: shopStock.filter((item) => item.card.game === game).length,
    }),
    {} as Record<CardGame, number>,
  );
  const stockCountsByType = prizeItemTypes.reduce(
    (counts, itemType) => ({
      ...counts,
      [itemType]: shopStock.filter(
        (item) => itemTypeOf(item.card) === itemType,
      ).length,
    }),
    {} as Record<PrizeItemType, number>,
  );
  const stockQuantityForCard = (card: ExternalCard) =>
    shopStock.find(
      (item) =>
        item.card.id === card.id &&
        item.card.game === card.game &&
        itemTypeOf(item.card) === itemTypeOf(card),
    )
      ?.quantity ?? 0;

  const showCardDetails = (card: ExternalCard) => {
    setSelectedCard({ card });
  };

  const runSearch = async (
    context: "public" | "admin",
    override?: Partial<SearchState>,
    append = false,
  ) => {
    const current = context === "public" ? publicSearch : adminSearch;

    if (append && (current.loading || current.loadingMore || !current.hasMore)) {
      return;
    }

    const next = { ...current, ...override };
    const setter = context === "public" ? setPublicSearch : setAdminSearch;
    const query = next.query.trim();
    const setName = next.setName.trim();
    const number = next.number.trim();

    if (query.length < 2 && setName.length < 2) {
      setter({
        ...next,
        error: "Escribi una carta o un set para buscar.",
        results: [],
        hasMore: false,
        loadingMore: false,
        page: 0,
      });
      return;
    }

    const requestedPage = append ? current.page + 1 : 1;
    setter({
      ...next,
      loading: !append,
      loadingMore: append,
      error: "",
      results: append ? current.results : [],
      hasMore: append ? current.hasMore : false,
      page: append ? current.page : 0,
    });

    try {
      const params = new URLSearchParams({ game: next.game });

      if (query) {
        params.set("q", query);
      }

      if (setName) {
        params.set("set", setName);
      }

      if (number) {
        params.set("number", number);
      }

      if (next.rarity.trim()) {
        params.set("rarity", next.rarity.trim());
      }

      params.set("page", String(requestedPage));
      params.set("sort", next.sort);

      const response = await fetch(`/api/cards/search?${params.toString()}`);
      const payload = (await response.json()) as SearchResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo buscar.");
      }

      setter((currentState) => {
        if (
          currentState.game !== next.game ||
          currentState.query !== next.query ||
          currentState.setName !== next.setName ||
          currentState.number !== next.number ||
          currentState.rarity !== next.rarity ||
          currentState.sort !== next.sort
        ) {
          return currentState;
        }

        const incomingCards = payload.cards ?? [];
        const results = append
          ? Array.from(
              new Map(
                [...currentState.results, ...incomingCards].map((card) => [
                  `${card.game}:${card.id}`,
                  card,
                ]),
              ).values(),
            )
          : incomingCards;

        return {
          ...currentState,
          results,
          loading: false,
          loadingMore: false,
          hasMore: payload.meta?.hasMore ?? false,
          page: payload.meta?.page ?? requestedPage,
          error: "",
        };
      });
    } catch (error) {
      setter((currentState) => {
        if (
          currentState.game !== next.game ||
          currentState.query !== next.query ||
          currentState.setName !== next.setName ||
          currentState.number !== next.number ||
          currentState.rarity !== next.rarity ||
          currentState.sort !== next.sort
        ) {
          return currentState;
        }

        return {
          ...currentState,
          results: append ? currentState.results : [],
          loading: false,
          loadingMore: false,
          hasMore: false,
          error: error instanceof Error ? error.message : "No se pudo buscar.",
        };
      });
    }
  };

  const storeSession = (nextSession: SessionAuth) => {
    setSession(nextSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    setProfileDisplayName(nextSession.displayName ?? "");
    setProfileEmail(nextSession.email ?? "");
    setProfileFullName(nextSession.fullName ?? "");
    setProfilePhone(nextSession.phone ?? "");
    setProfileStreet(nextSession.street ?? nextSession.addressLine1 ?? "");
    setProfileStreetNumber(nextSession.streetNumber ?? "");
    setProfileFloor(nextSession.floor ?? "");
    setProfileApartment(nextSession.apartment ?? "");
    setProfileAddressReference(
      nextSession.addressReference ?? nextSession.addressLine2 ?? "",
    );
    setProfileCity(nextSession.city ?? "");
    setProfileProvince(nextSession.province ?? "");
    setProfilePostalCode(nextSession.postalCode ?? "");
    setProfileCountry(nextSession.country?.trim() || "Argentina");
  };

  const updateSessionUser = (user?: LoginResponse["user"]) => {
    if (!session || !user) {
      return;
    }

    storeSession({
      ...session,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      street: user.street,
      streetNumber: user.streetNumber,
      floor: user.floor,
      apartment: user.apartment,
      addressReference: user.addressReference,
      city: user.city,
      province: user.province,
      postalCode: user.postalCode,
      country: user.country,
      hasShippingAddress: user.hasShippingAddress,
      shippingAddressMissing: user.shippingAddressMissing,
      balanceUsd: user.balanceUsd,
    });
  };

  const submitAuth = async () => {
    setAuthMessage("");
    setApiStatus("checking");
    let nextApiStatus: ApiStatus = "offline";

    try {
      const response = await fetch(
        localApiUrl(
          authMode === "login" ? "/api/auth/login" : "/api/auth/register",
        ),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loginUsername,
            password: loginPassword,
            email: loginEmail,
          }),
        },
      );
      const payload = (await response.json()) as LoginResponse;
      nextApiStatus = response.status >= 500 ? "offline" : "online";

      if (!response.ok || payload.error || !payload.token || !payload.user) {
        throw new Error(payload.error ?? "No se pudo iniciar sesion.");
      }

      const auth: SessionAuth = {
        token: payload.token,
        ...payload.user,
      };

      storeSession(auth);
      setHomeAuthOpen(false);
      setLoginPassword("");
      setApiStatus("online");
      setAuthMessage(
        payload.user.role === "admin"
          ? "Sesion admin iniciada."
          : "Sesion iniciada.",
      );
      await loadDbPacks();
    } catch (error) {
      setApiStatus(nextApiStatus);
      setAuthMessage(
        error instanceof Error
          ? error.message
          : "No se pudo conectar con el servidor local.",
      );
    }
  };

  const logout = () => {
    if (session) {
      void fetch(localApiUrl("/api/auth/logout"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      }).catch(() => undefined);
    }

    setSession(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthMessage("Sesion cerrada.");
    setProfileDisplayName("");
    setProfileEmail("");
    setProfileFullName("");
    setProfilePhone("");
    setProfileStreet("");
    setProfileStreetNumber("");
    setProfileFloor("");
    setProfileApartment("");
    setProfileAddressReference("");
    setProfileCity("");
    setProfileProvince("");
    setProfilePostalCode("");
    setProfileCountry("Argentina");
    setProfilePassword("");
    setWonCards([]);
    setShopStock([]);
    setShopOrders([]);
    setWalletOpen(false);
    setWonCardsOpen(false);
  };

  const addCardToDraft = (card: ExternalCard) => {
    setDraftItems((current) => {
      if (
        current.some(
          (item) =>
            item.card.id === card.id &&
            item.card.game === card.game &&
            itemTypeOf(item.card) === itemTypeOf(card),
        )
      ) {
        return current;
      }

      const nextProbability = current.length ? 5 : 100;
      return [
        ...current,
        {
          slotId: `${card.game}-${card.id}-${crypto.randomUUID()}`,
          card,
          probability: nextProbability,
        },
      ];
    });
  };

  const updateDraftProbability = (slotId: string, value: number) => {
    setDraftItems((current) =>
      current.map((item) =>
        item.slotId === slotId
          ? { ...item, probability: Number(Math.max(0, value).toFixed(3)) }
          : item,
      ),
    );
  };

  const removeDraftItem = (slotId: string) => {
    setDraftItems((current) => current.filter((item) => item.slotId !== slotId));
  };

  const addCardToStock = async (card: ExternalCard, quantity = 1) => {
    if (!session || !isSellerRole(session.role)) {
      setStockMessage("Inicia sesion como administrador para cargar stock.");
      return false;
    }

    setStockMessage("");

    try {
      const response = await fetch(localApiUrl("/api/admin/stock"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ card, quantity }),
      });
      const payload = (await response.json()) as ShopStockResponse;

      if (
        !response.ok ||
        payload.error ||
        !payload.stock ||
        Array.isArray(payload.stock)
      ) {
        throw new Error(payload.error ?? "No se pudo sumar al stock.");
      }

      setShopStock((current) => [
        payload.stock as ShopStockItem,
        ...current.filter((item) => item.id !== (payload.stock as ShopStockItem).id),
      ]);
      setStockMessage(`${card.name} sumado al stock.`);
      return true;
    } catch (error) {
      setStockMessage(
        error instanceof Error ? error.message : "No se pudo sumar al stock.",
      );
      return false;
    }
  };

  const addSealedProductToStock = async () => {
    const name = sealedName.trim();
    const setName = sealedSetName.trim();

    if (!name || !setName || sealedPrice <= 0 || sealedQuantity < 1) {
      setStockMessage(
        "Completa nombre, expansion, precio y cantidad del producto sellado.",
      );
      return;
    }

    const product: ExternalCard = {
      id: `${sealedType}-${crypto.randomUUID()}`,
      game: sealedGame,
      itemType: sealedType,
      name,
      setName,
      rarity: prizeTypeLabels[sealedType],
      imageUrl: sealedImageUrl.trim() || undefined,
      priceUsd: Number(Math.max(0, sealedPrice).toFixed(2)),
      priceSource: "Precio manual de Pullario",
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    const added = await addCardToStock(product, Math.floor(sealedQuantity));

    if (!added) {
      return;
    }

    setSealedName("");
    setSealedSetName("");
    setSealedPrice(0);
    setManualSealedOpen(true);
    setSealedImageUrl("");
    setSealedQuantity(1);
  };

  const searchSealedProducts = async () => {
    const query = sealedQuery.trim();

    if (query.length < 2) {
      setSealedSearchError("Escribi una expansion o producto.");
      setSealedResults([]);
      return;
    }

    setSealedSearchLoading(true);
    setSealedSearchError("");
    setSealedResults([]);

    try {
      const params = new URLSearchParams({ game: sealedGame, q: query });
      const response = await fetch(`/api/sealed/search?${params.toString()}`);
      const payload = (await response.json()) as {
        products?: ExternalCard[];
        error?: string;
      };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudieron buscar productos.");
      }

      setSealedResults(payload.products ?? []);
      if (!payload.products?.length) {
        setSealedSearchError(
          "No encontramos sobres o cajas con esa busqueda. Podes cargarlos manualmente.",
        );
      }
    } catch (error) {
      setSealedSearchError(
        error instanceof Error
          ? error.message
          : "No se pudieron buscar productos sellados.",
      );
    } finally {
      setSealedSearchLoading(false);
    }
  };

  const selectSealedSearchResult = async (product: ExternalCard) => {
    if (typeof product.priceUsd === "number" && product.priceUsd > 0) {
      await addCardToStock(product, 1);
      return;
    }

    setSealedType(
      itemTypeOf(product) === "sealed-box" ? "sealed-box" : "sealed-pack",
    );
    setSealedGame(product.game);
    setSealedName(product.name);
    setSealedSetName(product.setName);
    setSealedImageUrl(product.imageUrl ?? "");
    setSealedPrice(0);
    setStockMessage(
      `${product.name} no tiene precio de mercado. Completa el precio en la carga manual.`,
    );
  };

  const updateStockQuantity = async (
    stockItem: ShopStockItem,
    quantity: number,
  ) => {
    if (!session || !isSellerRole(session.role)) {
      return;
    }

    setStockBusyId(stockItem.id);
    setStockMessage("");

    try {
      const response = await fetch(
        localApiUrl(`/api/admin/stock/${encodeURIComponent(stockItem.id)}`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        },
      );
      const payload = (await response.json()) as ShopStockResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo actualizar el stock.");
      }

      if (payload.deleted) {
        setShopStock((current) =>
          current.filter((item) => item.id !== stockItem.id),
        );
      } else if (payload.stock && !Array.isArray(payload.stock)) {
        setShopStock((current) =>
          current.map((item) =>
            item.id === stockItem.id ? (payload.stock as ShopStockItem) : item,
          ),
        );
      }
      setStockQuantityDrafts((current) => {
        const next = { ...current };
        delete next[stockItem.id];
        return next;
      });
    } catch (error) {
      setStockQuantityDrafts((current) => {
        const next = { ...current };
        delete next[stockItem.id];
        return next;
      });
      setStockMessage(
        error instanceof Error ? error.message : "No se pudo actualizar el stock.",
      );
    } finally {
      setStockBusyId(null);
    }
  };

  const openStockEditor = (stockItem: ShopStockItem) => {
    setStockEditor(stockItem);
    setStockEditPrice(
      typeof stockItem.card.priceUsd === "number"
        ? String(stockItem.card.priceUsd)
        : "",
    );
    setStockEditImageUrl(stockItem.card.imageUrl ?? "");
    setStockEditError("");
  };

  const saveStockDetails = async () => {
    if (!session || !isSellerRole(session.role) || !stockEditor) {
      return;
    }

    const priceUsd = Number(stockEditPrice.replace(",", "."));

    if (!Number.isFinite(priceUsd) || priceUsd < 0) {
      setStockEditError("Ingresa un precio valido.");
      return;
    }

    setStockEditSaving(true);
    setStockEditError("");

    try {
      const response = await fetch(
        localApiUrl(`/api/admin/stock/${encodeURIComponent(stockEditor.id)}`),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            card: {
              ...stockEditor.card,
              imageUrl: stockEditImageUrl.trim() || undefined,
              priceUsd,
            },
          }),
        },
      );
      const payload = (await response.json()) as ShopStockResponse;

      if (
        !response.ok ||
        payload.error ||
        !payload.stock ||
        Array.isArray(payload.stock)
      ) {
        throw new Error(payload.error ?? "No se pudo editar el producto.");
      }

      const updatedStock = payload.stock as ShopStockItem;
      setShopStock((current) =>
        current.map((item) =>
          item.id === updatedStock.id ? updatedStock : item,
        ),
      );
      setDraftItems((current) =>
        current.map((item) =>
          item.card.id === updatedStock.card.id &&
          item.card.game === updatedStock.card.game &&
          itemTypeOf(item.card) === itemTypeOf(updatedStock.card)
            ? { ...item, card: updatedStock.card }
            : item,
        ),
      );
      setStockEditor(null);
      setStockMessage(`${updatedStock.card.name} actualizado.`);
    } catch (error) {
      setStockEditError(
        error instanceof Error
          ? error.message
          : "No se pudo editar el producto.",
      );
    } finally {
      setStockEditSaving(false);
    }
  };

  const resetDraftPack = () => {
    setEditingPackId(null);
    setDraftName("Caja personalizada");
    setDraftSeries("Mi serie local");
    setDraftGame("mixed");
    setDraftPrice(20);
    setDraftItems([]);
    setAdminMessage("");
  };

  const startEditingPack = (pack: BoosterPack) => {
    setEditingPackId(pack.id);
    setDraftName(pack.name);
    setDraftSeries(pack.series);
    setDraftGame(pack.game);
    setDraftPrice(pack.price);
    setDraftItems(pack.items);
    setAdminMessage("");
  };

  const topUpWallet = async () => {
    if (!session) {
      setWalletMessage("Inicia sesion para recargar.");
      return;
    }

    const amount = Number(walletAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setWalletMessage("Ingresa un monto valido mayor a cero.");
      return;
    }

    setWalletSaving(true);
    setWalletMessage("");

    try {
      const response = await fetch(localApiUrl("/api/wallet/topup"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });
      const payload = (await response.json()) as WalletResponse;

      if (!response.ok || payload.error || !payload.user) {
        throw new Error(payload.error ?? "No se pudo recargar la cartera.");
      }

      updateSessionUser(payload.user);
      setWalletMessage(`Recargaste ${formatUsd.format(amount)}.`);
    } catch (error) {
      setWalletMessage(
        error instanceof Error
          ? error.message
          : "No se pudo recargar la cartera.",
      );
    } finally {
      setWalletSaving(false);
    }
  };

  const toggleUpgraderStake = (cardId: number) => {
    if (upgraderPlaying) {
      return;
    }

    setUpgraderOutcome(null);
    setUpgraderStakeIds((current) => {
      if (current.includes(cardId)) {
        return current.filter((id) => id !== cardId);
      }

      if (current.length >= 20) {
        setWonCardsMessageTone("warning");
        setWonCardsMessage("Podés apostar hasta 20 premios juntos.");
        return current;
      }

      return [...current, cardId];
    });
  };

  const chooseUpgraderPreset = (multiplier: number) => {
    if (!upgraderStakeValue) {
      setWonCardsMessageTone("warning");
      setWonCardsMessage("Primero elegí uno o más premios para apostar.");
      return;
    }

    setUpgraderPreset(multiplier);
    setUpgraderMinPrice(
      String(Number((upgraderStakeValue * multiplier).toFixed(2))),
    );
    setUpgraderMaxPrice("");
    setUpgraderTargetId(null);
    setUpgraderOutcome(null);
  };

  const playUpgrader = async () => {
    if (!session) {
      setHomeAuthOpen(true);
      return;
    }

    if (!upgraderStakeIds.length || !upgraderTarget) {
      setWonCardsMessageTone("warning");
      setWonCardsMessage("Elegí tus premios y un objetivo antes de jugar.");
      return;
    }

    await prepareRouletteAudio();
    setUpgraderPlaying(true);
    setUpgraderOutcome(null);
    setWonCardsMessage("");

    try {
      const response = await fetch(localApiUrl("/api/upgrader/play"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stakeCardIds: upgraderStakeIds,
          targetStockId: upgraderTarget.id,
          targetQuantity: upgraderTargetQuantity,
        }),
      });
      const payload = (await response.json()) as UpgraderPlayResponse;

      if (
        !response.ok ||
        payload.error ||
        typeof payload.won !== "boolean" ||
        typeof payload.roll !== "number"
      ) {
        throw new Error(payload.error ?? "No se pudo completar el Upgrader.");
      }

      const landingPercent = safeUpgraderLandingPercent(
        payload.roll,
        payload.chance ?? upgraderChance,
        payload.won,
      );
      const targetAngle = landingPercent * 3.6;
      setUpgraderRotation((current) => {
        const currentAngle = ((current % 360) + 360) % 360;
        const finalTurn = (targetAngle - currentAngle + 360) % 360;
        return current + 1440 + finalTurn;
      });
      window.setTimeout(() => startUpgraderTickTracking(), 30);

      upgraderTimerRef.current = window.setTimeout(() => {
        if (upgraderTickFrameRef.current !== null) {
          window.cancelAnimationFrame(upgraderTickFrameRef.current);
          upgraderTickFrameRef.current = null;
        }
        setUpgraderOutcome(payload);
        setUpgraderPlaying(false);
        setUpgraderStakeIds([]);
        setUpgraderTargetId(null);
        setUpgraderPreset(null);
        setUpgraderMinPrice("");
        setUpgraderMaxPrice("");
        setWonCardsMessageTone(payload.won ? "success" : "warning");
        setWonCardsMessage(
          payload.won
            ? "¡Upgrade conseguido! El premio ya está en tu inventario."
            : "El upgrade no salió esta vez.",
        );
        playUpgraderResultSound(payload.won);
        void loadWonCards();
        void loadUpgraderOptions();
        upgraderTimerRef.current = null;
      }, 4200);
    } catch (error) {
      if (upgraderTickFrameRef.current !== null) {
        window.cancelAnimationFrame(upgraderTickFrameRef.current);
        upgraderTickFrameRef.current = null;
      }
      setUpgraderPlaying(false);
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error
          ? error.message
          : "No se pudo completar el Upgrader.",
      );
      void loadWonCards();
      void loadUpgraderOptions();
    }
  };

  const toggleChangerStake = (cardId: number) => {
    if (changerSaving) return;
    setChangerOutcome(null);
    setChangerStakeIds((current) => {
      if (current.includes(cardId)) {
        return current.filter((id) => id !== cardId);
      }
      return current.length >= 20 ? current : [...current, cardId];
    });
  };

  const addChangerTarget = (item: ShopStockItem) => {
    if (!session || changerSaving || !changerStakeIds.length) return;
    const price = Number(item.card.priceUsd ?? 0);
    const currentQuantity = changerTargetQuantities[item.id] ?? 0;
    if (
      price <= 0 ||
      currentQuantity >= Math.min(20, item.quantity) ||
      changerTargetUnits >= 20 ||
      changerTargetValue + price > changerStakeValue + 0.0001
    ) {
      return;
    }
    setChangerOutcome(null);
    setChangerTargetQuantities((current) => ({
      ...current,
      [item.id]: (current[item.id] ?? 0) + 1,
    }));
  };

  const removeChangerTarget = (stockId: number) => {
    if (changerSaving) return;
    setChangerOutcome(null);
    setChangerTargetQuantities((current) => {
      const quantity = current[stockId] ?? 0;
      if (quantity <= 1) {
        const next = { ...current };
        delete next[stockId];
        return next;
      }
      return { ...current, [stockId]: quantity - 1 };
    });
  };

  const playChanger = async () => {
    if (!session) {
      setAuthMode("login");
      setHomeAuthOpen(true);
      return;
    }
    if (
      !changerStakeIds.length ||
      !changerSelectedTargets.length ||
      changerTargetValue <= 0 ||
      changerTargetValue > changerStakeValue
    ) {
      return;
    }

    setChangerSaving(true);
    setChangerOutcome(null);
    try {
      const response = await fetch(localApiUrl("/api/changer/play"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stakeCardIds: changerStakeIds,
          targetItems: changerSelectedTargets.map((selection) => ({
            stockId: selection.item.id,
            quantity: selection.quantity,
          })),
        }),
      });
      const payload = (await response.json()) as ChangerPlayResponse;
      if (!response.ok || payload.error || !payload.runId) {
        throw new Error(payload.error ?? "No se pudo completar el cambio.");
      }

      updateSessionUser(payload.user);
      setChangerOutcome(payload);
      setChangerStakeIds([]);
      setChangerTargetQuantities({});
      setWonCardsMessageTone("success");
      setWonCardsMessage(
        payload.refundUsd
          ? `Cambio completado. Se acreditaron ${formatUsd.format(payload.refundUsd)} en tu cartera.`
          : "Cambio completado.",
      );
      await Promise.all([loadWonCards(), loadChangerOptions()]);
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo completar el cambio.",
      );
      void loadChangerOptions();
    } finally {
      setChangerSaving(false);
    }
  };

  const sellWonCard = async (cardId: number) => {
    if (!session) {
      return;
    }

    setWonCardBusyId(cardId);
    setWonCardsMessage("");

    try {
      const response = await fetch(
        localApiUrl(`/api/me/cards/${encodeURIComponent(cardId)}/sell`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        },
      );
      const payload = (await response.json()) as WalletResponse;

      if (!response.ok || payload.error || !payload.user) {
        throw new Error(payload.error ?? "No se pudo vender el premio.");
      }

      updateSessionUser(payload.user);
      setAuthMessage("");
      void loadWonCards();
      setWonCardsMessageTone("success");
      setWonCardsMessage(
        `Premio vendido por ${formatUsd.format(payload.valueUsd ?? 0)}.`,
      );
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo vender el premio.",
      );
    } finally {
      setWonCardBusyId(null);
    }
  };

  const withdrawWonCard = async (cardId: number) => {
    if (!session) {
      return;
    }

    if (!session.hasShippingAddress) {
      const missing = session.shippingAddressMissing ?? [];
      setWonCardsMessageTone("warning");
      setWonCardsMessage(
        missing.length
          ? `Completa estos datos antes de retirar premios: ${missing.join(", ")}.`
          : "Completa tu nombre y domicilio en Datos personales antes de retirar premios.",
      );
      setProfileSectionView("personal");
      return;
    }

    setWonCardBusyId(cardId);
    setWonCardsMessage("");

    try {
      const response = await fetch(
        localApiUrl(`/api/me/cards/${encodeURIComponent(cardId)}/withdraw`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        },
      );
      const payload = (await response.json()) as {
        error?: string;
        waitingForStock?: boolean;
      };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo retirar el premio.");
      }

      void loadWonCards();
      if (payload.waitingForStock) {
        setWonCardsMessageTone("warning");
        setWonCardsMessage(
          "No hay stock disponible en este momento. Tu retiro queda pendiente y te notificaremos cuando vuelva a haber stock.",
        );
      } else {
        setWonCardsMessageTone("success");
        setWonCardsMessage(
          "Retiro confirmado. Pronto te enviaremos por mail el numero de seguimiento del envio.",
        );
      }
    } catch (error) {
      setWonCardsMessageTone("error");
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo retirar el premio.",
      );
    } finally {
      setWonCardBusyId(null);
    }
  };

  const saveDraftPack = async () => {
    if (!draftItems.length || !draftName.trim()) {
      return;
    }

    if (!session || !isSellerRole(session.role)) {
      setAdminMessage("Inicia sesion como administrador para guardar cajas.");
      return;
    }

    const normalized = normalizeItems(draftItems, draftPrice);
    const pack: BoosterPack = {
      id:
        editingPackId ??
        `admin-${crypto.randomUUID()}`,
      name: draftName.trim(),
      series: draftSeries.trim() || "Serie local",
      game: draftGame,
      price: Math.max(0, Number(draftPrice.toFixed(2))),
      accent: gameAccents[draftGame],
      createdBy: "admin",
      shopId: session.id,
      shopSlug: "pullario",
      shopName: "Pullario",
      items: normalized,
    };

    setAdminSaving(true);
    setAdminMessage("");
    let nextApiStatus: ApiStatus = "offline";

    try {
      const response = await fetch(localApiUrl("/api/packs"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pack),
      });
      const payload = (await response.json()) as SavePackResponse;
      nextApiStatus = response.status >= 500 ? "offline" : "online";

      if (!response.ok || payload.error || !payload.pack) {
        throw new Error(payload.error ?? "No se pudo guardar la caja.");
      }

      setSavedPacks((current) => [
        payload.pack as BoosterPack,
        ...current.filter((savedPack) => savedPack.id !== payload.pack?.id),
      ]);
      setSelectedPackId(payload.pack.id);
      setEditingPackId(null);
      setDraftItems([]);
      setApiStatus("online");
      setAdminMessage(
        editingPackId ? "Caja actualizada." : "Caja guardada.",
      );
    } catch (error) {
      setApiStatus(nextApiStatus);
      setAdminMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la caja.",
      );
    } finally {
      setAdminSaving(false);
    }
  };

  const deleteSavedPack = async (packId: string) => {
    if (!session || !isSellerRole(session.role)) {
      setAdminMessage("Inicia sesion como administrador para borrar cajas.");
      return;
    }

    setAdminSaving(true);
    setAdminMessage("");
    let nextApiStatus: ApiStatus = "offline";

    try {
      const response = await fetch(localApiUrl(`/api/packs/${encodeURIComponent(packId)}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      const payload = (await response.json()) as { error?: string };
      nextApiStatus = response.status >= 500 ? "offline" : "online";

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo borrar la caja.");
      }

      setSavedPacks((current) => current.filter((pack) => pack.id !== packId));
      if (selectedPackId === packId) {
        setSelectedPackId(demoPacks[0].id);
      }
      setApiStatus("online");
      setAdminMessage("Caja borrada.");
    } catch (error) {
      setApiStatus(nextApiStatus);
      setAdminMessage(
        error instanceof Error ? error.message : "No se pudo borrar la caja.",
      );
    } finally {
      setAdminSaving(false);
    }
  };

  const updateProfile = async () => {
    if (!session) {
      setProfileMessage("Inicia sesion para editar tu perfil.");
      return;
    }

    setProfileSaving(true);
    setProfileMessage("");

    try {
      const response = await fetch(localApiUrl("/api/me"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: profileDisplayName,
          email: profileEmail,
          fullName: profileFullName,
          phone: profilePhone,
          street: profileStreet,
          streetNumber: profileStreetNumber,
          floor: profileFloor,
          apartment: profileApartment,
          addressReference: profileAddressReference,
          city: profileCity,
          province: profileProvince,
          postalCode: profilePostalCode,
          country: profileCountry.trim() || "Argentina",
          password: profilePassword,
        }),
      });
      const payload = (await response.json()) as LoginResponse;

      if (!response.ok || payload.error || !payload.user) {
        throw new Error(payload.error ?? "No se pudo actualizar el perfil.");
      }

      const nextSession: SessionAuth = {
        ...session,
        username: payload.user.username,
        role: payload.user.role,
        displayName: payload.user.displayName,
        email: payload.user.email,
        fullName: payload.user.fullName,
        phone: payload.user.phone,
        addressLine1: payload.user.addressLine1,
        addressLine2: payload.user.addressLine2,
        street: payload.user.street,
        streetNumber: payload.user.streetNumber,
        floor: payload.user.floor,
        apartment: payload.user.apartment,
        addressReference: payload.user.addressReference,
        city: payload.user.city,
        province: payload.user.province,
        postalCode: payload.user.postalCode,
        country: payload.user.country,
        hasShippingAddress: payload.user.hasShippingAddress,
        shippingAddressMissing: payload.user.shippingAddressMissing,
        balanceUsd: payload.user.balanceUsd,
      };

      storeSession(nextSession);
      setProfilePassword("");
      setWonCardsMessageTone("success");
      setWonCardsMessage("Perfil actualizado.");
    } catch (error) {
      setProfileMessage(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const spinWithWinner = (winner: PackItem, onDone?: () => void) => {
    spinTimers.current.forEach((timer) => window.clearTimeout(timer));
    spinTimers.current = [];
    if (rouletteTickFrameRef.current !== null) {
      window.cancelAnimationFrame(rouletteTickFrameRef.current);
      rouletteTickFrameRef.current = null;
    }
    setCelebratingRunId(null);

    const targetIndex = 32;
    const runId = Date.now();
    const targetOffset = targetIndex * ROULETTE_STRIDE;
    const strip = Array.from({ length: 42 }, (_, index) => ({
      ...weightedPick(selectedPack.items),
      spinKey: `${runId}-${index}-${crypto.randomUUID()}`,
    }));
    const showcaseHitCandidates = selectedPack.items.filter(
      (item) =>
        item.slotId !== winner.slotId &&
        normalizedProbability(item, selectedPack) < HIT_PROBABILITY_THRESHOLD,
    );
    const showcaseHit = showcaseHitCandidates.length
      ? showcaseHitCandidates[
          Math.floor(Math.random() * showcaseHitCandidates.length)
        ]
      : undefined;

    if (showcaseHit) {
      const showcaseOffsets = [-4, -3, -2, 2, 3, 4];
      const showcaseOffset =
        showcaseOffsets[Math.floor(Math.random() * showcaseOffsets.length)];
      const showcaseIndex = targetIndex + showcaseOffset;
      strip[showcaseIndex] = {
        ...showcaseHit,
        spinKey: `${runId}-showcase-hit-${crypto.randomUUID()}`,
      };
    }

    strip[targetIndex] = {
      ...winner,
      spinKey: `${runId}-winner-${crypto.randomUUID()}`,
    };

    setRoulette({
      packId: selectedPack.id,
      items: strip,
      targetIndex,
      offset: 0,
      phase: "spinning",
      runId,
      result: undefined,
    });

    const spinTimer = window.setTimeout(() => {
      setRoulette((current) =>
        current.runId === runId
          ? {
              ...current,
              offset: targetOffset,
            }
          : current,
      );
      startRouletteTickTracking(runId, targetIndex);
    }, 40);

    const resultTimer = window.setTimeout(() => {
      if (rouletteTickFrameRef.current !== null) {
        window.cancelAnimationFrame(rouletteTickFrameRef.current);
        rouletteTickFrameRef.current = null;
      }
      setRoulette((current) =>
        current.runId === runId
          ? {
              ...current,
              packId: selectedPack.id,
              phase: "done",
              result: winner,
            }
          : current,
      );
      if (normalizedProbability(winner, selectedPack) < HIT_PROBABILITY_THRESHOLD) {
        setCelebratingRunId(runId);
        playHitFanfare();
        const celebrationTimer = window.setTimeout(() => {
          setCelebratingRunId((current) => (current === runId ? null : current));
        }, 3200);
        spinTimers.current.push(celebrationTimer);
      }
      onDone?.();
    }, 3800);

    spinTimers.current = [spinTimer, resultTimer];
  };

  const prepareRouletteAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
    } catch {
      audioContextRef.current = null;
    }
  };

  const playRouletteTick = (progress: number, delaySeconds = 0) => {
    const context = audioContextRef.current;
    if (!context || context.state !== "running") return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime + delaySeconds;
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(720 - progress * 210, now);
    oscillator.frequency.exponentialRampToValueAtTime(360, now + 0.028);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.018 + progress * 0.008, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.036);
  };

  const startRouletteTickTracking = (runId: number, targetIndex: number) => {
    let lastBoundary = 0;

    const readTranslateX = (element: HTMLElement) => {
      const transform = window.getComputedStyle(element).transform;
      if (!transform || transform === "none") return 0;

      const match = transform.match(/^matrix(3d)?\((.+)\)$/);
      if (!match) return 0;

      const values = match[2].split(",").map(Number);
      return match[1] ? values[12] ?? 0 : values[4] ?? 0;
    };

    const sampleTrack = () => {
      const track = rouletteTrackRef.current;
      if (!track || track.dataset.rouletteRun !== String(runId)) {
        rouletteTickFrameRef.current = window.requestAnimationFrame(sampleTrack);
        return;
      }

      const distance = Math.abs(readTranslateX(track));
      const crossedBoundary = Math.min(
        targetIndex,
        Math.floor((distance + 0.5) / ROULETTE_STRIDE),
      );

      if (crossedBoundary > lastBoundary) {
        const crossedThisFrame = crossedBoundary - lastBoundary;
        const progress = Math.min(1, distance / (targetIndex * ROULETTE_STRIDE));
        for (let index = 0; index < crossedThisFrame; index += 1) {
          playRouletteTick(progress, index * 0.005);
        }
        lastBoundary = crossedBoundary;
      }

      if (lastBoundary < targetIndex) {
        rouletteTickFrameRef.current = window.requestAnimationFrame(sampleTrack);
      } else {
        rouletteTickFrameRef.current = null;
      }
    };

    rouletteTickFrameRef.current = window.requestAnimationFrame(sampleTrack);
  };

  const startUpgraderTickTracking = () => {
    if (upgraderTickFrameRef.current !== null) {
      window.cancelAnimationFrame(upgraderTickFrameRef.current);
    }

    let lastAngle: number | null = null;
    let travelledAngle = 0;
    let lastBoundary = 0;
    const startedAt = performance.now();

    const sampleNeedle = () => {
      const needle = upgraderNeedleRef.current;
      if (!needle) {
        upgraderTickFrameRef.current = null;
        return;
      }

      const transform = window.getComputedStyle(needle).transform;
      const match = transform.match(/^matrix\((.+)\)$/);
      if (match) {
        const values = match[1].split(",").map(Number);
        const angle = (Math.atan2(values[1] ?? 0, values[0] ?? 1) * 180) / Math.PI;
        const normalizedAngle = (angle + 360) % 360;

        if (lastAngle !== null) {
          travelledAngle += (normalizedAngle - lastAngle + 360) % 360;
          const crossedBoundary = Math.floor(travelledAngle / 12);
          if (crossedBoundary > lastBoundary) {
            const progress = Math.min(1, (performance.now() - startedAt) / 4000);
            const crossedThisFrame = Math.min(3, crossedBoundary - lastBoundary);
            for (let index = 0; index < crossedThisFrame; index += 1) {
              playRouletteTick(progress, index * 0.005);
            }
            lastBoundary = crossedBoundary;
          }
        }
        lastAngle = normalizedAngle;
      }

      if (performance.now() - startedAt < 4100) {
        upgraderTickFrameRef.current = window.requestAnimationFrame(sampleNeedle);
      } else {
        upgraderTickFrameRef.current = null;
      }
    };

    upgraderTickFrameRef.current = window.requestAnimationFrame(sampleNeedle);
  };

  const playUpgraderResultSound = (won: boolean) => {
    if (won) {
      playHitFanfare();
      return;
    }

    const context = audioContextRef.current;
    if (!context || context.state !== "running") return;

    [260, 190].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.12;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.035, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.22);
    });
  };

  const playHitFanfare = () => {
    const context = audioContextRef.current;
    if (!context || context.state !== "running") return;

    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.1;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.34);
    });
  };

  const openPack = async () => {
    if (!session) {
      setAuthMessage("Registrate o inicia sesion para abrir cajas.");
      return;
    }

    const currentPackIsSpinning =
      roulette.phase === "spinning" && roulette.packId === selectedPack.id;

    if (
      (view === "pack" && !selectedPackExists) ||
      !selectedPack.items.length ||
      currentPackIsSpinning ||
      openingPack
    ) {
      return;
    }

    setOpeningPack(true);
    setAuthMessage("");
    await prepareRouletteAudio();

    try {
      if (selectedPack.createdBy === "demo") {
        spinWithWinner(weightedPick(selectedPack.items));
        return;
      }

      const response = await fetch(
        localApiUrl(`/api/packs/${encodeURIComponent(selectedPack.id)}/open`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        },
      );
      const payload = (await response.json()) as OpenPackResponse;

      if (!response.ok || payload.error || !payload.item) {
        throw new Error(payload.error ?? "No se pudo abrir la caja.");
      }

      spinWithWinner(payload.item, () => {
        updateSessionUser(payload.user);
        setAuthMessage("");
        void loadWonCards();
        void loadRecentDrops(selectedPack.id);
        void loadDbPacks();
        if (isSellerRole(session.role)) {
          void loadShopStock();
          void loadShopOrders();
        }
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo abrir la caja.";

      if (message.toLowerCase().includes("saldo insuficiente")) {
        setWonCardsMessageTone("warning");
        setWonCardsMessage(message);
      } else {
        setAuthMessage(message);
      }
    } finally {
      setOpeningPack(false);
    }
  };

  const authPanel = session ? (
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

  const renderPackCards = (packList: BoosterPack[]) => (
      <div className="pack-grid">
        {packList.map((pack) => {
          const top = topItem(pack);

          return (
            <Link
              className="pack-card"
              href={`/packs/${encodeURIComponent(pack.id)}`}
              key={pack.id}
              style={{ "--accent": pack.accent } as CSSProperties}
            >
              <span className="pack-preview">
                {top?.card.imageUrl ? (
                  <img src={cardImage(top.card)} alt="" />
                ) : (
                  <Database size={26} aria-hidden />
                )}
              </span>
              <span className="pack-card-copy">
                <span className="pack-source">
                  {gameLabels[pack.game]} · Pullario
                </span>
                <span className="pack-name">{pack.name}</span>
                <span className="pack-series">{pack.series}</span>
              </span>
              <span className="pack-card-footer">
                <span>
                  <small>Precio</small>
                  <strong>{formatUsd.format(pack.price)}</strong>
                </span>
                <span>
                  <small>Hit</small>
                  <strong>{formatPercent.format(packHitChance(pack))}%</strong>
                </span>
                <span className="pack-open-icon" aria-hidden>
                  <ArrowRight size={22} />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
  );

  const packListing = (
    <section className="case-layout" id="cajas" aria-label="Cajas disponibles">
      <div className="case-header">
        <div>
          <span className="eyebrow">Coleccion actual</span>
          <h2>Elige tu proxima caja</h2>
        </div>
        <p className="case-intro">
          Revisa los posibles premios antes de entrar a la apertura.
        </p>
      </div>

      {renderPackCards(packs)}
    </section>
  );

  const homeGuideSection = (
    <section
      className="home-guide-band"
      id="como-funciona"
      aria-label="Como funciona Pullario"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">Como funciona</span>
          <h2>De la caja a tu inventario</h2>
        </div>
        <p>
          Una apertura simple, con los premios y sus probabilidades disponibles
          antes de elegir.
        </p>
      </div>

      <ol className="home-steps">
        <li>
          <span>01</span>
          <div>
            <h3>Elegi una caja</h3>
            <p>Explora el contenido, los precios y las probabilidades.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>Abrila en la ruleta</h3>
            <p>El resultado se revela al terminar la animacion.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Decidi que hacer</h3>
            <p>Conserva el premio, vendelo por saldo o pedi el retiro.</p>
          </div>
        </li>
      </ol>

      <div className="home-shortcuts">
        <div>
          <span className="eyebrow">Tambien en Pullario</span>
          <h3>Explora cartas e inventario sin perder el foco.</h3>
        </div>
        <nav aria-label="Accesos de Pullario">
          <Link href="/cards">
            <Search size={18} aria-hidden />
            Buscar cartas
          </Link>
          <Link href="/profile">
            <Trophy size={18} aria-hidden />
            Ver inventario
          </Link>
        </nav>
      </div>
    </section>
  );

  const openingSection = (
    <section className="case-layout" aria-label="Abrir caja">
      <div className="page-heading">
        <Link className="secondary-action compact" href="/">
          <ArrowLeft size={17} aria-hidden />
          Cajas
        </Link>
        <div>
          <span className="eyebrow">Caja activa</span>
          <h1>{selectedPack.name}</h1>
          <p>
            {selectedPack.series}
          </p>
        </div>
      </div>

      <div className="opening-stage">
        <div className="stage-main">
          {celebratingRunId === visibleRouletteRunId &&
            visibleRouletteResult && (
              <div className="hit-celebration" role="status">
                <span className="sr-only">Conseguiste un premio destacado.</span>
                {HIT_CELEBRATION_PIECES.map((piece, index) => (
                  <i
                    aria-hidden
                    key={`${visibleRouletteRunId}-celebration-${index}`}
                    style={
                      {
                        "--piece-color": piece.color,
                        "--piece-delay": piece.delay,
                        "--piece-left": piece.left,
                        "--piece-rotation": piece.rotation,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
            )}
          <div className="stage-top">
            <div>
              <span className="eyebrow">Ruleta</span>
              <p>Todos los premios posibles participan en cada apertura.</p>
            </div>
            <div className="stage-price">
              <small>Precio</small>
              <strong>{formatUsd.format(selectedPack.price)}</strong>
            </div>
          </div>

          <div className="roulette-window">
            <div className="safe-zone" aria-hidden />
            <div className="center-marker" aria-hidden />
            {visibleRouletteItems.length ? (
              <div
                className="roulette-track"
                data-roulette-run={visibleRouletteRunId}
                key={visibleRouletteRunId}
                ref={rouletteTrackRef}
                style={
                  {
                    transform: `translateX(-${visibleRouletteOffset}px)`,
                    "--spin-duration":
                      visibleRoulettePhase === "spinning" ? "3600ms" : "0ms",
                  } as CSSProperties
                }
              >
                {visibleRouletteItems.map((item) => (
                  <div
                    className={`roulette-item ${itemTypeOf(item.card)}`}
                    key={item.spinKey}
                    style={{ "--rarity": selectedPack.accent } as CSSProperties}
                  >
                    <img src={cardImage(item.card)} alt="" />
                    <small>{prizeTypeLabels[itemTypeOf(item.card)]}</small>
                    <span>{item.card.name}</span>
                    <strong>{formatUsd.format(item.card.priceUsd ?? 0)}</strong>
                  </div>
                ))}
              </div>
            ) : idleRouletteItems.length ? (
              <div className="roulette-track preview-track">
                {idleRouletteItems.map((item) => (
                  <div
                    className={`roulette-item ${itemTypeOf(item.card)}`}
                    key={item.spinKey}
                    style={{ "--rarity": selectedPack.accent } as CSSProperties}
                  >
                    <img src={cardImage(item.card)} alt="" />
                    <small>{prizeTypeLabels[itemTypeOf(item.card)]}</small>
                    <span>{item.card.name}</span>
                    <strong>{formatUsd.format(item.card.priceUsd ?? 0)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="roulette-empty">
                <Dice5 size={34} aria-hidden />
                <strong>La ruleta espera el primer giro</strong>
                <span>Los premios pasan por la cinta y el selector central marca el ganador.</span>
              </div>
            )}
          </div>

          {!session && (
            <p className="inline-warning">
              Necesitas una cuenta para abrir cajas. El login esta en la pagina principal.
            </p>
          )}

          <div className="open-actions">
            <button
              className="open-button"
              disabled={
                !session ||
                !selectedPack.items.length ||
                visibleRoulettePhase === "spinning" ||
                openingPack
              }
              onClick={() => void openPack()}
              type="button"
            >
              <Sparkles size={19} aria-hidden />
              {openingPack
                ? "Procesando"
                : visibleRoulettePhase === "spinning"
                  ? "Girando"
                  : "Abrir caja"}
            </button>
            {visibleRouletteResult && (
              <button
                className="secondary-action compact"
                onClick={() => {
                  if (visibleRouletteResult) {
                    showCardDetails(visibleRouletteResult.card);
                  }
                }}
                type="button"
              >
                <Eye size={18} aria-hidden />
                Ver resultado
              </button>
            )}
          </div>
          {authMessage && <p className="admin-message">{authMessage}</p>}

          {visibleRouletteResult && (
            <article
              className={`result-banner ${itemTypeOf(visibleRouletteResult.card)} ${
                normalizedProbability(visibleRouletteResult, selectedPack) <
                HIT_PROBABILITY_THRESHOLD
                  ? "hit-result"
                  : ""
              }`}
            >
              <img
                src={cardImage(visibleRouletteResult.card)}
                alt=""
                onError={handleImageError(visibleRouletteResult.card.game)}
              />
              <div>
                <span>Te llevaste</span>
                <small>{prizeTypeLabels[itemTypeOf(visibleRouletteResult.card)]}</small>
                <h3>{visibleRouletteResult.card.name}</h3>
                <strong>
                  {formatUsd.format(visibleRouletteResult.card.priceUsd ?? 0)}
                </strong>
              </div>
            </article>
          )}
        </div>

        <aside className="case-summary">
          <div className="metric-strip">
            <div>
              <Trophy size={18} aria-hidden />
              <span>
                <small>Mejor premio</small>
                <strong>{selectedTopItem?.card.name ?? "Sin premios"}</strong>
              </span>
            </div>
          </div>

          <div className="recent-drops">
            <h3>Mejores caidas</h3>
            {recentDropsLoading ? (
              <p>Cargando hits recientes.</p>
            ) : recentDrops.length ? (
              recentDrops.map((drop) => (
                <button
                  className="drop-row"
                  key={drop.id}
                  onClick={() => showCardDetails(drop.card)}
                  type="button"
                >
                  <img
                    src={cardImage(drop.card)}
                    alt=""
                    onError={handleImageError(drop.card.game)}
                  />
                  <span className="drop-copy">
                    <strong>{drop.card.name}</strong>
                    <small>
                      {drop.displayName || drop.username} - {drop.packName}
                    </small>
                    <em>{formatCardDate(drop.acquiredAt)}</em>
                  </span>
                  <b>{formatUsd.format(drop.valueUsd)}</b>
                </button>
              ))
            ) : (
              <p>Todavia no hay hits registrados en esta caja.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );

  const missingPackSection = (
    <section className="case-layout page-section" aria-label="Caja no encontrada">
      <div className="login-panel">
        <span className="eyebrow">Caja</span>
        <h3>
          {apiStatus === "checking"
            ? "Buscando la caja"
            : "No encontre esta caja"}
        </h3>
        <p className="admin-message">
          Confirma que el servidor local este corriendo y reintenta.
        </p>
        <div className="auth-actions">
          <button
            className="secondary-action compact"
            onClick={() => void loadDbPacks()}
            type="button"
          >
            <RotateCcw size={17} aria-hidden />
            Reintentar
          </button>
          <Link className="primary-action compact" href="/">
            <Home size={17} aria-hidden />
            Ver cajas
          </Link>
        </div>
      </div>
    </section>
  );

  const contentsSection = (
    <section className="contents-band" aria-label="Contenidos de la caja">
      <div className="section-heading centered">
        <span className="eyebrow">Contenidos de la caja</span>
        <h2>Todo lo que puede tocar</h2>
      </div>
      <div className="contents-grid">
        {selectedPack.items
          .slice()
          .sort(
            (a, b) =>
              normalizedProbability(a, selectedPack) -
              normalizedProbability(b, selectedPack),
          )
          .map((item) => (
            <button
              className={`content-card ${itemTypeOf(item.card)}`}
              key={item.slotId}
              onClick={() => showCardDetails(item.card)}
              style={{ "--rarity": selectedPack.accent } as CSSProperties}
              type="button"
            >
              <span className="content-prob">
                <small>Probabilidad</small>
                <strong>
                  {formatPercent.format(normalizedProbability(item, selectedPack))}%
                </strong>
              </span>
              <img
                src={cardImage(item.card)}
                alt=""
                onError={handleImageError(item.card.game)}
              />
              <span className="content-game">{gameLabels[item.card.game]}</span>
              <span className={`prize-type-chip ${itemTypeOf(item.card)}`}>
                {prizeTypeLabels[itemTypeOf(item.card)]}
              </span>
              <strong>{item.card.name}</strong>
              <small>{item.card.setName}</small>
              <b>{formatUsd.format(item.card.priceUsd ?? 0)}</b>
            </button>
          ))}
      </div>
    </section>
  );

  const siteFooter = (
    <footer className="site-footer">
      <div className="footer-main">
        <Link className="footer-brand" href="/">
          <PackageOpen size={19} aria-hidden />
          Pullario
        </Link>
        <p>
          Prototipo web para abrir cajas TCG con probabilidades visibles,
          buscador de cartas e inventario de usuario.
        </p>
      </div>
      <div className="footer-links">
        <nav aria-label="Navegacion del pie">
          <strong>Explorar</strong>
          <Link href="/">Cajas</Link>
          <Link href="/upgrader">Upgrader</Link>
          <Link href="/changer">Changer</Link>
          <Link href="/cards">Cartas</Link>
          <Link href="#como-funciona">Indice</Link>
          <Link href="#confianza">Confianza</Link>
        </nav>
        <nav aria-label="Cuenta y administracion">
          <strong>Cuenta</strong>
          <Link href="/profile">Perfil</Link>
          <button
            onClick={() => {
              setWonCardsOpen(true);
              void loadWonCards();
            }}
            type="button"
          >
            Premios ganados
          </button>
          {isSellerRole(session?.role) && <Link href="/admin">Administracion</Link>}
        </nav>
      </div>
      <div className="footer-note">
        <strong>Demo local</strong>
        <span>
          Sin pagos reales. Antes de publicar con dinero real hay que revisar
          terminos, edad, impuestos, privacidad y normativa de azar.
        </span>
      </div>
    </footer>
  );

  const searchSection = (
    <section className="search-band standalone" aria-label="Buscador de cartas">
      <div className="search-copy">
        <span className="eyebrow">Buscador de cartas</span>
        <h1>Precios e imagenes</h1>
        <p>
          Busca por juego, nombre y rareza. Al tocar una carta se abre el detalle
          con imagen grande, precio, set y fuente.
        </p>
      </div>
      <SearchConsole
        actionLabel="Detalles"
        infinite
        onCardAction={showCardDetails}
        onLoadMore={() => runSearch("public", undefined, true)}
        onSearch={(override) => runSearch("public", override)}
        search={publicSearch}
        setSearch={setPublicSearch}
      />
    </section>
  );

  const adminNavigation = isSellerRole(session?.role) ? (
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

  const adminShellHeader = (
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
      {adminNavigation}
      {view === "admin-packs" && adminMessage && (
        <p className="admin-message">{adminMessage}</p>
      )}
    </div>
  );

  const sellerRequiredPanel = (
    <div className="login-panel">
      <span className="eyebrow">Administracion protegida</span>
      <h3>Entra como administrador desde la pagina principal</h3>
      <Link className="primary-action compact" href="/">
        <LogIn size={17} aria-hidden />
        Ir al login
      </Link>
    </div>
  );

  const stockFilterControls = (
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

  const renderStockItem = (stockItem: ShopStockItem, withPackAction = false) => {
    const draftQuantity = stockQuantityDrafts[stockItem.id];
    const parsedDraftQuantity = Number(draftQuantity);
    const visibleStockQuantity =
      draftQuantity !== undefined &&
      draftQuantity.trim() !== "" &&
      Number.isFinite(parsedDraftQuantity)
        ? Math.max(0, Math.floor(parsedDraftQuantity))
        : stockItem.quantity;
    const isInDraft = draftItems.some(
      (item) =>
        item.card.id === stockItem.card.id &&
        item.card.game === stockItem.card.game &&
        itemTypeOf(item.card) === itemTypeOf(stockItem.card),
    );

    return (
      <article
      className={`stock-item ${itemTypeOf(stockItem.card)}`}
      key={stockItem.id}
      >
      <button
        className="stock-image-button"
        onClick={() => showCardDetails(stockItem.card)}
        type="button"
      >
        <img
          src={cardImage(stockItem.card)}
          alt=""
          onError={handleImageError(stockItem.card.game)}
        />
      </button>
      <div className="stock-item-copy">
        <span className={`prize-type-chip ${itemTypeOf(stockItem.card)}`}>
          {prizeTypeLabels[itemTypeOf(stockItem.card)]}
        </span>
        <strong>{stockItem.card.name}</strong>
        <small>
          {formatUsd.format(stockItem.card.priceUsd ?? 0)} -{" "}
          {gameLabels[stockItem.card.game]}
        </small>
        <span>
          {stockItem.card.setName}
          {stockItem.card.number ? ` #${stockItem.card.number}` : ""}
        </span>
      </div>
      <div className="stock-actions">
        <label className="stock-quantity-control">
          <span>Stock</span>
          <input
            aria-label={`Stock de ${stockItem.card.name}`}
            disabled={stockBusyId === stockItem.id}
            inputMode="numeric"
            min="0"
            onBlur={(event) => {
              if (event.currentTarget.value.trim() === "") {
                setStockQuantityDrafts((current) => {
                  const next = { ...current };
                  delete next[stockItem.id];
                  return next;
                });
                return;
              }
              const quantity = Math.max(
                0,
                Math.floor(Number(event.currentTarget.value)),
              );
              if (Number.isFinite(quantity) && quantity !== stockItem.quantity) {
                void updateStockQuantity(stockItem, quantity);
              } else {
                setStockQuantityDrafts((current) => {
                  const next = { ...current };
                  delete next[stockItem.id];
                  return next;
                });
              }
            }}
            onChange={(event) =>
              setStockQuantityDrafts((current) => ({
                ...current,
                [stockItem.id]: event.target.value,
              }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
            step="1"
            type="number"
            value={stockQuantityDrafts[stockItem.id] ?? stockItem.quantity}
          />
        </label>
        <div className="stock-stepper-buttons">
          <button
            aria-label={`Restar stock de ${stockItem.card.name}`}
            disabled={stockBusyId === stockItem.id || visibleStockQuantity <= 0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              void updateStockQuantity(stockItem, visibleStockQuantity - 1)
            }
            title="Restar stock"
            type="button"
          >
            -
          </button>
          <button
            aria-label={`Sumar stock de ${stockItem.card.name}`}
            disabled={stockBusyId === stockItem.id}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              void updateStockQuantity(stockItem, visibleStockQuantity + 1)
            }
            title="Sumar stock"
            type="button"
          >
            <Plus size={16} aria-hidden />
          </button>
        </div>
        <button
          aria-label={`Editar ${stockItem.card.name}`}
          className="stock-edit-button"
          disabled={stockBusyId === stockItem.id}
          onClick={() => openStockEditor(stockItem)}
          type="button"
        >
          <Pencil size={15} aria-hidden />
          Editar
        </button>
        {withPackAction && (
          <button
            className={`stock-add-pack${isInDraft ? " in-pack" : ""}`}
            disabled={stockItem.quantity <= 0 || isInDraft}
            onClick={() => addCardToDraft(stockItem.card)}
            type="button"
          >
            {isInDraft ? (
              <>
                <CircleCheck size={16} aria-hidden />
                En la caja
              </>
            ) : (
              <>
                <Plus size={16} aria-hidden />
                A la caja
              </>
            )}
          </button>
        )}
      </div>
      </article>
    );
  };

  const adminDashboardSection = (
    <section className="admin-band page-section" aria-label="Panel administrador">
      {adminShellHeader}
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
        sellerRequiredPanel
      )}
    </section>
  );

  const adminStockSection = (
    <section className="admin-band page-section" aria-label="Stock de Pullario">
      {adminShellHeader}
      {isSellerRole(session?.role) ? (
        <div className="stock-page-grid">
          <div className="stock-entry-column">
            <SearchConsole
              actionLabel="Stock"
              onCardAction={(card) => void addCardToStock(card)}
              onSearch={(override) => runSearch("admin", override)}
              search={adminSearch}
              setSearch={setAdminSearch}
            />
            <div className="sealed-stock-form">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Producto sellado</span>
                  <h2>Buscar sobre o caja</h2>
                </div>
                <Boxes size={22} aria-hidden />
              </div>

              <div className="sealed-search-bar">
                <label>
                  Juego
                  <select
                    onChange={(event) => {
                      setSealedGame(event.target.value as CardGame)
                      setSealedQuery("");
                      setSealedResults([]);
                      setSealedSearchError("");
                    }}
                    value={sealedGame}
                  >
                    {cardGames.map((game) => (
                      <option key={game} value={game}>
                        {gameLabels[game]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Expansion o producto
                  <input
                    onChange={(event) => setSealedQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void searchSealedProducts();
                      }
                    }}
                    placeholder="Ej: Surging Sparks booster box"
                    value={sealedQuery}
                  />
                </label>
                <button
                  className="primary-action compact"
                  disabled={sealedSearchLoading || sealedQuery.trim().length < 2}
                  onClick={() => void searchSealedProducts()}
                  type="button"
                >
                  <Search size={17} aria-hidden />
                  {sealedSearchLoading ? "Buscando" : "Buscar"}
                </button>
              </div>
              {sealedSearchLoading && (
                <div className="sealed-search-loading" role="status">
                  <span aria-hidden />
                  Buscando productos y precios
                </div>
              )}
              {sealedSearchError && (
                <p className="admin-message">{sealedSearchError}</p>
              )}
              {sealedResults.length > 0 && (
                <div className="sealed-search-results">
                  {sealedResults.map((product) => (
                    <article key={product.id}>
                      <img
                        src={cardImage(product)}
                        alt=""
                        onError={handleImageError(product.game, itemTypeOf(product))}
                      />
                      <div className="sealed-result-copy">
                        <span className={`prize-type-chip ${itemTypeOf(product)}`}>
                          {prizeTypeLabels[itemTypeOf(product)]}
                        </span>
                        <strong>{product.name}</strong>
                        <small>{product.setName}</small>
                      </div>
                      <div className="sealed-result-actions">
                        <b>
                          {typeof product.priceUsd === "number"
                            ? formatUsd.format(product.priceUsd)
                            : "Sin precio"}
                        </b>
                        <button
                          aria-label={`Agregar ${product.name}`}
                          onClick={() => void selectSealedSearchResult(product)}
                          type="button"
                        >
                          <Plus size={17} aria-hidden />
                          {typeof product.priceUsd === "number"
                            ? "Al stock"
                            : "Completar"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <details
                className="manual-sealed-entry"
                onToggle={(event) =>
                  setManualSealedOpen(event.currentTarget.open)
                }
                open={manualSealedOpen}
              >
                <summary>Cargar manualmente</summary>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void addSealedProductToStock();
                  }}
                >
                  <div className="sealed-form-grid">
                    <label>
                      Tipo
                      <select
                        onChange={(event) =>
                          setSealedType(
                            event.target.value as Exclude<PrizeItemType, "card">,
                          )
                        }
                        value={sealedType}
                      >
                        <option value="sealed-pack">Sobre sellado</option>
                        <option value="sealed-box">Caja sellada</option>
                      </select>
                    </label>
                    <label>
                      Juego
                      <select
                        onChange={(event) =>
                          setSealedGame(event.target.value as CardGame)
                        }
                        value={sealedGame}
                      >
                        {cardGames.map((game) => (
                          <option key={game} value={game}>
                            {gameLabels[game]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="wide">
                      Nombre
                      <input
                        onChange={(event) => setSealedName(event.target.value)}
                        placeholder="Ej: OP-13 Booster Pack"
                        value={sealedName}
                      />
                    </label>
                    <label className="wide">
                      Expansion
                      <input
                        onChange={(event) => setSealedSetName(event.target.value)}
                        placeholder="Ej: OP-13 Carrying On His Will"
                        value={sealedSetName}
                      />
                    </label>
                    <label>
                      Precio USD
                      <input
                        min="0.01"
                        onChange={(event) =>
                          setSealedPrice(Number(event.target.value))
                        }
                        step="0.01"
                        type="number"
                        value={sealedPrice}
                      />
                    </label>
                    <label>
                      Cantidad
                      <input
                        min="1"
                        onChange={(event) =>
                          setSealedQuantity(Number(event.target.value))
                        }
                        step="1"
                        type="number"
                        value={sealedQuantity}
                      />
                    </label>
                    <label className="wide">
                      URL de imagen
                      <input
                        onChange={(event) => setSealedImageUrl(event.target.value)}
                        placeholder="https://..."
                        type="url"
                        value={sealedImageUrl}
                      />
                    </label>
                  </div>
                  <button className="primary-action compact" type="submit">
                    <Plus size={17} aria-hidden />
                    Agregar al stock
                  </button>
                </form>
              </details>
            </div>
          </div>
          <div className="stock-panel standalone">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Stock de Pullario</span>
                <h2>{filteredShopStock.length} productos</h2>
              </div>
              <button
                className="secondary-action compact"
                onClick={() => void loadShopStock()}
                type="button"
              >
                <RotateCcw size={16} aria-hidden />
                Refrescar
              </button>
            </div>
            {stockFilterControls}
            {stockMessage && <p className="admin-message">{stockMessage}</p>}
            <div className="stock-list expanded">
              {filteredShopStock.length ? (
                filteredShopStock.map((stockItem) => renderStockItem(stockItem))
              ) : (
                <p>
                  No hay productos en este filtro. Busca una carta o carga un
                  producto sellado.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        sellerRequiredPanel
      )}
    </section>
  );

  const adminPacksSection = (
    <section className="admin-band page-section" aria-label="Crear cajas">
      {adminShellHeader}
      {isSellerRole(session?.role) ? (
        <>
          <div className="admin-grid packs-grid">
            <div className="admin-form">
              <div className={`pack-editor-heading${editingPackId ? " editing" : ""}`}>
                <div className="pack-editor-icon" aria-hidden>
                  {editingPackId ? <Pencil size={19} /> : <Plus size={19} />}
                </div>
                <div>
                  <span>{editingPackId ? "Editando caja" : "Nueva caja"}</span>
                  <strong>
                    {editingPackId ? draftName || "Sin nombre" : "Configura sus datos"}
                  </strong>
                </div>
                {editingPackId && (
                  <button
                    aria-label="Cancelar edicion"
                    onClick={resetDraftPack}
                    title="Cancelar edicion"
                    type="button"
                  >
                    <X size={17} aria-hidden />
                  </button>
                )}
              </div>
              <label>
                Nombre de la caja
                <input
                  onChange={(event) => setDraftName(event.target.value)}
                  value={draftName}
                />
              </label>
              <label>
                Serie
                <input
                  onChange={(event) => setDraftSeries(event.target.value)}
                  value={draftSeries}
                />
              </label>
              <label>
                Juego
                <select
                  onChange={(event) => setDraftGame(event.target.value as PackGame)}
                  value={draftGame}
                >
                  <option value="mixed">Mixto</option>
                  <option value="one-piece">One Piece</option>
                  <option value="pokemon">Pokemon</option>
                  <option value="magic">Magic</option>
                </select>
              </label>
              <label>
                Precio USD
                <input
                  min="0"
                  onChange={(event) => setDraftPrice(Number(event.target.value))}
                  step="0.01"
                  type="number"
                  value={draftPrice}
                />
              </label>

              <div className="admin-metrics">
                <span>
                  <small>Premios</small>
                  <strong>{draftItems.length}</strong>
                </span>
                <span>
                  <small>Prob.</small>
                  <strong>{formatPercent.format(draftProbabilityTotal)}%</strong>
                </span>
                <span>
                  <small>EV</small>
                  <strong>{formatUsd.format(draftExpectedValue)}</strong>
                </span>
                <span className={draftMargin < 0 ? "negative" : ""}>
                  <small>Margen</small>
                  <strong>{formatUsd.format(draftMargin)}</strong>
                </span>
              </div>

              <div className="admin-actions">
                <button
                  className="secondary-action compact"
                  disabled={adminSaving}
                  onClick={resetDraftPack}
                  type="button"
                >
                  <Plus size={17} aria-hidden />
                  Nueva caja
                </button>
                <button
                  className="secondary-action compact"
                  disabled={!draftItems.length || adminSaving}
                  onClick={() =>
                    setDraftItems((current) => normalizeItems(current, draftPrice))
                  }
                  type="button"
                >
                  <RotateCcw size={17} aria-hidden />
                  Normalizar rentable
                </button>
                <button
                  className="primary-action compact"
                  disabled={!draftItems.length || !draftName.trim() || adminSaving}
                  onClick={() => void saveDraftPack()}
                  type="button"
                >
                  <Save size={17} aria-hidden />
                  {adminSaving
                    ? "Guardando"
                    : editingPackId
                      ? "Actualizar caja"
                      : "Guardar caja"}
                </button>
              </div>
            </div>

            <div className="stock-panel pack-source-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Premios disponibles</span>
                  <h2>{packBuilderStock.length} en stock</h2>
                </div>
                <button
                  className="secondary-action compact"
                  onClick={() => void loadShopStock()}
                  type="button"
                >
                  <RotateCcw size={16} aria-hidden />
                  Refrescar
                </button>
              </div>
              <div className="stock-type-tabs" aria-label="Filtro para armar caja">
                <button
                  className={packStockGameFilter === "mixed" ? "active" : ""}
                  onClick={() => setPackStockGameFilter("mixed")}
                  type="button"
                >
                  Todos
                </button>
                {cardGames.map((game) => (
                  <button
                    className={packStockGameFilter === game ? "active" : ""}
                    key={game}
                    onClick={() => setPackStockGameFilter(game)}
                    type="button"
                  >
                    {gameLabels[game]}
                  </button>
                ))}
              </div>
              <div className="stock-type-tabs" aria-label="Tipo de premio para armar caja">
                <button
                  className={packPrizeFilter === "all" ? "active" : ""}
                  onClick={() => setPackPrizeFilter("all")}
                  type="button"
                >
                  Todo tipo
                </button>
                {prizeItemTypes.map((itemType) => (
                  <button
                    className={packPrizeFilter === itemType ? "active" : ""}
                    key={itemType}
                    onClick={() => setPackPrizeFilter(itemType)}
                    type="button"
                  >
                    {prizeTypeShortLabels[itemType]}
                  </button>
                ))}
              </div>
              <div className="stock-list expanded">
                {packBuilderStock.length ? (
                  packBuilderStock.map((stockItem) =>
                    renderStockItem(stockItem, true),
                  )
                ) : (
                  <p>
                    No hay stock compatible con esta caja. Cargalo desde la
                    pagina de stock.
                  </p>
                )}
              </div>
            </div>

            <div className="draft-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Premios de la caja</span>
                  <h2>{draftItems.length} items</h2>
                </div>
                <SortControl
                  ariaLabel="Ordenar premios por precio"
                  onChange={(value) =>
                    setDraftPriceSort(value as "price-desc" | "price-asc")
                  }
                  options={[
                    { value: "price-desc", label: "Mayor a menor" },
                    { value: "price-asc", label: "Menor a mayor" },
                  ]}
                  value={draftPriceSort}
                />
              </div>
              <div className="draft-list">
                {draftItems.length ? (
                  sortedDraftItems.map((item) => (
                    <div
                      className={`draft-item ${itemTypeOf(item.card)}`}
                      key={item.slotId}
                    >
                      <img src={cardImage(item.card)} alt="" />
                      <div>
                        <span className={`prize-type-chip ${itemTypeOf(item.card)}`}>
                          {prizeTypeLabels[itemTypeOf(item.card)]}
                        </span>
                        <strong>{item.card.name}</strong>
                        <small>
                          {formatUsd.format(item.card.priceUsd ?? 0)} -{" "}
                          {gameLabels[item.card.game]}
                        </small>
                        <small>Stock disponible {stockQuantityForCard(item.card)}</small>
                        <label>
                          Prob. %
                          <input
                            min="0"
                            onChange={(event) =>
                              updateDraftProbability(
                                item.slotId,
                                Number(event.target.value),
                              )
                            }
                            step="0.001"
                            type="number"
                            value={item.probability}
                          />
                        </label>
                      </div>
                      <button
                        aria-label={`Quitar ${item.card.name}`}
                        onClick={() => removeDraftItem(item.slotId)}
                        title="Quitar"
                        type="button"
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </div>
                  ))
                ) : (
                  <p>Agrega premios desde tu stock para armar la caja.</p>
                )}
              </div>
            </div>
          </div>

          <div className="saved-packs">
            <h3>Cajas creadas</h3>
            {sellerPacks.length ? (
              sellerPacks.map((pack) => (
                <div className="saved-pack" key={pack.id}>
                  <span>
                    <strong>{pack.name}</strong>
                    <small>
                      Pullario - {pack.series} -{" "}
                      {pack.items.length} premios
                    </small>
                  </span>
                  <div className="saved-pack-actions">
                    <button
                      disabled={adminSaving}
                      onClick={() => startEditingPack(pack)}
                      type="button"
                    >
                      <Settings size={16} aria-hidden />
                      Editar
                    </button>
                    <button
                      disabled={adminSaving}
                      onClick={() => void deleteSavedPack(pack.id)}
                      type="button"
                    >
                      <Trash2 size={16} aria-hidden />
                      Borrar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay cajas creadas todavia.</p>
            )}
          </div>
        </>
      ) : (
        sellerRequiredPanel
      )}
    </section>
  );

  const adminOrdersSection = (
    <section className="admin-band page-section" aria-label="Pedidos de Pullario">
      {adminShellHeader}
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
        sellerRequiredPanel
      )}
    </section>
  );

  const visibleShipmentGroups =
    shipmentView === "active" ? activeShipmentGroups : shipmentHistoryGroups;

  const adminShipmentsSection = (
    <section className="admin-band page-section" aria-label="Envios de Pullario">
      {adminShellHeader}
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
        sellerRequiredPanel
      )}
    </section>
  );

  const adminUsersSection = (
    <section
      className="admin-band page-section"
      aria-label="Inventarios de usuarios"
    >
      {adminShellHeader}
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
        sellerRequiredPanel
      )}
    </section>
  );

  const adminSection =
    view === "admin-stock"
      ? adminStockSection
      : view === "admin-packs"
        ? adminPacksSection
        : view === "admin-orders"
          ? adminOrdersSection
          : view === "admin-shipments"
            ? adminShipmentsSection
            : view === "admin-users"
              ? adminUsersSection
          : adminDashboardSection;

  const upgraderSection = (
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

  const changerSection = (
    <section className="upgrader-page changer-page page-section" aria-labelledby="changer-title">
      <div className="upgrader-heading">
        <span className="eyebrow">Changer</span>
        <h1 id="changer-title">Cambiá tus premios sin riesgo</h1>
        <p>
          Entregá premios de tu inventario y elegí productos por el mismo valor
          o menos. La diferencia vuelve automáticamente a tu cartera.
        </p>
      </div>

      {!session && (
        <div className="upgrader-guest-notice">
          <div>
            <span className="eyebrow">Modo demostración</span>
            <strong>Iniciá sesión para usar tus premios</strong>
            <p>Podés explorar los productos disponibles antes de entrar.</p>
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

      {changerOutcome && (
        <article className="upgrader-outcome won changer-outcome" role="status">
          <div className="changer-outcome-images" aria-hidden>
            {(changerOutcome.targets ?? []).slice(0, 4).map((target) => (
              <img
                src={cardImage(target.card)}
                alt=""
                key={target.stockId}
                onError={handleImageError(target.card.game)}
              />
            ))}
          </div>
          <div>
            <span>Cambio completado</span>
            <h2>{changerOutcome.awardedUserCardIds?.length ?? 0} premios agregados</h2>
            <p>
              Recibiste productos por {formatUsd.format(changerOutcome.targetValueUsd ?? 0)}.
              {(changerOutcome.refundUsd ?? 0) > 0 &&
                ` ${formatUsd.format(changerOutcome.refundUsd ?? 0)} volvieron a tu cartera.`}
            </p>
          </div>
          <Link className="secondary-action compact" href="/profile">
            <Trophy size={17} aria-hidden />
            Ver inventario
          </Link>
        </article>
      )}

      <div className="changer-layout">
        <section className="upgrader-panel changer-panel">
          <div className="upgrader-panel-heading">
            <div>
              <span>Entregás</span>
              <strong>{formatUsd.format(changerStakeValue)}</strong>
            </div>
            <small>{changerStakeCards.length}/20 elegidos</small>
          </div>
          <div className={`upgrader-selection-card selection-tray${changerStakeCards.length ? " filled" : ""}`}>
            <div className="upgrader-selection-copy">
              <small>Tus premios</small>
              <strong>{changerStakeCards.length ? `${changerStakeCards.length} seleccionados` : "Elegí qué querés cambiar"}</strong>
              <span>{changerStakeCards.length ? formatUsd.format(changerStakeValue) : "Tu selección aparecerá acá"}</span>
            </div>
            {changerStakeCards.length ? (
              <div className="upgrader-selection-strip">
                {changerStakeCards.map((item) => (
                  <button
                    aria-label={`Quitar ${item.card.name}`}
                    className="upgrader-selection-thumb"
                    disabled={changerSaving}
                    key={item.id}
                    onClick={() => toggleChangerStake(item.id)}
                    type="button"
                  >
                    <img src={cardImage(item.card)} alt="" onError={handleImageError(item.card.game)} />
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
            {ownedWonCards.length ? ownedWonCards.map((item) => {
              const selected = changerStakeIds.includes(item.id);
              return (
                <button
                  aria-pressed={selected}
                  className={`upgrader-item${selected ? " selected" : ""}`}
                  disabled={!session || changerSaving}
                  key={item.id}
                  onClick={() => toggleChangerStake(item.id)}
                  type="button"
                >
                  <img src={cardImage(item.card)} alt="" onError={handleImageError(item.card.game)} />
                  <span><strong>{item.card.name}</strong><small>{item.card.setName}</small></span>
                  <b>{formatUsd.format(item.valueUsd)}</b>
                  <CircleCheck size={19} aria-hidden />
                </button>
              );
            }) : (
              <div className="upgrader-empty">
                <Trophy size={28} aria-hidden />
                <strong>{session ? "No tenés premios activos" : "Tu inventario aparecerá acá"}</strong>
                <p>{session ? "Abrí una caja para conseguir premios." : "Iniciá sesión para elegir tus premios."}</p>
              </div>
            )}
          </div>
        </section>

        <section className="upgrader-center changer-center" aria-label="Resumen del cambio">
          <div className="changer-symbol" aria-hidden>
            <ArrowRight size={42} />
          </div>
          <span className="eyebrow">Valor disponible</span>
          <strong className="changer-main-value">{formatUsd.format(changerStakeValue)}</strong>
          <div className="upgrader-values">
            <div><small>Entregás</small><strong>{formatUsd.format(changerStakeValue)}</strong></div>
            <ArrowRight size={20} aria-hidden />
            <div><small>Recibís</small><strong>{formatUsd.format(changerTargetValue)}</strong></div>
          </div>
          <div className={`changer-refund${changerTargetValue > changerStakeValue ? " invalid" : ""}`}>
            <Wallet size={22} aria-hidden />
            <div>
              <small>Vuelve a tu cartera</small>
              <strong>
                {changerTargetValue > changerStakeValue
                  ? `Faltan ${formatUsd.format(changerTargetValue - changerStakeValue)}`
                  : formatUsd.format(changerRefund)}
              </strong>
            </div>
          </div>
          <button
            className="primary-action changer-play"
            disabled={
              !session || changerSaving || !changerStakeIds.length ||
              !changerSelectedTargets.length || changerTargetValue <= 0 ||
              changerTargetValue > changerStakeValue
            }
            onClick={() => void playChanger()}
            type="button"
          >
            <ArrowUpDown size={19} aria-hidden />
            {changerSaving ? "Cambiando..." : "Confirmar cambio"}
          </button>
          <p className="upgrader-risk">El cambio es inmediato y no usa probabilidades.</p>
        </section>

        <section className="upgrader-panel changer-panel">
          <div className="upgrader-panel-heading">
            <div>
              <span>Recibís</span>
              <strong>{formatUsd.format(changerTargetValue)}</strong>
            </div>
            <small>{changerTargetUnits}/20 elegidos</small>
          </div>
          <div className={`upgrader-selection-card selection-tray${changerTargetUnits ? " filled" : ""}`}>
            <div className="upgrader-selection-copy">
              <small>Productos elegidos</small>
              <strong>{changerTargetUnits ? `${changerTargetUnits} productos` : "Elegí qué querés recibir"}</strong>
              <span>{changerTargetUnits ? formatUsd.format(changerTargetValue) : "Tu selección aparecerá acá"}</span>
            </div>
            {changerTargetUnits ? (
              <div className="upgrader-selection-strip">
                {changerSelectedTargets.flatMap(({ item, quantity }) =>
                  Array.from({ length: quantity }, (_, index) => (
                    <button
                      aria-label={`Quitar una unidad de ${item.card.name}`}
                      className="upgrader-selection-thumb"
                      disabled={changerSaving}
                      key={`${item.id}-${index}`}
                      onClick={() => removeChangerTarget(item.id)}
                      type="button"
                    >
                      <img src={cardImage(item.card)} alt="" onError={handleImageError(item.card.game)} />
                      <span aria-hidden><X size={13} /></span>
                    </button>
                  )),
                )}
              </div>
            ) : (
              <div className="upgrader-selection-empty" aria-hidden>
                <Sparkles size={28} />
                <span>Los productos aparecerán acá</span>
              </div>
            )}
          </div>
          <div className="upgrader-target-tools">
            <div className="stock-type-tabs" aria-label="Filtrar por juego">
              <button className={changerGame === "mixed" ? "active" : ""} onClick={() => setChangerGame("mixed")} type="button">Todos</button>
              {cardGames.map((game) => (
                <button className={changerGame === game ? "active" : ""} key={game} onClick={() => setChangerGame(game)} type="button">{gameLabels[game]}</button>
              ))}
            </div>
            <label className="upgrader-search">
              <Search size={17} aria-hidden />
              <input onChange={(event) => setChangerQuery(event.target.value)} placeholder="Buscar producto" value={changerQuery} />
            </label>
          </div>
          <div className="upgrader-item-list">
            {changerLoading ? (
              <div className="upgrader-empty"><span className="mini-spinner" aria-hidden /><strong>Cargando productos</strong></div>
            ) : filteredChangerTargets.length ? filteredChangerTargets.map((item) => {
              const quantity = changerTargetQuantities[item.id] ?? 0;
              const price = Number(item.card.priceUsd ?? 0);
              const canAdd = Boolean(
                session && changerStakeIds.length && !changerSaving &&
                quantity < Math.min(20, item.quantity) && changerTargetUnits < 20 &&
                changerTargetValue + price <= changerStakeValue + 0.0001,
              );
              return (
                <button
                  aria-label={`Agregar ${item.card.name}`}
                  className={`upgrader-item${quantity ? " selected" : ""}`}
                  disabled={!canAdd}
                  key={item.id}
                  onClick={() => addChangerTarget(item)}
                  type="button"
                >
                  <img src={cardImage(item.card)} alt="" onError={handleImageError(item.card.game)} />
                  <span><strong>{item.card.name}</strong><small>{item.card.setName} · stock {item.quantity}</small></span>
                  <b>{quantity ? `${quantity}× · ` : ""}{formatUsd.format(price)}</b>
                  <Plus size={19} aria-hidden />
                </button>
              );
            }) : (
              <div className="upgrader-empty"><Search size={27} aria-hidden /><strong>No hay productos para ese filtro</strong></div>
            )}
          </div>
        </section>
      </div>
    </section>
  );

  const inventoryPanel = (
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

  const profileSection = (
    <section className="admin-band page-section" aria-label="Perfil de usuario">
      <div className="admin-intro">
        <span className="eyebrow">Perfil</span>
        <h1>Cuenta local</h1>
        <p>Modifica los datos del usuario que esta usando Pullario en esta PC.</p>
      </div>

      {session ? (
        <>
          <nav className="profile-section-nav" aria-label="Secciones del perfil">
            <button
              className={profileSectionView === "personal" ? "active" : ""}
              onClick={() => setProfileSectionView("personal")}
              type="button"
            >
              <User size={17} aria-hidden />
              Datos personales
            </button>
            <button
              className={profileSectionView === "inventory" ? "active" : ""}
              onClick={() => setProfileSectionView("inventory")}
              type="button"
            >
              <Boxes size={17} aria-hidden />
              Inventario
            </button>
          </nav>

          {profileSectionView === "personal" ? (
            <div className="profile-personal-layout">
              <aside className="profile-account-summary">
                <span className="db-status online">
                  <User size={16} aria-hidden />
                  {roleLabels[session.role]}
                </span>
                <strong>{session.username}</strong>
                <small>
                  Balance demo {formatUsd.format(session.balanceUsd ?? 0)}
                </small>
                <div
                  className={`address-status ${
                    session.hasShippingAddress ? "complete" : "incomplete"
                  }`}
                >
                  {session.hasShippingAddress ? (
                    <CircleCheck size={18} aria-hidden />
                  ) : (
                    <TriangleAlert size={18} aria-hidden />
                  )}
                  <span>
                    <strong>
                      {session.hasShippingAddress
                        ? "Domicilio completo"
                        : "Falta completar el domicilio"}
                    </strong>
                    <small>
                      {session.hasShippingAddress
                        ? "Ya podes solicitar retiros fisicos."
                        : `Falta: ${(
                            session.shippingAddressMissing ?? ["datos obligatorios"]
                          ).join(", ")}.`}
                    </small>
                  </span>
                </div>
              </aside>

              <form
                className="profile-details-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void updateProfile();
                }}
              >
                <section className="profile-form-section">
                  <div className="profile-form-heading">
                    <span className="eyebrow">Cuenta y contacto</span>
                    <h2>Informacion personal</h2>
                  </div>
                  <div className="profile-form-grid">
                    <label>
                      Nombre visible
                      <input
                        onChange={(event) =>
                          setProfileDisplayName(event.target.value)
                        }
                        value={profileDisplayName}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Nombre y apellido
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="name"
                        onChange={(event) => setProfileFullName(event.target.value)}
                        placeholder="Nombre del destinatario"
                        required
                        value={profileFullName}
                      />
                    </label>
                    <label>
                      Email
                      <input
                        autoComplete="email"
                        onChange={(event) => setProfileEmail(event.target.value)}
                        type="email"
                        value={profileEmail}
                      />
                    </label>
                    <label>
                      Telefono
                      <input
                        autoComplete="tel"
                        onChange={(event) => setProfilePhone(event.target.value)}
                        placeholder="Ej: +54 11 5555 5555"
                        type="tel"
                        value={profilePhone}
                      />
                    </label>
                  </div>
                </section>

                <section className="profile-form-section">
                  <div className="profile-form-heading">
                    <span className="eyebrow">Entrega</span>
                    <h2>Domicilio</h2>
                    <p>Usaremos esta direccion para enviar tus premios retirados.</p>
                    <div className="shipping-country-notice">
                      <Info size={17} aria-hidden />
                      Por el momento realizamos envios unicamente dentro de Argentina.
                    </div>
                  </div>
                  <div className="profile-form-grid address-grid">
                    <label>
                      <span className="field-label">
                        Pais
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <select
                        autoComplete="country-name"
                        onChange={(event) => setProfileCountry(event.target.value)}
                        required
                        value={profileCountry}
                      >
                        <option value="Argentina">Argentina</option>
                        <option disabled value="proximamente">
                          Otros paises proximamente
                        </option>
                      </select>
                    </label>
                    <label>
                      <span className="field-label">
                        Provincia
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <select
                        autoComplete="address-level1"
                        onChange={(event) =>
                          setProfileProvince(event.target.value)
                        }
                        required
                        value={profileProvince}
                      >
                        <option value="">Seleccionar provincia</option>
                        {argentinaProvinces.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="field-label">
                        Ciudad
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="address-level2"
                        onChange={(event) => setProfileCity(event.target.value)}
                        required
                        value={profileCity}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Calle
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="address-line1"
                        onChange={(event) => setProfileStreet(event.target.value)}
                        placeholder="Ej: Av. Corrientes"
                        required
                        value={profileStreet}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Numero
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        onChange={(event) =>
                          setProfileStreetNumber(event.target.value)
                        }
                        placeholder="Ej: 1234"
                        required
                        value={profileStreetNumber}
                      />
                    </label>
                    <label>
                      Piso
                      <input
                        onChange={(event) => setProfileFloor(event.target.value)}
                        placeholder="Ej: 4"
                        value={profileFloor}
                      />
                    </label>
                    <label>
                      Departamento
                      <input
                        onChange={(event) =>
                          setProfileApartment(event.target.value)
                        }
                        placeholder="Ej: B"
                        value={profileApartment}
                      />
                    </label>
                    <label>
                      <span className="field-label">
                        Codigo postal
                        <span className="required-mark" aria-hidden>*</span>
                      </span>
                      <input
                        autoComplete="postal-code"
                        onChange={(event) =>
                          setProfilePostalCode(event.target.value)
                        }
                        required
                        value={profilePostalCode}
                      />
                    </label>
                    <label className="wide-field">
                      Referencia
                      <input
                        onChange={(event) =>
                          setProfileAddressReference(event.target.value)
                        }
                        placeholder="Ej: Porton negro, timbre 2"
                        value={profileAddressReference}
                      />
                    </label>
                  </div>
                </section>

                <section className="profile-form-section security-section">
                  <div className="profile-form-heading">
                    <span className="eyebrow">Seguridad</span>
                    <h2>Cambiar contraseña</h2>
                  </div>
                  <label>
                    Nueva contraseña
                    <input
                      autoComplete="new-password"
                      onChange={(event) => setProfilePassword(event.target.value)}
                      placeholder="Dejar vacio para no cambiar"
                      type="password"
                      value={profilePassword}
                    />
                  </label>
                </section>

                <div className="profile-form-actions">
                  {profileMessage && (
                    <p className="admin-message">{profileMessage}</p>
                  )}
                  <button
                    className="primary-action compact"
                    disabled={profileSaving}
                    type="submit"
                  >
                    <Save size={17} aria-hidden />
                    {profileSaving ? "Guardando" : "Guardar datos"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="profile-inventory-view">{inventoryPanel}</div>
          )}
        </>
      ) : (
        <div className="login-panel">
          <span className="eyebrow">Sesion requerida</span>
          <h3>Entrar desde la pagina principal</h3>
          <Link className="primary-action compact" href="/">
            <LogIn size={17} aria-hidden />
            Ir al login
          </Link>
        </div>
      )}
    </section>
  );

  const pageTransitionKey = [view, initialPackId ?? ""].join(":");

  return (
    <main className="market-shell design-v3">
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

      <div
        className={`page-transition ${
          view === "cards" ? "cards-page-transition" : ""
        }`}
        key={pageTransitionKey}
      >
        {view === "home" && (
          <>
            <section className="market-hero" aria-labelledby="main-title">
              <div className="hero-product-stage" aria-hidden>
                {heroShowcaseItems.map((item, index) => (
                  <img
                    className={`hero-product hero-product-${index + 1}`}
                    key={`hero-${item.slotId}`}
                    src={cardImage(item.card)}
                    alt=""
                    onError={handleImageError(item.card.game, itemTypeOf(item.card))}
                  />
                ))}
              </div>
              <div className="hero-copy">
                <div className="status-pill">
                  <Sparkles size={16} aria-hidden />
                  One Piece · Pokemon · Magic
                </div>
                <h1 id="main-title">Cajas TCG para coleccionistas</h1>
                <p>
                  Premios reales, probabilidades visibles y una apertura que
                  termina en tu inventario.
                </p>
                <div className="hero-actions" aria-label="Acciones principales">
                  <Link className="primary-action" href="#cajas">
                    <PackageOpen size={18} aria-hidden />
                    Ver cajas
                  </Link>
                  <Link className="secondary-action" href="/cards">
                    <Search size={18} aria-hidden />
                    Buscar cartas
                  </Link>
                </div>
              </div>
            </section>

            {!session && (
              <section className="home-access-band" aria-label="Acceso a Pullario">
                <div>
                  <span className="eyebrow">Tu cuenta</span>
                  <h2>Entra para abrir, guardar y retirar premios.</h2>
                </div>
                <div className="home-access-actions">
                  <button
                    className="secondary-action compact"
                    onClick={() => {
                      setAuthMode("login");
                      setHomeAuthOpen(true);
                    }}
                    type="button"
                  >
                    <LogIn size={17} aria-hidden />
                    Entrar
                  </button>
                  <button
                    className="primary-action compact"
                    onClick={() => {
                      setAuthMode("register");
                      setHomeAuthOpen(true);
                    }}
                    type="button"
                  >
                    <UserPlus size={17} aria-hidden />
                    Crear cuenta
                  </button>
                </div>
              </section>
            )}

            {packListing}
            {homeGuideSection}

            <section
              className="trust-band"
              id="confianza"
              aria-label="Controles de confianza"
            >
              <article>
                <Eye size={22} aria-hidden />
                <h3>Todo visible</h3>
                <p>
                  Revisa los premios y sus probabilidades antes de abrir.
                </p>
              </article>
              <article>
                <Dice5 size={22} aria-hidden />
                <h3>Resultado claro</h3>
                <p>
                  La ruleta termina sobre el mismo premio que recibes.
                </p>
              </article>
              <article>
                <Trophy size={22} aria-hidden />
                <h3>Tu premio, tu decision</h3>
                <p>
                  Guardalo, vendelo por saldo o solicita el retiro fisico.
                </p>
              </article>
            </section>
          </>
        )}

        {view === "pack" &&
          (selectedPackExists ? (
            <>
              {openingSection}
              {contentsSection}
            </>
          ) : (
            missingPackSection
          ))}
        {view === "cards" && searchSection}
        {view === "upgrader" && upgraderSection}
        {view === "changer" && changerSection}
        {view.startsWith("admin") && adminSection}
        {view === "profile" && profileSection}
        {siteFooter}
      </div>

      {homeAuthOpen && !session && (
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
            {authPanel}
          </article>
        </div>
      )}

      {shippingModalOpen && (
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
      )}

      {stockEditor && (
        <div
          className="modal-backdrop"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !stockEditSaving) {
              setStockEditor(null);
            }
          }}
          role="presentation"
        >
          <article
            aria-labelledby="stock-edit-modal-title"
            aria-modal="true"
            className="utility-modal stock-edit-modal"
            role="dialog"
          >
            <button
              aria-label="Cerrar edicion de stock"
              className="modal-close"
              disabled={stockEditSaving}
              onClick={() => setStockEditor(null)}
              type="button"
            >
              <X size={18} aria-hidden />
            </button>
            <span className="eyebrow">Editar producto</span>
            <div className="stock-edit-heading">
              <img
                alt=""
                onError={handleImageError(
                  stockEditor.card.game,
                  itemTypeOf(stockEditor.card),
                )}
                src={
                  stockEditImageUrl.trim()
                    ? localImageUrl(stockEditImageUrl.trim())
                    : cardImage({ ...stockEditor.card, imageUrl: undefined })
                }
              />
              <div>
                <h2 id="stock-edit-modal-title">{stockEditor.card.name}</h2>
                <p>
                  {gameLabels[stockEditor.card.game]} - Stock actual: {stockEditor.quantity}
                </p>
              </div>
            </div>
            <label>
              Precio USD
              <input
                autoFocus
                inputMode="decimal"
                onChange={(event) => setStockEditPrice(event.target.value)}
                placeholder="Ej: 12.50"
                type="text"
                value={stockEditPrice}
              />
            </label>
            <label>
              URL de la imagen
              <input
                onChange={(event) => setStockEditImageUrl(event.target.value)}
                placeholder="https://..."
                type="url"
                value={stockEditImageUrl}
              />
            </label>
            <p className="stock-edit-help">
              Podes usar una imagen directa en formato JPG, PNG o WebP.
            </p>
            {stockEditError && (
              <p className="search-error" role="alert">
                {stockEditError}
              </p>
            )}
            <div className="stock-edit-actions">
              <button
                className="secondary-action compact"
                disabled={stockEditSaving}
                onClick={() => setStockEditor(null)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="primary-action compact"
                disabled={stockEditSaving || stockEditPrice.trim() === ""}
                onClick={() => void saveStockDetails()}
                type="button"
              >
                <Save size={16} aria-hidden />
                {stockEditSaving ? "Guardando" : "Guardar cambios"}
              </button>
            </div>
          </article>
        </div>
      )}

      {walletOpen && (
        <div
          className="modal-backdrop"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setWalletOpen(false);
            }
          }}
          role="presentation"
        >
          <article
            aria-labelledby="wallet-modal-title"
            aria-modal="true"
            className="utility-modal"
            role="dialog"
          >
            <button
              aria-label="Cerrar cartera"
              className="modal-close"
              onClick={() => setWalletOpen(false)}
              type="button"
            >
              <X size={18} aria-hidden />
            </button>
            <span className="eyebrow">Cartera</span>
            <h2 id="wallet-modal-title">
              {formatUsd.format(session?.balanceUsd ?? 0)}
            </h2>
            <p>
              Recarga saldo demo local para probar aperturas y compras sin pagos
              reales.
            </p>
            <label>
              Monto USD
              <input
                inputMode="decimal"
                onChange={(event) => setWalletAmount(event.target.value)}
                placeholder="Ej: 10"
                type="text"
                value={walletAmount}
              />
            </label>
            <button
              className="primary-action compact"
              disabled={
                walletSaving ||
                !Number.isFinite(Number(walletAmount)) ||
                Number(walletAmount) <= 0
              }
              onClick={() => void topUpWallet()}
              type="button"
            >
              <Wallet size={17} aria-hidden />
              {walletSaving ? "Recargando" : "Recargar dinero"}
            </button>
            {walletMessage && <p className="admin-message">{walletMessage}</p>}
          </article>
        </div>
      )}

      {wonCardsOpen && (
        <div
          className="modal-backdrop"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setWonCardsOpen(false);
            }
          }}
          role="presentation"
        >
          <article
            aria-labelledby="won-cards-modal-title"
            aria-modal="true"
            className="utility-modal won-cards-modal"
            role="dialog"
          >
            <button
              aria-label="Cerrar premios ganados"
              className="modal-close"
              onClick={() => setWonCardsOpen(false)}
              type="button"
            >
              <X size={18} aria-hidden />
            </button>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Premios ganados</span>
                <h2 id="won-cards-modal-title">
                  {formatUsd.format(ownedWonCardsValue)}
                </h2>
              </div>
            </div>
            <div className="won-card-list">
              {ownedWonCards.length ? (
                ownedWonCards.map((cardItem) => (
                  <article
                    className={`won-card ${itemTypeOf(cardItem.card)}`}
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
                        {cardItem.status === "waiting_stock" && (
                          <span className="status-chip waiting_stock">
                            {cardStatusLabels.waiting_stock}
                          </span>
                        )}
                        <span
                          className={`prize-type-chip ${itemTypeOf(cardItem.card)}`}
                        >
                          {prizeTypeLabels[itemTypeOf(cardItem.card)]}
                        </span>
                      </div>
                      <strong>{cardItem.card.name}</strong>
                      <small>
                        {cardItem.packName} -{" "}
                        {formatUsd.format(cardItem.valueUsd)}
                      </small>
                      <span className="card-meta">
                        {cardItem.card.setName}
                        {cardItem.card.number
                          ? ` #${cardItem.card.number}`
                          : ""}
                      </span>
                    </div>
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
                  </article>
                ))
              ) : (
                <p className="empty-list">
                  No tenes premios disponibles para vender o retirar. El
                  historial completo queda en tu perfil.
                </p>
              )}
            </div>
          </article>
        </div>
      )}

      {wonCardsMessage && (
        <div
          aria-live="polite"
          className={`notice-toast ${wonCardsMessageTone}`}
          role={wonCardsMessageTone === "error" ? "alert" : "status"}
        >
          {wonCardsMessageTone === "success" ? (
            <CircleCheck size={20} aria-hidden />
          ) : wonCardsMessageTone === "warning" ? (
            <TriangleAlert size={20} aria-hidden />
          ) : wonCardsMessageTone === "error" ? (
            <CircleX size={20} aria-hidden />
          ) : (
            <Info size={20} aria-hidden />
          )}
          <span>{wonCardsMessage}</span>
          <button
            aria-label="Cerrar notificacion"
            onClick={() => setWonCardsMessage("")}
            type="button"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      )}

      {selectedCard && (
        <CardModal
          card={selectedCard.card}
          key={`${selectedCard.card.game}-${selectedCard.card.id}`}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </main>
  );
}

function SortControl({
  ariaLabel,
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <div className="sort-control">
      <ArrowUpDown aria-hidden size={17} />
      <span>Ordenar</span>
      <div className="sort-select">
        <select
          aria-label={ariaLabel}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden size={16} />
      </div>
    </div>
  );
}

function SearchConsole({
  actionLabel,
  infinite = false,
  onCardAction,
  onLoadMore,
  onSearch,
  search,
  setSearch,
}: {
  actionLabel: string;
  infinite?: boolean;
  onCardAction: (card: ExternalCard) => void;
  onLoadMore?: () => void;
  onSearch: (override?: Partial<SearchState>) => void;
  search: SearchState;
  setSearch: React.Dispatch<React.SetStateAction<SearchState>>;
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (
      !infinite ||
      !sentinel ||
      !onLoadMore ||
      !search.hasMore ||
      search.loading ||
      search.loadingMore
    ) {
      return;
    }

    const scrollContainer = sentinel.closest(".result-grid");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: scrollContainer,
        rootMargin: "220px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [infinite, onLoadMore, search.hasMore, search.loading, search.loadingMore]);

  return (
    <div className={`search-console ${infinite ? "infinite-search" : ""}`}>
      <div className="source-tabs" aria-label="Fuente de cartas">
        {cardGames.map((game) => (
          <button
            className={search.game === game ? "active" : ""}
            key={game}
            onClick={() =>
              setSearch((current) =>
                current.game === game ? current : newSearchState(game, ""),
              )
            }
            type="button"
          >
            {gameLabels[game]}
          </button>
        ))}
      </div>

      <div className="search-row">
        <label>
          Buscar carta
          <input
            onChange={(event) =>
              setSearch((current) => ({ ...current, query: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearch();
              }
            }}
            placeholder="Ej: Squirtle, Luffy, Lightning Bolt"
            type="search"
            value={search.query}
          />
        </label>
        <label>
          Set
          <input
            onChange={(event) =>
              setSearch((current) => ({ ...current, setName: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearch();
              }
            }}
            placeholder="Ej: Stellar Crown, OP13, MH3"
            value={search.setName}
          />
        </label>
        <label>
          Numero
          <input
            onChange={(event) =>
              setSearch((current) => ({ ...current, number: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearch();
              }
            }}
            placeholder="Ej: 148, 001"
            value={search.number}
          />
        </label>
        <label>
          Rareza
          <input
            onChange={(event) =>
              setSearch((current) => ({ ...current, rarity: event.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearch();
              }
            }}
            placeholder="Ej: Common, C, Rare Holo"
            value={search.rarity}
          />
        </label>
        <button
          className="search-button"
          disabled={search.loading}
          onClick={() => onSearch()}
          type="button"
        >
          <Search size={18} aria-hidden />
          {search.loading ? "Buscando" : "Buscar"}
        </button>
      </div>

      {infinite && (
        <div className="search-results-toolbar">
          <SortControl
            ariaLabel="Ordenar resultados"
            onChange={(value) => {
              const sort = value as SearchState["sort"];
              setSearch((current) => ({ ...current, sort }));

              if (
                search.query.trim().length >= 2 ||
                search.setName.trim().length >= 2
              ) {
                onSearch({ sort });
              }
            }}
            options={[
              { value: "relevance", label: "Relevancia" },
              { value: "price-asc", label: "Precio: menor a mayor" },
              { value: "price-desc", label: "Precio: mayor a menor" },
              { value: "number-desc", label: "Numero: mayor a menor" },
            ]}
            value={search.sort}
          />
        </div>
      )}

      {search.error && <p className="search-error">{search.error}</p>}

      <div className="result-grid" aria-live="polite">
        {search.loading ? (
          <div className="search-loader" role="status">
            <div className="loader-orbit" aria-hidden>
              <span />
            </div>
            <div>
              <strong>Buscando cartas</strong>
              <p>
                Consultando imagenes y precios
                {search.setName.trim()
                  ? ` en ${search.setName.trim()}`
                  : ` para ${gameLabels[search.game]}`}
                .
              </p>
            </div>
          </div>
        ) : (
          search.results.map((card) => (
            <article className="market-card" key={`${card.game}-${card.id}`}>
              <button
                className="card-face"
                onClick={() => onCardAction(card)}
                title={actionLabel}
                type="button"
              >
                <img
                  src={cardImage(card)}
                  alt=""
                  loading="lazy"
                  onError={handleImageError(card.game)}
                />
              </button>
              <button
                className="card-summary"
                onClick={() => onCardAction(card)}
                type="button"
              >
                <span>{gameLabels[card.game]}</span>
                <h3>{card.name}</h3>
                <p>
                  {card.setName}
                  {card.number ? ` #${card.number}` : ""}
                </p>
                <strong>
                  {typeof card.priceUsd === "number"
                    ? formatUsd.format(card.priceUsd)
                    : "Sin precio"}
                </strong>
                <small>
                  {card.priceSource}
                  {card.updatedAt ? ` - ${card.updatedAt}` : ""}
                </small>
              </button>
              <button
                aria-label={`${actionLabel} ${card.name}`}
                className="card-action"
                onClick={() => onCardAction(card)}
                title={actionLabel}
                type="button"
              >
                {actionLabel === "Detalles" ? (
                  <Eye size={18} aria-hidden />
                ) : (
                  <Plus size={18} aria-hidden />
                )}
              </button>
            </article>
          ))
        )}
        {infinite && !search.loading && search.results.length > 0 && (
          <div className="infinite-search-status" ref={loadMoreRef}>
            {search.loadingMore ? (
              <>
                <span className="mini-spinner" aria-hidden />
                <strong>Cargando mas cartas</strong>
              </>
            ) : search.hasMore ? (
              <span>Continua desplazandote para ver mas</span>
            ) : (
              <span>Llegaste al final de los resultados</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CardModal({
  card,
  onClose,
}: {
  card: ExternalCard;
  onClose: () => void;
}) {
  const [focusedCardId, setFocusedCardId] = useState(card.id);
  const [variantGroups, setVariantGroups] = useState<CardLanguageGroup[]>(() =>
    isCardPrize(card) ? [] : [singleCardLanguageGroup(card)],
  );
  const [variantsLoading, setVariantsLoading] = useState(isCardPrize(card));
  const [variantsError, setVariantsError] = useState("");
  const loadingSteps = useMemo(() => variantLoadingSteps(card.game), [card.game]);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  useEffect(() => {
    if (!isCardPrize(card)) {
      return;
    }

    const controller = new AbortController();

    void fetch("/api/cards/variants", {
      body: JSON.stringify({ card }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as VariantsResponse;

        if (!response.ok || payload.error) {
          throw new Error(payload.error ?? "No se pudieron cargar versiones.");
        }

        setVariantGroups(
          payload.groups?.length ? payload.groups : [singleCardLanguageGroup(card)],
        );
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setVariantsError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar versiones.",
        );
        setVariantGroups([singleCardLanguageGroup(card)]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setVariantsLoading(false);
        }
      });

    return () => controller.abort();
  }, [card]);

  useEffect(() => {
    if (!variantsLoading) {
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStepIndex((current) =>
        Math.min(current + 1, loadingSteps.length - 1),
      );
    }, 950);

    return () => window.clearInterval(timer);
  }, [loadingSteps.length, variantsLoading]);

  const relatedVersions = useMemo(
    () => variantGroups.flatMap((group) => group.cards),
    [variantGroups],
  );
  const focusedCard =
    relatedVersions.find((version) => version.id === focusedCardId) ?? card;
  const languageCount = variantGroups.length;
  const variantCount = relatedVersions.length;

  return (
    <div
      className="modal-backdrop"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      role="presentation"
    >
      <article
        aria-labelledby="card-modal-title"
        aria-modal="true"
        className="card-modal"
        role="dialog"
      >
        <button
          aria-label="Cerrar detalles"
          className="modal-close"
          onClick={onClose}
          type="button"
        >
          <X size={18} aria-hidden />
        </button>
        <img
          src={cardImage(focusedCard)}
          alt=""
          onError={handleImageError(focusedCard.game)}
        />
        <div className="modal-copy">
          <span className="eyebrow">
            {gameLabels[focusedCard.game]} - {prizeTypeLabels[itemTypeOf(focusedCard)]}
          </span>
          <h2 id="card-modal-title">{focusedCard.name}</h2>
          <strong className="modal-price">
            {typeof focusedCard.priceUsd === "number"
              ? formatUsd.format(focusedCard.priceUsd)
              : "Sin precio"}
          </strong>
          <dl>
            <div>
              <dt>{isCardPrize(focusedCard) ? "Set" : "Expansion"}</dt>
              <dd>{focusedCard.setName}</dd>
            </div>
            {isCardPrize(focusedCard) && (
              <div>
                <dt>Numero</dt>
                <dd>{focusedCard.number ?? "N/D"}</dd>
              </div>
            )}
            <div>
              <dt>{isCardPrize(focusedCard) ? "Rareza" : "Tipo"}</dt>
              <dd>
                {isCardPrize(focusedCard)
                  ? focusedCard.rarity ?? "N/D"
                  : prizeTypeLabels[itemTypeOf(focusedCard)]}
              </dd>
            </div>
            <div>
              <dt>Fuente</dt>
              <dd>{focusedCard.priceSource}</dd>
            </div>
            <div>
              <dt>Actualizado</dt>
              <dd>{focusedCard.updatedAt ?? "N/D"}</dd>
            </div>
          </dl>
          {focusedCard.sourceUrl && (
            <a href={focusedCard.sourceUrl} rel="noreferrer" target="_blank">
              Abrir fuente
            </a>
          )}

          {isCardPrize(card) && (
          <section className="modal-versions" aria-label="Versiones relacionadas">
            <div className="modal-versions-heading">
              <h3>Misma carta por idioma</h3>
              <span>
                {variantsLoading
                  ? "Buscando"
                  : `${languageCount} idiomas / ${variantCount} versiones`}
              </span>
            </div>
            {card.game === "pokemon" && (
              <p className="variant-note">
                En Pokemon, las cartas de otros idiomas no siempre conservan el
                mismo numero dentro de la expansion. El buscador cruza set,
                numero y datos de la carta para acercarse a la version correcta,
                pero puede mostrar coincidencias cercanas.
              </p>
            )}
            {variantsError && <p className="variant-error">{variantsError}</p>}
            {variantsLoading ? (
              <div className="variant-loader" role="status">
                <div className="loader-orbit" aria-hidden>
                  <span />
                </div>
                <div>
                  <strong>{loadingSteps[loadingStepIndex]}</strong>
                  <p>Comparando la carta exacta entre idiomas disponibles.</p>
                </div>
                <ol className="loader-steps">
                  {loadingSteps.map((step, index) => (
                    <li
                      className={index <= loadingStepIndex ? "active" : ""}
                      key={step}
                    >
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="version-list">
                {variantGroups.map((group) => (
                  <section className="language-group" key={group.language}>
                    <div className="language-title">
                      <strong>{group.label}</strong>
                      <small>{group.cards.length}</small>
                    </div>
                    {group.cards.map((version) => (
                      <button
                        className={
                          version.id === focusedCard.id
                            ? "version-row active"
                            : "version-row"
                        }
                        key={`${version.game}-${version.id}`}
                        onClick={() => setFocusedCardId(version.id)}
                        type="button"
                      >
                        <img
                          src={cardImage(version)}
                          alt=""
                          loading="lazy"
                          onError={handleImageError(version.game)}
                        />
                        <span>
                          <strong>{version.name}</strong>
                          <small>
                            {version.setName}
                            {version.number ? ` #${version.number}` : ""}
                          </small>
                          <em>{version.rarity ?? "Sin rareza"}</em>
                        </span>
                        <b>
                          {typeof version.priceUsd === "number"
                            ? formatUsd.format(version.priceUsd)
                            : "Sin precio"}
                        </b>
                      </button>
                    ))}
                  </section>
                ))}
              </div>
            )}
          </section>
          )}
        </div>
      </article>
    </div>
  );
}
