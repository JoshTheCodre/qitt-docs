"use client"

import { useState, useEffect } from "react"
import { Download, Upload, FileText, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TopNav from "@/components/top-nav"

export default function LibraryScreen({ user, onNavigate, onResourceSelect }) {
  const [downloads, setDownloads] = useState([])
  const [uploads, setUploads] = useState([])
  const [uploadStats, setUploadStats] = useState({})

  const handleResourceDetails = (resource) => {
    if (onResourceSelect) {
      onResourceSelect(resource)
    }
  }

  useEffect(() => {
    fetchDownloads()
    fetchUploads()
  }, [user.id])

  const fetchDownloads = async () => {
    const { data } = await supabase
      .from("transactions")
      .select(`
        resources (
          id,
          title,
          department,
          level,
          price,
          file_type,
          storage_path,
          created_at
        )
      `)
      .eq("buyer_id", user.id)

    if (data) {
      const resources = data.map((item) => item.resources).filter(Boolean)
      setDownloads(resources)
    }
  }

  const fetchUploads = async () => {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("uploader_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setUploads(data)
      fetchUploadStats(data)
    }
  }

  const fetchUploadStats = async (resources) => {
    const stats = {}
    
    for (const resource of resources) {
      // Get purchase count and total earnings
      const { data: purchases } = await supabase
        .from("transactions")
        .select("amount")
        .eq("resource_id", resource.id)
      
      // Get download count
      const { data: downloads } = await supabase
        .from("downloads")
        .select("id")
        .eq("resource_id", resource.id)
      
      // Get view count (simulated for now)
      const viewCount = Math.floor(Math.random() * 1000) + 50
      
      stats[resource.id] = {
        purchases: purchases?.length || 0,
        totalEarnings: purchases?.reduce((sum, p) => sum + (p.amount * 0.9), 0) || 0, // 90% after platform fee
        downloads: downloads?.length || 0,
        views: viewCount
      }
    }
    
    setUploadStats(stats)
  }

  const handleDownload = async (resource) => {
    try {
      const { data } = await supabase.storage.from("resources").createSignedUrl(resource.storage_path, 3600) // 1 hour expiry

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank")
      }
    } catch (error) {
      console.error("Download error:", error)
    }
  }

  const ResourceCard = ({ resource, showDownload = false, showStats = false }) => {
    const stats = uploadStats[resource.id]
    
    return (
      <Card 
        className="rounded-xl card-shadow hover:shadow-lg transition-shadow bg-white cursor-pointer"
        onClick={() => handleResourceDetails(resource)}
      >
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{resource.title}</h3>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary" className="text-xs rounded-md">
                  {resource.department}
                </Badge>
                <Badge variant="outline" className="text-xs rounded-md">
                  Level {resource.level}
                </Badge>
                {resource.price === 0 && (
                  <Badge variant="outline" className="text-xs rounded-md text-green-600 border-green-200">
                    FREE
                  </Badge>
                )}
              </div>
              {showStats && stats && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-900">{stats.views}</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-900">{stats.downloads}</p>
                    <p className="text-xs text-gray-500">Downloads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-green-600">₦{stats.totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Earned</p>
                  </div>
                </div>
              )}
              {!showStats && (
                <p className="text-gray-500 text-xs">{new Date(resource.created_at).toLocaleDateString()}</p>
              )}
            </div>
            {showDownload && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(resource)
                }}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav title="My Library" showBack onBack={() => onNavigate("home")} />

      <div className="p-6">
        <Tabs defaultValue="downloads" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 bg-white">
            <TabsTrigger value="downloads" className="rounded-lg">
              <Download className="w-4 h-4 mr-2" />
              Downloads
            </TabsTrigger>
            <TabsTrigger value="uploads" className="rounded-lg">
              <Upload className="w-4 h-4 mr-2" />
              My Uploads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="downloads" className="mt-6">
            {downloads.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No downloads yet</h3>
                <p className="text-gray-600 mb-4">Purchase resources to see them here</p>
                <Button onClick={() => onNavigate("explore")} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Resources
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {downloads.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} showDownload />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="uploads" className="mt-6">
            {uploads.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No uploads yet</h3>
                <p className="text-gray-600 mb-4">Share your knowledge by uploading resources</p>
                <Button onClick={() => onNavigate("upload")} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resource
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Overview</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{uploads.length}</p>
                      <p className="text-sm text-gray-600">Resources</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        ₦{Object.values(uploadStats).reduce((sum, stat) => sum + stat.totalEarnings, 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Earned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {Object.values(uploadStats).reduce((sum, stat) => sum + stat.downloads, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Downloads</p>
                    </div>
                  </div>
                </div>
                {uploads.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} showStats />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
