"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const handleClick = () => {
    console.log('Theme toggle clicked, current theme:', theme)
    console.log('Document classes before toggle:', document.documentElement.className)
    toggleTheme()
    setTimeout(() => {
      console.log('Document classes after toggle:', document.documentElement.className)
    }, 100)
  }

  console.log('ThemeToggle rendered, current theme:', theme)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="h-9 w-9 hover:bg-secondary transition-colors border border-border"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Sun className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}