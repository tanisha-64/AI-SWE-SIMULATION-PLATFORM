import confetti from 'canvas-confetti';

export function celebrateSuccess() {
  const colors = ['#6366f1', '#c084fc', '#f472b6', '#22c55e'];

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
  }, 200);
}