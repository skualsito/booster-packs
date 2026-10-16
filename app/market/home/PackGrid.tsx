/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Database } from "../../MaterialIcons";
import { cardImage } from "../card-display";
import { gameLabels } from "../catalog";
import { formatPercent, formatUsd } from "../format";
import { packHitChance, topItem } from "../pack-math";
import type { BoosterPack } from "../types";

export function PackGrid({ packList }: { packList: BoosterPack[] }) {
  return (
    <div className="pack-grid">
      {packList.map((pack) => {
        const top = topItem(pack);

        return (
          <Link
            className="pack-card"
            href={`/packs/${encodeURIComponent(pack.id)}`}
            key={pack.id}
            style={{ "--accent": pack.accent } as CSSProperties}
          >
            <span className="pack-preview">
              {top?.card.imageUrl ? (
                <img src={cardImage(top.card)} alt="" />
              ) : (
                <Database size={26} aria-hidden />
              )}
            </span>
            <span className="pack-card-copy">
              <span className="pack-source">
                {gameLabels[pack.game]} · Pullario
              </span>
              <span className="pack-name">{pack.name}</span>
              <span className="pack-series">{pack.series}</span>
            </span>
            <span className="pack-card-footer">
              <span>
                <small>Precio</small>
                <strong>{formatUsd.format(pack.price)}</strong>
              </span>
              <span>
                <small>Hit</small>
                <strong>{formatPercent.format(packHitChance(pack))}%</strong>
              </span>
              <span className="pack-open-icon" aria-hidden>
                <ArrowRight size={22} />
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
