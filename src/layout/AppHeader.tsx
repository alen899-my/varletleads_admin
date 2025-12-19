"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

const AppHeader = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [username, setUsername] = useState("User");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const storedValue = localStorage.getItem("user");
    const storedUser = storedValue ? JSON.parse(storedValue) : null;
    
    if (storedUser?.fname) {
      setUsername(storedUser.fname);
    } else if (storedUser?.name) {
      setUsername(storedUser.name);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isApplicationMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileToggleRef.current &&
        !mobileToggleRef.current.contains(event.target as Node)
      ) {
        setApplicationMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isApplicationMenuOpen]);


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
    <header className="sticky top-0 z-1000 flex w-full bg-[#000] border-b border-gray-800 dark:bg-gray-900 lg:h-[72px]">
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
            ref={mobileToggleRef}
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-400 rounded-lg hover:bg-gray-800 lg:hidden"
            aria-label="Toggle Mobile options menu"
          >
            <span className="text-xl">⋮</span>
          </button>

          {/* Desktop Right Nav */}
          <div className="hidden items-center gap-4 lg:flex">
            <ThemeToggleButton />
            <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
              <span className="text-gray-400 text-sm font-medium">
                Welcome</span>
             
              <UserDropdown />
            </div>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN (Absolute Positioned) */}
        {isApplicationMenuOpen && (
          <div 
            ref={mobileMenuRef}
            // ✅ FIX APPLIED HERE:
            // 1. Removed `max-h-[85vh]`, `overflow-y-auto`, and the large `pb-32`.
            // 2. Used simple `p-4` for standard padding.
            // 3. Kept the clean light/dark mode colors.
            className="absolute left-0 top-full z-50 flex w-full flex-col border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl animate-in slide-in-from-top-2 lg:hidden p-4"
          >
            <div className="flex items-center justify-end gap-4 mb-4 shrink-0">
              <span className="text-gray-900 dark:text-white text-sm font-medium">👋 Welcome</span>
              <ThemeToggleButton />
            </div>
            
            {/* Removed mt-auto and relative as they are no longer needed without fixed height */}
            <div className="flex items-center text-gray-900 justify-end border-t border-gray-200 dark:border-gray-800 pt-4">
              <UserDropdown />
           
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;