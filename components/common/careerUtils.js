const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

export const parseMonthYear = (value = "") => {
  const [month, year] = value.trim().split(/\s+/);
  const m = MONTHS[month?.slice(0, 3).toLowerCase()];
  const y = Number(year);
  return m === undefined || !y ? null : { month: m, year: y };
};

const formatDuration = (totalMonths) => {
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
  return parts.join(" ") || "< 1 mo";
};

/** "Sep 2023 – Present" -> { start, end, isCurrent, duration } */
export const getRangeSummary = (range = "") => {
  const [start = "", end = ""] = range.split(/\s+[–-]\s+/);
  const isCurrent = /present/i.test(end);
  const s = parseMonthYear(start);
  const now = new Date();
  const e = isCurrent ? { month: now.getMonth(), year: now.getFullYear() } : parseMonthYear(end);
  const duration = s && e ? formatDuration(Math.max(0, (e.year - s.year) * 12 + e.month - s.month)) : "";
  return { start: start.trim(), end: end.trim() || "", isCurrent, duration };
};

export const splitList = (t = "") =>
  t
    .split(/,\s*/)
    .map((x) => x.trim())
    .filter(Boolean);

/** "Impacteers - Genrichers Innovations Private Limited" -> "Impacteers" */
export const shortCompany = (name = "") => name.split(/\s+[-–]\s+/)[0].replace(/\s+(Pvt|Private).*$/i, "").trim();

export const revealItem = (i) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.55, delay: 0.05 + i * 0.08, ease: "easeOut" },
});
