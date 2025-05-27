import React, { useState, useEffect } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, Globe, Palette, School } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { updateUserProfile, getCurrentUser } from "@/lib/database";
import { toast } from "@/components/ui/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("teacher");
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [theme, setTheme] = useState("light");
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setEmail(user.email || "");

        // Get user profile data from database
        const userData = await getCurrentUser();
        if (userData) {
          setName(userData.full_name || "");
          setUserType(userData.user_type || "teacher");
        }
      }
    };

    loadUserData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activePage="settings" />
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-[#1B1B1B] mb-6">
              Settings
            </h2>

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger
                  value="account"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Account
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center gap-2"
                >
                  <Bell className="h-4 w-4" /> Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" /> Privacy
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" /> Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="integrations"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" /> Integrations
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="account"
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]"
              >
                <h3 className="text-lg font-medium mb-4">
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1">
                      Full Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A] mb-1">
                      Role
                    </label>
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 text-[#FFB672]" />
                      <span>Teacher</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button
                      className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await updateUserProfile({
                            full_name: name,
                          });
                          toast({
                            title: "Profile updated",
                            description:
                              "Your profile has been updated successfully.",
                          });
                        } catch (error) {
                          console.error("Error updating profile:", error);
                          toast({
                            title: "Error",
                            description:
                              "Failed to update profile. Please try again.",
                            variant: "destructive",
                          });
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="notifications"
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]"
              >
                <h3 className="text-lg font-medium mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-[#4A4A4A]">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-[#4A4A4A]">
                        Receive notifications in the app
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  <div className="pt-4">
                    <Button className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]">
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="appearance"
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]"
              >
                <h3 className="text-lg font-medium mb-4">
                  Appearance Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Theme</h4>
                    <div className="flex gap-4">
                      <div
                        className={`w-16 h-16 rounded-lg border-2 ${theme === "light" ? "border-[#FFB672]" : "border-transparent"} cursor-pointer bg-white flex items-center justify-center`}
                        onClick={() => setTheme("light")}
                      >
                        Light
                      </div>
                      <div
                        className={`w-16 h-16 rounded-lg border-2 ${theme === "dark" ? "border-[#FFB672]" : "border-transparent"} cursor-pointer bg-gray-800 text-white flex items-center justify-center`}
                        onClick={() => setTheme("dark")}
                      >
                        Dark
                      </div>
                      <div
                        className={`w-16 h-16 rounded-lg border-2 ${theme === "system" ? "border-[#FFB672]" : "border-transparent"} cursor-pointer bg-gradient-to-r from-white to-gray-800 text-gray-800 flex items-center justify-center`}
                        onClick={() => setTheme("system")}
                      >
                        System
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">High Contrast</h4>
                      <p className="text-sm text-[#4A4A4A]">
                        Increase contrast for better visibility
                      </p>
                    </div>
                    <Switch
                      checked={highContrast}
                      onCheckedChange={setHighContrast}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Large Text</h4>
                      <p className="text-sm text-[#4A4A4A]">
                        Increase text size throughout the app
                      </p>
                    </div>
                    <Switch
                      checked={largeText}
                      onCheckedChange={setLargeText}
                    />
                  </div>
                  <div className="pt-4">
                    <Button className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]">
                      Save Appearance
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="privacy"
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]"
              >
                <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Sharing</h4>
                      <p className="text-sm text-[#4A4A4A]">
                        Share anonymous usage data to improve the service
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Profile Visibility</h4>
                      <p className="text-sm text-[#4A4A4A]">
                        Allow other teachers to see your profile
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="pt-4">
                    <Button className="bg-[#FFB672] hover:bg-[#FFA050] text-[#1B1B1B]">
                      Save Privacy Settings
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="integrations"
                className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E5E5]"
              >
                <h3 className="text-lg font-medium mb-4">LMS Integrations</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-[#E5E5E5] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">C</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Canvas</h4>
                        <p className="text-sm text-[#4A4A4A]">
                          Sync grades and assignments
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[#E5E5E5] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold">M</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Moodle</h4>
                        <p className="text-sm text-[#4A4A4A]">
                          Sync grades and assignments
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[#E5E5E5] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">B</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Blackboard</h4>
                        <p className="text-sm text-[#4A4A4A]">
                          Sync grades and assignments
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
