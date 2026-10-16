import type {
  CardGame,
  CardLanguageGroup,
  ExternalCard,
} from "../lib/card-search";

export type PackGame = CardGame | "mixed";
export type UserRole = "user" | "admin";

export type PackItem = {
  slotId: string;
  card: ExternalCard;
  probability: number;
};

export type BoosterPack = {
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

export type SearchState = {
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

export type SearchResponse = {
  cards?: ExternalCard[];
  meta?: {
    hasMore?: boolean;
    page?: number;
    total?: number;
  };
  error?: string;
};

export type VariantsResponse = {
  groups?: CardLanguageGroup[];
  error?: string;
};

export type SelectedCardDetails = {
  card: ExternalCard;
};

export type PacksResponse = {
  packs?: BoosterPack[];
  error?: string;
};

export type SavePackResponse = {
  pack?: BoosterPack;
  error?: string;
};

export type ShopStockItem = {
  id: number;
  card: ExternalCard;
  quantity: number;
};

export type ShopStockResponse = {
  stock?: ShopStockItem[] | ShopStockItem;
  deleted?: boolean;
  error?: string;
};

export type UserCardItem = {
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

export type UserCardsResponse = {
  cards?: UserCardItem[];
  totalValueUsd?: number;
  ownedValueUsd?: number;
  lifetimeValueUsd?: number;
  error?: string;
};

export type UpgraderOptionsResponse = {
  inventory?: UserCardItem[];
  targets?: ShopStockItem[];
  rtp?: number;
  maxChance?: number;
  error?: string;
};

export type UpgraderPlayResponse = {
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

export type ChangerPlayResponse = {
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

export type ShopOrderItem = {
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

export type ShopOrdersResponse = {
  orders?: ShopOrderItem[];
  reservedCount?: number;
  waitingStockCount?: number;
  withdrawnCount?: number;
  soldCount?: number;
  error?: string;
};

export type ShipOrdersResponse = {
  ok?: boolean;
  shippedCount?: number;
  error?: string;
};

export type ShopShipmentsResponse = {
  active?: ShopOrderItem[];
  history?: ShopOrderItem[];
  error?: string;
};

export type DeliverShipmentResponse = {
  ok?: boolean;
  deliveredCount?: number;
  error?: string;
};

export type AdminUserSummary = {
  id: number;
  username: string;
  displayName?: string;
  email?: string;
  prizeCount: number;
  activeCount: number;
  spentValueUsd: number;
  withdrawnValueUsd: number;
};

export type AdminUsersResponse = {
  users?: AdminUserSummary[];
  error?: string;
};

export type AdminUserCardsResponse = {
  user?: Pick<AdminUserSummary, "id" | "username" | "displayName" | "email">;
  cards?: UserCardItem[];
  error?: string;
};

export type WalletResponse = {
  user?: LoginResponse["user"];
  valueUsd?: number;
  error?: string;
};

export type OpenPackResponse = {
  item?: PackItem;
  userCardId?: number;
  user?: LoginResponse["user"];
  error?: string;
};

export type RecentDrop = {
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

export type RecentDropsResponse = {
  drops?: RecentDrop[];
  error?: string;
};

export type LoginResponse = {
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

export type SessionAuth = {
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

export type ApiStatus = "checking" | "online" | "offline";
export type AppView =
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

export type RouletteCard = PackItem & {
  spinKey: string;
};

export type RouletteState = {
  packId?: string;
  items: RouletteCard[];
  targetIndex: number;
  offset: number;
  phase: "idle" | "spinning" | "done";
  runId: number;
  result?: PackItem;
};

export type MarketProps = {
  initialPackId?: string;
  view: AppView;
};
