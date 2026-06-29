export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatConfidence(value: number): string {
  return `${(value * 100).toFixed(1)}% match`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
