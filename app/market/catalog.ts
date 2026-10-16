import type { CardGame, ExternalCard, PrizeItemType } from "../lib/card-search";
import type { PackGame, SearchState, UserCardItem, UserRole } from "./types";

export const gameLabels: Record<PackGame, string> = {
  "one-piece": "One Piece",
  pokemon: "Pokemon",
  magic: "Magic",
  mixed: "Mixto",
};

export const gameAccents: Record<PackGame, string> = {
  "one-piece": "#15c8ff",
  pokemon: "#ffcc33",
  magic: "#c084fc",
  mixed: "#ff4f7b",
};

export const cardGames: CardGame[] = ["one-piece", "pokemon", "magic"];
export const argentinaProvinces = [
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

export const prizeItemTypes: PrizeItemType[] = ["card", "sealed-pack", "sealed-box"];

export const prizeTypeLabels: Record<PrizeItemType, string> = {
  card: "Carta",
  "sealed-pack": "Sobre sellado",
  "sealed-box": "Caja sellada",
};

export const prizeTypeShortLabels: Record<PrizeItemType, string> = {
  card: "Cartas",
  "sealed-pack": "Sobres",
  "sealed-box": "Cajas",
};

export const itemTypeOf = (card: ExternalCard): PrizeItemType =>
  card.itemType ?? "card";

export const isCardPrize = (card: ExternalCard) => itemTypeOf(card) === "card";

export const roleLabels: Record<UserRole, string> = {
  user: "Usuario registrado",
  admin: "Administrador",
};

export const cardStatusLabels: Record<UserCardItem["status"], string> = {
  owned: "Disponible",
  waiting_stock: "Esperando stock",
  sold: "Vendida",
  withdrawn: "Retirada",
  upgraded: "Usada en Upgrader",
  changed: "Usada en Changer",
};

export const orderStatusLabels: Record<UserCardItem["status"], string> = {
  owned: "Ganada",
  waiting_stock: "Esperando stock",
  sold: "Vendida",
  withdrawn: "Retiro confirmado",
  upgraded: "Usada en Upgrader",
  changed: "Usada en Changer",
};

export const isSellerRole = (role?: UserRole) => role === "admin";

export const newSearchState = (game: CardGame, query: string): SearchState => ({
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
