
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import LibraryScreen from "@/components/screens/library-screen"
import useStore from "@/store/useStore"

export default function LibraryPage() {
  const router = useRouter()
  const { user, setUser, setSelectedResource } = useStore()

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

  const handleResourceSelect = (resource) => {
    setSelectedResource(resource)
    router.push(`/resource/${resource.id}`)
  }

  if (!user) return null

  return <LibraryScreen user={user} onNavigate={handleNavigate} onResourceSelect={handleResourceSelect} />
}
