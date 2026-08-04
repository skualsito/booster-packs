export type CardGame = "magic" | "pokemon" | "one-piece";

export type PrizeItemType = "card" | "sealed-pack" | "sealed-box";

export type ExternalCard = {
  id: string;
  game: CardGame;
  itemType?: PrizeItemType;
  name: string;
  setName: string;
  number?: string;
  rarity?: string;
  language?: string;
  languageLabel?: string;
  imageUrl?: string;
  priceUsd?: number;
  priceSource: string;
  sourceUrl?: string;
  updatedAt?: string;
};

export type CardLanguageGroup = {
  language: string;
  label: string;
  cards: ExternalCard[];
};

type CacheEntry = {
  expiresAt: number;
  cards: ExternalCard[];
};

type SearchOptions = {
  rarity?: string;
  setName?: string;
  number?: string;
};

type StructuredSearch = {
  setTerm: string;
  number: string;
};

type SetNumberQuery = {
  setTerm?: string;
  setCode?: string;
  number: string;
};

type ExternalSet = {
  id: string;
  name: string;
};

type SetCacheEntry = {
  expiresAt: number;
  sets: ExternalSet[];
};

type RateCacheEntry = {
  expiresAt: number;
  usdPerJpy: number;
};

type PokemonSpeciesCacheEntry = {
  expiresAt: number;
  names: string[];
};

type YuyuteiPriceEntry = {
  code: string;
  href?: string;
  name: string;
  priceJpy: number;
};

type OnePieceJapaneseRawCard = {
  id: string;
  image: string;
  name: string;
  number: string;
  rarity: string;
  type: string;
};

const CACHE_TTL_MS = 1000 * 60 * 20;
const SET_CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const CACHE_VERSION = "exact-language-variant-search-v1";
const ONE_PIECE_JP_CARDLIST_URL = "https://www.onepiece-cardgame.com/cardlist/";
const searchCache = new Map<string, CacheEntry>();
const onePieceJapanesePriceCache = new Map<
  string,
  { entries: YuyuteiPriceEntry[]; expiresAt: number }
>();
let pokemonSetCache: SetCacheEntry | undefined;
const tcgdexSetCaches: Partial<Record<TcgdexLocale, SetCacheEntry>> = {};
let magicSetCache: SetCacheEntry | undefined;
let jpyUsdRateCache: RateCacheEntry | undefined;
const pokemonSpeciesNameCache = new Map<number, PokemonSpeciesCacheEntry>();

type TcgdexLocale = "en" | "ja" | "zh-cn" | "zh-tw";
const tcgdexCodeSearchLocales: TcgdexLocale[] = ["en", "ja", "zh-tw", "zh-cn"];
const tcgdexLocalizedCodeSearchLocales: TcgdexLocale[] = [
  "ja",
  "zh-tw",
  "zh-cn",
];

const tcgdexLocaleLabels: Record<TcgdexLocale, string> = {
  en: "EN",
  ja: "JP",
  "zh-cn": "ZH-CN",
  "zh-tw": "ZH-TW",
};

const cardLanguageLabels: Record<string, string> = {
  en: "Ingles",
  ja: "Japones",
  "zh-cn": "Chino simplificado",
  "zh-tw": "Chino tradicional",
};

const languageSortOrder = ["en", "ja", "zh-tw", "zh-cn"];

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const cleanQuery = (query: string) =>
  query.trim().replace(/\s+/g, " ").slice(0, 80);

const cleanSetCode = (value: string) =>
  value.trim().replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 32);

const cleanSetTerm = (value: string) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9 .:'_\-&]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);

const cleanCardNumber = (value: string) =>
  value.trim().replace(/[^a-zA-Z0-9/-]/g, "").slice(0, 32);

const searchCardNumberCandidates = (value: string) => {
  const cleaned = cleanCardNumber(value);
  const withoutTotal = cleaned.split("/")[0] ?? cleaned;
  const candidates = [cleaned, withoutTotal];

  if (/^\d+$/.test(withoutTotal)) {
    candidates.push(withoutTotal.replace(/^0+(?=\d)/, ""));
    candidates.push(withoutTotal.padStart(3, "0"));
  }

  return Array.from(new Set(candidates.filter(Boolean)));
};

const onePieceCardCodeCandidates = (setCode: string, number: string) => {
  const cleanedNumber = cleanCardNumber(number).split("/")[0] ?? "";
  const numberCandidates = /^\d+$/.test(cleanedNumber)
    ? [cleanedNumber.padStart(3, "0")]
    : [cleanedNumber];

  return Array.from(
    new Set(
      numberCandidates
        .filter(Boolean)
        .map((numberCandidate) => `${cleanSetCode(setCode)}-${numberCandidate}`),
    ),
  );
};

const proxiedImageUrl = (imageUrl: string) =>
  `/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;

const tcgdexSetCodeCandidates = (value: string) => {
  const cleaned = cleanSetCode(value);
  const candidates = [cleaned, cleaned.toLowerCase(), cleaned.toUpperCase()];
  const alphaNumericSet = cleaned.match(/^([a-z]+)(0*)(\d+)([a-z]*)$/i);
  const pointSet = cleaned.match(/^([a-z]+)(\d+)pt(\d+)$/i);

  if (alphaNumericSet) {
    const prefix = alphaNumericSet[1];
    const number = alphaNumericSet[3].replace(/^0+(?=\d)/, "");
    const suffix = alphaNumericSet[4];

    candidates.push(`${prefix}${number}${suffix}`);
    candidates.push(`${prefix}${number.padStart(2, "0")}${suffix}`);
    candidates.push(`${prefix.toUpperCase()}${number}${suffix}`);
    candidates.push(`${prefix.toLowerCase()}${number.padStart(2, "0")}${suffix}`);
  }

  if (pointSet) {
    const prefix = pointSet[1];
    const number = pointSet[2].replace(/^0+(?=\d)/, "").padStart(2, "0");
    const decimal = pointSet[3].replace(/^0+(?=\d)/, "");

    candidates.push(`${prefix}${number}.${decimal}`);
    candidates.push(`${prefix.toLowerCase()}${number}.${decimal}`);
    candidates.push(`${prefix.toUpperCase()}${number}.${decimal}`);
  }

  return Array.from(new Set(candidates.filter(Boolean)));
};

const decodeHtml = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const stripHtml = (value: string) =>
  decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const hasKana = (value: string) => /[\u3040-\u30ff]/u.test(value);

const hasHan = (value: string) => /[\u3400-\u9fff]/u.test(value);

const normalizedPokemonSpeciesName = (value: string) =>
  value
    .toLowerCase()
    .replace(/\b(?:ex|gx|vmax|vstar|v-union|v|lv\.?\s*x)\b/gi, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "")
    .trim();

const looksLikeSetCode = (value: string) =>
  /^[a-zA-Z0-9._-]{2,14}$/.test(value) && (/\d/.test(value) || value.length <= 5);

const parseSetNumberQuery = (query: string): SetNumberQuery | undefined => {
  const cleaned = cleanQuery(query);
  const explicitSet =
    cleaned.match(/\b(?:set|exp|expansion|edicion|edición|e)\s*[:=]\s*"([^"]+)"/i)?.[1] ??
    cleaned.match(/\b(?:set|exp|expansion|edicion|edición|e)\s*[:=]\s*([a-zA-Z0-9._-]+)/i)?.[1];
  const explicitNumber =
    cleaned.match(/\b(?:number|num|nro|numero|número|cn|collector)\s*[:=#]?\s*([a-zA-Z0-9/-]+)/i)?.[1] ??
    cleaned.match(/#\s*([a-zA-Z0-9/-]+)/i)?.[1];

  if (explicitSet && explicitNumber) {
    const setCode = cleanSetCode(explicitSet);
    const number = cleanCardNumber(explicitNumber);
    return setCode && number ? { setCode, number } : undefined;
  }

  const parts = cleaned.split(/\s+/);

  if (parts.length === 2 && looksLikeSetCode(parts[0])) {
    const setCode = cleanSetCode(parts[0]);
    const number = cleanCardNumber(parts[1]);
    return setCode && number ? { setCode, number } : undefined;
  }

  const compact = cleaned.match(/^([a-zA-Z0-9._-]{2,14})[-_\s]+([a-zA-Z0-9]+(?:\/[a-zA-Z0-9]+)?)$/);

  if (compact && looksLikeSetCode(compact[1])) {
    return {
      setCode: cleanSetCode(compact[1]),
      number: cleanCardNumber(compact[2]),
    };
  }

  return undefined;
};

const parseHumanSetNumberQuery = (query: string): SetNumberQuery | undefined => {
  const cleaned = cleanQuery(query);
  const explicitSetAndNumber = cleaned.match(
    /\b(?:set|exp|expansion|edicion|ediciÃ³n|e)\s*[:=]\s*(?:"([^"]+)"|(.+?))\s+\b(?:number|num|nro|numero|nÃºmero|cn|collector)\s*[:=#]?\s*([a-zA-Z0-9/-]+)/i,
  );

  if (explicitSetAndNumber) {
    const setTerm = cleanSetTerm(
      explicitSetAndNumber[1] ?? explicitSetAndNumber[2] ?? "",
    );
    const number = cleanCardNumber(explicitSetAndNumber[3]);
    return setTerm && number ? { setTerm, number } : undefined;
  }

  const parts = cleaned.split(/\s+/);

  if (parts.length < 2) {
    return undefined;
  }

  const possibleNumber = cleanCardNumber(parts[parts.length - 1]);
  const possibleSetTerm = cleanSetTerm(parts.slice(0, -1).join(" "));

  if (
    possibleSetTerm &&
    possibleNumber &&
    /^[a-zA-Z0-9/-]+$/.test(parts[parts.length - 1])
  ) {
    return { setTerm: possibleSetTerm, number: possibleNumber };
  }

  return undefined;
};

const setNumberTerm = (query: SetNumberQuery) =>
  cleanSetTerm(query.setTerm ?? query.setCode ?? "");

const structuredSetNumberQuery = (
  search: StructuredSearch,
): SetNumberQuery | undefined => {
  const setTerm = cleanSetTerm(search.setTerm);
  const number = cleanCardNumber(search.number);

  if (!setTerm || !number) {
    return undefined;
  }

  const setCode = cleanSetCode(search.setTerm);

  return setCode ? { setTerm, setCode, number } : { setTerm, number };
};

const normalizeSetName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const setSearchTerms = (rawTerm: string) => {
  const term = normalizeSetName(rawTerm);
  const withoutGenericWords = term
    .replace(/\b(set|edition|expansion)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return Array.from(
    new Set([term, withoutGenericWords].filter((value) => value.length > 0)),
  );
};

const rankSetMatches = (sets: ExternalSet[], rawTerm: string) => {
  const terms = setSearchTerms(rawTerm);

  if (!terms.length) {
    return [];
  }

  return sets
    .map((set) => {
      const id = normalizeSetName(set.id);
      const name = normalizeSetName(set.name);
      let score = 999;

      for (const term of terms) {
        if (id === term) {
          score = Math.min(score, 0);
        } else if (name === term) {
          score = Math.min(score, 1);
        } else if (name.startsWith(term)) {
          score = Math.min(score, 2);
        } else if (name.includes(term)) {
          score = Math.min(score, 3);
        }
      }

      return { set, score };
    })
    .filter(({ score }) => score < 999)
    .sort((a, b) => a.score - b.score || a.set.name.localeCompare(b.set.name))
    .map(({ set }) => set);
};

const uniqueSetsById = (sets: ExternalSet[]) => {
  const seen = new Set<string>();

  return sets.filter((set) => {
    const key = set.id.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const parseUsd = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number(value.toFixed(2));
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : undefined;
  }

  return undefined;
};

const pickImage = (card: Record<string, unknown>): string | undefined => {
  const imageUris = asObject(card.image_uris);
  const faceImageUris = Array.isArray(card.card_faces)
    ? asObject(asObject(card.card_faces[0]).image_uris)
    : {};

  return (
    asString(imageUris.normal) ??
    asString(imageUris.large) ??
    asString(imageUris.small) ??
    asString(faceImageUris.normal) ??
    asString(faceImageUris.large) ??
    asString(faceImageUris.small)
  );
};

const pickMagicPrice = (prices: Record<string, unknown>) =>
  parseUsd(prices.usd) ??
  parseUsd(prices.usd_foil) ??
  parseUsd(prices.usd_etched) ??
  parseUsd(prices.eur) ??
  parseUsd(prices.eur_foil);

const pickPokemonPrice = (
  pricesRoot: Record<string, unknown>,
): number | undefined => {
  const buckets = Object.values(pricesRoot).map(asObject);
  const fields = ["market", "directLow", "mid", "low", "averageSellPrice", "trendPrice"];

  for (const field of fields) {
    const values = buckets
      .map((bucket) => parseUsd(bucket[field]))
      .filter((value): value is number => typeof value === "number");

    if (values.length) {
      return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
    }
  }

  return undefined;
};

const pickTcgdexTcgplayerPrice = (
  tcgplayerRoot: Record<string, unknown>,
): number | undefined => {
  const buckets = Object.values(tcgplayerRoot)
    .map(asObject)
    .filter((bucket) => Object.keys(bucket).length > 0);
  const fields = [
    "marketPrice",
    "directLowPrice",
    "midPrice",
    "lowPrice",
    "avg",
  ];

  for (const field of fields) {
    const values = buckets
      .map((bucket) => parseUsd(bucket[field]))
      .filter((value): value is number => typeof value === "number");

    if (values.length) {
      return Number(
        (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(
          2,
        ),
      );
    }
  }

  return undefined;
};

const pickTcgdexCardmarketPrice = (
  cardmarketRoot: Record<string, unknown>,
): number | undefined =>
  parseUsd(cardmarketRoot.trend) ??
  parseUsd(cardmarketRoot.avg) ??
  parseUsd(cardmarketRoot.low);

const pickTcgdexPrice = (card: Record<string, unknown>) => {
  const pricingRoots = [
    asObject(card.pricing),
    ...(Array.isArray(card.variants_detailed)
      ? card.variants_detailed.map((variant) => asObject(asObject(variant).pricing))
      : []),
  ];

  for (const pricingRoot of pricingRoots) {
    const tcgplayer = asObject(pricingRoot.tcgplayer);
    const price = pickTcgdexTcgplayerPrice(tcgplayer);

    if (typeof price === "number") {
      return {
        price,
        source: "TCGdex / TCGplayer",
        updated: asString(tcgplayer.updated),
      };
    }
  }

  for (const pricingRoot of pricingRoots) {
    const cardmarket = asObject(pricingRoot.cardmarket);
    const price = pickTcgdexCardmarketPrice(cardmarket);

    if (typeof price === "number") {
      return {
        price,
        source: "TCGdex / Cardmarket",
        updated: asString(cardmarket.updated),
      };
    }
  }

  return {
    price: undefined,
    source: "TCGdex",
    updated: asString(card.updated),
  };
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Pullario local prototype",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Source responded ${response.status}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
};

const requestText = async (url: string, init?: RequestInit): Promise<string> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Pullario local prototype",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Source responded ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timer);
  }
};

async function getUsdPerJpy() {
  if (jpyUsdRateCache && jpyUsdRateCache.expiresAt > Date.now()) {
    return jpyUsdRateCache.usdPerJpy;
  }

  const payload = await requestJson<{ rates?: { USD?: unknown } }>(
    "https://api.frankfurter.app/latest?from=JPY&to=USD",
  ).catch(() => ({ rates: { USD: 0.0067 } }));
  const rawRate = payload.rates?.USD;
  const usdPerJpy =
    typeof rawRate === "number"
      ? rawRate
      : typeof rawRate === "string"
        ? Number(rawRate)
        : 0.0067;

  jpyUsdRateCache = {
    usdPerJpy: Number.isFinite(usdPerJpy) ? usdPerJpy : 0.0067,
    expiresAt: Date.now() + SET_CACHE_TTL_MS,
  };

  return usdPerJpy;
}

const filterByRarity = (cards: ExternalCard[], rawRarity?: string) => {
  const rarity = normalizeRarity(rawRarity ?? "");

  if (!rarity) {
    return cards;
  }

  const candidates = rarityAliases[rarity] ?? [rarity];

  return cards.filter((card) => {
    const cardRarity = normalizeRarity(card.rarity ?? "");
    return candidates.some((candidate) =>
      rarityCandidateMatches(cardRarity, candidate),
    );
  });
};

const uniqueCardsById = (cards: ExternalCard[]) => {
  const seen = new Set<string>();

  return cards.filter((card) => {
    if (seen.has(card.id)) {
      return false;
    }

    seen.add(card.id);
    return true;
  });
};

const cardLanguage = (card: ExternalCard) => {
  if (card.language) {
    return card.language;
  }

  if (card.id.startsWith("onepiece-jp:")) {
    return "ja";
  }

  const tcgdexLocale = card.id.match(/^tcgdex:([^:]+):/i)?.[1];

  if (tcgdexLocale) {
    return tcgdexLocale.toLowerCase();
  }

  if (card.priceSource.includes("One Piece JP") || card.priceSource.includes("(JP)")) {
    return "ja";
  }

  if (card.priceSource.includes("(ZH-CN)")) {
    return "zh-cn";
  }

  if (card.priceSource.includes("(ZH-TW)")) {
    return "zh-tw";
  }

  return "en";
};

const withCardLanguage = (card: ExternalCard, language?: string): ExternalCard => {
  const nextLanguage = language ?? cardLanguage(card);

  return {
    ...card,
    language: nextLanguage,
    languageLabel: cardLanguageLabels[nextLanguage] ?? nextLanguage.toUpperCase(),
  };
};

const groupCardsByLanguage = (
  cards: ExternalCard[],
  selectedCardId?: string,
): CardLanguageGroup[] => {
  const groups = new Map<string, ExternalCard[]>();

  uniqueCardsById(cards.map((card) => withCardLanguage(card))).forEach((card) => {
    const language = card.language ?? "en";
    groups.set(language, [...(groups.get(language) ?? []), card]);
  });

  return Array.from(groups.entries())
    .map(([language, groupCards]) => ({
      language,
      label: cardLanguageLabels[language] ?? language.toUpperCase(),
      cards: groupCards.sort((a, b) => {
        if (a.id === selectedCardId) {
          return -1;
        }

        if (b.id === selectedCardId) {
          return 1;
        }

        return (b.priceUsd ?? -1) - (a.priceUsd ?? -1);
      }),
    }))
    .sort((a, b) => {
      const aIndex = languageSortOrder.indexOf(a.language);
      const bIndex = languageSortOrder.indexOf(b.language);

      return (
        (aIndex === -1 ? 999 : aIndex) -
          (bIndex === -1 ? 999 : bIndex) ||
        a.label.localeCompare(b.label)
      );
    });
};

const onePiecePrintIdPattern = /[a-z]+\d{2}-\d{3}(?:_p\d+)?/gi;

const normalizeOnePiecePrintId = (value: string) => {
  const match = cleanQuery(value).match(/^([a-z]+)(\d{2}-\d{3})(?:_p(\d+))?$/i);

  if (!match) {
    return "";
  }

  return `${match[1].toUpperCase()}${match[2]}${match[3] ? `_p${match[3]}` : ""}`;
};

const onePiecePrintIdFromCard = (card: ExternalCard) => {
  const idMatches = Array.from(card.id.matchAll(onePiecePrintIdPattern)).map(
    (match) => normalizeOnePiecePrintId(match[0]),
  );
  const normalizedNumber = card.number
    ? normalizeOnePiecePrintId(card.number)
    : "";

  return idMatches.filter(Boolean).at(-1) ?? normalizedNumber;
};

const onePieceBaseNumberFromPrintId = (printId: string) =>
  printId.replace(/_p\d+$/i, "");

const pokemonIdFromCard = (card: ExternalCard) => {
  const tcgdexId = card.id.match(/^tcgdex:[^:]+:(.+)$/i)?.[1];
  const rawId = tcgdexId ?? card.id;
  const match = rawId.match(/^(.+)-([a-zA-Z0-9]+(?:\/[a-zA-Z0-9]+)?)$/);

  return match
    ? { setCode: cleanSetCode(match[1]), number: cleanCardNumber(match[2]) }
    : undefined;
};

const pokemonSetNumberQueryFromCard = (card: ExternalCard): SetNumberQuery | undefined => {
  const parsed = pokemonIdFromCard(card);

  if (parsed?.setCode && parsed.number) {
    return { ...parsed, setTerm: card.setName };
  }

  if (card.number && card.setName) {
    return { setTerm: card.setName, number: card.number };
  }

  return undefined;
};

const normalizeRarity = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9!]+/g, " ")
    .replace(/\s+/g, " ");

const rarityAliases: Record<string, string[]> = {
  c: ["c", "common"],
  common: ["common", "c"],
  u: ["u", "uncommon"],
  uc: ["uc", "uncommon"],
  uncommon: ["uncommon", "u", "uc"],
  r: ["r", "rare"],
  rare: ["rare", "r"],
  sr: ["sr", "super rare"],
  "super rare": ["super rare", "sr"],
  sec: ["sec", "secret rare"],
  "secret rare": ["secret rare", "sec"],
  l: ["l", "leader"],
  leader: ["leader", "l"],
  mythic: ["mythic", "mythic rare"],
  "mythic rare": ["mythic rare", "mythic"],
};

const rarityCandidateMatches = (cardRarity: string, candidate: string) => {
  const normalizedCandidate = normalizeRarity(candidate);

  if (cardRarity === normalizedCandidate) {
    return true;
  }

  const cardTokens = new Set(cardRarity.split(" ").filter(Boolean));
  return normalizedCandidate
    .split(" ")
    .filter(Boolean)
    .every((token) => cardTokens.has(token));
};

const toScryfallRarity = (rawRarity: string) => {
  const rarity = normalizeRarity(rawRarity);
  const values: Record<string, string> = {
    c: "common",
    common: "common",
    u: "uncommon",
    uc: "uncommon",
    uncommon: "uncommon",
    r: "rare",
    rare: "rare",
    m: "mythic",
    mythic: "mythic",
    "mythic rare": "mythic",
  };

  return values[rarity];
};

const toPokemonRarity = (rawRarity: string) => {
  const rarity = normalizeRarity(rawRarity);
  const values: Record<string, string> = {
    c: "Common",
    common: "Common",
    u: "Uncommon",
    uc: "Uncommon",
    uncommon: "Uncommon",
    r: "Rare",
    rare: "Rare",
    "rare holo": "Rare Holo",
    "rare ultra": "Rare Ultra",
    "rare secret": "Rare Secret",
    "illustration rare": "Illustration Rare",
    "special illustration rare": "Special Illustration Rare",
  };

  return values[rarity] ?? (rarity.length > 2 ? rawRarity.trim() : undefined);
};

const cleanPokemonQuery = (query: string) =>
  query
    .replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tcgdexLocalesForQuery = (query: string): TcgdexLocale[] => {
  if (hasKana(query)) {
    return ["ja", "zh-tw", "zh-cn", "en"];
  }

  if (hasHan(query)) {
    return ["zh-tw", "zh-cn", "ja", "en"];
  }

  return ["en", "ja", "zh-tw", "zh-cn"];
};

async function getPokemonSets(
  headers: Record<string, string>,
): Promise<ExternalSet[]> {
  if (pokemonSetCache && pokemonSetCache.expiresAt > Date.now()) {
    return pokemonSetCache.sets;
  }

  const url = new URL("https://api.pokemontcg.io/v2/sets");
  url.searchParams.set("pageSize", "500");
  url.searchParams.set("select", "id,name");
  url.searchParams.set("orderBy", "-releaseDate");

  const payload = await requestJson<{ data?: unknown[] }>(url.toString(), {
    headers,
  }).catch(() => ({ data: [] }));
  const sets = Array.isArray(payload.data)
    ? payload.data
        .map((item) => {
          const set = asObject(item);
          const id = asString(set.id);
          const name = asString(set.name);

          return id && name ? { id, name } : undefined;
        })
        .filter((set): set is ExternalSet => Boolean(set))
    : [];
  const fallbackSets = sets.length
    ? []
    : await requestJson<unknown[]>("https://api.tcgdex.net/v2/en/sets")
        .then((items) =>
          Array.isArray(items)
            ? items
                .map((item) => {
                  const set = asObject(item);
                  const id = asString(set.id);
                  const name = asString(set.name);

                  return id && name ? { id, name } : undefined;
                })
                .filter((set): set is ExternalSet => Boolean(set))
            : [],
        )
        .catch(() => []);
  const allSets = uniqueSetsById([...sets, ...fallbackSets]);

  pokemonSetCache = {
    sets: allSets,
    expiresAt: Date.now() + SET_CACHE_TTL_MS,
  };

  return allSets;
}

async function resolvePokemonSetIds(
  term: string,
  headers: Record<string, string>,
) {
  const directCode = cleanSetCode(term).toLowerCase();
  const matches = rankSetMatches(await getPokemonSets(headers), term).map(
    (set) => set.id,
  );

  return Array.from(
    new Set([directCode, ...matches].filter((value) => value.length > 0)),
  ).slice(0, 5);
}

async function getTcgdexSets(locale: TcgdexLocale): Promise<ExternalSet[]> {
  const cached = tcgdexSetCaches[locale];

  if (cached && cached.expiresAt > Date.now()) {
    return cached.sets;
  }

  const sets = await requestJson<unknown[]>(
    `https://api.tcgdex.net/v2/${locale}/sets`,
  )
    .then((items) =>
      Array.isArray(items)
        ? items
            .map((item) => {
              const set = asObject(item);
              const id = asString(set.id);
              const name = asString(set.name);

              return id && name ? { id, name } : undefined;
            })
            .filter((set): set is ExternalSet => Boolean(set))
        : [],
    )
    .catch(() => []);

  tcgdexSetCaches[locale] = {
    sets,
    expiresAt: Date.now() + SET_CACHE_TTL_MS,
  };

  return sets;
}

async function resolveTcgdexSetCodes(term: string, locale: TcgdexLocale) {
  const directCode = cleanSetCode(term);
  const matches = rankSetMatches(await getTcgdexSets(locale), term).map(
    (set) => set.id,
  );

  return Array.from(
    new Set([directCode, ...matches].filter((value) => value.length > 0)),
  ).slice(0, 8);
}

async function getMagicSets(): Promise<ExternalSet[]> {
  if (magicSetCache && magicSetCache.expiresAt > Date.now()) {
    return magicSetCache.sets;
  }

  const payload = await requestJson<{ data?: unknown[] }>(
    "https://api.scryfall.com/sets",
  ).catch(() => ({ data: [] }));
  const sets = Array.isArray(payload.data)
    ? payload.data
        .map((item) => {
          const set = asObject(item);
          const id = asString(set.code);
          const name = asString(set.name);

          return id && name ? { id, name } : undefined;
        })
        .filter((set): set is ExternalSet => Boolean(set))
    : [];

  magicSetCache = {
    sets,
    expiresAt: Date.now() + SET_CACHE_TTL_MS,
  };

  return sets;
}

async function resolveMagicSetCodes(term: string) {
  const directCode = cleanSetCode(term).toLowerCase();
  const matches = rankSetMatches(await getMagicSets(), term).map((set) => set.id);

  return Array.from(
    new Set([directCode, ...matches].filter((value) => value.length > 0)),
  ).slice(0, 5);
}

export const supportedGames: CardGame[] = ["magic", "pokemon", "one-piece"];

export const isSupportedGame = (game: string): game is CardGame =>
  supportedGames.includes(game as CardGame);

export async function searchCards(
  game: CardGame,
  rawQuery: string,
  options: SearchOptions = {},
): Promise<ExternalCard[]> {
  const query = cleanQuery(rawQuery);
  const rarity = cleanQuery(options.rarity ?? "");
  const structuredSearch: StructuredSearch = {
    setTerm: cleanSetTerm(options.setName ?? ""),
    number: cleanCardNumber(options.number ?? ""),
  };

  if (query.length < 2 && structuredSearch.setTerm.length < 2) {
    return [];
  }

  const cacheKey = [
    CACHE_VERSION,
    game,
    query.toLowerCase(),
    rarity.toLowerCase(),
    structuredSearch.setTerm.toLowerCase(),
    structuredSearch.number.toLowerCase(),
  ].join(":");
  const cached = searchCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.cards;
  }

  const sourceCards =
    game === "magic"
      ? await searchMagic(query, rarity, structuredSearch)
      : game === "pokemon"
        ? await searchPokemon(query, rarity, structuredSearch)
        : await searchOnePiece(query, rarity, structuredSearch);
  const cards = filterByRarity(sourceCards, rarity).slice(0, 24);

  if (cards.length > 0) {
    searchCache.set(cacheKey, {
      cards,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  return cards;
}

export async function getCardLanguageVariants(
  card: ExternalCard,
): Promise<CardLanguageGroup[]> {
  const normalizedCard = withCardLanguage(card);

  if (normalizedCard.game === "one-piece") {
    return getOnePieceLanguageVariants(normalizedCard);
  }

  if (normalizedCard.game === "pokemon") {
    return getPokemonLanguageVariants(normalizedCard);
  }

  return groupCardsByLanguage([normalizedCard], normalizedCard.id);
}

async function searchMagic(
  query: string,
  rarity: string,
  structuredSearch: StructuredSearch,
): Promise<ExternalCard[]> {
  const searchScryfall = async (scryfallQuery: string) => {
    const url = new URL("https://api.scryfall.com/cards/search");
    url.searchParams.set("q", scryfallQuery);
    url.searchParams.set("unique", "prints");
    url.searchParams.set("order", "released");
    url.searchParams.set("include_extras", "false");

    return requestJson<{ data?: unknown[] }>(url.toString());
  };

  const setNumberQuery =
    structuredSetNumberQuery(structuredSearch) ??
    parseHumanSetNumberQuery(query) ?? parseSetNumberQuery(query);

  if (setNumberQuery) {
    const exactCards = await searchMagicBySetNumber(setNumberQuery);

    if (exactCards.length) {
      return exactCards;
    }
  }

  if (structuredSearch.setTerm) {
    const setCards = await searchMagicBySet(
      structuredSearch.setTerm,
      query,
      rarity,
    );

    if (setCards.length || query.length < 2) {
      return setCards;
    }
  }

  if (query.length < 2) {
    return [];
  }

  const scryfallRarity = toScryfallRarity(rarity);
  const rarityClause = scryfallRarity ? ` rarity:${scryfallRarity}` : "";
  const exactQuery = `!"${query.replace(/["\\]/g, "")}" game:paper${rarityClause}`;
  const fallbackQuery = `${query} game:paper${rarityClause}`;
  const payload = await searchScryfall(exactQuery).catch(() =>
    searchScryfall(fallbackQuery),
  ).catch(() => ({ data: [] }));
  const cards = Array.isArray(payload.data) ? payload.data : [];

  return cards
    .slice(0, 80)
    .map(mapMagicCard);
}

async function searchMagicBySet(
  setTerm: string,
  query: string,
  rarity: string,
): Promise<ExternalCard[]> {
  const setCodes = await resolveMagicSetCodes(setTerm);
  const scryfallRarity = toScryfallRarity(rarity);
  const rarityClause = scryfallRarity ? ` rarity:${scryfallRarity}` : "";
  const nameClause = query.length >= 2 ? ` ${query.replace(/["\\]/g, "")}` : "";

  for (const setCode of setCodes) {
    const url = new URL("https://api.scryfall.com/cards/search");
    url.searchParams.set(
      "q",
      `e:${setCode.toLowerCase()}${nameClause} game:paper${rarityClause}`,
    );
    url.searchParams.set("unique", "prints");
    url.searchParams.set("order", "set");
    url.searchParams.set("include_extras", "false");

    const payload = await requestJson<{ data?: unknown[] }>(url.toString()).catch(
      () => ({ data: [] }),
    );
    const cards = Array.isArray(payload.data) ? payload.data : [];

    if (cards.length) {
      return cards.slice(0, 80).map(mapMagicCard);
    }
  }

  return [];
}

async function searchMagicBySetNumber(
  setNumberQuery: SetNumberQuery,
): Promise<ExternalCard[]> {
  const term = setNumberTerm(setNumberQuery);
  const { number } = setNumberQuery;
  const setCodes = await resolveMagicSetCodes(term);

  for (const setCode of setCodes) {
    const directUrl = `https://api.scryfall.com/cards/${encodeURIComponent(setCode.toLowerCase())}/${encodeURIComponent(number)}`;
    const directCard = await requestJson<Record<string, unknown>>(directUrl)
      .then((card) => [mapMagicCard(card)])
      .catch(() => []);

    if (directCard.length) {
      return directCard;
    }

    const collectorNumber = /^[a-zA-Z0-9]+$/.test(number)
      ? number
      : `"${number.replace(/["\\]/g, "")}"`;
    const url = new URL("https://api.scryfall.com/cards/search");
    url.searchParams.set("q", `e:${setCode.toLowerCase()} cn:${collectorNumber} game:paper`);
    url.searchParams.set("unique", "prints");
    url.searchParams.set("order", "released");
    url.searchParams.set("include_extras", "false");

    const payload = await requestJson<{ data?: unknown[] }>(url.toString()).catch(
      () => ({ data: [] }),
    );
    const cards = Array.isArray(payload.data) ? payload.data : [];

    if (cards.length) {
      return cards.slice(0, 12).map(mapMagicCard);
    }
  }

  return [];
}

function mapMagicCard(item: unknown): ExternalCard {
  const card = asObject(item);
  const prices = asObject(card.prices);

  return {
    id: asString(card.id) ?? asString(card.uri) ?? crypto.randomUUID(),
    game: "magic",
    name: asString(card.name) ?? "Magic card",
    setName: asString(card.set_name) ?? "Unknown set",
    number: asString(card.collector_number),
    rarity: asString(card.rarity),
    language: asString(card.lang) ?? "en",
    languageLabel:
      cardLanguageLabels[asString(card.lang) ?? "en"] ??
      (asString(card.lang) ?? "EN").toUpperCase(),
    imageUrl: pickImage(card),
    priceUsd: pickMagicPrice(prices),
    priceSource: "Scryfall",
    sourceUrl: asString(card.scryfall_uri),
    updatedAt: asString(card.image_updated_at),
  };
}

async function searchPokemon(
  query: string,
  rarity: string,
  structuredSearch: StructuredSearch,
): Promise<ExternalCard[]> {
  const headers: Record<string, string> = {};

  if (typeof process !== "undefined" && process.env.POKEMON_TCG_API_KEY) {
    headers["X-Api-Key"] = process.env.POKEMON_TCG_API_KEY;
  }

  const pokemonQuery = cleanPokemonQuery(query);

  if (pokemonQuery.length < 2 && structuredSearch.setTerm.length < 2) {
    return [];
  }

  const fetchPokemon = async (q: string) => {
    const url = new URL("https://api.pokemontcg.io/v2/cards");
    url.searchParams.set("q", q);
    url.searchParams.set("pageSize", "80");
    url.searchParams.set("orderBy", "-set.releaseDate");
    url.searchParams.set(
      "select",
      "id,name,number,rarity,set,images,tcgplayer,cardmarket",
    );

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await requestJson<{ data?: unknown[] }>(url.toString(), {
          headers,
        });
      } catch (error) {
        if (attempt === 1) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    return { data: [] };
  };

  const pokemonRarity = toPokemonRarity(rarity);
  const rarityClause = pokemonRarity
    ? ` rarity:"${cleanPokemonQuery(pokemonRarity)}"`
    : "";
  const setNumberQuery =
    structuredSetNumberQuery(structuredSearch) ??
    parseHumanSetNumberQuery(query) ?? parseSetNumberQuery(query);

  if (setNumberQuery) {
    const exactCards = await searchPokemonBySetNumber(
      setNumberQuery,
      fetchPokemon,
      rarityClause,
      headers,
    );
    const localizedCards = await searchPokemonTcgdexSetNumberVariants(
      setNumberQuery,
      rarity,
      headers,
      exactCards.length
        ? tcgdexLocalizedCodeSearchLocales
        : tcgdexCodeSearchLocales,
    );
    const combinedCards = uniqueCardsById([...exactCards, ...localizedCards]);

    if (combinedCards.length) {
      return combinedCards;
    }
  }

  if (structuredSearch.setTerm) {
    const setCards = await searchPokemonBySet(
      structuredSearch.setTerm,
      pokemonQuery,
      fetchPokemon,
      rarityClause,
      headers,
    );

    if (setCards.length || pokemonQuery.length < 2) {
      return setCards;
    }
  }

  if (pokemonQuery.length < 2) {
    return [];
  }

  const pokemonTokens = pokemonQuery.split(" ").filter(Boolean);
  const prefixQuery =
    pokemonTokens.length > 0 && pokemonTokens.every((token) => token.length >= 4)
      ? pokemonTokens.map((token) => `name:${token}*`).join(" ")
      : "";
  const luceneQueries = Array.from(
    new Set(
      [
        prefixQuery ? `${prefixQuery}${rarityClause}` : "",
        `name:"${pokemonQuery}"${rarityClause}`,
        `name:${pokemonQuery}${rarityClause}`,
      ].filter(Boolean),
    ),
  );

  let payload: { data?: unknown[] } = { data: [] };

  for (const luceneQuery of luceneQueries) {
    try {
      payload = await fetchPokemon(luceneQuery);
      if (Array.isArray(payload.data) && payload.data.length > 0) {
        break;
      }
    } catch {
      payload = { data: [] };
    }
  }

  const cards = Array.isArray(payload.data) ? payload.data : [];

  const mappedCards = cards.map(mapPokemonCard);

  return mappedCards.length ? mappedCards : searchPokemonTcgdex(query, rarity);
}

async function searchPokemonBySetNumber(
  setNumberQuery: SetNumberQuery,
  fetchPokemon: (query: string) => Promise<{ data?: unknown[] }>,
  rarityClause: string,
  headers: Record<string, string>,
): Promise<ExternalCard[]> {
  const term = setNumberTerm(setNumberQuery);
  const { number } = setNumberQuery;
  const setIds = await resolvePokemonSetIds(term, headers);
  const numberCandidates = searchCardNumberCandidates(number);

  for (const setId of setIds) {
    for (const numberCandidate of numberCandidates) {
      const cardId = `${setId.toLowerCase()}-${numberCandidate}`;
      const directUrl = `https://api.pokemontcg.io/v2/cards/${encodeURIComponent(cardId)}`;
      const directCard = await requestJson<{ data?: unknown }>(directUrl, {
        headers,
      })
        .then((payload) => (payload.data ? [mapPokemonCard(payload.data)] : []))
        .catch(() => []);

      if (directCard.length) {
        return directCard;
      }
    }

    const luceneQueries = numberCandidates.flatMap((numberCandidate) => [
      `set.id:${cleanPokemonQuery(setId)} number:${cleanPokemonQuery(numberCandidate)}${rarityClause}`,
      `set.name:"${cleanPokemonQuery(term)}" number:${cleanPokemonQuery(numberCandidate)}${rarityClause}`,
    ]);

    for (const luceneQuery of luceneQueries) {
      const payload = await fetchPokemon(luceneQuery).catch(() => ({ data: [] }));
      const cards = Array.isArray(payload.data) ? payload.data : [];

      if (cards.length) {
        return cards.map(mapPokemonCard);
      }
    }
  }

  return [];
}

async function searchPokemonBySet(
  setTerm: string,
  query: string,
  fetchPokemon: (query: string) => Promise<{ data?: unknown[] }>,
  rarityClause: string,
  headers: Record<string, string>,
): Promise<ExternalCard[]> {
  const setIds = await resolvePokemonSetIds(setTerm, headers);
  const setClauses = Array.from(
    new Set([
      ...setIds.map((setId) => `set.id:${cleanPokemonQuery(setId)}`),
      `set.name:"${cleanPokemonQuery(setTerm)}"`,
    ]),
  );
  const queryClauses =
    query.length >= 2
      ? [` name:"${query}"`, ` name:${query}`]
      : [""];

  for (const setClause of setClauses) {
    for (const queryClause of queryClauses) {
      const payload = await fetchPokemon(
        `${setClause}${queryClause}${rarityClause}`,
      ).catch(() => ({ data: [] }));
      const cards = Array.isArray(payload.data) ? payload.data : [];

      if (cards.length) {
        return uniqueCardsById(cards.map(mapPokemonCard));
      }
    }
  }

  return [];
}

const pokemonRequestHeaders = () => {
  const headers: Record<string, string> = {};

  if (typeof process !== "undefined" && process.env.POKEMON_TCG_API_KEY) {
    headers["X-Api-Key"] = process.env.POKEMON_TCG_API_KEY;
  }

  return headers;
};

const fetchPokemonExactCards =
  (headers: Record<string, string>) =>
  async (q: string): Promise<{ data?: unknown[] }> => {
    const url = new URL("https://api.pokemontcg.io/v2/cards");
    url.searchParams.set("q", q);
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("orderBy", "-set.releaseDate");
    url.searchParams.set(
      "select",
      "id,name,number,rarity,set,images,tcgplayer,cardmarket",
    );

    return requestJson<{ data?: unknown[] }>(url.toString(), { headers }).catch(
      () => ({ data: [] }),
    );
  };

async function getPokemonLanguageVariants(
  card: ExternalCard,
): Promise<CardLanguageGroup[]> {
  const setNumberQuery = pokemonSetNumberQueryFromCard(card);

  if (!setNumberQuery) {
    return groupCardsByLanguage([card], card.id);
  }

  const headers = pokemonRequestHeaders();
  const referenceCard = await getTcgdexReferenceCard(
    card,
    setNumberQuery,
    headers,
  ).catch(() => undefined);
  const englishCards = await searchPokemonBySetNumber(
    setNumberQuery,
    fetchPokemonExactCards(headers),
    "",
    headers,
  ).catch(() => []);
  const localizedLocales = englishCards.length
    ? tcgdexLocalizedCodeSearchLocales
    : tcgdexCodeSearchLocales;
  const directLocalizedCards = await searchPokemonTcgdexSetNumberVariants(
    setNumberQuery,
    "",
    headers,
    localizedLocales,
  ).catch(() => []);
  const safeDirectLocalizedCards = referenceCard
    ? directLocalizedCards.filter((candidate) =>
        tcgdexExternalCardMatchesReference(referenceCard, candidate),
      )
    : directLocalizedCards;
  const directLanguages = new Set(
    safeDirectLocalizedCards.map((candidate) => cardLanguage(candidate)),
  );
  const metadataLocales = localizedLocales.filter(
    (locale) => !directLanguages.has(locale),
  );
  const metadataLocalizedCards = referenceCard
    ? await searchPokemonTcgdexMetadataVariants(
        referenceCard,
        setNumberQuery,
        headers,
        metadataLocales,
      ).catch(() => [])
    : [];
  const localizedCards = [...safeDirectLocalizedCards, ...metadataLocalizedCards];

  return groupCardsByLanguage(
    [card, ...englishCards, ...localizedCards],
    card.id,
  );
}

async function getTcgdexReferenceCard(
  card: ExternalCard,
  setNumberQuery: SetNumberQuery,
  headers: Record<string, string>,
) {
  const tcgdexMatch = card.id.match(/^tcgdex:([^:]+):(.+)$/i);

  if (tcgdexMatch) {
    return requestJson<Record<string, unknown>>(
      `https://api.tcgdex.net/v2/${tcgdexMatch[1]}/cards/${encodeURIComponent(
        tcgdexMatch[2],
      )}`,
    );
  }

  const setCodes = await resolveTcgdexCandidateSetCodes(
    setNumberQuery,
    headers,
    "en",
  );
  const numberCandidates = searchCardNumberCandidates(setNumberQuery.number);

  for (const setCode of setCodes) {
    for (const setCodeCandidate of tcgdexSetCodeCandidates(setCode)) {
      for (const numberCandidate of numberCandidates) {
        const cardId = `${setCodeCandidate}-${numberCandidate}`;
        const detail = await requestJson<Record<string, unknown>>(
          `https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(cardId)}`,
        ).catch(() => undefined);

        if (detail) {
          return detail;
        }
      }
    }
  }

  return undefined;
}

const numericLocalId = (value: unknown) => {
  const text = asString(value);

  if (!text || !/^\d+$/.test(text)) {
    return undefined;
  }

  return Number(text);
};

const tcgdexDexIds = (card: Record<string, unknown>) =>
  Array.isArray(card.dexId)
    ? card.dexId.filter((value): value is number => typeof value === "number")
    : [];

async function getPokemonSpeciesNames(dexId: number) {
  const cached = pokemonSpeciesNameCache.get(dexId);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.names;
  }

  const payload = await requestJson<{ names?: unknown[] }>(
    `https://pokeapi.co/api/v2/pokemon-species/${dexId}`,
  ).catch(() => ({ names: [] }));
  const allowedLanguages = new Set([
    "en",
    "ja",
    "ja-Hrkt",
    "zh-Hans",
    "zh-Hant",
  ]);
  const names = Array.isArray(payload.names)
    ? payload.names
        .map((item) => {
          const name = asString(asObject(item).name);
          const language = asString(asObject(asObject(item).language).name);

          return name && language && allowedLanguages.has(language)
            ? normalizedPokemonSpeciesName(name)
            : undefined;
        })
        .filter((name): name is string => Boolean(name))
    : [];
  const uniqueNames = Array.from(new Set(names));

  pokemonSpeciesNameCache.set(dexId, {
    names: uniqueNames,
    expiresAt: Date.now() + SET_CACHE_TTL_MS,
  });

  return uniqueNames;
}

async function getPokemonReferenceSpeciesNames(
  reference: Record<string, unknown>,
) {
  const dexIds = tcgdexDexIds(reference);
  const names = await Promise.all(
    dexIds.slice(0, 4).map((dexId) => getPokemonSpeciesNames(dexId)),
  );

  return Array.from(new Set(names.flat()));
}

const tcgdexSpeciesMatchesReference = (
  reference: Record<string, unknown>,
  candidate: Record<string, unknown>,
  referenceSpeciesNames: string[],
) => {
  if (asString(reference.category) !== "Pokemon") {
    return true;
  }

  const referenceDexIds = tcgdexDexIds(reference);

  if (!referenceDexIds.length) {
    return true;
  }

  const candidateDexIds = tcgdexDexIds(candidate);

  if (
    candidateDexIds.length &&
    candidateDexIds.some((dexId) => referenceDexIds.includes(dexId))
  ) {
    return true;
  }

  if (candidateDexIds.length) {
    return false;
  }

  if (!referenceSpeciesNames.length) {
    return false;
  }

  const candidateName = normalizedPokemonSpeciesName(asString(candidate.name) ?? "");

  return referenceSpeciesNames.some(
    (speciesName) => speciesName && candidateName.includes(speciesName),
  );
};

const tcgdexIsSpecialNumber = (card: Record<string, unknown>) => {
  const localId = numericLocalId(card.localId);
  const set = asObject(card.set);
  const cardCount = asObject(set.cardCount);
  const officialCount =
    typeof cardCount.official === "number" ? cardCount.official : undefined;
  const rarity = normalizeRarity(asString(card.rarity) ?? "");

  return (
    (typeof localId === "number" &&
      typeof officialCount === "number" &&
      localId > officialCount) ||
    rarity.includes("secret") ||
    rarity.includes("illustration") ||
    rarity.includes("shiny") ||
    rarity.includes("hyper")
  );
};

const tcgdexReferenceScore = (
  reference: Record<string, unknown>,
  candidate: Record<string, unknown>,
) => {
  let score = 0;
  const referenceDexIds = tcgdexDexIds(reference);
  const candidateDexIds = tcgdexDexIds(candidate);
  const referenceIllustrator = asString(reference.illustrator);
  const candidateIllustrator = asString(candidate.illustrator);

  if (
    referenceDexIds.length &&
    candidateDexIds.some((dexId) => referenceDexIds.includes(dexId))
  ) {
    score += 45;
  }

  if (referenceIllustrator && referenceIllustrator === candidateIllustrator) {
    score += 40;
  }

  if (
    asString(reference.suffix) &&
    asString(reference.suffix)?.toLowerCase() ===
      asString(candidate.suffix)?.toLowerCase()
  ) {
    score += 10;
  }

  if (asString(reference.stage) && asString(reference.stage) === asString(candidate.stage)) {
    score += 8;
  }

  if (reference.hp && reference.hp === candidate.hp) {
    score += 8;
  }

  if (
    asString(reference.category) &&
    asString(reference.category) === asString(candidate.category)
  ) {
    score += 4;
  }

  if (asString(reference.localId) === asString(candidate.localId)) {
    score += 6;
  }

  return score;
};

const tcgdexCardMatchesReference = (
  reference: Record<string, unknown>,
  candidate: Record<string, unknown>,
  referenceSpeciesNames: string[] = [],
) =>
  tcgdexSpeciesMatchesReference(reference, candidate, referenceSpeciesNames) &&
  tcgdexReferenceScore(reference, candidate) >= 65;

const tcgdexExternalCardMatchesReference = (
  reference: Record<string, unknown>,
  candidate: ExternalCard,
) => {
  const candidateId = candidate.id.match(/^tcgdex:([^:]+):(.+)$/i);

  if (!candidateId) {
    return true;
  }

  if (candidate.number === asString(reference.localId)) {
    const referenceSpecial = tcgdexIsSpecialNumber(reference);

    return !referenceSpecial;
  }

  return false;
};

async function searchPokemonTcgdexMetadataVariants(
  reference: Record<string, unknown>,
  setNumberQuery: SetNumberQuery,
  headers: Record<string, string>,
  locales: TcgdexLocale[],
) {
  const referenceLocalId = numericLocalId(reference.localId);
  const referenceSpeciesNames = await getPokemonReferenceSpeciesNames(reference);
  const cards: ExternalCard[] = [];
  const seen = new Set<string>();

  for (const locale of locales) {
    const setCodes = await resolveTcgdexCandidateSetCodes(
      setNumberQuery,
      headers,
      locale,
    );

    for (const setCode of setCodes) {
      const set = await requestJson<Record<string, unknown>>(
        `https://api.tcgdex.net/v2/${locale}/sets/${encodeURIComponent(setCode)}`,
      ).catch(() => undefined);
      const summaries = Array.isArray(set?.cards) ? set.cards : [];
      const cardCount = asObject(asObject(set).cardCount);
      const officialCount =
        typeof cardCount.official === "number" ? cardCount.official : undefined;
      const shouldScanSpecials = tcgdexIsSpecialNumber(reference);
      const candidateSummaries = summaries.filter((summary) => {
        const localId = numericLocalId(asObject(summary).localId);

        if (typeof localId !== "number") {
          return false;
        }

        if (localId === referenceLocalId) {
          return true;
        }

        return (
          shouldScanSpecials &&
          typeof officialCount === "number" &&
          localId > officialCount
        );
      });
      const detailResults = await Promise.allSettled(
        candidateSummaries.map((summary) => {
          const id = asString(asObject(summary).id);

          return id
            ? requestJson<Record<string, unknown>>(
                `https://api.tcgdex.net/v2/${locale}/cards/${encodeURIComponent(id)}`,
              )
            : Promise.resolve(undefined);
        }),
      );

      for (const result of detailResults) {
        if (result.status !== "fulfilled" || !result.value) {
          continue;
        }

        if (
          !tcgdexCardMatchesReference(
            reference,
            result.value,
            referenceSpeciesNames,
          )
        ) {
          continue;
        }

        const mapped = mapTcgdexCard(result.value, locale);

        if (!seen.has(mapped.id)) {
          seen.add(mapped.id);
          cards.push(mapped);
        }
      }
    }
  }

  const globalCards = await searchPokemonTcgdexGlobalMetadataVariants(
    reference,
    locales,
  );

  for (const card of globalCards) {
    if (!seen.has(card.id)) {
      seen.add(card.id);
      cards.push(card);
    }
  }

  return cards;
}

function tcgdexGlobalMetadataSearchParams(reference: Record<string, unknown>) {
  const category = asString(reference.category);
  const illustrator = asString(reference.illustrator);
  const suffix = asString(reference.suffix);
  const stage = asString(reference.stage);
  const hp = typeof reference.hp === "number" ? reference.hp : undefined;

  if (category !== "Pokemon" || !illustrator) {
    return undefined;
  }

  const params = new URLSearchParams();

  if (category) {
    params.set("category", `eq:${category}`);
  }

  params.set("illustrator", `eq:${illustrator}`);

  if (typeof hp === "number") {
    params.set("hp", `eq:${hp}`);
  }

  if (suffix) {
    params.set("suffix", suffix);
  }

  if (stage) {
    params.set("stage", `eq:${stage}`);
  }

  params.set("pagination:itemsPerPage", "80");

  return params;
}

async function searchPokemonTcgdexGlobalMetadataVariants(
  reference: Record<string, unknown>,
  locales: TcgdexLocale[],
) {
  const params = tcgdexGlobalMetadataSearchParams(reference);

  if (!params) {
    return [];
  }
  const referenceSpeciesNames = await getPokemonReferenceSpeciesNames(reference);

  const settled = await Promise.allSettled(
    locales.map(async (locale) => {
      const url = new URL(`https://api.tcgdex.net/v2/${locale}/cards`);
      params.forEach((value, key) => url.searchParams.set(key, value));
      const summaries = await requestJson<unknown[]>(url.toString());

      return Array.isArray(summaries)
        ? summaries.map((summary) => ({ locale, summary }))
        : [];
    }),
  );
  const summaries = settled.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const details = await Promise.allSettled(
    summaries.map(({ locale, summary }) => {
      const id = asString(asObject(summary).id);

      return id
        ? requestJson<Record<string, unknown>>(
            `https://api.tcgdex.net/v2/${locale}/cards/${encodeURIComponent(id)}`,
          ).then((card) => ({ locale, card }))
        : Promise.resolve(undefined);
    }),
  );

  return details
    .flatMap((result) =>
      result.status === "fulfilled" && result.value ? [result.value] : [],
    )
    .filter(({ card }) =>
      tcgdexCardMatchesReference(reference, card, referenceSpeciesNames),
    )
    .map(({ locale, card }) => mapTcgdexCard(card, locale));
}

function mapPokemonCard(item: unknown): ExternalCard {
  const card = asObject(item);
  const set = asObject(card.set);
  const images = asObject(card.images);
  const tcgplayer = asObject(card.tcgplayer);
  const cardmarket = asObject(card.cardmarket);
  const tcgplayerPrice = pickPokemonPrice(asObject(tcgplayer.prices));
  const cardmarketPrice =
    parseUsd(asObject(cardmarket.prices).trendPrice) ??
    parseUsd(asObject(cardmarket.prices).averageSellPrice);

  return {
    id: asString(card.id) ?? crypto.randomUUID(),
    game: "pokemon",
    name: asString(card.name) ?? "Pokemon card",
    setName: asString(set.name) ?? "Unknown set",
    number: asString(card.number),
    rarity: asString(card.rarity),
    language: "en",
    languageLabel: cardLanguageLabels.en,
    imageUrl: asString(images.large) ?? asString(images.small),
    priceUsd: tcgplayerPrice ?? cardmarketPrice,
    priceSource: tcgplayerPrice
      ? "PokemonTCG.io / TCGplayer"
      : "PokemonTCG.io / Cardmarket",
    sourceUrl: asString(tcgplayer.url) ?? asString(cardmarket.url),
    updatedAt:
      asString(tcgplayer.updatedAt) ?? asString(cardmarket.updatedAt),
  };
}

async function searchPokemonTcgdex(
  query: string,
  rarity: string,
): Promise<ExternalCard[]> {
  const pokemonQuery = cleanPokemonQuery(query);
  const locales = tcgdexLocalesForQuery(query);

  if (pokemonQuery.length < 2) {
    return [];
  }

  const setNumberQuery =
    parseHumanSetNumberQuery(query) ?? parseSetNumberQuery(query);

  if (setNumberQuery) {
    const directCards = await searchPokemonTcgdexSetNumberVariants(
      setNumberQuery,
      rarity,
      {},
      locales,
    );

    if (directCards.length) {
      return directCards;
    }
  }

  const summaryResults = await Promise.allSettled(
    locales.map(async (locale) => {
      const url = new URL(`https://api.tcgdex.net/v2/${locale}/cards`);
      url.searchParams.set("name", pokemonQuery);
      const summaries = await requestJson<unknown[]>(url.toString());

      return Array.isArray(summaries)
        ? summaries.map((summary) => ({ locale, summary }))
        : [];
    }),
  );
  const summaries = summaryResults.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  if (!summaries.length) {
    return [];
  }

  const seen = new Set<string>();
  const uniqueSummaries = summaries.filter(({ locale, summary }) => {
    const id = asString(asObject(summary).id);
    const key = `${locale}:${id ?? JSON.stringify(summary)}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });

  const detailResults = await Promise.allSettled(
    uniqueSummaries.slice(0, 24).map(({ locale, summary }) => {
      const id = asString(asObject(summary).id);

      return id
        ? requestJson<Record<string, unknown>>(
            `https://api.tcgdex.net/v2/${locale}/cards/${encodeURIComponent(id)}`,
          ).then((card) => ({ locale, card }))
        : Promise.resolve({ locale, card: asObject(summary) });
    }),
  );
  const cards = detailResults
    .map((result, index) =>
      result.status === "fulfilled"
        ? mapTcgdexCard(result.value.card, result.value.locale)
        : mapTcgdexCard(
            uniqueSummaries[index].summary,
            uniqueSummaries[index].locale,
          ),
    )
    .filter((card) => card.name !== "Pokemon card");

  return filterByRarity(cards, rarity);
}

async function searchPokemonTcgdexSetNumberVariants(
  setNumberQuery: SetNumberQuery,
  rarity: string,
  headers: Record<string, string>,
  locales: TcgdexLocale[] = tcgdexCodeSearchLocales,
): Promise<ExternalCard[]> {
  const numberCandidates = searchCardNumberCandidates(setNumberQuery.number);
  const seenLocaleCards = new Set<string>();
  const cards: ExternalCard[] = [];

  for (const locale of locales) {
    const localeSetCodes = await resolveTcgdexCandidateSetCodes(
      setNumberQuery,
      headers,
      locale,
    );

    for (const setCode of localeSetCodes) {
      const setCodeCandidates = tcgdexSetCodeCandidates(setCode);

      for (const setCodeCandidate of setCodeCandidates) {
        let foundLocaleCard = false;

        for (const numberCandidate of numberCandidates) {
          const cardId = `${setCodeCandidate}-${numberCandidate}`;
          const card = await requestJson<Record<string, unknown>>(
            `https://api.tcgdex.net/v2/${locale}/cards/${encodeURIComponent(cardId)}`,
          )
            .then((item) => mapTcgdexCard(item, locale))
            .catch(() => undefined);

          if (!card) {
            continue;
          }

          const key = `${locale}:${card.id}`;

          if (!seenLocaleCards.has(key)) {
            seenLocaleCards.add(key);
            cards.push(card);
          }

          foundLocaleCard = true;
          break;
        }

        if (foundLocaleCard) {
          break;
        }
      }
    }
  }

  return filterByRarity(uniqueCardsById(cards), rarity);
}

async function resolveTcgdexCandidateSetCodes(
  setNumberQuery: SetNumberQuery,
  headers: Record<string, string>,
  locale: TcgdexLocale,
) {
  const candidates: string[] = [];

  if (setNumberQuery.setCode) {
    candidates.push(setNumberQuery.setCode);
    candidates.push(...tcgdexSetCodeCandidates(setNumberQuery.setCode));
  }

  if (setNumberQuery.setTerm) {
    candidates.push(...(await resolveTcgdexSetCodes(setNumberQuery.setTerm, locale)));

    if (locale === "en") {
      candidates.push(...(await resolvePokemonSetIds(setNumberQuery.setTerm, headers)));
    }
  }

  return Array.from(
    new Set(candidates.map(cleanSetCode).filter((value) => value.length > 0)),
  ).slice(0, 12);
}

function mapTcgdexCard(item: unknown, locale: TcgdexLocale): ExternalCard {
  const card = asObject(item);
  const set = asObject(card.set);
  const image = asString(card.image);
  const price = pickTcgdexPrice(card);
  const sourceLocale = tcgdexLocaleLabels[locale];
  const source =
    price.source === "TCGdex"
      ? `TCGdex ${sourceLocale}`
      : `${price.source} (${sourceLocale})`;
  const id = asString(card.id);

  return {
    id: id ? `tcgdex:${locale}:${id}` : crypto.randomUUID(),
    game: "pokemon",
    name: asString(card.name) ?? "Pokemon card",
    setName: asString(set.name) ?? "Pokemon",
    number: asString(card.localId),
    rarity: asString(card.rarity),
    language: locale,
    languageLabel: cardLanguageLabels[locale],
    imageUrl: image ? `${image}/high.png` : undefined,
    priceUsd: price.price,
    priceSource: source,
    updatedAt: price.updated,
  };
}

async function searchOnePiece(
  query: string,
  rarity: string,
  structuredSearch: StructuredSearch,
): Promise<ExternalCard[]> {
  const cards = await getOnePieceCatalog();
  const setNumberQuery =
    structuredSetNumberQuery(structuredSearch) ?? parseSetNumberQuery(query);
  const codeSearchTerms = setNumberQuery?.setCode
    ? onePieceCardCodeCandidates(setNumberQuery.setCode, setNumberQuery.number)
    : [];
  const searchQuery = query.length >= 2 ? query : structuredSearch.setTerm;
  const englishSearchTerms = Array.from(
    new Set([searchQuery, ...codeSearchTerms].map((term) => term.toLowerCase())),
  );

  const englishMatches = filterByRarity(
    cards
      .filter((card) => {
        const name = `${card.name} ${card.setName} ${card.number ?? ""}`.toLowerCase();
        const cardNumber = (card.number ?? "").toLowerCase();

        if (codeSearchTerms.length) {
          return englishSearchTerms.some((term) => cardNumber === term);
        }

        return englishSearchTerms.some((term) => name.includes(term));
      }),
    rarity,
  )
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aSearchText = `${a.name} ${a.number ?? ""}`.toLowerCase();
      const bSearchText = `${b.name} ${b.number ?? ""}`.toLowerCase();
      const aScore = englishSearchTerms.some((term) =>
        aSearchText.startsWith(term),
      )
        ? 0
        : 1;
      const bScore = englishSearchTerms.some((term) =>
        bSearchText.startsWith(term),
      )
        ? 0
        : 1;

      return aScore - bScore || aName.localeCompare(bName);
    })
    .slice(0, 80);

  if (setNumberQuery?.setCode) {
    const japaneseSearchTerms = codeSearchTerms.length ? codeSearchTerms : [query];
    const japaneseMatches = uniqueCardsById(
      (
        await Promise.all(
          Array.from(new Set(japaneseSearchTerms)).map((term) =>
            searchOnePieceJapanese(term, cards, rarity),
          ),
        )
      ).flat(),
    );

    return uniqueCardsById([...englishMatches, ...japaneseMatches]).slice(0, 80);
  }

  if (query.length < 2 && !codeSearchTerms.length) {
    return englishMatches;
  }

  if (englishMatches.length && !hasKana(query) && !hasHan(query)) {
    return englishMatches;
  }

  const japaneseMatches = await searchOnePieceJapanese(query, cards, rarity);

  return japaneseMatches.length ? japaneseMatches : englishMatches;
}

let onePieceCatalog: CacheEntry | undefined;

async function getOnePieceCatalog(): Promise<ExternalCard[]> {
  if (onePieceCatalog && onePieceCatalog.expiresAt > Date.now()) {
    return onePieceCatalog.cards;
  }

  const endpoints = [
    "https://optcgapi.com/api/allSetCards/",
    "https://optcgapi.com/api/allSTCards/",
    "https://optcgapi.com/api/allDonCards/",
  ];

  const settled = await Promise.allSettled(
    endpoints.map((endpoint) => requestJson<unknown[]>(endpoint)),
  );

  const cards = settled.flatMap((result) =>
    result.status === "fulfilled" && Array.isArray(result.value)
      ? result.value.map(mapOnePieceCard).filter(Boolean)
      : [],
  ) as ExternalCard[];

  onePieceCatalog = {
    cards,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return cards;
}

function mapOnePieceCard(item: unknown): ExternalCard | undefined {
  const card = asObject(item);
  const name =
    asString(card.card_name) ??
    asString(card.optcg_don_name) ??
    asString(card.name);

  if (!name) {
    return undefined;
  }

  const marketPrice = parseUsd(card.market_price);
  const inventoryPrice = parseUsd(card.inventory_price);
  const number = asString(card.card_set_id) ?? asString(card.card_image_id);

  return {
    id: `${number ?? name}-${asString(card.card_image_id) ?? ""}`,
    game: "one-piece",
    name,
    setName: asString(card.set_name) ?? asString(card.set_id) ?? "One Piece",
    number,
    rarity: asString(card.rarity),
    language: "en",
    languageLabel: cardLanguageLabels.en,
    imageUrl: asString(card.card_image),
    priceUsd: marketPrice ?? inventoryPrice,
    priceSource: marketPrice ? "OPTCG API market" : "OPTCG API inventory",
    sourceUrl: number ? `https://optcgapi.com/api/sets/card/${number}/` : undefined,
    updatedAt: asString(card.date_scraped),
  };
}

const yuyuteiVariantScore = (entry: YuyuteiPriceEntry, printId: string) => {
  const isParallel =
    entry.name.includes("\u30d1\u30e9\u30ec\u30eb") || /\bP[-/]/i.test(entry.name);
  const isPromo =
    entry.name.includes("\u4e00\u756a\u304f\u3058") ||
    entry.href?.includes("promo") === true;
  const suffix = printId.match(/_p(\d+)$/i)?.[1];

  if (!suffix) {
    return !isParallel && !isPromo ? 0 : isParallel ? 40 : 60;
  }

  if (suffix === "1") {
    return isPromo ? 0 : isParallel ? 20 : 50;
  }

  return isParallel && !isPromo ? 0 : isParallel ? 10 : 50;
};

const parseYuyuteiOnePiecePrices = (html: string, code: string) => {
  const indices: number[] = [];
  let index = -1;

  while ((index = html.indexOf("card-product", index + 1)) !== -1) {
    indices.push(index);
  }

  return indices
    .map((start, listIndex) => {
      const end = indices[listIndex + 1] ?? html.length;
      const block = html.slice(start, end);
      const productCode = stripHtml(
        block.match(/<span[^>]*>\s*([^<]+?)\s*<\/span>/)?.[1] ?? "",
      );
      const name = stripHtml(
        block.match(/<h4[^>]*>([\s\S]*?)<\/h4>/)?.[1] ?? "",
      );
      const rawPrice = block.match(
        /<strong[^>]*>\s*([0-9,]+)\s*\u5186\s*<\/strong>/,
      )?.[1];
      const href = asString(
        block.match(/href="([^"]*\/sell\/opc\/card\/[^"]+)"/)?.[1],
      );
      const priceJpy = rawPrice
        ? Number(rawPrice.replace(/,/g, ""))
        : undefined;

      if (
        productCode.toUpperCase() !== code.toUpperCase() ||
        !name ||
        !priceJpy ||
        !Number.isFinite(priceJpy)
      ) {
        return undefined;
      }

      const entry: YuyuteiPriceEntry = {
        code: productCode,
        name,
        priceJpy,
      };

      if (href) {
        entry.href = href;
      }

      return entry;
    })
    .filter((entry): entry is YuyuteiPriceEntry => Boolean(entry));
};

async function getYuyuteiOnePiecePrices(code: string) {
  const normalizedCode = onePieceBaseNumberFromPrintId(
    normalizeOnePiecePrintId(code),
  );

  if (!normalizedCode) {
    return [];
  }

  const cached = onePieceJapanesePriceCache.get(normalizedCode);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.entries;
  }

  const url = new URL("https://yuyu-tei.jp/sell/opc/s/search");
  url.searchParams.set("search_word", normalizedCode);
  const html = await requestText(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 Pullario local prototype",
    },
  }).catch(() => "");
  const entries = html
    ? parseYuyuteiOnePiecePrices(html, normalizedCode)
    : [];

  onePieceJapanesePriceCache.set(normalizedCode, {
    entries,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return entries;
}

async function getYuyuteiOnePiecePrice(printId: string) {
  const entries = await getYuyuteiOnePiecePrices(printId);
  const bestEntry = entries
    .slice()
    .sort(
      (a, b) =>
        yuyuteiVariantScore(a, printId) - yuyuteiVariantScore(b, printId),
    )[0];

  if (!bestEntry) {
    return undefined;
  }

  const usdPerJpy = await getUsdPerJpy();

  return {
    entry: bestEntry,
    priceUsd: Number((bestEntry.priceJpy * usdPerJpy).toFixed(2)),
  };
}

async function getOnePieceLanguageVariants(
  card: ExternalCard,
): Promise<CardLanguageGroup[]> {
  const printId = onePiecePrintIdFromCard(card);

  if (!printId) {
    return groupCardsByLanguage([card], card.id);
  }

  const cards = await getOnePieceCatalog();
  const baseNumber = onePieceBaseNumberFromPrintId(printId);
  const englishCards = cards.filter(
    (candidate) => onePiecePrintIdFromCard(candidate) === printId,
  );
  const japaneseCards = (
    await searchOnePieceJapanese(baseNumber, cards, "")
  ).filter((candidate) => onePiecePrintIdFromCard(candidate) === printId);

  return groupCardsByLanguage(
    [card, ...englishCards, ...japaneseCards],
    card.id,
  );
}

async function searchOnePieceJapanese(
  query: string,
  pricedCards: ExternalCard[],
  rarity: string,
): Promise<ExternalCard[]> {
  const url = new URL(ONE_PIECE_JP_CARDLIST_URL);
  url.searchParams.set("freewords", query);

  const html = await requestText(url.toString()).catch(() => "");

  if (!html) {
    return [];
  }

  const matches = Array.from(
    html.matchAll(
      /<dl class="modalCol" id="([^"]+)">[\s\S]*?<div class="infoCol">\s*<span>([^<]+)<\/span>\s*\|\s*<span>([^<]+)<\/span>\s*\|\s*<span>([^<]+)<\/span>[\s\S]*?<div class="cardName">([^<]+)<\/div>[\s\S]*?<img class="lazy" src="\/images\/cardlist\/dummy.gif" data-src="([^"]+)"/g,
    ),
  );

  const seen = new Set<string>();
  const rawCards = matches
    .map((match) => {
      const id = decodeHtml(match[1] ?? "");
      const number = decodeHtml(match[2] ?? "");

      if (!id || !number || seen.has(id)) {
        return undefined;
      }

      seen.add(id);

      return {
        id,
        number,
        rarity: decodeHtml(match[3] ?? ""),
        type: decodeHtml(match[4] ?? ""),
        name: decodeHtml(match[5] ?? ""),
        image: decodeHtml(match[6] ?? ""),
      };
    })
    .filter((card): card is OnePieceJapaneseRawCard => Boolean(card));
  const shouldLoadJapanesePrices =
    rawCards.length <= 12 || parseSetNumberQuery(query)?.setCode;
  const pricedResults = shouldLoadJapanesePrices
    ? await Promise.all(
        rawCards.map((card) =>
          getYuyuteiOnePiecePrice(card.id).catch(() => undefined),
        ),
      )
    : [];
  const cards = rawCards.map((card, index) =>
    mapOnePieceJapaneseCard(card, pricedCards, pricedResults[index]),
  );

  return filterByRarity(cards, rarity).slice(0, 80);
}

function mapOnePieceJapaneseCard(
  card: OnePieceJapaneseRawCard,
  pricedCards: ExternalCard[],
  japanesePrice?: {
    entry: YuyuteiPriceEntry;
    priceUsd: number;
  },
): ExternalCard {
  const matchingPriceCard =
    pricedCards.find((pricedCard) => pricedCard.id.endsWith(`-${card.id}`)) ??
    pricedCards.find(
      (pricedCard) =>
        (pricedCard.number ?? "").toUpperCase() === card.number.toUpperCase(),
    );
  const imageUrl = new URL(card.image, ONE_PIECE_JP_CARDLIST_URL).href;

  return {
    id: `onepiece-jp:${card.id}`,
    game: "one-piece",
    name: card.name,
    setName: matchingPriceCard?.setName ?? "One Piece JP",
    number: card.number,
    rarity: card.rarity,
    language: "ja",
    languageLabel: cardLanguageLabels.ja,
    imageUrl: proxiedImageUrl(imageUrl),
    priceUsd: japanesePrice?.priceUsd,
    priceSource: japanesePrice
      ? `Yuyu-tei JP retail (${japanesePrice.entry.priceJpy.toLocaleString("en-US")} JPY)`
      : "One Piece JP official",
    sourceUrl:
      japanesePrice?.entry.href ??
      `${ONE_PIECE_JP_CARDLIST_URL}?freewords=${encodeURIComponent(card.number)}`,
    updatedAt: japanesePrice ? new Date().toISOString().slice(0, 10) : undefined,
  };
}
