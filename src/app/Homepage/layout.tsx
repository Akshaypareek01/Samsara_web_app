"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  CalendarDays,
  User,
  BookOpen,
  Calendar,
  Users,
  User2,
  Activity,
  Bell,
  Search,
  Menu,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";

type UserProfile = {
  name: string;
  email: string;
  profileImage?: string;
  images?: { path: string }[];
  role: string; // Added role field
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // User state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("accessToken");
      if (!token) {
        setLoadingUser(false);
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          setLoadingUser(false);
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        // ignore
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);
  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#fdf4f2]">
      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between p-3 bg-[#fdf4f2]">
        <div className="flex items-center gap-2">
          <Image src="/images/logo.svg" alt="Logo" width={30} height={30} />
          <span className="font-semibold text-gray-700 text-[15px]">
            SAMSARA
          </span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:static w-64 p-6 bg-[#fdf4f2] z-10 h-full transition-transform duration-300 ease-in-out md:block`}
      >
        <div className="flex flex-col items-start gap-2 pl-2">
          {loadingUser ? (
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <>
              <Image
                src={user.profileImage || "/images/logo.svg"}
                width={80}
                height={80}
                className="rounded-full object-cover"
                alt={user.name || "Profile"}
              />
              <h2 className="font-semibold text-[16px]">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </>
          ) : (
            <>
              <Image
                src="/images/logo.svg"
                width={80}
                height={80}
                className="rounded-full object-cover"
                alt="Profile"
              />
              <h2 className="font-semibold text-[16px]">Guest</h2>
              <p className="text-gray-500 text-sm">Not signed in</p>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-10 space-y-3 text-gray-700 text-sm">
          <MenuItem
            icon={<CalendarDays size={18} />}
            label="Dashboard"
            isActive={pathname === "/Homepage"}
            onClick={() => router.push("/Homepage")}
          />

          {/* Conditionally show Profile section only for teachers */}
          {user && user.role === "teacher" && (
            <MenuItem
              icon={<User size={18} />}
              label="Profile"
              isActive={pathname === "/Homepage/Profile"}
              onClick={() => router.push("/Homepage/Profile")}
            />
          )}

          <MenuItem
            icon={<BookOpen size={18} />}
            label="My Classes"
            isActive={pathname === "/Homepage/Classes"}
            onClick={() => router.push("/Homepage/Classes")}
          />
          <MenuItem
            icon={<Calendar size={18} />}
            label="Events"
            isActive={pathname.startsWith("/Homepage/Events")}
            onClick={() => router.push("/Homepage/Events")}
          />
          <MenuItem
            icon={<Users size={18} />}
            label="Group Classes"
            isActive={pathname.startsWith("/Homepage/Group")}
            onClick={() => router.push("/Homepage/Group")}
          />
          <MenuItem
            icon={<User2 size={18} />}
            label="1:1 Classes"
            isActive={pathname === "/Homepage/onetoone"}
            onClick={() => router.push("/Homepage/onetoone")}
          />
          <MenuItem
            icon={<Activity size={18} />}
            label="My Body"
            isActive={pathname === "/Homepage/Mybody"}
            onClick={() => router.push("/Homepage/Mybody")}
          />
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 bg-[#fdf4f2] mt-8">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-2xl pl-10 pr-4 py-2 rounded-full bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <Bell className="text-gray-500 cursor-pointer" size={20} />
            <button className="bg-[#EB855F] text-white px-4 py-2 rounded-md text-sm hover:bg-orange-500 transition">
              Dashboard
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  isActive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-2 py-2 cursor-pointer rounded-md transition ${
        isActive
          ? "bg-white text-orange-600 font-semibold"
          : "text-gray-700 hover:text-black"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
