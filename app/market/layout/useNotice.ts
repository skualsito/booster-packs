import { useEffect, useState } from "react";

export function useNotice() {

  const [wonCardsMessage, setWonCardsMessage] = useState("");
  const [wonCardsMessageTone, setWonCardsMessageTone] = useState<
    "info" | "success" | "warning" | "error"
  >("info");

  useEffect(() => {
    if (!wonCardsMessage) {
      return;
    }

    const timer = window.setTimeout(() => setWonCardsMessage(""), 8000);
    return () => window.clearTimeout(timer);
  }, [wonCardsMessage]);

  return {
    wonCardsMessage,
    setWonCardsMessage,
    wonCardsMessageTone,
    setWonCardsMessageTone,
  };
}

export type NoticeState = ReturnType<typeof useNotice>;
