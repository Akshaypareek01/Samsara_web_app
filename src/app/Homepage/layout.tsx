"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  BookOpen,
  Menu,
  Calendar,
  Crown,
  CalendarDays,
  Users,
  X,
  LogOut,
  User,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/utils";
import LetterAvatar from "@/components/LetterAvatar";

const PORTAL_ORANGE = "#ed662e";

type UserProfile = {
  name: string;
  email: string;
  profileImage?: string;
  images?: { path: string }[];
  role: string;
};

/**
 * Resolves avatar URL from profile fields (empty when missing).
 * @param user - Logged-in user profile
 */
function getAvatarUrl(user: UserProfile): string | undefined {
  if (user.profileImage) return user.profileImage;
  const images = user.images;
  if (images && images.length > 0) {
    return images[images.length - 1]?.path;
  }
  return undefined;
}

/**
 * Role label for sidebar / header user chip.
 * @param role - API role string
 */
function roleLabel(role?: string): string {
  if (role === "teacher") return "Teacher";
  return "Member";
}

/**
 * Homepage shell — company-portal style orange sidebar + white header canvas.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    /**
     * Loads the signed-in user profile; redirects when unauthenticated.
     */
    const fetchUser = async () => {
      const token = Cookies.get("accessToken");
      if (!token) {
        setLoadingUser(false);
        router.replace("/");
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          Cookies.remove("accessToken");
          Cookies.remove("user");
          setLoadingUser(false);
          router.replace("/");
          return;
        }
        const data = await res.json();
        setUser(data.data || data);
      } catch {
        router.replace("/");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [router]);

  /**
   * Clears auth cookies and returns to login.
   */
  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("user");
    router.push("/");
  };

  /**
   * Navigates and closes the mobile drawer.
   * @param href - Target path
   */
  const navigate = (href: string) => {
    setSidebarOpen(false);
    router.push(href);
  };

  if (loadingUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div
          className="w-10 h-10 rounded-full border-2 border-[#ed662e] border-t-transparent animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const avatarSrc = getAvatarUrl(user);
  const role = roleLabel(user.role);

  return (
    <div className="h-screen flex bg-[#f3f4f6]" style={{ ["--portal-primary" as string]: PORTAL_ORANGE }}>
      {/* Mobile overlay */}
      {isSidebarOpen ? (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Orange sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:static inset-y-0 left-0 z-40 w-60 flex flex-col bg-[#ed662e] text-white shadow-[4px_0_24px_rgba(237,102,46,0.15)] transition-transform duration-300 ease-in-out`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-5 border-b border-white/15">
          <div className="flex items-center gap-2 min-w-0">
            <Image
              src="/images/logo.svg"
              alt="Samsara"
              width={36}
              height={36}
              className="brightness-0 invert shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-wide uppercase truncate">
                Samsara
              </p>
              <p className="text-[10px] text-white/65 uppercase tracking-wider">
                Wellness
              </p>
            </div>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/12 hover:bg-white/20 transition"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Primary">
          {/* Teacher-only: schedule first */}
          {user.role === "teacher" ? (
            <MenuItem
              icon={<Calendar size={18} aria-hidden />}
              label="My Scheduled Classes"
              isActive={pathname === "/Homepage/Classes/Scheduled"}
              onClick={() => navigate("/Homepage/Classes/Scheduled")}
            />
          ) : null}

          <MenuItem
            icon={<BookOpen size={18} aria-hidden />}
            label="My Classes"
            isActive={pathname === "/Homepage/Classes"}
            onClick={() => navigate("/Homepage/Classes")}
          />

          <MenuItem
            icon={<Users size={18} aria-hidden />}
            label="Group Classes"
            isActive={pathname.startsWith("/Homepage/Group")}
            onClick={() => navigate("/Homepage/Group")}
          />

          <MenuItem
            icon={<CalendarDays size={18} aria-hidden />}
            label="Events"
            isActive={pathname.startsWith("/Homepage/Events")}
            onClick={() => navigate("/Homepage/Events")}
          />

          <MenuItem
            icon={<Crown size={18} aria-hidden />}
            label="Membership"
            isActive={pathname.startsWith("/Homepage/Membership")}
            onClick={() => navigate("/Homepage/Membership")}
          />

          <MenuItem
            icon={<User size={18} aria-hidden />}
            label="Profile"
            isActive={pathname === "/Homepage/Dashboard/UserProfile"}
            onClick={() => navigate("/Homepage/Dashboard/UserProfile")}
          />
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-white/15">
          <button
            type="button"
            onClick={() => navigate("/Homepage/Dashboard/UserProfile")}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 bg-white/10 hover:bg-white/15 transition text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label={`${user.name}, ${role}. Open profile`}
          >
            <LetterAvatar
              name={user.name}
              src={avatarSrc}
              size={40}
              className="ring-2 ring-white/40"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-white truncate">
                {user.name}
              </span>
              <span className="block text-xs text-white/70 truncate">{role}</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-20"
          role="banner"
        >
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
            aria-label="Toggle navigation menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} aria-hidden />
          </button>

          <div className="flex-1 min-w-0" aria-hidden="true" />

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/Homepage/Dashboard/UserProfile")}
              className="hidden sm:inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-[#fff4ef] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
              aria-label={`${user.name}, ${role}. View profile`}
            >
              <LetterAvatar name={user.name} src={avatarSrc} size={40} />
              <span className="flex flex-col items-start leading-tight min-w-0">
                <span className="text-[13px] font-semibold text-gray-900 truncate max-w-[10rem]">
                  {user.name}
                </span>
                <span className="text-[11px] text-gray-500">{role}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-[#ed662e] text-white text-[13px] font-semibold hover:bg-[#c95520] transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 focus-visible:ring-offset-2"
            >
              <LogOut size={16} aria-hidden />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#f3f4f6] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Sidebar nav row — white icons/text; active = white pill + orange text.
 */
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
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl transition text-left min-h-[44px] text-[13px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
        isActive
          ? "bg-white text-[#ed662e] shadow-sm"
          : "text-white/88 hover:bg-white/12"
      }`}
    >
      <span className={isActive ? "text-[#ed662e]" : "text-white/90"} aria-hidden>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
