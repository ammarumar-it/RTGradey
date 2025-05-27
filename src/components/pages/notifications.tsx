import React, { useState, useEffect } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../supabase/auth";
import { Notification } from "@/types/notification.types";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  subscribeToNotifications,
} from "@/lib/notifications";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/supabase/supabase";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to create a test notification
  const createTestNotification = async () => {
    if (!user) return;

    try {
      const types = ["info", "success", "warning", "error"] as const;
      const randomType = types[Math.floor(Math.random() * types.length)];

      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: "Test notification",
          message: `This is a test ${randomType} notification created at ${new Date().toLocaleTimeString()}`,
          type: randomType,
          read: false,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Test Notification Created",
        description: "A new test notification has been created.",
      });
    } catch (error) {
      console.error("Error creating test notification:", error);
      toast({
        title: "Error",
        description: "Failed to create test notification",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to realtime notifications
      const subscription = subscribeToNotifications(user.id, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === "error" ? "destructive" : "default",
        });
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(
        notifications.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type: string, read: boolean) => {
    const className = `h-5 w-5 ${read ? "text-gray-400" : ""}`;
    switch (type) {
      case "success":
        return (
          <CheckCircle
            className={`${className} ${!read ? "text-green-500" : ""}`}
          />
        );
      case "warning":
        return (
          <AlertCircle
            className={`${className} ${!read ? "text-yellow-500" : ""}`}
          />
        );
      case "info":
      default:
        return (
          <Bell className={`${className} ${!read ? "text-blue-500" : ""}`} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activePage="notifications" />
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#1B1B1B]">
                Notifications
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#4A4A4A]"
                  onClick={() => markAllNotificationsAsRead()}
                >
                  Mark all as read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#4A4A4A]"
                  onClick={createTestNotification}
                >
                  Create Test Notification
                </Button>
                <Button variant="outline" size="sm" className="text-[#4A4A4A]">
                  Settings
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No notifications yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={createTestNotification}
                  >
                    Create Test Notification
                  </Button>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-[#E5E5E5] last:border-b-0 flex items-start gap-4 ${!notification.read ? "bg-blue-50" : ""} hover:bg-gray-50 transition-colors cursor-pointer`}
                  >
                    <div
                      className={`mt-1 ${!notification.read ? "text-blue-500" : "text-gray-400"}`}
                    >
                      {getNotificationIcon(
                        notification.type,
                        notification.read,
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${!notification.read ? "text-[#1B1B1B]" : "text-gray-500"}`}
                      >
                        {notification.title}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${!notification.read ? "text-[#4A4A4A]" : "text-gray-500"}`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(notification.created_at).toLocaleString(
                          undefined,
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                    )}
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Notifications;
