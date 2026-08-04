/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ArrowLeft,
  Boxes,
  Database,
  Dice5,
  Eye,
  Gauge,
  Info,
  LockKeyhole,
  LogIn,
  Home,
  PackageOpen,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  User,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
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
};

type SearchResponse = {
  cards?: ExternalCard[];
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
  status: "owned" | "sold" | "withdrawn";
  acquiredAt?: string;
};

type UserCardsResponse = {
  cards?: UserCardItem[];
  totalValueUsd?: number;
  ownedValueUsd?: number;
  lifetimeValueUsd?: number;
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
  status: "owned" | "sold" | "withdrawn";
  acquiredAt?: string;
};

type ShopOrdersResponse = {
  orders?: ShopOrderItem[];
  reservedCount?: number;
  withdrawnCount?: number;
  soldCount?: number;
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
  | "profile"
  | "cards";

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
  process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://localhost:4000"
).replace(/\/$/, "");
const ROULETTE_CARD_WIDTH = 164;
const ROULETTE_GAP = 10;
const ROULETTE_STRIDE = ROULETTE_CARD_WIDTH + ROULETTE_GAP;
const HIT_PROBABILITY_THRESHOLD = 10;
const HIT_CELEBRATION_PIECES = Array.from({ length: 28 }, (_, index) => ({
  color: ["#ffcf4a", "#73e4d7", "#ff7897", "#8dde72"][index % 4],
  delay: `${(index % 7) * 55}ms`,
  left: `${4 + ((index * 37) % 92)}%`,
  rotation: `${(index * 47) % 180}deg`,
}));

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
  sold: "Vendida",
  withdrawn: "Retirada",
};

const orderStatusLabels: Record<UserCardItem["status"], string> = {
  owned: "Reservada",
  sold: "Vendida",
  withdrawn: "Retiro pedido",
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
  const rounded = probabilities.map((probability) =>
    probability > 0 ? Math.max(0.001, Number(probability.toFixed(3))) : 0,
  );
  const total = rounded.reduce((sum, probability) => sum + probability, 0);
  const adjustment = Number((100 - total).toFixed(3));

  if (rounded.length && adjustment) {
    const targetIndex = rounded.reduce(
      (bestIndex, probability, index) =>
        probability > rounded[bestIndex] ? index : bestIndex,
      0,
    );
    rounded[targetIndex] = Number(
      Math.max(0, rounded[targetIndex] + adjustment).toFixed(3),
    );
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

  const premiumShareTotal = premiumItems.reduce(
    (total, _item, index) => total + index + 1,
    0,
  );
  const premiumAveragePrice = premiumShareTotal
    ? premiumItems.reduce(
        (total, item, index) => total + item.price * (index + 1),
        0,
      ) / premiumShareTotal
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
    0,
    Math.min(
      PREMIUM_PROBABILITY_MASS,
      maximumProfitablePremiumMass * 0.85,
    ),
  );

  premiumItems.forEach((item, index) => {
    probabilities[item.index] =
      premiumShareTotal > 0
        ? (premiumMass * (index + 1)) / premiumShareTotal
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
  const [profilePassword, setProfilePassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
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
  const [walletAmount, setWalletAmount] = useState(50);
  const [walletMessage, setWalletMessage] = useState("");
  const [walletSaving, setWalletSaving] = useState(false);
  const [wonCardsOpen, setWonCardsOpen] = useState(false);
  const [wonCards, setWonCards] = useState<UserCardItem[]>([]);
  const [wonCardsMessage, setWonCardsMessage] = useState("");
  const [wonCardBusyId, setWonCardBusyId] = useState<number | null>(null);
  const [shopStock, setShopStock] = useState<ShopStockItem[]>([]);
  const [stockMessage, setStockMessage] = useState("");
  const [stockBusyId, setStockBusyId] = useState<number | null>(null);
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
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("Caja personalizada");
  const [draftSeries, setDraftSeries] = useState("Mi serie local");
  const [draftGame, setDraftGame] = useState<PackGame>("mixed");
  const [draftPrice, setDraftPrice] = useState(20);
  const [draftItems, setDraftItems] = useState<PackItem[]>([]);
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
      setWonCardsMessage(
        error instanceof Error ? error.message : "No se pudo leer tus cartas.",
      );
      return [];
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
    return () => {
      spinTimers.current.forEach((timer) => window.clearTimeout(timer));
      if (audioContextRef.current) {
        void audioContextRef.current.close();
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

    return selectedPack.items.slice(0, 5).map((item, index) => ({
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
  const ownedWonCards = wonCards.filter((item) => item.status === "owned");
  const ownedWonCardsValue = ownedWonCards.reduce(
    (total, item) => total + Math.max(0, item.valueUsd),
    0,
  );
  const lifetimeWonCardsValue = wonCards.reduce(
    (total, item) => total + Math.max(0, item.valueUsd),
    0,
  );
  const reservedOrderCount = shopOrders.filter(
    (item) => item.status === "owned",
  ).length;
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
  ) => {
    const current = context === "public" ? publicSearch : adminSearch;
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
      });
      return;
    }

    setter({ ...next, loading: true, error: "", results: [] });

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
          currentState.rarity !== next.rarity
        ) {
          return currentState;
        }

        return {
          ...currentState,
          results: payload.cards ?? [],
          loading: false,
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
          currentState.rarity !== next.rarity
        ) {
          return currentState;
        }

        return {
          ...currentState,
          results: [],
          loading: false,
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
        id: payload.user.id,
        username: payload.user.username,
        role: payload.user.role,
        displayName: payload.user.displayName,
        email: payload.user.email,
        balanceUsd: payload.user.balanceUsd,
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
    setAdminMessage(`Editando ${pack.name}.`);
  };

  const topUpWallet = async () => {
    if (!session) {
      setWalletMessage("Inicia sesion para recargar.");
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
        body: JSON.stringify({ amount: walletAmount }),
      });
      const payload = (await response.json()) as WalletResponse;

      if (!response.ok || payload.error || !payload.user) {
        throw new Error(payload.error ?? "No se pudo recargar la cartera.");
      }

      updateSessionUser(payload.user);
      setWalletMessage(`Recargaste ${formatUsd.format(walletAmount)}.`);
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
      setAuthMessage(`Se descontaron ${formatUsd.format(selectedPack.price)}.`);
      void loadWonCards();
      setWonCardsMessage(
        `Premio vendido por ${formatUsd.format(payload.valueUsd ?? 0)}.`,
      );
    } catch (error) {
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
      const payload = (await response.json()) as { error?: string };

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "No se pudo retirar el premio.");
      }

      void loadWonCards();
      setWonCardsMessage("Premio marcado para retiro fisico.");
    } catch (error) {
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
        balanceUsd: payload.user.balanceUsd,
      };

      storeSession(nextSession);
      setProfilePassword("");
      setProfileMessage("Perfil actualizado.");
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
    setCelebratingRunId(null);

    const targetIndex = 32;
    const runId = Date.now();
    const targetOffset = targetIndex * ROULETTE_STRIDE;
    const strip = Array.from({ length: 42 }, (_, index) => ({
      ...weightedPick(selectedPack.items),
      spinKey: `${runId}-${index}-${crypto.randomUUID()}`,
    }));
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

    const tickTimers: number[] = [];
    let tickDelay = 45;
    for (let tick = 0; tick < 30; tick += 1) {
      const progress = tick / 29;
      tickDelay += 46 + Math.pow(progress, 2) * 180;
      tickTimers.push(
        window.setTimeout(() => playRouletteTick(progress), tickDelay),
      );
    }

    const spinTimer = window.setTimeout(() => {
      setRoulette((current) =>
        current.runId === runId
          ? {
              ...current,
              offset: targetOffset,
            }
          : current,
      );
    }, 40);

    const resultTimer = window.setTimeout(() => {
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

    spinTimers.current = [spinTimer, resultTimer, ...tickTimers];
  };

  const prepareRouletteAudio = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === "suspended") {
        void audioContextRef.current.resume();
      }
    } catch {
      audioContextRef.current = null;
    }
  };

  const playRouletteTick = (progress: number) => {
    const context = audioContextRef.current;
    if (!context || context.state !== "running") return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(480 + progress * 170, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.028, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.05);
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
    prepareRouletteAudio();

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
        setAuthMessage(`Se descontaron ${formatUsd.format(selectedPack.price)}.`);
        void loadWonCards();
        void loadRecentDrops(selectedPack.id);
        void loadDbPacks();
        if (isSellerRole(session.role)) {
          void loadShopStock();
          void loadShopOrders();
        }
      });
    } catch (error) {
      setAuthMessage(
        error instanceof Error ? error.message : "No se pudo abrir la caja.",
      );
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
              <span className="pack-source">
                {gameLabels[pack.game]} - Pullario
              </span>
              <span className="pack-preview">
                {top?.card.imageUrl ? (
                  <img src={cardImage(top.card)} alt="" />
                ) : (
                  <Database size={26} aria-hidden />
                )}
              </span>
              <span className="pack-name">{pack.name}</span>
              <span className="pack-series">{pack.series}</span>
              <span className="pack-stats">
                <span>
                  <small>Precio</small>
                  <strong>{formatUsd.format(pack.price)}</strong>
                </span>
                <span>
                  <small>Hit</small>
                  <strong>{formatPercent.format(packHitChance(pack))}%</strong>
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
                <div className="hit-celebration-badge">
                  <Sparkles size={20} aria-hidden />
                  <strong>HIT</strong>
                  <small>
                    {formatPercent.format(
                      normalizedProbability(visibleRouletteResult, selectedPack),
                    )}
                    %
                  </small>
                </div>
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
              <h2>{selectedPack.name}</h2>
              <p>
                {selectedPack.series} - Pullario
              </p>
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
                key={visibleRouletteRunId}
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
              <Gauge size={18} aria-hidden />
              <span>
                <small>Hit chance</small>
                <strong>{formatPercent.format(packHitChance(selectedPack))}%</strong>
              </span>
            </div>
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
                Probabilidad {formatPercent.format(normalizedProbability(item, selectedPack))}%
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
        onCardAction={showCardDetails}
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
              ? "Pedidos y reservas"
              : "Panel administrador"}
      </h1>
      <p>
        {view === "admin-stock"
          ? "Carga cartas y productos sellados al stock y separalos por TCG antes de armar cajas."
          : view === "admin-packs"
            ? "Arma y edita cajas usando unicamente premios disponibles en tu stock."
            : view === "admin-orders"
              ? "Revisa los premios ganados por usuarios, reservados, vendidos o pedidos para retiro."
              : "Administra stock, cajas publicadas y premios ganados por usuarios desde secciones separadas."}
      </p>
      {adminNavigation}
      {adminMessage && <p className="admin-message">{adminMessage}</p>}
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
        {withPackAction && (
          <button
            className="stock-add-pack"
            disabled={stockItem.quantity <= 0}
            onClick={() => addCardToDraft(stockItem.card)}
            type="button"
          >
            A la caja
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
            <Database size={22} aria-hidden />
            <span className="eyebrow">Stock</span>
            <strong>{shopStock.length} productos cargados</strong>
            <small>
              One Piece {stockCountsByGame["one-piece"]} - Pokemon{" "}
              {stockCountsByGame.pokemon} - Magic {stockCountsByGame.magic}
            </small>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/packs">
            <PackageOpen size={22} aria-hidden />
            <span className="eyebrow">Cajas</span>
            <strong>{sellerPacks.length} cajas publicadas</strong>
            <small>Crear, editar y normalizar probabilidades.</small>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/orders">
            <Trophy size={22} aria-hidden />
            <span className="eyebrow">Pedidos</span>
            <strong>{reservedOrderCount} premios reservados</strong>
            <small>{withdrawnOrderCount} pedidas para retiro fisico.</small>
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
              </div>
              <div className="draft-list">
                {draftItems.length ? (
                  draftItems.map((item) => (
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
          <div className="admin-metrics wide">
            <span>
              <small>Reservadas</small>
              <strong>{reservedOrderCount}</strong>
            </span>
            <span>
              <small>Retiro pedido</small>
              <strong>{withdrawnOrderCount}</strong>
            </span>
            <span>
              <small>Vendidas</small>
              <strong>
                {shopOrders.filter((item) => item.status === "sold").length}
              </strong>
            </span>
          </div>
          <button
            className="secondary-action compact"
            onClick={() => void loadShopOrders()}
            type="button"
          >
            <RotateCcw size={16} aria-hidden />
            Refrescar pedidos
          </button>
          {ordersMessage && <p className="admin-message">{ordersMessage}</p>}
          <div className="order-list">
            {shopOrders.length ? (
              shopOrders.map((order) => (
                <article
                  className={`order-card ${itemTypeOf(order.card)}`}
                  key={order.id}
                >
                  <img
                    src={cardImage(order.card)}
                    alt=""
                    onError={handleImageError(order.card.game)}
                  />
                  <div>
                    <span className={`status-chip ${order.status}`}>
                      {orderStatusLabels[order.status]}
                    </span>
                    <span className={`prize-type-chip ${itemTypeOf(order.card)}`}>
                      {prizeTypeLabels[itemTypeOf(order.card)]}
                    </span>
                    <strong>{order.card.name}</strong>
                    <small>
                      {order.packName} - {formatUsd.format(order.valueUsd)}
                    </small>
                    <small>
                      Usuario: {order.displayName || order.username}
                    </small>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-list">
                Todavia no hay premios ganados por usuarios en tus cajas.
              </p>
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
          : adminDashboardSection;

  const inventoryPanel = (
    <section className="inventory-panel" aria-label="Inventario de premios">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Inventario</span>
          <h2>{wonCards.length} premios ganados</h2>
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
      <div className="admin-metrics wide">
        <span>
          <small>Disponible</small>
          <strong>{formatUsd.format(ownedWonCardsValue)}</strong>
        </span>
        <span>
          <small>Historico</small>
          <strong>{formatUsd.format(lifetimeWonCardsValue)}</strong>
        </span>
        <span>
          <small>Para retirar</small>
          <strong>
            {wonCards.filter((item) => item.status === "withdrawn").length}
          </strong>
        </span>
      </div>
      {wonCardsMessage && <p className="admin-message">{wonCardsMessage}</p>}
      <div className="inventory-list">
        {wonCards.length ? (
          wonCards.map((cardItem) => (
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
                <span className={`status-chip ${cardItem.status}`}>
                  {cardStatusLabels[cardItem.status]}
                </span>
                <span className={`prize-type-chip ${itemTypeOf(cardItem.card)}`}>
                  {prizeTypeLabels[itemTypeOf(cardItem.card)]}
                </span>
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
              {cardItem.status === "owned" && (
                <div className="won-card-actions">
                  <button
                    disabled={wonCardBusyId === cardItem.id}
                    onClick={() => void sellWonCard(cardItem.id)}
                    type="button"
                  >
                    Vender
                  </button>
                  <button
                    disabled={wonCardBusyId === cardItem.id}
                    onClick={() => void withdrawWonCard(cardItem.id)}
                    type="button"
                  >
                    Retirar
                  </button>
                </div>
              )}
            </article>
          ))
        ) : (
          <p className="empty-list">
            Todavia no ganaste premios. Cuando abras cajas reales van a aparecer
            aca.
          </p>
        )}
      </div>
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
        <div className="profile-layout">
          <form
            className="login-panel profile-panel"
            onSubmit={(event) => {
              event.preventDefault();
              void updateProfile();
            }}
          >
            <div className="profile-summary">
              <span className="db-status online">
                <User size={16} aria-hidden />
                {roleLabels[session.role]}
              </span>
              <strong>{session.username}</strong>
              <small>Balance demo {formatUsd.format(session.balanceUsd ?? 0)}</small>
            </div>
            <label>
              Nombre visible
              <input
                onChange={(event) => setProfileDisplayName(event.target.value)}
                value={profileDisplayName}
              />
            </label>
            <label>
              Email
              <input
                onChange={(event) => setProfileEmail(event.target.value)}
                type="email"
                value={profileEmail}
              />
            </label>
            <label>
              Nuevo password
              <input
                autoComplete="new-password"
                onChange={(event) => setProfilePassword(event.target.value)}
                placeholder="Dejar vacio para no cambiar"
                type="password"
                value={profilePassword}
              />
            </label>
            <button
              className="primary-action compact"
              disabled={profileSaving}
              type="submit"
            >
              <Save size={17} aria-hidden />
              {profileSaving ? "Guardando" : "Guardar perfil"}
            </button>
            {profileMessage && <p className="admin-message">{profileMessage}</p>}
          </form>
          {inventoryPanel}
        </div>
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
    <main className="market-shell">
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

      <div className="page-transition" key={pageTransitionKey}>
        {view === "home" && (
          <>
            <section className="market-hero" aria-labelledby="main-title">
              <div className="hero-copy">
                <div className="status-pill">
                  <Sparkles size={16} aria-hidden />
                  One Piece · Pokemon · Magic
                </div>
                <h1 id="main-title">Cajas TCG, premio asegurado</h1>
                <p>
                  Elige una caja, conoce todo lo que puede salir y descubre tu
                  premio en la ruleta de Pullario.
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
                  {!session && (
                    <button
                      className="secondary-action hero-login-action"
                      onClick={() => setHomeAuthOpen(true)}
                      type="button"
                    >
                      <LogIn size={18} aria-hidden />
                      Entrar
                    </button>
                  )}
                </div>
              </div>

              <div className="hero-side">{authPanel}</div>
            </section>

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
        {view.startsWith("admin") && adminSection}
        {view === "profile" && profileSection}
        {siteFooter}
      </div>

      {homeAuthOpen && !session && (
        <div
          className="modal-backdrop"
          onClick={() => setHomeAuthOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setHomeAuthOpen(false);
          }}
          role="presentation"
        >
          <article
            aria-label="Acceso a Pullario"
            aria-modal="true"
            className="utility-modal home-auth-modal"
            onClick={(event) => event.stopPropagation()}
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

      {walletOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setWalletOpen(false)}
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
            onClick={(event) => event.stopPropagation()}
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
                min="1"
                onChange={(event) => setWalletAmount(Number(event.target.value))}
                step="1"
                type="number"
                value={walletAmount}
              />
            </label>
            <button
              className="primary-action compact"
              disabled={walletSaving}
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
          onClick={() => setWonCardsOpen(false)}
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
            onClick={(event) => event.stopPropagation()}
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
              <button
                className="secondary-action compact"
                onClick={() => void loadWonCards()}
                type="button"
              >
                <RotateCcw size={16} aria-hidden />
                Refrescar
              </button>
            </div>
            {wonCardsMessage && (
              <p className="admin-message">{wonCardsMessage}</p>
            )}
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
                      <span
                        className={`prize-type-chip ${itemTypeOf(cardItem.card)}`}
                      >
                          {prizeTypeLabels[itemTypeOf(cardItem.card)]}
                      </span>
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
                        disabled={wonCardBusyId === cardItem.id}
                        onClick={() => void sellWonCard(cardItem.id)}
                        type="button"
                      >
                        Vender
                      </button>
                      <button
                        disabled={wonCardBusyId === cardItem.id}
                        onClick={() => void withdrawWonCard(cardItem.id)}
                        type="button"
                      >
                        Retirar
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

function SearchConsole({
  actionLabel,
  onCardAction,
  onSearch,
  search,
  setSearch,
}: {
  actionLabel: string;
  onCardAction: (card: ExternalCard) => void;
  onSearch: (override?: Partial<SearchState>) => void;
  search: SearchState;
  setSearch: React.Dispatch<React.SetStateAction<SearchState>>;
}) {
  return (
    <div className="search-console">
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
      onClick={onClose}
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
        onClick={(event) => event.stopPropagation()}
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
