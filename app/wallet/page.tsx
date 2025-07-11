
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import WalletScreen from "@/components/screens/wallet-screen"
import useStore from "@/store/useStore"

export default function WalletPage() {
  const router = useRouter()
  const { user, setUser } = useStore()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
    }
    checkAuth()
  }, [router, setUser])

  const handleNavigate = (route) => {
    router.push(`/${route}`)
  }

  if (!user) return null

  return <WalletScreen user={user} onNavigate={handleNavigate} />
}
