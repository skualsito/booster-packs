import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from "../../MaterialIcons";
import { useMarket } from "../MarketContext";

export function NoticeToast() {
  const {
    setWonCardsMessage,
    wonCardsMessage,
    wonCardsMessageTone,
  } = useMarket();

  if (!wonCardsMessage) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={`notice-toast ${wonCardsMessageTone}`}
      role={wonCardsMessageTone === "error" ? "alert" : "status"}
    >
      {wonCardsMessageTone === "success" ? (
        <CircleCheck size={20} aria-hidden />
      ) : wonCardsMessageTone === "warning" ? (
        <TriangleAlert size={20} aria-hidden />
      ) : wonCardsMessageTone === "error" ? (
        <CircleX size={20} aria-hidden />
      ) : (
        <Info size={20} aria-hidden />
      )}
      <span>{wonCardsMessage}</span>
      <button
        aria-label="Cerrar notificacion"
        onClick={() => setWonCardsMessage("")}
        type="button"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}
