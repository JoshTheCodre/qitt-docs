"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import LibraryScreen from "@/components/screens/library-screen"
import BottomNav from "@/components/bottom-nav"
import useStore from "@/store/useStore"

export default function LibraryPage() {
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

  return (
    <>
      <div className="pb-20">
        <LibraryScreen user={user} onNavigate={handleNavigate} />
      </div>
      <BottomNav />
    </>
  )
}