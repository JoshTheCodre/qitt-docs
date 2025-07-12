"use client";

import { useEffect, useState } from "react";
import {
  User,
  TrendingUp,
  Star,
  ArrowRight,
  BookOpen,
  UploadIcon,
  Award,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TopNav from "@/components/top-nav"
import ModernSearch from "@/components/modern-search"
import { ResourceCardSkeleton } from "@/components/loading-skeleton"
import InstallAppButton from "@/components/install-app-button"

export default function HomeScreen({ user, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [trendingResources, setTrendingResources] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [forYouResources, setForYouResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchTrendingResources();
    fetchFeaturedResources();
    console.log("User zzz : ", user);
  }, [user.id]);

  useEffect(() => {
    if (profile) {
      fetchForYouResources();
    }
  }, [profile]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await supabase
        .from("users")
        .select("name, school, department, level")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingResources = async () => {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);
    if (data) setTrendingResources(data);
  };

  const fetchFeaturedResources = async () => {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("featured", true)
      .limit(4);
    if (data) setFeaturedResources(data);
  };

  const fetchForYouResources = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("department", profile.department)
      .eq("level", profile.level)
      .order("created_at", { ascending: false })
      .limit(4);

    if (data) setForYouResources(data);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onNavigate("explore");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <TopNav
        title="Qitt"
        showNotifications
        rightAction={
          <button
            onClick={() => onNavigate("profile")}
            className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg"
          >
            <User className="w-5 h-5 text-white" />
          </button>
        }
      /> */}

      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center px-1 mt-2">
          <div  className="text-left space-y-1">
          <p className="text-gray-500 text-sm">{getGreeting()},</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? "Loading..." : profile?.name || "Student"} 👋
          </h1>
          </div>
           <button
            onClick={() => onNavigate("profile")}
            className="w-12 h-12 bg-blue-500 rounded-full  border border-blue-300 flex items-center justify-center shadow-lg"
          ><img src='/cat.png' className="w-full h-full rounded-full " alt="cat" />

          </button>
        </div>

        {/* Search */}
        <ModernSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={() => onNavigate("explore")}
          showSuggestions
        />

        {/* Install App Button */}
        <InstallAppButton className="mb-4" />

        {/* Featured Resources */}
        <div>
          {/* <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">Featured</h2>
            </div>
            <Button
              variant="ghost"
              className="text-blue-600 font-medium hover:bg-blue-50 rounded-lg"
              onClick={() => onNavigate("explore")}
            >
              See All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div> */}

          {/* {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(1)].map((_, i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {featuredResources.slice(0, 4).map((resource) => (
                <Card
                  key={resource.id}
                  className="rounded-xl card-shadow hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="w-full h-20 bg-blue-100 rounded-lg mb-3 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight">
                      {resource.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs rounded-md">
                        {resource.department}
                      </Badge>
                      <span className="text-blue-600 font-bold text-sm">
                        {resource.price === 0
                          ? "Free"
                          : `₦${resource.price.toLocaleString()}`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}*/}
        </div> 

        {/* Trending Resources */}
        <div>
          <div className="flex items-center justify-between my-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">Trending</h2>
            </div>
            <Button
              variant="ghost"
              className="text-blue-600 font-medium hover:bg-blue-50 rounded-lg"
              onClick={() => onNavigate("explore")}
            >
              See All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {trendingResources.slice(0, 4).map((resource) => (
                <Card
                  key={resource.id}
                  className="rounded-xl card-shadow hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="w-full h-20 bg-orange-100 rounded-lg mb-3 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight">
                      {resource.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs rounded-md">
                        {resource.department}
                      </Badge>
                      <span className="text-blue-600 font-bold text-sm">
                        {resource.price === 0
                          ? "Free"
                          : `₦${resource.price.toLocaleString()}`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* For You Section */}
          {profile && (
            <div>
              <div className="flex items-center justify-between my-3">
                <h2 className="text-xl font-bold text-gray-900">For You</h2>
                <Button
                  variant="ghost"
                  className="text-blue-600 font-medium hover:bg-blue-50 rounded-lg"
                  onClick={() => onNavigate("explore")}
                >
                  See All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <Card className="bg-blue-500 text-white rounded-2xl card-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-2">
                        {profile.department} Resources
                      </h3>
                      <p className="text-blue-100 text-sm mb-4">
                        Level {profile.level} • {profile.school}
                      </p>
                      <Button
                        className="bg-white text-blue-600 hover:bg-gray-100"
                        onClick={() => onNavigate("explore")}
                      >
                        Explore Now
                      </Button>
                    </div>
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                      <Star className="w-8 h-8 text-yellow-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="rounded-xl card-shadow hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate("upload")}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <UploadIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Upload Resource
              </h3>
              <p className="text-gray-600 text-xs">Share & Earn</p>
            </CardContent>
          </Card>

          <Card
            className="rounded-xl card-shadow hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onNavigate("wallet")}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">My Wallet</h3>
              <p className="text-gray-600 text-xs">Manage Funds</p>
            </CardContent>
          </Card>
        </div>

        {/* Recommended for You */}
        {forYouResources.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Recommended for You
              </h2>
              <Button
                variant="ghost"
                className="text-blue-600 font-medium hover:bg-blue-50 rounded-lg"
                onClick={() => onNavigate("explore")}
              >
                See All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {forYouResources.slice(0, 3).map((resource) => (
                <Card
                  key={resource.id}
                  className="rounded-xl card-shadow hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {resource.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                          {resource.description || "No description available"}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className="text-xs rounded-md"
                          >
                            {resource.department}
                          </Badge>
                          <span className="text-blue-600 font-bold text-sm">
                            {resource.price === 0
                              ? "Free"
                              : `₦${resource.price.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}