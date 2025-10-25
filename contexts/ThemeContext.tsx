'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('analytics-theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    
    setThemeState(initialTheme)
    setMounted(true)
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    localStorage.setItem('analytics-theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-gray-950">{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme-aware class utilities
export const themeClasses = {
  // Backgrounds
  bg: 'bg-white dark:bg-gray-950',
  bgSecondary: 'bg-gray-50 dark:bg-gray-900',
  bgTertiary: 'bg-gray-100 dark:bg-gray-800',
  bgCard: 'bg-white dark:bg-gray-900',
  bgInput: 'bg-white dark:bg-gray-800',
  bgButton: 'bg-gray-100 dark:bg-gray-800',
  bgButtonHover: 'hover:bg-gray-200 dark:hover:bg-gray-700',
  bgButtonActive: 'bg-gray-200 dark:bg-gray-700',
  
  // Text
  text: 'text-gray-900 dark:text-gray-100',
  textSecondary: 'text-gray-600 dark:text-gray-400',
  textMuted: 'text-gray-500 dark:text-gray-500',
  textInverse: 'text-gray-100 dark:text-gray-900',
  
  // Borders
  border: 'border-gray-200 dark:border-gray-800',
  borderSecondary: 'border-gray-300 dark:border-gray-700',
  borderFocus: 'focus:border-blue-500 dark:focus:border-blue-400',
  
  // Shadows
  shadow: 'shadow-sm dark:shadow-gray-900/20',
  shadowLg: 'shadow-lg dark:shadow-gray-900/40',
  
  // States
  hover: 'hover:bg-gray-50 dark:hover:bg-gray-800',
  active: 'active:bg-gray-100 dark:active:bg-gray-700',
  disabled: 'disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600',
}
