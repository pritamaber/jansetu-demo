"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { agentLogin } from "@/lib/actions";

export default function AgentLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await agentLogin(phone, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/agent/dashboard");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-orange-50 via-slate-50 to-slate-50">
      <div className="max-w-md w-full">
        <Link href="/" className="text-sm text-orange-600 hover:underline">
          ← Back
        </Link>
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Booth Agent Login</h1>
          <p className="text-sm text-slate-500 mb-6">
            Demo: Rick Sonkar · 9000000001 · agent123
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9000000001"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="agent123"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={loading}
              className="w-full bg-orange-600 text-white font-medium rounded-lg py-2 hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
