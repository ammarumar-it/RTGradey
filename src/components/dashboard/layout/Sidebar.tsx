import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  BarChart,
  Settings,
  HelpCircle,
  GraduationCap,
  FileText,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
}

interface SidebarProps {
  activePage?: string;
  onPageChange?: (page: string) => void;
}

const Sidebar = ({
  activePage = "dashboard",
  onPageChange = () => {},
}: SidebarProps) => {
  const navItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      value: "dashboard",
      href: "/dashboard",
    },
    {
      icon: <Bell size={20} />,
      label: "Notifications",
      value: "notifications",
      href: "/notifications",
    },
    {
      icon: <BarChart size={20} />,
      label: "Analytics",
      value: "analytics",
      href: "/analytics",
    },
    {
      icon: <GraduationCap size={20} />,
      label: "AI Grading",
      value: "essay-grading",
      href: "/dashboard",
    },
  ];

  const bottomItems = [
    {
      icon: <Settings size={20} />,
      label: "Settings",
      value: "settings",
      href: "/settings",
    },
    {
      icon: <HelpCircle size={20} />,
      label: "Help",
      value: "help",
      href: "/help",
    },
  ];

  return (
    <div className="w-[280px] h-full bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">RTGradey</h2>
        <p className="text-sm text-gray-500">Essay Grading Platform</p>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              to={item.href}
              key={item.label}
              className="block"
              onClick={
                item.value === "essay-grading"
                  ? () => {
                      localStorage.setItem("activePage", "essay-grading");
                      window.location.href = "/dashboard";
                    }
                  : undefined
              }
            >
              <Button
                variant={"ghost"}
                className={`w-full justify-start gap-3 h-10 rounded-xl text-sm font-medium ${item.value === activePage ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "text-gray-700 hover:bg-gray-100"}`}
              >
                <span
                  className={`${item.value === activePage ? "text-[#FFB672]" : "text-[#4A4A4A]"}`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-gray-200">
        {bottomItems.map((item) => (
          <Link to={item.href} key={item.label} className="block">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 h-10 rounded-xl text-sm font-medium ${item.value === activePage ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span
                className={`${item.value === activePage ? "text-[#FFB672]" : "text-gray-500"}`}
              >
                {item.icon}
              </span>
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
