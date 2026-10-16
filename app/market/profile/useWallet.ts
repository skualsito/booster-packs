import { useState } from "react";
import { apiFetch, authHeader } from "../api";
import type { AuthState } from "../auth/useAuth";
import { formatUsd } from "../format";
import type { WalletResponse } from "../types";

type WalletDeps = Pick<AuthState, "session" | "updateSessionUser">;

export function useWallet(deps: WalletDeps) {
  const { session, updateSessionUser } = deps;

  const [walletOpen, setWalletOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState("50");
  const [walletMessage, setWalletMessage] = useState("");
  const [walletSaving, setWalletSaving] = useState(false);

  const topUpWallet = async () => {
    if (!session) {
      setWalletMessage("Inicia sesion para recargar.");
      return;
    }

    const amount = Number(walletAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setWalletMessage("Ingresa un monto valido mayor a cero.");
      return;
    }

    setWalletSaving(true);
    setWalletMessage("");

    try {
      const response = await apiFetch("/api/wallet/topup", {
        method: "POST",
        headers: {
          ...authHeader(session),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });
      const payload = (await response.json()) as WalletResponse;

      if (!response.ok || payload.error || !payload.user) {
        throw new Error(payload.error ?? "No se pudo recargar la cartera.");
      }

      updateSessionUser(payload.user);
      setWalletMessage(`Recargaste ${formatUsd.format(amount)}.`);
    } catch (error) {
      setWalletMessage(
        error instanceof Error
          ? error.message
          : "No se pudo recargar la cartera.",
      );
    } finally {
      setWalletSaving(false);
    }
  };

  return {
    walletOpen,
    setWalletOpen,
    walletAmount,
    setWalletAmount,
    walletMessage,
    walletSaving,
    topUpWallet,
  };
}

export type WalletState = ReturnType<typeof useWallet>;
