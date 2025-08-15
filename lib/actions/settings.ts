"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { setServerLanguage, setServerTheme, setServerFilters } from "@/lib/server-cookies"
import type { Language, Settings } from "@/types/language"

export async function changeLanguageAction(language: Language) {
  await setServerLanguage(language)
  revalidatePath("/")
  redirect("/")
}

export async function changeThemeAction(theme: Settings["theme"]) {
  await setServerTheme(theme)
  revalidatePath("/")
}

export async function saveFiltersAction(filters: Settings["filters"]) {
  await setServerFilters(filters)
  revalidatePath("/")
}

export async function clearFiltersAction() {
  await setServerFilters({})
  revalidatePath("/")
}
