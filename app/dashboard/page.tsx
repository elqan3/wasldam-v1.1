"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ActivityIcon,
  DropletIcon,
  MapPinIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from "@/components/ui/Icons";
import { supabase } from "@/lib/supabase";

type Donor = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  blood_type: string;
  city: string;
  available: boolean;
  age: number | null;
  last_donation_date: string | null;
  notes: string | null;
  profile_completed: boolean;
};

const secondaryButtonClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100";

function isEligible(lastDate: string | null) {
  if (!lastDate) return true;

  const last = new Date(lastDate);
  const now = new Date();
  const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays >= 56;
}

function getDaysSinceDonation(date: string | null) {
  if (!date) return null;

  const last = new Date(date);
  const now = new Date();

  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDonationDate(date: string | null) {
  if (!date) return "غير محدد";

  return new Intl.DateTimeFormat("ar-LY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function DashboardPage() {
  const router = useRouter();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user;

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("donors")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (!data?.profile_completed) {
        router.push("/profile");
        return;
      }

      setDonor(data);
      setLoading(false);
    }

    load();
  }, [router]);

  async function toggleAvailability() {
    if (!donor) return;

    setTogglingAvailability(true);
    setActionMessage("");

    const nextAvailable = !donor.available;

    const { error } = await supabase
      .from("donors")
      .update({ available: nextAvailable, updated_at: new Date() })
      .eq("id", donor.id);

    setTogglingAvailability(false);

    if (error) {
      setActionMessage("تعذر تحديث حالة الجاهزية.");
      return;
    }

    setDonor({ ...donor, available: nextAvailable });
    setActionMessage(
      nextAvailable
        ? "أصبحت متاحاً للتبرع وستظهر في نتائج البحث."
        : "تم إخفاؤك مؤقتاً من نتائج البحث."
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function deleteAccount() {
    if (!donor) return;

    const confirmed = confirm(
      "هل أنت متأكد من حذف حسابك؟ سيتم حذف بياناتك من المنصة ولا يمكن التراجع عن ذلك."
    );

    if (!confirmed) return;

    setDeleting(true);
    setActionMessage("");

    const { error } = await supabase
      .from("donors")
      .delete()
      .eq("user_id", donor.user_id);

    if (error) {
      setDeleting(false);
      setActionMessage("تعذر حذف البيانات. حاول مرة أخرى.");
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-500 shadow-xl shadow-slate-200/70">
            جاري تحميل لوحة التحكم...
          </div>
        </div>
      </main>
    );
  }

  if (!donor) return null;

  const daysSinceDonation = getDaysSinceDonation(donor.last_donation_date);
  const eligible = isEligible(donor.last_donation_date);
  const showInSearch = donor.available && eligible;

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
              <span className="block text-lg font-bold text-slate-950">وصل دم</span>
              <span className="block text-xs font-medium text-slate-500">
                لوحة التحكم
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="inline-flex w-full items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 sm:w-auto"
          >
            تسجيل الخروج
          </button>
        </header>

        <section className="mb-6 overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl shadow-slate-200">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-red-200">مرحباً بك</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                {donor.full_name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                هذه لوحة تحكمك في وصل دم — تابع حالة جاهزيتك، وادِر ملفك، وابحث
                عن متبرعين عند الحاجة.
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                showInSearch
                  ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                  : "border-slate-300/20 bg-white/10 text-slate-200"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  showInSearch ? "bg-emerald-300" : "bg-slate-400"
                }`}
              />
              {showInSearch
                ? "ظاهر في نتائج البحث"
                : donor.available && !eligible
                  ? "غير مؤهل حالياً (56 يوم)"
                  : "مخفي عن البحث"}
            </div>
          </div>

          <div className="grid border-t border-white/10 bg-white/[0.04] sm:grid-cols-3">
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-l">
              <p className="text-xs font-semibold text-slate-400">فصيلة الدم</p>
              <p className="mt-2 text-2xl font-bold">{donor.blood_type}</p>
            </div>
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-l">
              <p className="text-xs font-semibold text-slate-400">المدينة</p>
              <p className="mt-2 text-2xl font-bold">{donor.city}</p>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-slate-400">آخر تبرع</p>
              <p className="mt-2 text-lg font-bold leading-snug">
                {daysSinceDonation === null
                  ? "غير محدد"
                  : `منذ ${daysSinceDonation} يوم`}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <p className="text-sm font-semibold text-red-600">ملخص الحساب</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    بياناتك الحالية
                  </h2>
                </div>
                <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 sm:flex">
                  <ShieldCheckIcon className="h-6 w-6" />
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">الاسم</p>
                  <p className="mt-1 font-bold text-slate-900">{donor.full_name}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">رقم الهاتف</p>
                  <p className="mt-1 font-bold text-slate-900" dir="ltr">
                    {donor.phone}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">العمر</p>
                  <p className="mt-1 font-bold text-slate-900">
                    {donor.age ? `${donor.age} سنة` : "غير محدد"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    تاريخ آخر تبرع
                  </p>
                  <p className="mt-1 font-bold text-slate-900">
                    {formatDonationDate(donor.last_donation_date)}
                  </p>
                </div>
              </div>

              {donor.notes && (
                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
                  <p className="text-xs font-semibold text-slate-500">ملاحظات</p>
                  <p className="mt-1">{donor.notes}</p>
                </div>
              )}

              {!eligible && donor.last_donation_date && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800">
                  تبرعت مؤخراً — يُنصح بالانتظار 56 يوماً بين التبرعات. لن تظهر
                  في نتائج البحث حتى انقضاء هذه المدة.
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <SearchIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">إجراءات سريعة</h2>
                  <p className="text-xs text-slate-500">تنقل وإدارة من مكان واحد.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
                >
                  <SearchIcon className="h-5 w-5" />
                  البحث عن متبرع
                </Link>

                <Link
                  href="/profile"
                  className={secondaryButtonClassName}
                >
                  <UserPlusIcon className="h-5 w-5" />
                  تعديل الملف الشخصي
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <ActivityIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">حالة الجاهزية</h2>
                  <p className="text-xs text-slate-500">تحكم في ظهورك للباحثين.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => !donor.available && toggleAvailability()}
                  disabled={togglingAvailability || donor.available}
                  className={`rounded-lg px-3 py-2.5 text-sm font-bold transition disabled:cursor-default ${
                    donor.available
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  aria-pressed={donor.available}
                >
                  متاح
                </button>
                <button
                  type="button"
                  onClick={() => donor.available && toggleAvailability()}
                  disabled={togglingAvailability || !donor.available}
                  className={`rounded-lg px-3 py-2.5 text-sm font-bold transition disabled:cursor-default ${
                    !donor.available
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  aria-pressed={!donor.available}
                >
                  غير متاح
                </button>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                {donor.available
                  ? "أنت متاح حالياً. يمكن للباحثين رؤيتك إذا كنت مؤهلاً للتبرع."
                  : "أنت مخفي حالياً ولن تظهر في نتائج البحث."}
              </p>

              {actionMessage && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-700">
                  {actionMessage}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">اختصارات</h2>
                  <p className="text-xs text-slate-500">روابط مفيدة.</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/" className={secondaryButtonClassName}>
                  الصفحة الرئيسية
                </Link>
                <Link href="/profile" className={secondaryButtonClassName}>
                  <UserPlusIcon className="h-5 w-5" />
                  الملف الشخصي
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-red-100 bg-red-50/50 p-5">
              <h2 className="text-sm font-bold text-red-800">منطقة حساسة</h2>
              <p className="mt-2 text-xs leading-6 text-red-700/80">
                حذف الحساب يزيل بياناتك من المنصة نهائياً.
              </p>
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleting}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "جاري الحذف..." : "حذف الحساب"}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
