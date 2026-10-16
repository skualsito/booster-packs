import type { SyntheticEvent } from "react";
import type {
  CardGame,
  CardLanguageGroup,
  ExternalCard,
  PrizeItemType,
} from "../lib/card-search";
import { isCardPrize } from "./catalog";

export const fallbackImages: Record<CardGame, string> = {
  "one-piece": "https://optcgapi.com/media/static/Card_Images/OP01-001.jpg",
  pokemon: "https://images.pokemontcg.io/base1/4_hires.png",
  magic:
    "https://cards.scryfall.io/normal/front/7/7/77bdf609-2d7e-4bdb-a9fd-8b5eeebd6e0e.jpg?1562738291",
};

export const fallbackSealedImage = "/favicon.svg";

export const localImageUrl = (imageUrl: string) =>
  imageUrl.startsWith("https://www.onepiece-cardgame.com/")
    ? `/api/images/proxy?url=${encodeURIComponent(imageUrl)}`
    : imageUrl;

export const cardImage = (card: ExternalCard) =>
  card.imageUrl
    ? localImageUrl(card.imageUrl)
    : isCardPrize(card)
      ? fallbackImages[card.game]
      : fallbackSealedImage;

export const handleImageError =
  (game: CardGame, itemType: PrizeItemType = "card") =>
  (event: SyntheticEvent<HTMLImageElement>) => {
    const fallback =
      itemType === "card" ? fallbackImages[game] : fallbackSealedImage;

    if (event.currentTarget.src !== fallback) {
      event.currentTarget.src = fallback;
    }
  };

export const languageLabelForCard = (card: ExternalCard) => {
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

export const singleCardLanguageGroup = (card: ExternalCard): CardLanguageGroup => ({
  language: card.language ?? "en",
  label: languageLabelForCard(card),
  cards: [card],
});

export const variantLoadingSteps = (game: CardGame) =>
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
