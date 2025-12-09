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
  const [username, setUsername] = useState("User"); // default placeholder
  const inputRef = useRef<HTMLInputElement | null>(null); // <-- Fix

  useEffect(() => {
    // fetch user from localStorage
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

  // Ctrl+K search shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { // <-- Fix
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-[#465fff] border-gray-200 z-2 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">

        {/* LEFT AREA: Sidebar Toggle + Placeholder Branding */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:border-b-0 lg:px-0 lg:py-4">
          {/* Sidebar Toggle Button */}
          <button
            className="items-center justify-center w-10 h-10 text-white border-gray-200 rounded-lg dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? "✖" : "☰"}
          </button>

          {/* Placeholder Logo */}
          <Link href="/" className="lg:hidden">
            <div className="font-semibold text-lg text-white dark:text-white">
              Varlet Parking
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            ⋮
          </button>

          {/* Search Input Desktop */}
       
        </div>

        {/* RIGHT AREA */}
        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"} items-center justify-between w-full gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0`}
        >
          <div className="flex items-center gap-2">
            <ThemeToggleButton />
          </div>

          {/* USER BADGE */}
          <div className="flex items-center gap-3">
            <span className="text-white dark:text-gray-300 text-sm font-medium">
              👋 Welcome
            </span>
            <UserDropdown />
          </div>

        </div>
      </div>
    </header>
  );
};

export default AppHeader;
