
"use client"

import { useState } from "react"
import { Share2, Copy, Check, Link, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function ShareMaterialModal({ resource, onClose }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const shareUrl = `${window.location.origin}/resource/${resource.id}`
  
  const shareMessage = `Check out "${resource.title}" on StudyHub! ${resource.price === 0 ? 'It\'s free!' : `Only ₦${resource.price.toLocaleString()}`} ${shareUrl}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      })
    }
  }

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
    window.open(url, '_blank')
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Share Material</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>

          <div className="space-y-4">
            {/* Material Preview */}
            <div className="p-3 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 text-sm">{resource.title}</h4>
              <p className="text-gray-600 text-xs mt-1">{resource.department} • Level {resource.level}</p>
              <p className="text-blue-600 font-bold text-sm mt-1">
                {resource.price === 0 ? "Free" : `₦${resource.price.toLocaleString()}`}
              </p>
            </div>

            {/* Share URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
              <div className="flex space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="rounded-xl flex-1"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Quick Share Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quick Share</label>
              <div className="flex space-x-2">
                <Button
                  onClick={shareToWhatsApp}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={shareToTwitter}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
