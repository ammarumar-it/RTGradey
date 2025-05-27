import React, { useState, useEffect } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Save,
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_seed: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [avatarType, setAvatarType] = useState("avataaars"); // Default avatar type
  const [originalAvatarType, setOriginalAvatarType] = useState("avataaars"); // To track original value
  const [availableAvatarTypes] = useState([
    "avataaars",
    "bottts",
    "micah",
    "miniavs",
    "personas",
    "pixel-art",
  ]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      const userProfile = {
        id: data.id,
        full_name: data.full_name || "",
        email: user?.email || "",
        avatar_seed: data.avatar_seed || user?.email || "default",
      };

      setProfile(userProfile);
      setFullName(userProfile.full_name);
      setAvatarSeed(userProfile.avatar_seed);

      // Check if avatar_type is stored, otherwise use default
      if (data.avatar_type) {
        setAvatarType(data.avatar_type);
        setOriginalAvatarType(data.avatar_type);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update the user profile in the database
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          avatar_seed: avatarSeed,
          avatar_type: avatarType,
          avatar_url: getAvatarUrl(), // Save the complete avatar URL
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });

      // Refresh profile data
      fetchUserProfile();

      // Force update the avatar in the TopNavigation component
      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: { avatarSeed, avatarType },
        }),
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    setAvatarSeed(randomSeed);
  };

  const cycleAvatarType = (direction: "next" | "prev") => {
    const currentIndex = availableAvatarTypes.indexOf(avatarType);
    let newIndex;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % availableAvatarTypes.length;
    } else {
      newIndex =
        (currentIndex - 1 + availableAvatarTypes.length) %
        availableAvatarTypes.length;
    }

    setAvatarType(availableAvatarTypes[newIndex]);
  };

  const getAvatarUrl = () => {
    return `https://api.dicebear.com/7.x/${avatarType}/svg?seed=${avatarSeed}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold text-[#1B1B1B] mb-6">
              My Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <Card className="md:col-span-1 bg-white shadow-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="mb-6 relative">
                    <Avatar className="h-32 w-32 border-2 border-[#FFB672]">
                      <AvatarImage src={getAvatarUrl()} alt="Profile" />
                      <AvatarFallback>
                        {fullName?.[0]?.toUpperCase() ||
                          user?.email?.[0]?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-4 w-full">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => cycleAvatarType("prev")}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium px-2 py-1 bg-gray-100 rounded">
                      {avatarType}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => cycleAvatarType("next")}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2">
                      <Input
                        value={avatarSeed}
                        onChange={(e) => setAvatarSeed(e.target.value)}
                        placeholder="Avatar seed"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={generateRandomSeed}
                        className="h-10 w-10"
                        title="Generate random avatar"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Change the seed to get different avatar variations
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Information */}
              <Card className="md:col-span-2 bg-white shadow-sm border border-gray-100">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Full Name
                    </label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Email Address
                    </label>
                    <Input
                      value={profile?.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email address cannot be changed
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
