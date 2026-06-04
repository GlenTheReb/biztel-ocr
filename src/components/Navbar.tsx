"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  
  let title = "Dashboard";
  if (pathname.includes("/upload")) title = "Upload Document";
  if (pathname.includes("/history")) title = "Processed History";
  if (pathname.includes("/review")) title = "Review Record";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-8">
      <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => alert("You have 0 new notifications.")}
          className="relative text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950" />
        </button>
      </div>
    </header>
  );
}
