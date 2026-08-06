import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BoosterMarket } from "../../BoosterMarket";

const publicPackId = (packId: string) =>
  packId.startsWith("admin-") ? packId.slice("admin-".length) : packId;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ packId: string }>;
}): Promise<Metadata> {
  const { packId } = await params;
  const decodedPackId = publicPackId(decodeURIComponent(packId));

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
  const decodedPackId = decodeURIComponent(packId);
  const cleanPackId = publicPackId(decodedPackId);

  if (cleanPackId !== decodedPackId) {
    redirect(`/packs/${encodeURIComponent(cleanPackId)}`);
  }

  return <BoosterMarket initialPackId={cleanPackId} view="pack" />;
}
