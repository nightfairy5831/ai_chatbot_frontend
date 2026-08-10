import { useState, useEffect } from 'react'

export type Theme = 'blue' | 'purple'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'blue')

  useEffect(() => {
    if (theme === 'purple') document.documentElement.setAttribute('data-theme', 'purple')
    else document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, toggleTheme: () => setTheme((prev) => (prev === 'blue' ? 'purple' : 'blue')) }
}
