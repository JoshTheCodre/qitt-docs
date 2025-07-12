"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  CreditCard,
  Star,
  User,
  Calendar,
  BookOpen,
  FileText,
  Shield,
  Heart,
  Share,
  Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ShareMaterialModal from "@/components/share-material-modal";

export default function ResourceDetailScreen({
  user,
  resource,
  onNavigate,
  onBack,
}) {
  const [loading, setLoading] = useState(false);
  const [userWallet, setUserWallet] = useState(null);
  const [isOwned, setIsOwned] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserWallet();
    checkOwnership();
    checkFavorite();
  }, [user.id, resource.id]);

  const fetchUserWallet = async () => {
    const { data } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (data) setUserWallet(data);
  };

  const checkOwnership = async () => {
    const { data } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("resource_id", resource.id)
      .single();

    setIsOwned(!!data);
  };

  const checkFavorite = async () => {
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("resource_id", resource.id)
      .single();

    setIsFavorited(!!data);
  };

  const handleDownload = async () => {
    if (resource.price > 0 && !isOwned) {
      toast({
        title: "Purchase Required",
        description: "You need to buy this resource first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if already downloaded to prevent duplicates
      const { data: existingDownload } = await supabase
        .from("downloads")
        .select("id")
        .eq("user_id", user.id)
        .eq("resource_id", resource.id)
        .single();

      if (!existingDownload) {
        // Add to downloads table
        await supabase.from("downloads").insert({
          user_id: user.id,
          resource_id: resource.id,
          downloaded_at: new Date().toISOString(),
        });
      }

      const url = `https://https://vmfjidjxdofmdonivzzp.supabase.co/storage/v1/object/public/resources/${resource.storage_path}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.title || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Download Complete",
        description: "Your resource has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Please try again" + `${error}`,
        variant: "destructive",
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!userWallet || userWallet.balance < resource.price) {
      toast({
        title: "Insufficient Balance",
        description: "Please add funds to your wallet.",
        variant: "destructive",
      });
      onNavigate("wallet");
      return;
    }

    setLoading(true);
    try {
      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          buyer_id: user.id,
          resource_id: resource.id,
          amount: resource.price,
        });

      if (transactionError) throw transactionError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: userWallet.balance - resource.price })
        .eq("user_id", user.id);

      if (walletError) throw walletError;

      // Add to downloads automatically after purchase
      const { data: existingDownload } = await supabase
        .from("downloads")
        .select("id")
        .eq("user_id", user.id)
        .eq("resource_id", resource.id)
        .single();

      if (!existingDownload) {
        const { error: downloadError } = await supabase
          .from("downloads")
          .insert({
            user_id: user.id,
            resource_id: resource.id,
            downloaded_at: new Date().toISOString(),
          });

        if (downloadError) {
          console.error("Error adding to downloads:", downloadError);
        }
      }

      setIsOwned(true);
      fetchUserWallet(); // Refresh wallet balance
      toast({
        title: "Purchase Successful!",
        description: "You can now download this resource.",
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resource.id);
        setIsFavorited(false);
      } else {
        await supabase.from("favorites").insert({
          user_id: user.id,
          resource_id: resource.id,
        });
        setIsFavorited(true);
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-full w-10 h-10 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className="rounded-full w-10 h-10 p-0"
            >
              <Heart
                className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="rounded-full w-10 h-10 p-0"
            >
              <Share className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Preview Image */}
        {resource.preview_path && (
          <Card className="bg-white border-0 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={`https://vmfjidjxdofmdonivzzp.supabase.co/storage/v1/object/public/previews/${resource.preview_path}`}
                  alt={`Preview of ${resource.title}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-sm opacity-80">Previews</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-0"
                  >
                    {resource.department}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-0"
                  >
                    Level {resource.level}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold mb-2 leading-tight">
                  {resource.title}
                </h1>
                <p className="text-blue-100 text-sm">
                  {resource.description || "No description available"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {resource.price === 0
                    ? "FREE"
                    : `₦${resource.price.toLocaleString()}`}
                </div>
                {resource.price > 0 && (
                  <div className="text-blue-200 text-sm">One-time purchase</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {resource.price === 0 ? (
                <Button
                  onClick={handleDownload}
                  disabled={loading}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? "Downloading..." : "Download Free"}
                </Button>
              ) : isOwned ? (
                <Button
                  onClick={handleDownload}
                  disabled={loading}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? "Downloading..." : "Download Now"}
                </Button>
              ) : (
                <Button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading
                    ? "Processing..."
                    : `Buy for ₦${resource.price.toLocaleString()}`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">2.3k</div>
              <div className="text-gray-600 text-xs">Views</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">451</div>
              <div className="text-gray-600 text-xs">Downloads</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">4.8</div>
              <div className="text-gray-600 text-xs">Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Resource Details */}
        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Resource Details
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">File Type</div>
                  <div className="text-gray-600 text-sm">PDF Document</div>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Uploaded by</div>
                  <div className="text-gray-600 text-sm">
                    Academic Contributor
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Upload Date</div>
                  <div className="text-gray-600 text-sm">
                    {formatDate(resource.created_at)}
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-200" />

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Security</div>
                  <div className="text-gray-600 text-sm">Verified & Safe</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        {resource.description && (
          <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                About This Resource
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {resource.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Reviews & Ratings
              </h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">4.8 (32 reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((review) => (
                <div key={review} className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">
                        Student {review}
                      </span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Really helpful resource! Well structured and easy to
                      understand.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Modal */}
      <ShareMaterialModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        resource={resource}
      />
    </div>
  );
}
