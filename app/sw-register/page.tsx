"use client"

import { useEffect } from "react"

// This page is never rendered — it's loaded as a Client Component
// to register the service worker from a layout if needed.
export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error)
    }
  }, [])

  return null
}
