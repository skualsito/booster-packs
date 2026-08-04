import { isSupportedGame, searchCards } from "../../../lib/card-search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const game = url.searchParams.get("game") ?? "";
  const query = url.searchParams.get("q") ?? "";
  const setName = url.searchParams.get("set") ?? "";
  const number = url.searchParams.get("number") ?? "";
  const rarity = url.searchParams.get("rarity") ?? "";

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
    const cards = await searchCards(game, query, { rarity, setName, number });
    return Response.json({
      cards,
      meta: {
        game,
        query: query.trim(),
        set: setName.trim(),
        number: number.trim(),
        rarity: rarity.trim(),
        count: cards.length,
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
          count: 0,
        },
    });
  }
}
