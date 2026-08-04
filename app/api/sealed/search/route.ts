import type { CardGame, ExternalCard, PrizeItemType } from "../../../lib/card-search";

type TcgCsvGroup = {
  groupId: number;
  name: string;
  abbreviation?: string;
  publishedOn?: string;
  modifiedOn?: string;
};

type TcgCsvProduct = {
  productId: number;
  name: string;
  imageUrl?: string;
  url?: string;
  modifiedOn?: string;
  extendedData?: Array<{ name?: string; value?: string }>;
};

type TcgCsvPrice = {
  productId: number;
  marketPrice?: number | null;
  midPrice?: number | null;
  lowPrice?: number | null;
  subTypeName?: string;
};

type TcgCsvResponse<T> = {
  success?: boolean;
  results?: T[];
};

const CATEGORY_IDS: Record<CardGame, number> = {
  magic: 1,
  pokemon: 3,
  "one-piece": 68,
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const SEALED_WORDS =
  /\b(booster|pack|box|display|case|bundle|blister|tin|collection|deck|kit|etb|trainer|premium|gift|starter|pre[- ]?release)\b/i;
const GENERIC_WORDS = new Set([
  "booster",
  "pack",
  "box",
  "display",
  "case",
  "bundle",
  "blister",
  "tin",
  "collection",
  "deck",
  "kit",
  "etb",
  "trainer",
  "premium",
  "gift",
  "starter",
  "sealed",
]);

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const compact = (value: string) => normalize(value).replace(/\s+/g, "");

async function cachedJson<T>(url: string): Promise<TcgCsvResponse<T>> {
  const cached = responseCache.get(url);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as TcgCsvResponse<T>;
  }

  const response = await fetch(url, {
    headers: { "User-Agent": "Pullario/0.1.0" },
  });

  if (!response.ok) {
    throw new Error(`TCGCSV respondio ${response.status}.`);
  }

  const value = (await response.json()) as TcgCsvResponse<T>;
  responseCache.set(url, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  return value;
}

const groupScore = (group: TcgCsvGroup, query: string, coreTokens: string[]) => {
  const name = normalize(`${group.name} ${group.abbreviation ?? ""}`);
  const compactName = compact(name);
  const compactQuery = compact(query);
  let score = compactQuery && compactName.includes(compactQuery) ? 100 : 0;

  for (const token of coreTokens) {
    if (name.includes(token) || compactName.includes(compact(token))) {
      score += 12;
    }
  }

  return score;
};

const isSealedProduct = (product: TcgCsvProduct) => {
  const fields = product.extendedData ?? [];
  const isCard = fields.some((field) =>
    ["number", "rarity"].includes((field.name ?? "").toLowerCase()),
  );

  return !isCard && SEALED_WORDS.test(product.name);
};

const itemTypeFor = (name: string): PrizeItemType =>
  /\b(box|display|case|bundle|tin|collection|deck|kit|etb|trainer)\b/i.test(name)
    ? "sealed-box"
    : "sealed-pack";

const bestPrice = (prices: TcgCsvPrice[]) => {
  const preferred =
    prices.find(
      (price) =>
        price.subTypeName?.toLowerCase() === "normal" &&
        typeof price.marketPrice === "number",
    ) ?? prices.find((price) => typeof price.marketPrice === "number") ?? prices[0];

  return preferred?.marketPrice ?? preferred?.midPrice ?? preferred?.lowPrice;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const game = url.searchParams.get("game") as CardGame;
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (!(game in CATEGORY_IDS)) {
    return Response.json({ error: "Juego no soportado." }, { status: 400 });
  }

  if (query.length < 2) {
    return Response.json({ products: [] });
  }

  try {
    const categoryId = CATEGORY_IDS[game];
    const normalizedQuery = normalize(query);
    const queryTokens = normalizedQuery.split(" ").filter(Boolean);
    const coreTokens = queryTokens.filter((token) => !GENERIC_WORDS.has(token));
    const groupsPayload = await cachedJson<TcgCsvGroup>(
      `https://tcgcsv.com/tcgplayer/${categoryId}/groups`,
    );
    const groups = (groupsPayload.results ?? [])
      .map((group) => ({
        group,
        score: groupScore(group, normalizedQuery, coreTokens),
      }))
      .filter(({ score }) => score > 0 || coreTokens.length === 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return Date.parse(b.group.publishedOn ?? b.group.modifiedOn ?? "") -
          Date.parse(a.group.publishedOn ?? a.group.modifiedOn ?? "");
      })
      .slice(0, 6);

    const groupResults = await Promise.all(
      groups.map(async ({ group, score: setScore }) => {
        const baseUrl = `https://tcgcsv.com/tcgplayer/${categoryId}/${group.groupId}`;
        const [productsPayload, pricesPayload] = await Promise.all([
          cachedJson<TcgCsvProduct>(`${baseUrl}/products`),
          cachedJson<TcgCsvPrice>(`${baseUrl}/prices`),
        ]);
        const pricesByProduct = new Map<number, TcgCsvPrice[]>();

        for (const price of pricesPayload.results ?? []) {
          pricesByProduct.set(price.productId, [
            ...(pricesByProduct.get(price.productId) ?? []),
            price,
          ]);
        }

        return (productsPayload.results ?? [])
          .filter(isSealedProduct)
          .map((product) => {
            const productName = normalize(product.name);
            const matchingTokens = queryTokens.filter((token) =>
              productName.includes(token),
            ).length;
            const exactBonus = productName.includes(normalizedQuery) ? 80 : 0;
            const retailPriority = /\bcase\b/i.test(product.name)
              ? -45
              : /\bdisplay\b/i.test(product.name)
                ? -15
                : /\bbooster (pack|box)\b/i.test(product.name)
                  ? 20
                  : 0;
            const price = bestPrice(pricesByProduct.get(product.productId) ?? []);
            const itemType = itemTypeFor(product.name);
            const card: ExternalCard = {
              id: `tcgcsv-${product.productId}`,
              game,
              itemType,
              name: product.name,
              setName: group.name,
              rarity: itemType === "sealed-box" ? "Caja sellada" : "Sobre sellado",
              imageUrl: product.imageUrl?.replace("_200w.jpg", "_in_1000x1000.jpg"),
              priceUsd:
                typeof price === "number" && Number.isFinite(price)
                  ? Number(price.toFixed(2))
                  : undefined,
              priceSource: "TCGCSV / TCGplayer market",
              sourceUrl: product.url,
              updatedAt: product.modifiedOn?.slice(0, 10),
            };

            return {
              card,
              score: setScore + exactBonus + matchingTokens * 10 + retailPriority,
            };
          });
      }),
    );

    const products = groupResults
      .flat()
      .sort((a, b) => b.score - a.score || (b.card.priceUsd ?? 0) - (a.card.priceUsd ?? 0))
      .slice(0, 24)
      .map(({ card }) => card);

    return Response.json({
      products,
      meta: { game, query, count: products.length, source: "TCGCSV" },
    });
  } catch (error) {
    return Response.json(
      {
        products: [],
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron buscar productos sellados.",
      },
      { status: 502 },
    );
  }
}
