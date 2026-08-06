import { isSupportedGame, searchCards } from "../../../lib/card-search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const game = url.searchParams.get("game") ?? "";
  const query = url.searchParams.get("q") ?? "";
  const setName = url.searchParams.get("set") ?? "";
  const number = url.searchParams.get("number") ?? "";
  const rarity = url.searchParams.get("rarity") ?? "";
  const sort = url.searchParams.get("sort") ?? "relevance";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const pageSize = 24;

  if (!isSupportedGame(game)) {
    return Response.json(
      {
        error:
          "Unsupported game. Use one of: magic, pokemon, one-piece.",
      },
      { status: 400 },
    );
  }

  if (query.trim().length < 2 && setName.trim().length < 2) {
    return Response.json({ cards: [] });
  }

  try {
    const result = await searchCards(game, query, {
      rarity,
      setName,
      number,
      page,
      pageSize,
      sort,
    });
    return Response.json({
      cards: result.cards,
      meta: {
        game,
        query: query.trim(),
        set: setName.trim(),
        number: number.trim(),
        rarity: rarity.trim(),
        sort,
        count: result.cards.length,
        hasMore: result.hasMore,
        page: result.page,
        total: result.total,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not fetch cards right now.";

    return Response.json({
      cards: [],
      error: message,
        meta: {
          game,
          query: query.trim(),
          set: setName.trim(),
          number: number.trim(),
          rarity: rarity.trim(),
          sort,
          count: 0,
          hasMore: false,
          page,
          total: 0,
        },
    });
  }
}
