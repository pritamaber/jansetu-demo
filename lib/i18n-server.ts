import { cookies } from "next/headers";
import { LANG_COOKIE, type Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return value === "bn" ? "bn" : "en";
}
