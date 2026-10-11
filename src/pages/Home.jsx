
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Recycle,
  Search,
  Heart,
  Leaf,
  Package,
  Users,
  HandHeart,
  CheckCircle2,
  Sofa,
  BookOpen,
  Shirt,
  Laptop,
  Menu,
  X,
  MapPin,
  Sparkles,
  LogOut,
  UserRound,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";

const categories = [
  { name: "Furniture", icon: Sofa, color: "bg-orange-50 text-orange-600" },
  { name: "Books", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
  { name: "Clothing", icon: Shirt, color: "bg-pink-50 text-pink-600" },
  { name: "Electronics", icon: Laptop, color: "bg-violet-50 text-violet-600" },
  { name: "Household", icon: Package, color: "bg-amber-50 text-amber-600" },
  { name: "Other", icon: Recycle, color: "bg-emerald-50 text-emerald-700" },
];

const demoItems = [
  {
    id: 1,
    title: "Comfortable Study Chair",
    category: "Furniture",
    location: "Mumbai",
    type: "Donation",
    condition: "Good condition",
    icon: Sofa,
    color: "bg-orange-50 text-orange-600",
  },
  {
    id: 2,
    title: "Engineering Textbooks",
    category: "Books",
    location: "Palghar",
    type: "Exchange",
    condition: "Gently used",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: 3,
    title: "Everyday Clothing Bundle",
    category: "Clothing",
    location: "Thane",
    type: "Donation",
    condition: "Good condition",
    icon: Shirt,
    color: "bg-pink-50 text-pink-600",
  },
];

const impactStats = [
  { value: "Community", label: "People helping people", icon: Users },
  { value: "Reuse", label: "Useful items get a new life", icon: RefreshCw },
  { value: "Together", label: "Building a greener future", icon: Leaf },
];

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
      <Sparkles size={15} />
      {children}
    </span>
  );
}

function Home() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("Could not load session:", error.message);
      }

      setUser(data?.session?.user ?? null);
      setAuthLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Could not log out: " + error.message);
      return;
    }

    closeMenu();
    navigate("/home", { replace: true });
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchText.trim();
    navigate(query ? `/explore?search=${encodeURIComponent(query)}` : "/explore");
  };

  const navLinks = [
    { label: "Home", path: "/home" },
    { label: "Explore Items", path: "/explore" },
    { label: "How It Works", path: "/how-it-works" },
    { label: "About Us", path: "/about" },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-800">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/home"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
              <Recycle size={25} />
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight text-slate-900">
                Waste<span className="text-emerald-700">2</span>Worth
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Share more. Waste less.
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {authLoading ? (
              <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-100" />
            ) : user ? (
              <>
                <Link
                  to="/my-listings"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
                >
                  <UserRound size={18} />
                  My Account
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  <LogOut size={17} />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
                >
                  Log in
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
                >
                  Get Started <ArrowRight className="ml-1 inline" size={16} />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    to="/add-item"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-emerald-50"
                  >
                    Add an Item
                  </Link>
                  <Link
                    to="/my-listings"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-emerald-50"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/requests"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-emerald-50"
                  >
                    My Requests & Messages
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-left font-bold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="mt-2 rounded-xl bg-emerald-700 px-4 py-3 text-center font-bold text-white"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO */}
        <section className="relative isolate">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-lime-50" />
          <div className="absolute -right-32 top-0 -z-10 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="absolute -left-32 bottom-0 -z-10 h-80 w-80 rounded-full bg-lime-100/60 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-2 lg:py-32">
            <div>
              <SectionLabel>A community-powered circular economy</SectionLabel>

              <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                One person's
                <span className="block text-emerald-700">unused item.</span>
                Another person's
                <span className="block">new beginning.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Give useful things a second life. Donate what you no longer
                need, exchange items with your community, and find things that
                can make someone else's day better.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={user ? "/add-item" : "/login"}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-7 py-4 font-bold text-white shadow-xl shadow-emerald-700/20 transition hover:-translate-y-1 hover:bg-emerald-800"
                >
                  <HandHeart size={20} />
                  Share an Item
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/explore"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <Search size={19} />
                  Explore Items
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-600" />
                  Free to join
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-600" />
                  Community focused
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-600" />
                  Reduce waste
                </span>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-5 rounded-[3rem] bg-emerald-100/60 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-5 shadow-2xl shadow-emerald-950/10 sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Small actions, meaningful impact
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                      Good things go around.
                    </h2>
                  </div>
                  <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <Leaf size={26} />
                  </span>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-emerald-50 p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                      <HandHeart size={25} />
                    </span>
                    <h3 className="mt-4 font-extrabold text-slate-900">
                      Give with purpose
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Pass useful items to people who need them.
                    </p>
                  </div>

                  <div className="rounded-3xl bg-amber-50 p-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                      <RefreshCw size={25} />
                    </span>
                    <h3 className="mt-4 font-extrabold text-slate-900">
                      Exchange locally
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Find something useful in return.
                    </p>
                  </div>

                  <div className="col-span-2 rounded-3xl bg-slate-950 p-5 text-white sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                        <Recycle size={30} />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold">
                          Waste less. Help more.
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          Every reusable item can have another purpose.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-3/4 rounded-full bg-emerald-400" />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      A better future starts with our everyday choices.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-50 text-lime-700">
                    <Heart size={21} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Your unused items still have value.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Find them a new home on Waste2Worth.
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-5 top-1/4 hidden items-center gap-2 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl sm:flex">
                <span className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <Recycle size={19} />
                </span>
                <span className="text-sm font-bold text-slate-800">
                  Reuse, rethink, repeat
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="relative z-10 mx-auto -mt-5 max-w-5xl px-5 sm:px-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-900/5 sm:flex-row sm:items-center sm:p-5"
          >
            <Search className="ml-2 hidden text-emerald-700 sm:block" size={23} />
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search furniture, books, clothes, electronics..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 sm:border-0 sm:focus:ring-0"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-800"
            >
              Search Items <ArrowRight size={17} />
            </button>
          </form>
        </section>

        {/* CATEGORIES */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>Explore by category</SectionLabel>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Find something useful.
              </h2>
              <p className="mt-3 max-w-xl leading-7 text-slate-600">
                Discover pre-loved items shared by people in your community.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 font-bold text-emerald-700 hover:text-emerald-900"
            >
              Browse all items <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(({ name, icon: Icon, color }) => (
              <Link
                key={name}
                to={`/explore?category=${encodeURIComponent(name)}`}
                className="group rounded-3xl border border-slate-100 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 sm:p-6"
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} transition group-hover:scale-105`}
                >
                  <Icon size={26} />
                </span>
                <h3 className="mt-4 font-extrabold text-slate-900">{name}</h3>
                <p className="mt-1 text-xs text-slate-500">Explore items</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED ITEMS */}
        <section className="bg-slate-50 py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <SectionLabel>Discover and reuse</SectionLabel>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Give good things another life.
                </h2>
                <p className="mt-3 max-w-xl leading-7 text-slate-600">
                  These are illustrative examples of the kinds of items people
                  can share on Waste2Worth.
                </p>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 font-bold text-emerald-700 hover:text-emerald-900"
              >
                Explore the community <ArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {demoItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-3xl border border-slate-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5"
                  >
                    <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-lime-50">
                      <span
                        className={`flex h-24 w-24 items-center justify-center rounded-[2rem] ${item.color}`}
                      >
                        <Icon size={43} strokeWidth={1.5} />
                      </span>
                      <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-emerald-800 shadow-sm">
                        {item.type}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {item.category}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {item.condition}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin size={15} className="text-emerald-700" />
                        {item.location}
                      </p>
                      <Link
                        to="/explore"
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 font-bold text-emerald-800 transition hover:bg-emerald-50"
                      >
                        View Available Items <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Sample cards are demonstrations; live listings are available on
              the Explore page.
            </p>
          </div>
        </section>

        {/* IMPACT */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24">
          <div className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white sm:px-12 sm:py-16">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-emerald-300">
                <Leaf size={16} /> The Waste2Worth mission
              </span>
              <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">
                Make sustainability a part of everyday life.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
                A reusable item should not become waste just because one person
                no longer needs it. Let's make sharing, donating, and exchanging
                a natural part of our communities.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
              {impactStats.map(({ value, label, icon: Icon }) => (
                <div
                  key={value}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
                >
                  <Icon className="mx-auto text-emerald-300" size={28} />
                  <p className="mt-4 text-xl font-black">{value}</p>
                  <p className="mt-2 text-sm text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-20 sm:px-8 md:pb-24">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-emerald-50 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
              <HandHeart size={32} />
            </div>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Your next small act of kindness starts here.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
              Share something you no longer need or find something useful from
              someone nearby.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to={user ? "/add-item" : "/login"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-7 py-4 font-bold text-white transition hover:bg-emerald-800"
              >
                {user ? "List an Item" : "Join Waste2Worth"}
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-7 py-4 font-bold text-emerald-800 transition hover:bg-emerald-100"
              >
                Explore Items
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link to="/home" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <Recycle size={22} />
            </span>
            <span>
              <span className="block font-black text-slate-900">
                Waste<span className="text-emerald-700">2</span>Worth
              </span>
              <span className="text-xs text-slate-500">
                Share more. Waste less.
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
            <Link to="/explore" className="hover:text-emerald-700">
              Explore
            </Link>
            <Link to="/how-it-works" className="hover:text-emerald-700">
              How It Works
            </Link>
            <Link to="/about" className="hover:text-emerald-700">
              About
            </Link>
            <Link to="/requests" className="hover:text-emerald-700">
              Requests & Messages
            </Link>
          </div>

          <p className="text-sm text-slate-500">
            Made for a more sustainable community.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;