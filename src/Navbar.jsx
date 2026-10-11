
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Recycle, Menu, X, UserCircle } from "lucide-react";
import { supabase } from "./lib/supabase.js";

const links = [
  { name: "Home", path: "/home" },
  { name: "Explore", path: "/explore" },
  { name: "My Listings", path: "/my-listings" },
  { name: "About", path: "/about" },
  { name: "How It Works", path: "/how-it-works" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out failed:", error);
      return;
    }

    setMenuOpen(false);
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-green-100 text-green-800"
        : "text-gray-600 hover:bg-gray-100 hover:text-green-800"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/home"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white">
            <Recycle size={24} />
          </span>

          <span>
            <span className="block text-lg font-extrabold tracking-tight text-gray-900">
              Waste2Worth
            </span>
            <span className="block text-xs text-gray-500">
              Give items a second life
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={linkClass}
            >
              {link.name}
            </NavLink>
          ))}

          <Link
            to="/add-item"
            className="ml-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-800"
          >
            + Add Item
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="ml-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            <UserCircle size={18} />
            Sign Out
          </button>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={linkClass}
              >
                {link.name}
              </NavLink>
            ))}

            <Link
              to="/add-item"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-green-700 px-4 py-3 text-center font-bold text-white"
            >
              + Add Item
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-xl border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}