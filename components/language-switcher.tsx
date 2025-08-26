"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "uk">("en")

  const languages = {
    en: { name: "English", flag: "🇺🇸" },
    uk: { name: "Українська", flag: "🇺🇦" },
  }

  const handleLanguageChange = (lang: "en" | "uk") => {
    setCurrentLanguage(lang)
    // Here you would typically integrate with your i18n solution
    console.log(`[v0] Language changed to: ${lang}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {languages[currentLanguage].flag} {languages[currentLanguage].name}
          </span>
          <span className="sm:hidden">{languages[currentLanguage].flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          className={currentLanguage === "en" ? "bg-accent" : ""}
        >
          <span className="mr-2">🇺🇸</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("uk")}
          className={currentLanguage === "uk" ? "bg-accent" : ""}
        >
          <span className="mr-2">🇺🇦</span>
          Українська
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
