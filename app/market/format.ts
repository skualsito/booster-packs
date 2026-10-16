export const formatUsd = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const formatPercent = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
});

export const formatDateTime = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const formatCardDate = (value?: string) => {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Sin fecha" : formatDateTime.format(date);
};
