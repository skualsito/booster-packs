import { Wallet, X } from "../../MaterialIcons";
import { formatUsd } from "../format";
import { useMarket } from "../MarketContext";

export function WalletModal() {
  const {
    session,
    setWalletAmount,
    setWalletOpen,
    topUpWallet,
    walletAmount,
    walletMessage,
    walletOpen,
    walletSaving,
  } = useMarket();

  if (!walletOpen) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setWalletOpen(false);
        }
      }}
      role="presentation"
    >
      <article
        aria-labelledby="wallet-modal-title"
        aria-modal="true"
        className="utility-modal"
        role="dialog"
      >
        <button
          aria-label="Cerrar cartera"
          className="modal-close"
          onClick={() => setWalletOpen(false)}
          type="button"
        >
          <X size={18} aria-hidden />
        </button>
        <span className="eyebrow">Cartera</span>
        <h2 id="wallet-modal-title">
          {formatUsd.format(session?.balanceUsd ?? 0)}
        </h2>
        <p>
          Recarga saldo demo local para probar aperturas y compras sin pagos
          reales.
        </p>
        <label>
          Monto USD
          <input
            inputMode="decimal"
            onChange={(event) => setWalletAmount(event.target.value)}
            placeholder="Ej: 10"
            type="text"
            value={walletAmount}
          />
        </label>
        <button
          className="primary-action compact"
          disabled={
            walletSaving ||
            !Number.isFinite(Number(walletAmount)) ||
            Number(walletAmount) <= 0
          }
          onClick={() => void topUpWallet()}
          type="button"
        >
          <Wallet size={17} aria-hidden />
          {walletSaving ? "Recargando" : "Recargar dinero"}
        </button>
        {walletMessage && <p className="admin-message">{walletMessage}</p>}
      </article>
    </div>
  );
}
