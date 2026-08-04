import {
  getCardLanguageVariants,
  isSupportedGame,
  type ExternalCard,
} from "../../../lib/card-search";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    card?: Partial<ExternalCard>;
  };
  const card = body.card;

  if (!card?.game || !isSupportedGame(card.game)) {
    return Response.json({ error: "Invalid card game." }, { status: 400 });
  }

  if (!card.id || !card.name || !card.setName) {
    return Response.json({ error: "Invalid card payload." }, { status: 400 });
  }

  try {
    const groups = await getCardLanguageVariants(card as ExternalCard);

    return Response.json({
      groups,
      meta: {
        game: card.game,
        id: card.id,
        count: groups.reduce((total, group) => total + group.cards.length, 0),
        languages: groups.length,
      },
    });
  } catch (error) {
    return Response.json(
      {
        groups: [],
        error:
          error instanceof Error
            ? error.message
            : "Could not fetch language variants.",
      },
      { status: 500 },
    );
  }
}
