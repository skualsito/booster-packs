/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import type { CardLanguageGroup, ExternalCard } from "../../lib/card-search";
import { X } from "../../MaterialIcons";
import {
  cardImage,
  handleImageError,
  singleCardLanguageGroup,
  variantLoadingSteps,
} from "../card-display";
import {
  gameLabels,
  isCardPrize,
  itemTypeOf,
  prizeTypeLabels,
} from "../catalog";
import { formatUsd } from "../format";
import type { VariantsResponse } from "../types";

export function CardModal({
  card,
  onClose,
}: {
  card: ExternalCard;
  onClose: () => void;
}) {
  const [focusedCardId, setFocusedCardId] = useState(card.id);
  const [variantGroups, setVariantGroups] = useState<CardLanguageGroup[]>(() =>
    isCardPrize(card) ? [] : [singleCardLanguageGroup(card)],
  );
  const [variantsLoading, setVariantsLoading] = useState(isCardPrize(card));
  const [variantsError, setVariantsError] = useState("");
  const loadingSteps = useMemo(() => variantLoadingSteps(card.game), [card.game]);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  useEffect(() => {
    if (!isCardPrize(card)) {
      return;
    }

    const controller = new AbortController();

    void fetch("/api/cards/variants", {
      body: JSON.stringify({ card }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as VariantsResponse;

        if (!response.ok || payload.error) {
          throw new Error(payload.error ?? "No se pudieron cargar versiones.");
        }

        setVariantGroups(
          payload.groups?.length ? payload.groups : [singleCardLanguageGroup(card)],
        );
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setVariantsError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar versiones.",
        );
        setVariantGroups([singleCardLanguageGroup(card)]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setVariantsLoading(false);
        }
      });

    return () => controller.abort();
  }, [card]);

  useEffect(() => {
    if (!variantsLoading) {
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStepIndex((current) =>
        Math.min(current + 1, loadingSteps.length - 1),
      );
    }, 950);

    return () => window.clearInterval(timer);
  }, [loadingSteps.length, variantsLoading]);

  const relatedVersions = useMemo(
    () => variantGroups.flatMap((group) => group.cards),
    [variantGroups],
  );
  const focusedCard =
    relatedVersions.find((version) => version.id === focusedCardId) ?? card;
  const languageCount = variantGroups.length;
  const variantCount = relatedVersions.length;

  return (
    <div
      className="modal-backdrop"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      role="presentation"
    >
      <article
        aria-labelledby="card-modal-title"
        aria-modal="true"
        className="card-modal"
        role="dialog"
      >
        <button
          aria-label="Cerrar detalles"
          className="modal-close"
          onClick={onClose}
          type="button"
        >
          <X size={18} aria-hidden />
        </button>
        <img
          src={cardImage(focusedCard)}
          alt=""
          onError={handleImageError(focusedCard.game)}
        />
        <div className="modal-copy">
          <span className="eyebrow">
            {gameLabels[focusedCard.game]} - {prizeTypeLabels[itemTypeOf(focusedCard)]}
          </span>
          <h2 id="card-modal-title">{focusedCard.name}</h2>
          <strong className="modal-price">
            {typeof focusedCard.priceUsd === "number"
              ? formatUsd.format(focusedCard.priceUsd)
              : "Sin precio"}
          </strong>
          <dl>
            <div>
              <dt>{isCardPrize(focusedCard) ? "Set" : "Expansion"}</dt>
              <dd>{focusedCard.setName}</dd>
            </div>
            {isCardPrize(focusedCard) && (
              <div>
                <dt>Numero</dt>
                <dd>{focusedCard.number ?? "N/D"}</dd>
              </div>
            )}
            <div>
              <dt>{isCardPrize(focusedCard) ? "Rareza" : "Tipo"}</dt>
              <dd>
                {isCardPrize(focusedCard)
                  ? focusedCard.rarity ?? "N/D"
                  : prizeTypeLabels[itemTypeOf(focusedCard)]}
              </dd>
            </div>
            <div>
              <dt>Fuente</dt>
              <dd>{focusedCard.priceSource}</dd>
            </div>
            <div>
              <dt>Actualizado</dt>
              <dd>{focusedCard.updatedAt ?? "N/D"}</dd>
            </div>
          </dl>
          {focusedCard.sourceUrl && (
            <a href={focusedCard.sourceUrl} rel="noreferrer" target="_blank">
              Abrir fuente
            </a>
          )}

          {isCardPrize(card) && (
          <section className="modal-versions" aria-label="Versiones relacionadas">
            <div className="modal-versions-heading">
              <h3>Misma carta por idioma</h3>
              <span>
                {variantsLoading
                  ? "Buscando"
                  : `${languageCount} idiomas / ${variantCount} versiones`}
              </span>
            </div>
            {card.game === "pokemon" && (
              <p className="variant-note">
                En Pokemon, las cartas de otros idiomas no siempre conservan el
                mismo numero dentro de la expansion. El buscador cruza set,
                numero y datos de la carta para acercarse a la version correcta,
                pero puede mostrar coincidencias cercanas.
              </p>
            )}
            {variantsError && <p className="variant-error">{variantsError}</p>}
            {variantsLoading ? (
              <div className="variant-loader" role="status">
                <div className="loader-orbit" aria-hidden>
                  <span />
                </div>
                <div>
                  <strong>{loadingSteps[loadingStepIndex]}</strong>
                  <p>Comparando la carta exacta entre idiomas disponibles.</p>
                </div>
                <ol className="loader-steps">
                  {loadingSteps.map((step, index) => (
                    <li
                      className={index <= loadingStepIndex ? "active" : ""}
                      key={step}
                    >
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="version-list">
                {variantGroups.map((group) => (
                  <section className="language-group" key={group.language}>
                    <div className="language-title">
                      <strong>{group.label}</strong>
                      <small>{group.cards.length}</small>
                    </div>
                    {group.cards.map((version) => (
                      <button
                        className={
                          version.id === focusedCard.id
                            ? "version-row active"
                            : "version-row"
                        }
                        key={`${version.game}-${version.id}`}
                        onClick={() => setFocusedCardId(version.id)}
                        type="button"
                      >
                        <img
                          src={cardImage(version)}
                          alt=""
                          loading="lazy"
                          onError={handleImageError(version.game)}
                        />
                        <span>
                          <strong>{version.name}</strong>
                          <small>
                            {version.setName}
                            {version.number ? ` #${version.number}` : ""}
                          </small>
                          <em>{version.rarity ?? "Sin rareza"}</em>
                        </span>
                        <b>
                          {typeof version.priceUsd === "number"
                            ? formatUsd.format(version.priceUsd)
                            : "Sin precio"}
                        </b>
                      </button>
                    ))}
                  </section>
                ))}
              </div>
            )}
          </section>
          )}
        </div>
      </article>
    </div>
  );
}
