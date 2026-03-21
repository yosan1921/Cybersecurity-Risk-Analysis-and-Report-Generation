"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import NotificationPanel from "@/components/NotificationPanel";
import { useRBAC } from "@/hooks/useRBAC";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { can, role } = useRBAC();
  const [showNotifications, setShowNotifications] = useState(false);

  const allNavItems = [
    { name: "Dashboard", href: "/dashboard", show: true },
    { name: "Assessment", href: "/questionnaires", show: true },
    { name: "Risk Analysis", href: "/risk-analysis", show: true },
    { name: "Risk Evaluation", href: "/risk-evaluation", show: true },
    { name: "Risk Treatment", href: "/risk-treatment", show: can("VIEW_RISK_TREATMENT") },
    { name: "Reports & Docs", href: "/reports", show: can("VIEW_REPORTS") },
    { name: "Risk Register", href: "/risks", show: true },
    { name: "Incidents", href: "/incidents", show: can("VIEW_INCIDENTS") },
    { name: "Awareness", href: "/awareness", show: can("VIEW_AWARENESS") },
    { name: "Team Chat", href: "/chat", show: true },
    { name: "Audit Logs", href: "/audit", show: can("VIEW_AUDIT_LOGS") },
    { name: "My Profile", href: "/profile", show: true },
  ];

  const navigation = allNavItems.filter(item => item.show);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">

      <div className="flex">
        <aside className="w-64 bg-slate-800 border-r border-slate-700 h-screen sticky top-0 flex flex-col">
          <div className="p-4 border-b border-slate-700 flex flex-col items-center gap-2">
            <div className="w-full flex items-center justify-center">
              <Image src="/logo2.png" alt="CSRARS Logo" width={180} height={60} className="object-contain" priority />
            </div>
            {role && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                {role}
              </span>
            )}
          </div>
          <nav className="p-4 flex-1">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-2 rounded-md transition ${isActive
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom area: Notifications & Sign Out */}
          <div className="p-4 border-t border-slate-700 space-y-2 relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
              </svg>
              Notifications
            </button>

            {showNotifications && (
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

