import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bell,
  Home,
  Search,
  Settings,
  User,
  FileText,
  BookOpen,
  GraduationCap,
  BarChart,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../supabase/auth";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/database";

interface TopNavigationProps {
  onSearch?: (query: string) => void;
  notifications?: Array<{ id: string; title: string }>;
}

const TopNavigation = ({
  onSearch = () => {},
  notifications = [
    { id: "1", title: "New project assigned" },
    { id: "2", title: "Meeting reminder" },
  ],
}: TopNavigationProps) => {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");

  const [avatarSeed, setAvatarSeed] = useState("");
  const [avatarType, setAvatarType] = useState("avataaars");

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const userData = await getCurrentUser();
        if (userData) {
          if (userData.full_name) {
            setFullName(userData.full_name);
          }
          if (userData.avatar_seed) {
            setAvatarSeed(userData.avatar_seed);
          }
          if (userData.avatar_type) {
            setAvatarType(userData.avatar_type);
          }
        }
      }
    };

    loadUserData();

    // Listen for profile updates
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail) {
        if (event.detail.avatarSeed) setAvatarSeed(event.detail.avatarSeed);
        if (event.detail.avatarType) setAvatarType(event.detail.avatarType);
      }
    };

    window.addEventListener(
      "profile-updated",
      handleProfileUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "profile-updated",
        handleProfileUpdate as EventListener,
      );
    };
  }, [user]);

  // Always show the header, even if user is not logged in

  return (
    <div className="w-full h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 fixed top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <Link
          to="/"
          className="text-gray-900 hover:text-gray-700 transition-colors"
          onClick={() => (window.location.href = "/")}
        >
          <img
            src="/images/rtgradey-logo.svg"
            alt="RTGradey Logo"
            className="h-8"
          />
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
                >
                  <span className="font-medium">Dashboard</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 rounded-xl overflow-hidden p-2 border border-gray-200 shadow-lg"
              >
                <DropdownMenuItem
                  className="rounded-lg flex items-center gap-2 cursor-pointer"
                  asChild
                >
                  <Link to="/dashboard">
                    <BarChart className="h-4 w-4 text-blue-500" />
                    <span>Overview</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg flex items-center gap-2 cursor-pointer"
                  asChild
                >
                  <Link to="/rubrics">
                    <GraduationCap className="h-4 w-4 text-[#FFB672]" />
                    <span>Rubrics</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg flex items-center gap-2 cursor-pointer"
                  asChild
                >
                  <Link to="/analytics">
                    <BarChart className="h-4 w-4 text-green-500" />
                    <span>Analytics</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg flex items-center gap-2 cursor-pointer"
                  asChild
                >
                  <Link to="/settings">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
              asChild
            >
              <Link to="/rubrics">
                <GraduationCap className="h-4 w-4 text-[#FFB672]" />
                <span className="font-medium">Rubrics</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
              asChild
            >
              <Link to="/analytics">
                <BarChart className="h-4 w-4 text-green-500" />
                <span className="font-medium">Analytics</span>
              </Link>
            </Button>
          </div>
        ) : (
          <Link
            to="/dashboard"
            className="text-gray-900 hover:text-gray-700 transition-colors font-medium"
          >
            Dashboard
          </Link>
        )}

        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            className="pl-9 h-10 rounded-full bg-gray-100 border-0 text-sm focus:ring-2 focus:ring-gray-200 focus-visible:ring-gray-200 focus-visible:ring-offset-0"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        {user && (
          <div className="text-sm font-medium text-gray-700">
            Welcome,{" "}
            <span className="text-blue-600">
              {fullName || user.email?.split("@")[0] || "User"}
            </span>
            !
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#FFB672]/10 text-[#FFB672] border-[#FFB672]/20 hover:bg-[#FFB672]/20"
              asChild
            >
              <Link
                to="/dashboard"
                onClick={() => {
                  localStorage.setItem("activePage", "essay-grading");
                  // Force a page reload to ensure the essay grading interface appears
                  window.location.href = "/dashboard";
                }}
              >
                <FileText className="h-4 w-4 mr-1" /> Grade Essay
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              asChild
            >
              <Link to="/help">
                <HelpCircle className="h-4 w-4 mr-1" /> Help
              </Link>
            </Button>
          </>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full h-9 w-9 bg-[#FAF6F0] hover:bg-[#F0EBE4] transition-colors"
                  >
                    <Bell className="h-4 w-4 text-gray-700" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium border border-white">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-xl overflow-hidden p-2 border border-gray-200 shadow-lg"
                >
                  <DropdownMenuLabel className="text-sm font-medium text-gray-900 px-2">
                    Notifications
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-gray-100" />
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="rounded-lg text-sm py-2 focus:bg-gray-100"
                    >
                      {notification.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent className="rounded-lg bg-gray-900 text-white text-xs px-3 py-1.5">
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 hover:cursor-pointer">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/${avatarType || "avataaars"}/svg?seed=${avatarSeed || user?.email || "default"}`}
                alt={user?.email || "Guest"}
              />
              <AvatarFallback>
                {user?.email?.[0]?.toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border-none shadow-lg"
          >
            <DropdownMenuLabel className="text-xs text-gray-500">
              {user?.email || "Guest User"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/dashboard">
                <BarChart className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={async () => {
                await signOut();
                window.location.href = "/";
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopNavigation;
