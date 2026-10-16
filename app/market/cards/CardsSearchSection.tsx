import { CardModal } from "../components/CardModal";
import { SearchConsole } from "../components/SearchConsole";
import { useMarket } from "../MarketContext";

export function CardsSearchSection() {
  const {
    publicSearch,
    runSearch,
    setPublicSearch,
    showCardDetails,
  } = useMarket();

  return (
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
}

export function SelectedCardModal() {
  const { selectedCard, setSelectedCard } = useMarket();

  if (!selectedCard) {
    return null;
  }

  return (
    <CardModal
      card={selectedCard.card}
      key={`${selectedCard.card.game}-${selectedCard.card.id}`}
      onClose={() => setSelectedCard(null)}
    />
  );
}
