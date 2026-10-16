/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef } from "react";
import type { ExternalCard } from "../../lib/card-search";
import { Eye, Plus, Search } from "../../MaterialIcons";
import { cardImage, handleImageError } from "../card-display";
import { cardGames, gameLabels, newSearchState } from "../catalog";
import { formatUsd } from "../format";
import type { SearchState } from "../types";
import { SortControl } from "./SortControl";

export function SearchConsole({
  actionLabel,
  infinite = false,
  onCardAction,
  onLoadMore,
  onSearch,
  search,
  setSearch,
}: {
  actionLabel: string;
  infinite?: boolean;
  onCardAction: (card: ExternalCard) => void;
  onLoadMore?: () => void;
  onSearch: (override?: Partial<SearchState>) => void;
  search: SearchState;
  setSearch: React.Dispatch<React.SetStateAction<SearchState>>;
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (
      !infinite ||
      !sentinel ||
      !onLoadMore ||
      !search.hasMore ||
      search.loading ||
      search.loadingMore
    ) {
      return;
    }

    const scrollContainer = sentinel.closest(".result-grid");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: scrollContainer,
        rootMargin: "220px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [infinite, onLoadMore, search.hasMore, search.loading, search.loadingMore]);

  return (
    <div className={`search-console ${infinite ? "infinite-search" : ""}`}>
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

      {infinite && (
        <div className="search-results-toolbar">
          <SortControl
            ariaLabel="Ordenar resultados"
            onChange={(value) => {
              const sort = value as SearchState["sort"];
              setSearch((current) => ({ ...current, sort }));

              if (
                search.query.trim().length >= 2 ||
                search.setName.trim().length >= 2
              ) {
                onSearch({ sort });
              }
            }}
            options={[
              { value: "relevance", label: "Relevancia" },
              { value: "price-asc", label: "Precio: menor a mayor" },
              { value: "price-desc", label: "Precio: mayor a menor" },
              { value: "number-desc", label: "Numero: mayor a menor" },
            ]}
            value={search.sort}
          />
        </div>
      )}

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
        {infinite && !search.loading && search.results.length > 0 && (
          <div className="infinite-search-status" ref={loadMoreRef}>
            {search.loadingMore ? (
              <>
                <span className="mini-spinner" aria-hidden />
                <strong>Cargando mas cartas</strong>
              </>
            ) : search.hasMore ? (
              <span>Continua desplazandote para ver mas</span>
            ) : (
              <span>Llegaste al final de los resultados</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
