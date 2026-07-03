"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";

import {
  ActivityIcon,
  DropletIcon,
  MapPinIcon,
  MessageCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "@/components/ui/Icons";
import { supabase } from "@/lib/supabase";

type Donor = {
  id: string;
  full_name: string;
  phone: string;
  blood_type: string;
  city: string;
  available: boolean;
  age: number | null;
  last_donation_date: string | null;
  notes: string | null;
};

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const libyanCities = [
  "ترهونة",
  "طرابلس",
  "بنغازي",
  "مصراتة",
  "قصر الاخيار",
  "الزاوية",
  "الخمس",
  "زليتن",
  "صبراتة",
  "صرمان",
  "العجيلات",
  "عواتة",
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
];

const fieldClassName =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100";

function isEligible(lastDate: string | null) {
  if (!lastDate) return true;

  const last = new Date(lastDate);
  const now = new Date();
  const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays >= 56;
}

function formatPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function normalizeWhatsAppPhone(phone: string) {
  const cleaned = formatPhone(phone);

  if (cleaned.startsWith("+")) return cleaned.replace("+", "");
  if (cleaned.startsWith("00")) return cleaned.slice(2);
  if (cleaned.startsWith("0")) return `218${cleaned.slice(1)}`;

  return cleaned;
}

function formatDonationDate(date: string | null) {
  if (!date) return "لم يحدد آخر تبرع";

  return new Intl.DateTimeFormat("ar-LY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getDaysSinceDonation(date: string | null) {
  if (!date) return null;

  const last = new Date(date);
  const now = new Date();

  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

export default function SearchPage() {
  const [bloodType, setBloodType] = useState("A+");
  const [city, setCity] = useState("ترهونة");
  const [results, setResults] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const resultSummary = useMemo(() => {
    if (!hasSearched) return "ابدأ البحث لاختيار المدينة والفصيلة.";
    if (results.length === 0) return "لا توجد نتائج مطابقة حاليا.";
    if (results.length === 1) return "تم العثور على متبرع واحد مناسب.";

    return `تم العثور على ${results.length} متبرعين مناسبين.`;
  }, [hasSearched, results.length]);

  async function search(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setCopiedPhone(null);
    setHasSearched(true);

    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .eq("blood_type", bloodType)
      .eq("city", city);

    if (error) {
      setErrorMessage(error.message);
      setResults([]);
      setLoading(false);
      return;
    }

    const filtered = (data || [])
      .filter((donor: Donor) => donor.available && isEligible(donor.last_donation_date))
      .sort((a: Donor, b: Donor) => {
        if (!a.last_donation_date) return -1;
        if (!b.last_donation_date) return 1;

        return (
          new Date(a.last_donation_date).getTime() -
          new Date(b.last_donation_date).getTime()
        );
      });

    setResults(filtered);
    setLoading(false);
  }

  async function copyPhone(phone: string) {
    await navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            aria-label="العودة إلى الصفحة الرئيسية"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20">
              <DropletIcon className="h-5 w-5" />
            </span>
            <span className="text-right">
              <span className="block text-lg font-bold text-slate-950">
                وصل دم
              </span>
              <span className="block text-xs font-medium text-slate-500">
                البحث عن متبرعين
              </span>
            </span>
          </Link>

          <Link
            href="/profile"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100 sm:w-auto"
          >
            ملفي الشخصي
          </Link>
        </header>

        <section className="mb-6 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl shadow-slate-200">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-red-200">
                البحث السريع
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                ابحث عن متبرع مناسب حسب الفصيلة والمدينة.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                تظهر النتائج للمتبرعين المتاحين فقط، مع استبعاد من تبرعوا خلال
                آخر 56 يوما.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-72">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold text-slate-400">الفصيلة</p>
                <p className="mt-2 text-2xl font-bold">{bloodType}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold text-slate-400">المدينة</p>
                <p className="mt-2 text-2xl font-bold">{city}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <SearchIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">فلاتر البحث</h2>
                  <p className="text-xs text-slate-500">
                    اختر الفصيلة والمدينة.
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={search}>
                <div>
                  <label
                    htmlFor="blood_type"
                    className="text-sm font-semibold text-slate-700"
                  >
                    فصيلة الدم
                  </label>
                  <select
                    id="blood_type"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className={fieldClassName}
                  >
                    {bloodTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="text-sm font-semibold text-slate-700"
                  >
                    المدينة
                  </label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={fieldClassName}
                  >
                    {libyanCities.map((cityName) => (
                      <option key={cityName}>{cityName}</option>
                    ))}
                  </select>
                </div>

                {errorMessage && (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700"
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  <SearchIcon className="h-5 w-5" />
                  {loading ? "جاري البحث..." : "بحث عن متبرع"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <ShieldCheckIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">معايير النتائج</h2>
                  <p className="text-xs text-slate-500">
                    جاهزية المتبرع تؤخذ بعين الاعتبار.
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                <p>يعرض البحث المتبرعين المتاحين في المدينة المحددة.</p>
                <p>يتم ترتيب النتائج حسب الأبعد عن آخر تبرع أولا.</p>
              </div>
            </section>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7">
            <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600">
                  نتائج البحث
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {resultSummary}
                </h2>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                <UsersIcon className="h-4 w-4 text-red-600" />
                {results.length} نتيجة
              </div>
            </div>

            {!hasSearched && (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                  <SearchIcon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  ابدأ بتحديد الفصيلة والمدينة
                </h3>
                <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                  ستظهر هنا قائمة المتبرعين المناسبين مع وسائل التواصل السريعة.
                </p>
              </div>
            )}

            {hasSearched && !loading && results.length === 0 && (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                  <UsersIcon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  لا يوجد متبرعون متاحون حاليا
                </h3>
                <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                  جرّب مدينة قريبة أو فصيلة أخرى، أو أعد المحاولة لاحقا عند
                  تحديث جاهزية المتبرعين.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                <p className="text-sm font-semibold text-slate-500">
                  جاري البحث عن المتبرعين المناسبين...
                </p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid gap-4 xl:grid-cols-2">
                {results.map((donor) => {
                  const daysSinceDonation = getDaysSinceDonation(
                    donor.last_donation_date
                  );
                  const phone = formatPhone(donor.phone);
                  const whatsappPhone = normalizeWhatsAppPhone(donor.phone);

                  return (
                    <article
                      key={donor.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-red-100 hover:shadow-lg hover:shadow-slate-200/70"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-950">
                            {donor.full_name}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPinIcon className="h-4 w-4 text-red-500" />
                            {donor.city}
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          جاهز
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-red-50 p-4">
                          <p className="text-xs font-semibold text-red-500">
                            الفصيلة
                          </p>
                          <p className="mt-1 text-2xl font-bold text-red-700">
                            {donor.blood_type}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-500">
                            آخر تبرع
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-800">
                            {daysSinceDonation === null
                              ? "غير محدد"
                              : `منذ ${daysSinceDonation} يوم`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                        {donor.age && <p>العمر: {donor.age} سنة</p>}
                        <p>{formatDonationDate(donor.last_donation_date)}</p>
                        {donor.notes && (
                          <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
                            {donor.notes}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 grid gap-2 sm:grid-cols-3">
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
                        >
                          <ActivityIcon className="h-4 w-4" />
                          اتصال
                        </a>

                        <a
                          href={`https://wa.me/${whatsappPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
                        >
                          <MessageCircleIcon className="h-4 w-4" />
                          واتساب
                        </a>

                        <button
                          type="button"
                          onClick={() => copyPhone(donor.phone)}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
                        >
                          {copiedPhone === donor.phone ? "تم النسخ" : "نسخ الرقم"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
