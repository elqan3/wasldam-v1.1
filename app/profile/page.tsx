"use client";

import type { ChangeEvent, FormEvent } from "react";
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

type ProfileForm = {
  full_name: string;
  phone: string;
  blood_type: string;
  city: string;
  available: boolean;
  age: string;
  last_donation_date: string;
  notes: string;
};

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const libyanCities = [
  "ترهونة",
  "طرابلس",
  "بنغازي",
  "قصر الاخيار",
  "مصراتة",
  "الزاوية",
  "الخمس",
  "زليتن",
  "صبراتة",
  "صرمان",
  "العجيلات",
  "غريان",
  "الزنتان",
  "يفرن",
  "عواتة",
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
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100";

const secondaryButtonClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100";

export default function ProfilePage() {
  const router = useRouter();
  const [donorId, setDonorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    phone: "",
    blood_type: "A+",
    city: "ترهونة",
    available: true,
    age: "",
    last_donation_date: "",
    notes: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user;

      if (!currentUser) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("donors")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (error || !data) {
        setErrorMessage("تعذر تحميل بيانات الملف الشخصي.");
        setLoading(false);
        return;
      }

      setDonorId(data.id);
      setForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
        blood_type: data.blood_type || "A+",
        city: data.city || "ترهونة",
        available: data.available ?? true,
        age: data.age ? String(data.age) : "",
        last_donation_date: data.last_donation_date || "",
        notes: data.notes || "",
      });
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setErrorMessage("");
    setSuccessMessage("");
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function setAvailability(available: boolean) {
    setErrorMessage("");
    setSuccessMessage("");
    setForm((prev) => ({ ...prev, available }));
  }

  async function saveChanges(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!donorId) {
      setErrorMessage("تعذر العثور على سجل المتبرع.");
      return;
    }

    if (!form.full_name.trim() || !form.phone.trim()) {
      setErrorMessage("الاسم ورقم الهاتف مطلوبان.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("donors")
      .update({
        full_name: form.full_name,
        phone: form.phone,
        blood_type: form.blood_type,
        city: form.city,
        available: form.available,
        age: form.age ? Number(form.age) : null,
        last_donation_date: form.last_donation_date || null,
        notes: form.notes || null,
        profile_completed: true,
        updated_at: new Date(),
      })
      .eq("id", donorId);

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("تم حفظ بيانات الملف الشخصي بنجاح.");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-500 shadow-xl shadow-slate-200/70">
            جاري تحميل الملف الشخصي...
          </div>
        </div>
      </main>
    );
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
                ملف المتبرع
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
              <p className="text-sm font-semibold text-red-200">
                الملف الشخصي
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                {form.full_name || "متبرع بدون اسم"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                حدّث بياناتك لتظهر بدقة عند البحث عن متبرع مناسب في مدينتك.
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                form.available
                  ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                  : "border-slate-300/20 bg-white/10 text-slate-200"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  form.available ? "bg-emerald-300" : "bg-slate-400"
                }`}
              />
              {form.available ? "متاح للتبرع" : "غير متاح حاليا"}
            </div>
          </div>

          <div className="grid border-t border-white/10 bg-white/[0.04] sm:grid-cols-3">
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-l">
              <p className="text-xs font-semibold text-slate-400">فصيلة الدم</p>
              <p className="mt-2 text-2xl font-bold">{form.blood_type}</p>
            </div>
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-l">
              <p className="text-xs font-semibold text-slate-400">المدينة</p>
              <p className="mt-2 text-2xl font-bold">{form.city}</p>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-slate-400">
                آخر تبرع
              </p>
              <p className="mt-2 text-2xl font-bold">
                {form.last_donation_date || "غير محدد"}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7">
            <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <p className="text-sm font-semibold text-red-600">
                  بيانات المتبرع
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  تحديث الملف
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  المعلومات الدقيقة تساعد في الوصول إليك عند الحالات المناسبة.
                </p>
              </div>
              <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 sm:flex">
                <UserPlusIcon className="h-6 w-6" />
              </span>
            </div>

            <form className="space-y-5" onSubmit={saveChanges}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="full_name"
                    className="text-sm font-semibold text-slate-700"
                  >
                    الاسم الكامل
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="مثال: محمد علي"
                    className={fieldClassName}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm font-semibold text-slate-700"
                  >
                    رقم الهاتف
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09xxxxxxxx"
                    className={fieldClassName}
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>

                <div>
                  <label
                    htmlFor="age"
                    className="text-sm font-semibold text-slate-700"
                  >
                    العمر
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="17"
                    max="70"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="مثال: 28"
                    className={fieldClassName}
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label
                    htmlFor="blood_type"
                    className="text-sm font-semibold text-slate-700"
                  >
                    فصيلة الدم
                  </label>
                  <select
                    id="blood_type"
                    name="blood_type"
                    value={form.blood_type}
                    onChange={handleChange}
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
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={fieldClassName}
                  >
                    {libyanCities.map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="last_donation_date"
                    className="text-sm font-semibold text-slate-700"
                  >
                    تاريخ آخر تبرع
                  </label>
                  <input
                    id="last_donation_date"
                    name="last_donation_date"
                    type="date"
                    value={form.last_donation_date}
                    onChange={handleChange}
                    className={fieldClassName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="text-sm font-semibold text-slate-700"
                  >
                    ملاحظات إضافية
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="مثال: أوقات التوفر، أي ملاحظات صحية مهمة، أو طريقة التواصل المفضلة."
                    className={`${fieldClassName} min-h-28 resize-y leading-7`}
                    rows={4}
                  />
                </div>
              </div>

              {errorMessage && (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-700">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <ShieldCheckIcon className="h-5 w-5" />
                {saving ? "جاري حفظ البيانات..." : "حفظ التغييرات"}
              </button>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <ActivityIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">حالة الجاهزية</h2>
                  <p className="text-xs text-slate-500">
                    اختر ظهورك في نتائج البحث.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setAvailability(true)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                    form.available
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  aria-pressed={form.available}
                >
                  متاح
                </button>
                <button
                  type="button"
                  onClick={() => setAvailability(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                    !form.available
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  aria-pressed={!form.available}
                >
                  غير متاح
                </button>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                عند تفعيل الجاهزية يمكن أن يظهر رقمك للباحثين عن نفس الفصيلة في
                مدينتك.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">اختصارات</h2>
                  <p className="text-xs text-slate-500">
                    تنقل سريع داخل المنصة.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className={secondaryButtonClassName}
                >
                  <ActivityIcon className="h-5 w-5" />
                  لوحة التحكم
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/search")}
                  className={secondaryButtonClassName}
                >
                  <SearchIcon className="h-5 w-5" />
                  البحث عن متبرع
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
