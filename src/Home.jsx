
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Recycle,
  Search,
  MapPin,
  Heart,
  Leaf,
  HandHeart,
  Users,
  Package,
  Shirt,
  BookOpen,
  Sofa,
  Laptop,
  Bike,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  Plus,
  Sprout,
  Gift,
} from "lucide-react";

const categories = [
  { name: "All Items", icon: Package },
  { name: "Electronics", icon: Laptop },
  { name: "Books", icon: BookOpen },
  { name: "Clothing", icon: Shirt },
  { name: "Furniture", icon: Sofa },
  { name: "Sports", icon: Bike },
];

const initialItems = [
  {
    id: 1,
    title: "Study Table",
    category: "Furniture",
    condition: "Good condition",
    location: "Palghar, Maharashtra",
    mode: "Free Donation",
    emoji: "🪑",
    background: "#E7EFE3",
    owner: "Aarav",
  },
  {
    id: 2,
    title: "Engineering Books",
    category: "Books",
    condition: "Like new",
    location: "Boisar, Maharashtra",
    mode: "Exchange",
    emoji: "📚",
    background: "#F5E9D5",
    owner: "Riya",
  },
  {
    id: 3,
    title: "Wireless Headphones",
    category: "Electronics",
    condition: "Good condition",
    location: "Mumbai, Maharashtra",
    mode: "Free Donation",
    emoji: "🎧",
    background: "#E7E9FA",
    owner: "Kabir",
  },
  {
    id: 4,
    title: "Casual Denim Jacket",
    category: "Clothing",
    condition: "Gently used",
    location: "Thane, Maharashtra",
    mode: "Exchange",
    emoji: "🧥",
    background: "#DDECF5",
    owner: "Anaya",
  },
  {
    id: 5,
    title: "Mountain Bicycle",
    category: "Sports",
    condition: "Good condition",
    location: "Navi Mumbai, Maharashtra",
    mode: "Free Donation",
    emoji: "🚲",
    background: "#E4F1E8",
    owner: "Rehan",
  },
  {
    id: 6,
    title: "Wooden Bookshelf",
    category: "Furniture",
    condition: "Gently used",
    location: "Vasai, Maharashtra",
    mode: "Exchange",
    emoji: "🗄️",
    background: "#F2E6DC",
    owner: "Meera",
  },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", to: "/home" },
    { label: "Explore Items", to: "/explore" },
    { label: "My Listings", to: "/my-listings" },
    { label: "How It Works", to: "/how-it-works" },
    { label: "About Us", to: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link
          to="/home"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
            <Recycle size={23} />
          </span>

          <span className="text-xl font-extrabold tracking-tight text-brand-900">
            Waste<span className="text-brand-600">2</span>Worth
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-semibold text-slate-600 transition hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-brand-800 transition hover:bg-brand-50"
          >
            Log in
          </Link>

          <Link
            to="/add-item"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus size={16} />
            Add an item
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-xl p-2 text-brand-800 hover:bg-brand-50 md:hidden"
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-emerald-100 bg-white px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-brand-50 hover:text-brand-800"
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/add-item"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-bold text-white"
            >
              + Add an item
            </Link>

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl border border-brand-100 px-4 py-3 text-center text-sm font-bold text-brand-800"
            >
              Log in / Join
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function ItemCard({ item }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10">
      <div
        className="relative flex h-48 items-center justify-center overflow-hidden"
        style={{ backgroundColor: item.background }}
      >
        <span className="text-8xl transition duration-300 group-hover:scale-110">
          {item.emoji}
        </span>

        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-brand-800 shadow-sm">
          {item.mode}
        </span>

        <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600">
          {item.condition}
        </span>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              {item.category}
            </p>
            <h3 className="text-lg font-extrabold text-slate-900">
              {item.title}
            </h3>
          </div>

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Gift size={18} />
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={15} className="shrink-0 text-brand-600" />
          <span>{item.location}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-800">
              {item.owner.charAt(0)}
            </span>
            <span className="text-sm font-semibold text-slate-600">
              {item.owner}
            </span>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-900"
          >
            View item <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-brand-600">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 leading-7 text-slate-500">{description}</p>
    </div>
  );
}

function Home() {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All Items" || item.category === activeCategory;

      const searchableText =
        `${item.title} ${item.category} ${item.location} ${item.mode}`.toLowerCase();

      return (
        matchesCategory &&
        searchableText.includes(searchQuery.toLowerCase())
      );
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f8fbf8]">
      <Navbar />

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-lime-100/50 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-10 lg:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-2 shadow-sm">
                <Sparkles size={15} className="text-brand-600" />
                <span className="text-xs font-bold text-brand-800 sm:text-sm">
                  Small actions. A greener tomorrow.
                </span>
              </div>

              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-900 sm:text-5xl lg:text-6xl">
                Your unused things can become{" "}
                <span className="text-brand-600">
                  someone's treasure.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Give useful things a second life. Donate what you no longer
                need, exchange with your community, and discover items that
                deserve a new home.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/explore"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-4 font-bold text-white shadow-lg shadow-brand-600/20 transition hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  Explore available items <ArrowRight size={18} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-white px-6 py-4 font-bold text-brand-800 transition hover:bg-brand-50"
                >
                  <Plus size={18} /> Share an item
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-brand-600" />
                  Free to join
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-brand-600" />
                  Community-powered
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-brand-600" />
                  Less waste
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -right-3 top-12 h-32 w-32 rounded-full bg-lime-200/60 blur-2xl" />
              <div className="absolute -bottom-3 left-0 h-32 w-32 rounded-full bg-emerald-200/70 blur-2xl" />

              <div className="relative rounded-[2rem] border border-white bg-white p-4 shadow-2xl shadow-emerald-900/10 sm:p-6">
                <div className="flex items-center justify-between px-2 pb-5">
                  <div>
                    <p className="text-sm font-bold text-brand-900">
                      The circle of giving
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Good things keep moving
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Sprout size={23} />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex min-h-44 flex-col justify-between rounded-3xl bg-[#e8f3e8] p-4">
                    <span className="text-5xl">📚</span>
                    <div>
                      <p className="font-extrabold text-brand-900">Share</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Pass useful things forward.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex min-h-44 flex-col justify-between rounded-3xl bg-[#f7edda] p-4">
                    <span className="text-5xl">🤝</span>
                    <div>
                      <p className="font-extrabold text-brand-900">
                        Exchange
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Trade things you value.
                      </p>
                    </div>
                  </div>

                  <div className="flex min-h-44 flex-col justify-between rounded-3xl bg-[#e5edf8] p-4">
                    <span className="text-5xl">🪴</span>
                    <div>
                      <p className="font-extrabold text-brand-900">Reuse</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Give items a fresh purpose.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex min-h-44 flex-col justify-between rounded-3xl bg-[#f4e7e8] p-4">
                    <span className="text-5xl">💚</span>
                    <div>
                      <p className="font-extrabold text-brand-900">
                        Make an impact
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Start right in your community.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-brand-900 p-4 text-white">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <HandHeart size={23} />
                  </span>
                  <div>
                    <p className="text-sm font-bold">
                      One person's extra is another's essential.
                    </p>
                    <p className="mt-1 text-xs text-emerald-100">
                      Together, we make reuse meaningful.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-brand-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 sm:px-8 md:grid-cols-4 lg:px-10">
            {[
              { value: "Reuse", label: "Before you discard", icon: Recycle },
              { value: "Share", label: "What you don't need", icon: HandHeart },
              { value: "Connect", label: "With nearby people", icon: Users },
              { value: "Care", label: "For our planet", icon: Leaf },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.value} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon size={21} />
                  </span>
                  <div>
                    <p className="font-extrabold text-brand-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <SectionHeading
            eyebrow="Discover something useful"
            title="Give good things a second chance."
            description="Explore items shared by our sample community. Filter by category or search for something you need."
          />

          <div className="mx-auto mb-8 max-w-2xl">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
              <Search size={20} className="shrink-0 text-brand-600" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search books, furniture, electronics..."
                aria-label="Search items"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <span className="hidden rounded-lg bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700 sm:inline">
                Search
              </span>
            </div>
          </div>

          <div className="mb-9 flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.name;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setActiveCategory(category.name)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/15"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                  }`}
                >
                  <Icon size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.slice(0, 6).map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
              <Search size={34} className="mx-auto text-brand-600" />
              <h3 className="mt-4 text-xl font-extrabold text-brand-900">
                No matching items found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Try another keyword or select a different category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All Items");
                }}
                className="mt-5 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-6 py-3.5 text-sm font-bold text-brand-800 transition hover:bg-brand-50"
            >
              Explore all listings <ArrowRight size={17} />
            </Link>
            <p className="mt-3 text-xs text-slate-400">
              These are demonstration listings. Real community listings will
              be connected later.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="Simple by design"
              title="Three steps. One better world."
              description="You don't need to throw something away just because you no longer need it."
            />

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  number: "01",
                  icon: Package,
                  title: "List an item",
                  description:
                    "Share a clear description of something usable that you want to donate or exchange.",
                  color: "bg-[#e6f4e9]",
                },
                {
                  number: "02",
                  icon: Users,
                  title: "Find your person",
                  description:
                    "Explore available items and connect with people in your local community.",
                  color: "bg-[#f6eddc]",
                },
                {
                  number: "03",
                  icon: Heart,
                  title: "Pass it forward",
                  description:
                    "Arrange a safe handover and help something useful find its next home.",
                  color: "bg-[#e8ecfa]",
                },
              ].map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="rounded-3xl border border-slate-100 bg-[#fcfdfc] p-7 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold tracking-widest text-brand-600">
                        STEP {step.number}
                      </span>
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.color} text-brand-800`}
                      >
                        <Icon size={23} />
                      </span>
                    </div>

                    <h3 className="mt-7 text-xl font-extrabold text-brand-900">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-9 text-center">
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 font-bold text-brand-700 hover:text-brand-900"
              >
                Learn how it works <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-brand-900 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-lime-300/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-emerald-200">
                <HandHeart size={29} />
              </span>
              <h2 className="mt-6 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Have something useful to share?
              </h2>
              <p className="mt-4 leading-7 text-emerald-100/80">
                Your unused items could make someone's day. Join a community
                that believes good things should keep going.
              </p>
              <Link
                to="/login"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-extrabold text-brand-900 transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                Become a community member <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <Link to="/home" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Recycle size={20} />
            </span>
            <span className="font-extrabold text-brand-900">
              Waste<span className="text-brand-600">2</span>Worth
            </span>
          </Link>

          <p className="text-sm text-slate-500">
            Give items a second life. Build a better tomorrow.
          </p>

          <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-600">
            <Link to="/about" className="hover:text-brand-700">
              About
            </Link>
            <Link to="/how-it-works" className="hover:text-brand-700">
              How it works
            </Link>
            <Link to="/explore" className="hover:text-brand-700">
              Explore
            </Link>
            <Link to="/my-listings" className="hover:text-brand-700">
              My Listings
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Waste2Worth. Built for a more circular
          future.
        </div>
      </footer>
    </div>
  );
}

export default Home;