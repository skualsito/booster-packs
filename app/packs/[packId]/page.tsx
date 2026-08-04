import type { Metadata } from "next";
import { BoosterMarket } from "../../BoosterMarket";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ packId: string }>;
}): Promise<Metadata> {
  const { packId } = await params;
  const decodedPackId = decodeURIComponent(packId);

  return {
    title: `Caja ${decodedPackId}`,
    description:
      "Detalle de la caja TCG en Pullario con ruleta de apertura, cartas posibles y porcentajes de probabilidad visibles.",
    alternates: {
      canonical: `/packs/${encodeURIComponent(decodedPackId)}`,
    },
  };
}

export default async function PackPage({
  params,
}: {
  params: Promise<{ packId: string }>;
}) {
  const { packId } = await params;

  return <BoosterMarket initialPackId={decodeURIComponent(packId)} view="pack" />;
}
