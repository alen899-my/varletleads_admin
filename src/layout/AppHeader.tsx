"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

const AppHeader = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [username, setUsername] = useState("User");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const storedValue = localStorage.getItem("user");
    const storedUser = storedValue ? JSON.parse(storedValue) : null;
    
    if (storedUser?.fname) {
      setUsername(storedUser.fname);
    } else if (storedUser?.name) {
      setUsername(storedUser.name);
    }
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => setApplicationMenuOpen(!isApplicationMenuOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex w-full bg-[#000] border-b border-gray-800 dark:bg-gray-900 lg:h-[72px]">
      <div className="relative flex items-center justify-between w-full px-4 py-2 lg:px-6">
        
        {/* LEFT AREA: Sidebar Toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center w-10 h-10 text-white rounded-lg hover:bg-gray-800 lg:h-11 lg:w-11 lg:border lg:border-gray-700 dark:text-gray-400"
            onClick={handleToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>

          <Link href="/" className="flex lg:hidden">
            <div className="text-base font-bold tracking-tight text-white sm:text-lg">
              Varlet Parking
            </div>
          </Link>
        </div>

        {/* RIGHT AREA: Mobile Toggle & Desktop Items */}
        <div className="flex items-center gap-2">
          {/* Mobile "More" Menu Button */}
          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-400 rounded-lg hover:bg-gray-800 lg:hidden"
          >
            <span className="text-xl">⋮</span>
          </button>

          {/* Desktop Right Nav */}
          <div className="hidden items-center gap-4 lg:flex">
            <ThemeToggleButton />
            <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
              <span className="text-gray-400 text-sm font-medium">
                Welcome, <span className="text-white">{username}</span>
              </span>
              <UserDropdown />
            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN (Absolute Positioned) */}
        {isApplicationMenuOpen && (
          <div className="absolute left-0 top-full flex w-full flex-col border-b border-gray-800 bg-black p-4 shadow-xl animate-in slide-in-from-top-2 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-sm font-medium">👋 Welcome, {username}</span>
              <ThemeToggleButton />
            </div>
            <div className="flex items-center justify-center border-t border-gray-800 pt-4">
              <UserDropdown />
              <span className="ml-3 text-white">Profile Settings</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;