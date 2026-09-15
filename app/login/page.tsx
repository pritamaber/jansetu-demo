"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { verifyCitizenOtp, registerCitizen } from "@/lib/actions";
import { useLanguage } from "@/components/LanguageProvider";

const BOOTHS = [
  { id: "RJH-DEMO-01", name: "Rajarhat Chowmatha Booth Office", area: "Rajarhat Chowmatha" },
  { id: "RJH-DEMO-02", name: "Rajarhat Complex Booth Office", area: "Rajarhat Complex" },
  { id: "RJH-DEMO-03", name: "Rajarhat Newtown Booth Office", area: "Rajarhat Newtown" },
];

export default function CitizenLoginPage() {
  const router = useRouter();
  const { t: dict } = useLanguage();
  const t = dict.citizenLogin;
  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [boothId, setBoothId] = useState(BOOTHS[0].id);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(phone)) {
      setError(t.errorInvalidPhone);
      return;
    }
    setStep("otp");
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await verifyCitizenOtp(phone, otp);
    setLoading(false);
    if (!res.ok) {
      setError(res.error === "Invalid OTP. Use the demo OTP 123456." ? t.errorInvalidOtp : res.error);
      return;
    }
    if (res.exists) {
      router.push("/citizen/dashboard");
    } else {
      setStep("register");
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const area = BOOTHS.find((b) => b.id === boothId)?.area || "";
    const res = await registerCitizen({ name, phone, address, area, boothId });
    setLoading(false);
    if (!res.ok) {
      setError(
        res.error === "This phone number is already registered."
          ? t.errorAlreadyRegistered
          : res.error
      );
      return;
    }
    router.push("/citizen/dashboard");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 bg-orange-100">
      <div className="max-w-md w-full">
        <Link href="/" className="text-sm text-orange-600 hover:underline">
          {t.back}
        </Link>
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">{t.title}</h1>
          <p className="text-sm text-slate-500 mb-6">
            {t.demoNote} <code className="bg-slate-100 px-1 rounded">123456</code> {t.forAnyNumber}
          </p>

          {step === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9000000000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button className="w-full bg-orange-600 text-white font-medium rounded-lg py-2 hover:bg-orange-700">
                {t.sendOtp}
              </button>
              <p className="text-xs text-slate-400">{t.tryDemo}</p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.otpLabel} {phone}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                disabled={loading}
                className="w-full bg-orange-600 text-white font-medium rounded-lg py-2 hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? t.verifying : t.verifyLogin}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-sm text-slate-500 hover:underline"
              >
                {t.changePhone}
              </button>
            </form>
          )}

          {step === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <p className="text-sm text-slate-600">{t.firstTime}</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.fullName}
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.address}
                </label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.boothOffice}
                </label>
                <select
                  value={boothId}
                  onChange={(e) => setBoothId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {BOOTHS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.area})
                    </option>
                  ))}
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                disabled={loading}
                className="w-full bg-orange-600 text-white font-medium rounded-lg py-2 hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? t.creating : t.createAccount}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
