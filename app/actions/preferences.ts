"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Language } from "@/types/language"
import { THEME_CONFIG } from "@/config/theme.config"
import { DEFAULT_LANGUAGE } from "@/lib/languages"

const oneYear = 60 * 60 * 24 * 365

export async function setTheme(theme: (typeof THEME_CONFIG.themes)[number]) {
  const cookieStore = await cookies()
  cookieStore.set("theme", theme, { path: "/", maxAge: oneYear })
  revalidatePath("/")
}

export async function setLanguage(language: Language = DEFAULT_LANGUAGE) {
  const cookieStore = await cookies()
  cookieStore.set("lang", language, { path: "/", maxAge: oneYear })
  revalidatePath("/")
}
