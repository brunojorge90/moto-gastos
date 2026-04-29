import React, { createContext, useContext, useState, useCallback } from 'react'

interface AlertaBanner {
  id: string
  message: string
  variant: 'warning' | 'destructive' | 'info'
}

interface AlertaContextValue {
  banners: AlertaBanner[]
  addBanner: (banner: Omit<AlertaBanner, 'id'>) => void
  removeBanner: (id: string) => void
}

const AlertaContext = createContext<AlertaContextValue | null>(null)

export function AlertaProvider({ children }: { children: React.ReactNode }) {
  const [banners, setBanners] = useState<AlertaBanner[]>([])

  const addBanner = useCallback((banner: Omit<AlertaBanner, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setBanners((prev) => [...prev, { ...banner, id }])
  }, [])

  const removeBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id))
  }, [])

  return (
    <AlertaContext.Provider value={{ banners, addBanner, removeBanner }}>
      {children}
    </AlertaContext.Provider>
  )
}

export function useAlertaContext() {
  const ctx = useContext(AlertaContext)
  if (!ctx) throw new Error('useAlertaContext must be used inside AlertaProvider')
  return ctx
}
