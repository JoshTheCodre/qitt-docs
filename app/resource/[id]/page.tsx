
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ResourceDetailScreen from "@/components/screens/resource-detail-screen"
import useStore from "@/store/useStore"

export default function ResourceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, setUser, selectedResource, setSelectedResource } = useStore()
  const [resource, setResource] = useState(selectedResource)

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

  useEffect(() => {
    const fetchResource = async () => {
      if (!resource && params.id) {
        const { data } = await supabase
          .from('resources')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (data) {
          setResource(data)
          setSelectedResource(data)
        }
      }
    }
    fetchResource()
  }, [params.id, resource, setSelectedResource])

  const handleNavigate = (route) => {
    router.push(`/${route}`)
  }

  const handleBack = () => {
    router.back()
  }

  if (!user || !resource) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return <ResourceDetailScreen user={user} resource={resource} onNavigate={handleNavigate} onBack={handleBack} />
}
