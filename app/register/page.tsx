"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { DropletIcon, UserPlusIcon } from "@/components/ui/Icons";
import { supabase } from "@/lib/supabase";

type RegisterForm = {
  password: string;
  full_name: string;
  phone: string;
  blood_type: string;
  city: string;
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
];

const fieldClassName =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100";

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState<RegisterForm>({
    password: "",
    full_name: "",
    phone: "",
    blood_type: "A+",
    city: "ترهونة",
  });

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setErrorMessage("");
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!form.password.trim() || !form.full_name.trim() || !form.phone.trim()) {
      setErrorMessage("يرجى تعبئة الاسم ورقم الهاتف وكلمة المرور.");
      return;
    }

    if (form.password.length < 6) {
      setErrorMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    setLoading(true);

    try {
      const generatedEmail = `${form.phone}@wasldam.local`;
      const { data, error: authError } = await supabase.auth.signUp({
        email: generatedEmail,
        password: form.password,
      });

      if (authError) {
        setErrorMessage(authError.message);
        return;
      }

      const user = data?.user;

      if (!user) {
        setErrorMessage("تعذر إنشاء الحساب، حاول مرة أخرى.");
        return;
      }

      const { error: insertError } = await supabase.from("donors").insert({
        user_id: user.id,
        full_name: form.full_name,
        phone: form.phone,
        blood_type: form.blood_type,
        city: form.city,
        available: true,
        profile_completed: false,
        updated_at: new Date(),
      });

      if (insertError) {
        setErrorMessage(insertError.message);
        return;
      }

      router.replace("/profile");
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage("حدث خطأ غير متوقع. يرجى المحاولة لاحقا.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center">
        <Link
          href="/"
          className="mx-auto mb-7 inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
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
              شبكة المتبرعين في ليبيا
            </span>
          </span>
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7 lg:p-8">
          <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <p className="text-sm font-semibold text-red-600">
                تسجيل متبرع جديد
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">
                إنشاء حساب متبرع
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                أدخل بياناتك الأساسية ليتم العثور عليك عند الحاجة لفصيلة دمك.
              </p>
            </div>
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 sm:flex">
              <UserPlusIcon className="h-6 w-6" />
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
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
                placeholder="مثال: محمد علي"
                value={form.full_name}
                onChange={handleChange}
                className={fieldClassName}
                autoComplete="name"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
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
                  placeholder="09xxxxxxxx"
                  value={form.phone}
                  onChange={handleChange}
                  className={fieldClassName}
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="6 أحرف أو أكثر"
                  value={form.password}
                  onChange={handleChange}
                  className={fieldClassName}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
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
              <UserPlusIcon className="h-5 w-5" />
              {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب متبرع"}
            </button>

            <p className="text-center text-sm text-slate-500">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/login"
                className="font-semibold text-red-600 transition hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                تسجيل الدخول
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
