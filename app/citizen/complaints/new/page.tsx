"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  checkSimilarComplaints,
  submitComplaint,
  supportExistingComplaint,
} from "@/lib/actions";
import type { ComplaintWithJoins } from "@/lib/complaints";
import { useLanguage } from "@/components/LanguageProvider";

const CATEGORIES = [
  "Street Light",
  "Water Logging",
  "Road Damage",
  "Drainage",
  "Drinking Water",
  "Electricity",
  "Sanitation",
  "Footpath",
  "Civic Suggestion",
  "Medical Assistance",
  "Legal Assistance",
  "Other",
] as const;

const LOCATIONS = ["Rajarhat Chowmatha", "Rajarhat Complex", "Rajarhat Newtown"] as const;

const LOCATION_TO_BOOTH: Record<string, string> = {
  "Rajarhat Chowmatha": "RJH-DEMO-01",
  "Rajarhat Complex": "RJH-DEMO-02",
  "Rajarhat Newtown": "RJH-DEMO-03",
};

const MAX_IMAGES = 5;

export default function NewComplaintPage() {
  const router = useRouter();
  const { t: dict } = useLanguage();
  const t = dict.newComplaint;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [similar, setSimilar] = useState<ComplaintWithJoins[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [supported, setSupported] = useState<string | null>(null);
  const [images, setImages] = useState<{ file: File; previewUrl: string }[]>([]);
  const [imageError, setImageError] = useState("");

  const boothId = LOCATION_TO_BOOTH[location] || "RJH-DEMO-01";

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImageError("");
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      setImageError(`You can attach at most ${MAX_IMAGES} photos.`);
      return;
    }
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setImageError("Please upload image files only.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Each photo must be under 5MB.");
        return;
      }
    }
    setImages((prev) => [
      ...prev,
      ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError(t.errorTitleRequired);
      return;
    }
    if (images.length === 0) {
      setError(t.errorPhotoRequired);
      return;
    }
    setChecking(true);
    const results = await checkSimilarComplaints(title, category, boothId);
    setChecking(false);
    setSimilar(results);
  }

  async function handleSupport(id: string) {
    await supportExistingComplaint(id);
    setSupported(id);
  }

  async function handleSubmitNew() {
    if (images.length === 0) {
      setError(t.errorPhotoRequired);
      setSimilar(null);
      return;
    }
    setError("");
    setChecking(true);

    const uploadForm = new FormData();
    for (const { file } of images) uploadForm.append("images", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
    const uploadData = await uploadRes.json();
    if (!uploadData.ok) {
      setChecking(false);
      setError(uploadData.error);
      return;
    }

    const res = await submitComplaint({
      title,
      description,
      category,
      location,
      boothId,
      priority,
      imagePaths: uploadData.imagePaths,
    });
    setChecking(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(`/citizen/complaints/${res.id}`);
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full">
        <Link href="/citizen/dashboard" className="text-sm text-orange-600 hover:underline">
          {t.back}
        </Link>
        <div className="mt-4 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">{t.title}</h1>
          <p className="text-sm text-slate-500 mb-6">{t.subtitle}</p>

          {similar === null && (
            <form onSubmit={handleCheck} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.issueTitle}
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.issueTitlePlaceholder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.category}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {dict.categories[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t.location}
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>
                        {dict.locations[l]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.description}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.priority}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Low">{dict.priorities.Low}</option>
                  <option value="Medium">{dict.priorities.Medium}</option>
                  <option value="High">{dict.priorities.High}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t.photos} <span className="text-red-600">*</span>
                </label>

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {images.map((img, i) => (
                      <div key={img.previewUrl} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.previewUrl}
                          alt={`Selected issue photo ${i + 1}`}
                          className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          aria-label={t.removePhoto}
                          className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-600 text-white text-xs leading-none hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <input
                    required={images.length === 0}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-orange-50 file:text-orange-700 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-orange-100"
                  />
                )}
                {imageError && <p className="text-sm text-red-600 mt-1">{imageError}</p>}
                <p className="text-xs text-slate-400 mt-1">{t.photosNote}</p>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                disabled={checking}
                className="w-full bg-orange-600 text-white font-medium rounded-lg py-2 hover:bg-orange-700 disabled:opacity-50"
              >
                {checking ? t.checking : t.continueBtn}
              </button>
            </form>
          )}

          {similar !== null && similar.length > 0 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-3">
                ⚠️ {t.similarFound}
              </div>
              <div className="space-y-3">
                {similar.map((s) => (
                  <div key={s.id} className="border border-slate-200 rounded-lg p-3">
                    <div className="text-xs font-mono text-slate-400">{s.id}</div>
                    <div className="font-medium text-slate-900">{s.title}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      📍 {s.location} · {dict.complaintDetail.status}:{" "}
                      {dict.statuses[s.status as keyof typeof dict.statuses] || s.status}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      👥 {t.supportersLabel} {s.supporter_count} {t.citizensLabel}
                    </div>
                    {supported === s.id ? (
                      <div className="mt-2 text-sm font-medium text-green-700">
                        ✓ {t.supporting}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSupport(s.id)}
                        className="mt-2 bg-green-600 text-white text-sm font-medium rounded-lg px-3 py-1.5 hover:bg-green-700"
                      >
                        {t.supportBtn}
                      </button>
                    )}
                    <Link
                      href={`/citizen/complaints/${s.id}`}
                      className="block mt-2 text-sm text-orange-600 hover:underline"
                    >
                      {t.viewDetails}
                    </Link>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-4 flex gap-3">
                <button
                  onClick={() => setSimilar(null)}
                  className="flex-1 text-sm text-slate-600 border border-slate-300 rounded-lg py-2 hover:bg-slate-50"
                >
                  {t.editReport}
                </button>
                <button
                  onClick={handleSubmitNew}
                  disabled={checking}
                  className="flex-1 text-sm bg-orange-600 text-white font-medium rounded-lg py-2 hover:bg-orange-700 disabled:opacity-50"
                >
                  {checking ? t.submitting : t.stillReportNew}
                </button>
              </div>
            </div>
          )}

          {similar !== null && similar.length === 0 && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3">
                {t.noSimilarFound}
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setSimilar(null)}
                  className="flex-1 text-sm text-slate-600 border border-slate-300 rounded-lg py-2 hover:bg-slate-50"
                >
                  {t.back2}
                </button>
                <button
                  onClick={handleSubmitNew}
                  disabled={checking}
                  className="flex-1 text-sm bg-orange-600 text-white font-medium rounded-lg py-2 hover:bg-orange-700 disabled:opacity-50"
                >
                  {checking ? t.submitting : t.submitComplaint}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
