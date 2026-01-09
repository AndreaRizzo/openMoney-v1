export function formatEUR(value: number): string {
  const formatter = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
}

export function formatPct(value: number): string {
  const formatter = new Intl.NumberFormat("it-IT", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  return formatter.format(value);
}

export function formatShortDate(value: string): string {
  const [year, month, day] = value.split("-");
  const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  const label = months[Number(month) - 1] ?? month;
  return `${day} ${label}`;
}

export function formatMonthLabel(value: string): string {
  const [year, month] = value.split("-");
  const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  const label = months[Number(month) - 1] ?? month;
  return `${label} ${year?.slice(-2) ?? ""}`.trim();
}

export function formatCompact(value: number): string {
  const formatter = new Intl.NumberFormat("it-IT", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return formatter.format(value);
}
