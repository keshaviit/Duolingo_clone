"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Shield, User } from "lucide-react";
import DuoMascot from "@/components/DuoMascot";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: "LEARN", href: "/learn", icon: Compass },
  { name: "LEADERBOARD", href: "/leaderboard", icon: Shield },
  { name: "PROFILE", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar (Left side, fixed) */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 border-r-2 border-hare-light dark:border-slate-800 bg-white dark:bg-[#111827] px-4 py-8 z-20 text-slate-800 dark:text-white transition-colors duration-150">
        {/* Logo/Mascot Title */}
        <div className="flex items-center gap-3 px-2 mb-8 select-none">
          <span className="text-macaw font-extrabold text-3xl tracking-wide font-nunito">
            duolingo
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 flex flex-col gap-2">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all font-bold tracking-wider text-[15px] ${
                  isActive
                    ? "bg-feather/10 border-feather text-feather"
                    : "bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-hare-ultralight dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={22} className={isActive ? "text-feather" : "text-slate-400 dark:text-slate-500"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Optional decorative mascot info */}
        <div className="p-4 rounded-2xl bg-hare-ultralight dark:bg-slate-800/40 border-2 border-hare-light dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-12 h-12 bg-transparent flex items-center justify-center">
            <DuoMascot mood="neutral" className="w-12 h-12" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Duo Mascot</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">Ready to learn!</p>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Bar (Bottom, fixed) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-[#111827] border-t-2 border-hare-light dark:border-slate-800 flex items-center justify-around px-4 z-20 text-slate-800 dark:text-white transition-colors duration-150">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 ${
                isActive ? "text-feather" : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <Icon size={24} className={isActive ? "text-feather" : "text-slate-400 dark:text-slate-500"} />
              <span className="text-[10px] font-extrabold tracking-wider mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
