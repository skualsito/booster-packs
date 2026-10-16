import { useEffect, useRef } from "react";

export function useRouletteAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        const audioContext = audioContextRef.current;
        audioContextRef.current = null;
        if (audioContext.state !== "closed") {
          void audioContext.close();
        }
      }
    };
  }, []);

  const prepareRouletteAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
    } catch {
      audioContextRef.current = null;
    }
  };

  const playRouletteTick = (progress: number, delaySeconds = 0) => {
    const context = audioContextRef.current;
    if (!context || context.state !== "running") return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime + delaySeconds;
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(720 - progress * 210, now);
    oscillator.frequency.exponentialRampToValueAtTime(360, now + 0.028);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.018 + progress * 0.008, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.036);
  };

  const playUpgraderResultSound = (won: boolean) => {
    if (won) {
      playHitFanfare();
      return;
    }

    const context = audioContextRef.current;
    if (!context || context.state !== "running") return;

    [260, 190].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.12;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.035, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.22);
    });
  };

  const playHitFanfare = () => {
    const context = audioContextRef.current;
    if (!context || context.state !== "running") return;

    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.1;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.34);
    });
  };

  return {
    prepareRouletteAudio,
    playRouletteTick,
    playUpgraderResultSound,
    playHitFanfare,
  };
}

export type RouletteAudioState = ReturnType<typeof useRouletteAudio>;
