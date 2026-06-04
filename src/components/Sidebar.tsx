"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UploadCloud, History, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Upload Document", href: "/upload", icon: UploadCloud },
  { name: "History", href: "/history", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const [geminiStatus, setGeminiStatus] = useState<"checking" | "up" | "down">("checking");

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.ok ? setGeminiStatus("up") : setGeminiStatus("down"))
      .catch(() => setGeminiStatus("down"));
  }, []);

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950 px-4 py-6 text-zinc-300">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
          <FileText size={18} />
        </div>
        <span className="text-lg font-semibold text-zinc-100">Biztel OCR</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isReallyActive = item.href === "/" ? pathname === "/" : isActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isReallyActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isReallyActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-zinc-800/50">
        <div className="flex items-center gap-3 px-2">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
            geminiStatus === "up" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : 
            geminiStatus === "down" ? "border-red-500 bg-red-500/10 text-red-500" :
            "border-zinc-700 bg-zinc-800 text-zinc-400"
          )}>
            AI
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-200">
              {geminiStatus === "checking" ? "Checking Status..." : 
               geminiStatus === "up" ? "System Ready" : "API Offline"}
            </span>
            <span className="text-xs text-zinc-500">Gemini 3.5 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
