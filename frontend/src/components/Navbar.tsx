import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AppLogo } from "./AppLogo";
import { Button } from "./Button";

const navPillClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-gray-900 text-white"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
  ].join(" ");

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menuOpen]);

  const initial =
    user?.first_name?.trim().charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "?";

  return (
    <header className="mx-auto w-full max-w-6xl">
      <nav className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 shadow-md ring-1 ring-black/5 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center" onClick={closeMenu}>
          <AppLogo className="h-12 w-auto max-w-[min(100%,11rem)] object-contain sm:h-9 sm:max-w-56" />
        </Link>

        <div className="flex flex-1 flex-wrap items-center justify-center gap-1 sm:gap-2">
          <NavLink to="/" end className={navPillClass} onClick={closeMenu}>
            Explore
          </NavLink>
          {!isAdmin && (
            <>
              <NavLink
                to="/my-plan"
                className={navPillClass}
                onClick={closeMenu}
              >
                My plan
              </NavLink>
              <NavLink
                to="/calendar"
                className={navPillClass}
                onClick={closeMenu}
              >
                Calendar
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navPillClass} onClick={closeMenu}>
              Create
            </NavLink>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className="hidden max-w-44 cursor-default items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5 text-sm text-gray-400 lg:inline-flex"
            aria-hidden
          >
            <span className="text-gray-400">⌕</span>
            <span>Search</span>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
            aria-label="Notifications"
          >
            <span className="text-lg leading-none">🔔</span>
          </button>

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-controls="account-menu"
                id="account-menu-button"
                aria-label="Account menu"
              >
                {initial}
              </button>
              {menuOpen && (
                <div
                  id="account-menu"
                  role="menu"
                  aria-labelledby="account-menu-button"
                  className="absolute right-0 top-full z-50 mt-2 min-w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg ring-1 ring-black/5"
                >
                  <p className="border-b border-gray-100 px-3 pb-2 text-xs text-gray-500">
                    Hi, {user.first_name.trim() || "there"}
                  </p>
                  <div className="px-2 pt-2">
                    <Button
                      variant="outline"
                      fullWidth
                      text="Log out"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="text-gray-700"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
