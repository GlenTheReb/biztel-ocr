"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";

export function Navbar() {
  const pathname = usePathname();
  
  let title = "Dashboard";
  if (pathname.includes("/upload")) title = "Upload Document";
  if (pathname.includes("/history")) title = "Processed History";
  if (pathname.includes("/review")) title = "Review Record";

  const { notifications, markAllAsRead, removeNotification, clearAllNotifications } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-8">
      <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        <button 
          onClick={() => {
            if (!isOpen) markAllAsRead();
            setIsOpen(!isOpen);
          }}
          className="relative text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white ring-2 ring-zinc-950">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl z-50 overflow-hidden">
            <div className="flex justify-between items-center border-b border-zinc-800 bg-zinc-950 px-4 py-3">
              <h3 className="font-semibold text-sm text-zinc-100">Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={clearAllNotifications}
                  className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-zinc-500">
                  You have no new notifications.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="group flex gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors relative">
                      <div className="mt-0.5 shrink-0">
                        {notif.status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />}
                        {notif.status === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                        {notif.status === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
                      </div>
                      <div className="flex-1 space-y-1 pr-6">
                        <p className="text-sm font-medium text-zinc-200 leading-tight">
                          {notif.title}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notif.id);
                        }}
                        className="absolute right-4 top-4 text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                        title="Remove Notification"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
