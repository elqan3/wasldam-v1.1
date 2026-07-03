export const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const libyanCities = [
  "ترهونة",
  "طرابلس",
  "بنغازي",
  "قصر الاخيار",
  "مصراتة",
  "الزاوية",
  "الخمس",
  "زليتن",
  "عواتة",
  "صبراتة",
  "صرمان",
  "العجيلات",
  "غريان",
  "الزنتان",
  "يفرن",
  "نالوت",
  "سبها",
  "أوباري",
  "مرزق",
  "الشاطئ",
  "سرت",
  "أجدابيا",
  "البيضاء",
  "درنة",
  "طبرق",
  "المرج",
  "شحات",
  "الكفرة",
  "تازربو",
  "جالو",
  "هون",
  "ودان",
  "سوكنة",
  "رقدالين",
  "زوارة",
  "بني وليد",
] as const;

export const DEFAULT_CITY = libyanCities[0];
export const DEFAULT_BLOOD_TYPE = bloodTypes[0];

export const fieldClassName =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100";

export const secondaryButtonClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100";

export const primaryButtonClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none";
