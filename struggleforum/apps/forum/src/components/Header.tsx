"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth/AuthProvider";
import { apiFetch } from "@/src/lib/api-client";
import { apiRoutes } from "@/src/lib/api-routes";
import type { Notification } from "@/src/lib/types";

const NOTIFICATION_POLL_MS = 60_000;

export default function Header() {
  const { user, status, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  const navLinkClass = (href: string) =>
    pathname === href
      ? "font-semibold text-sky-300"
      : "text-white/90 hover:text-white";

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let active = true;

    const refreshUnreadCount = () => {
      apiFetch<{ notifications: Notification[] }>(
        apiRoutes.notifications.collection,
      )
        .then(({ notifications }) => {
          if (!active) return;
          setUnreadCount(notifications.filter((n) => !n.isRead).length);
        })
        .catch(() => {});
    };

    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, NOTIFICATION_POLL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [status]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-slate-800/80 px-5 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
      <Link href="/" className="select-none text-3xl font-bold text-sky-400">
        SF
      </Link>

      {status === "authenticated" && user ? (
        <div className="flex items-center gap-4">
          <Link
            href="/notifications"
            className={`relative text-lg ${navLinkClass("/notifications")}`}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-sky-500 px-1.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            href={`/users/${user.id}`}
            className={`flex items-center gap-2 ${navLinkClass(`/users/${user.id}`)}`}
          >
            {user.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- avatar URLs are arbitrary user-supplied domains, unknown ahead of time
              <img
                src={user.avatarUrl}
                alt=""
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            )}
            <span className="font-semibold">{user.username}</span>
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="text-white/90 hover:text-white"
          >
            Log out
          </button>
        </div>
      ) : status === "unauthenticated" ? (
        <div className="flex items-center gap-4">
          <Link href="/login" className={navLinkClass("/login")}>
            Login
          </Link>
          <Link href="/register" className={navLinkClass("/register")}>
            Register
          </Link>
        </div>
      ) : null}
    </header>
  );
}
