"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { DropletIcon, ShieldCheckIcon } from "@/components/ui/Icons";
import { supabase } from "@/lib/supabase";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!phone.trim() || !password.trim()) {
      setErrorMessage("يرجى إدخال رقم الهاتف وكلمة المرور.");
      return;
    }

    setLoading(true);

    try {
      const generatedEmail = `${phone}@wasldam.local`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: generatedEmail,
        password,
      });

      if (error) {
        setErrorMessage("رقم الهاتف أو كلمة المرور غير صحيحة.");
        return;
      }

      if (data.session) {
        router.replace("/profile");
      }
    } catch {
      setErrorMessage("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
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
            <span className="block text-lg font-bold text-slate-950">وصل دم</span>
            <span className="block text-xs font-medium text-slate-500">
              شبكة المتبرعين في ليبيا
            </span>
          </span>
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-7 lg:p-8">
          <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <p className="text-sm font-semibold text-red-600">مرحباً بعودتك</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">تسجيل الدخول</h1>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                أدخل بيانات حسابك للوصول إلى ملفك الشخصي وإدارة حالة التبرع.
              </p>
            </div>
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 sm:flex">
              <ShieldCheckIcon className="h-6 w-6" />
            </span>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                رقم الهاتف
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="09xxxxxxxx"
                value={phone}
                onChange={(e) => {
                  setErrorMessage("");
                  setPhone(e.target.value);
                }}
                className={fieldClassName}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => {
                  setErrorMessage("");
                  setPassword(e.target.value);
                }}
                className={fieldClassName}
                autoComplete="current-password"
              />
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
              <ShieldCheckIcon className="h-5 w-5" />
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>

            <p className="text-center text-sm text-slate-500">
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="font-semibold text-red-600 transition hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                سجّل الآن
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
