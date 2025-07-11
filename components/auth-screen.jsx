"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, GraduationCap, Users, BookOpen } from "lucide-react";

const schools = [
  "Uniport",
  "RSU"
];

const departments = [
  "Computer Science",
  "Engineering",
  "Medicine",
  "Law",
  "Business Administration",
  "Economics",
  "Psychology",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "English",
  "Other",
];

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've been logged in successfully.",
        });
      } else {
        // Validate required fields for signup
        if (!name || !school || !department || !level) {
          throw new Error("Please fill in all required fields");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          // Create user profile
          const { error: profileError, data: profileData } = await supabase
            .from("users")
            .insert([
              {
                id: data.user.id,
                name,
                email,
                school,
                department,
                level,
                role: "buyer",
              },
            ]);
          console.log("Profile Data:", profileData);
          console.log("Profile Error:", profileError);

          if (profileError) {
            console.log("An error occurred creating profile:", profileError);
            throw profileError;
          }
          // Create wallet
            const { error: walletError} = await supabase.from("wallets").insert([
            {
              user_id: data.user.id,
              balance: 0,
            },
          ]);

          if (walletError) throw walletError;
        }

        toast({
          title: "Account created!",
          description: "Welcome to Qitt! Let's get learning!",
        });
      }
    } catch (error) {
      toast({
        title: "Oops! Something went wrong",
        description: error.message,
        variant: "destructive",
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Simple background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-800 rounded-full opacity-30"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="text-center pb-2 bg-gray-50">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-blue-600 mb-2">
              {isLogin ? "Welcome Back!" : "Join Qitt!"}
            </CardTitle>
            <p className="text-gray-600 text-sm">
              {isLogin
                ? "Ready to continue learning?"
                : "Your academic journey starts here!"}
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="rounded-xl border-gray-200 focus:border-blue-500 h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      School/University *
                    </label>
                    <Select value={school} onValueChange={setSchool} required>
                      <SelectTrigger className="rounded-xl border-gray-200 focus:border-blue-500 h-12">
                        <SelectValue placeholder="Select your school" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((schoolName) => (
                          <SelectItem key={schoolName} value={schoolName}>
                            {schoolName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Department *
                      </label>
                      <Select
                        value={department}
                        onValueChange={setDepartment}
                        required
                      >
                        <SelectTrigger className="rounded-xl border-gray-200 focus:border-blue-500 h-12">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Level *
                      </label>
                      <Select value={level} onValueChange={setLevel} required>
                        <SelectTrigger className="rounded-xl border-gray-200 focus:border-blue-500 h-12">
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 Level</SelectItem>
                          <SelectItem value="200">200 Level</SelectItem>
                          <SelectItem value="300">300 Level</SelectItem>
                          <SelectItem value="400">400 Level</SelectItem>
                          <SelectItem value="500">500 Level</SelectItem>
                          <SelectItem value="masters">Masters</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl border-gray-200 focus:border-blue-500 h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl border-gray-200 focus:border-blue-500 h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-bold rounded-xl bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-blue-600 hover:text-blue-700 font-semibold transition-colors p-3 rounded-xl hover:bg-blue-50"
            >
              {isLogin ? (
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>New here? Create an account</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Already have an account? Sign in</span>
                </div>
              )}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
