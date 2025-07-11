
"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, CreditCard, FileText, Star, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import TopNav from "@/components/top-nav"

export default function ResourceDetailScreen({ user, resource, onNavigate, onBack }) {
  const [loading, setLoading] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const [hasPurchased, setHasPurchased] = useState(false)

  useEffect(() => {
    if (user && resource) {
      fetchWalletBalance()
      checkIfPurchased()
    }
  }, [user, resource])

  const fetchWalletBalance = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single()
    
    if (data) setWalletBalance(data.wallet_balance || 0)
  }

  const checkIfPurchased = async () => {
    if (resource.price === 0) {
      setHasPurchased(true)
      return
    }

    const { data } = await supabase
      .from("transactions")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("resource_id", resource.id)
      .single()

    setHasPurchased(!!data)
  }

  const handlePurchase = async () => {
    if (walletBalance < resource.price) {
      alert("Insufficient wallet balance. Please add funds to your wallet.")
      onNavigate("wallet")
      return
    }

    setLoading(true)
    try {
      // Create transaction
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            buyer_id: user.id,
            seller_id: resource.uploader_id,
            resource_id: resource.id,
            amount: resource.price
          }
        ])

      if (transactionError) throw transactionError

      // Update buyer's wallet balance
      const { error: buyerError } = await supabase
        .from("profiles")
        .update({ wallet_balance: walletBalance - resource.price })
        .eq("id", user.id)

      if (buyerError) throw buyerError

      // Update seller's wallet balance
      const { data: sellerData } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", resource.uploader_id)
        .single()

      if (sellerData) {
        await supabase
          .from("profiles")
          .update({ wallet_balance: (sellerData.wallet_balance || 0) + resource.price })
          .eq("id", resource.uploader_id)
      }

      setHasPurchased(true)
      fetchWalletBalance()
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Purchase failed. Please try again.")
    }
    setLoading(false)
  }

  const handleDownload = async () => {
    try {
      const { data } = await supabase.storage
        .from("resources")
        .createSignedUrl(resource.storage_path, 3600)

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed. Please try again.")
    }
  }

  if (!resource) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav 
        title="Resource Details" 
        showBack 
        onBack={onBack} 
      />

      <div className="p-6 space-y-6">
        {/* Resource Header */}
        <Card className="rounded-2xl card-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h1>
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="secondary" className="text-xs rounded-md">
                    {resource.department}
                  </Badge>
                  <Badge variant="outline" className="text-xs rounded-md">
                    Level {resource.level}
                  </Badge>
                  <Badge variant={resource.price === 0 ? "default" : "destructive"} className="text-xs rounded-md">
                    {resource.price === 0 ? "Free" : `₦${resource.price.toLocaleString()}`}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  Uploaded on {new Date(resource.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {resource.description && (
          <Card className="rounded-2xl card-shadow bg-white">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{resource.description}</p>
            </CardContent>
          </Card>
        )}

        {/* File Info */}
        <Card className="rounded-2xl card-shadow bg-white">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">File Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">File Type:</span>
                <span className="font-medium text-gray-900">{resource.file_type?.toUpperCase() || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium text-gray-900">{resource.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Academic Level:</span>
                <span className="font-medium text-gray-900">Level {resource.level}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Balance (for paid resources) */}
        {resource.price > 0 && !hasPurchased && (
          <Card className="rounded-2xl card-shadow bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Your Wallet Balance</h3>
                  <p className="text-2xl font-bold text-green-600">₦{walletBalance.toLocaleString()}</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate("wallet")}
                  className="rounded-lg"
                >
                  Add Funds
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto">
          {hasPurchased ? (
            <Button 
              onClick={handleDownload}
              className="w-full bg-green-500 hover:bg-green-600 text-white h-12 rounded-xl text-lg font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Now
            </Button>
          ) : resource.price === 0 ? (
            <Button 
              onClick={handleDownload}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl text-lg font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Free
            </Button>
          ) : (
            <Button 
              onClick={handlePurchase}
              disabled={loading || walletBalance < resource.price}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 rounded-xl text-lg font-semibold disabled:bg-gray-400"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Purchase for ₦{resource.price.toLocaleString()}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
