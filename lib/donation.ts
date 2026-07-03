import type { Locale } from "@/lib/translations";

const ELIGIBILITY_DAYS = 56;

export function isEligible(lastDate: string | null) {
  if (!lastDate) return true;

  const last = new Date(lastDate);
  const now = new Date();
  const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays >= ELIGIBILITY_DAYS;
}

export function getDaysSinceDonation(date: string | null) {
  if (!date) return null;

  const last = new Date(date);
  const now = new Date();

  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDonationDate(
  date: string | null,
  locale: Locale,
  notSpecified: string
) {
  if (!date) return notSpecified;

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-LY" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
