
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Recycle,
  Search,
  MapPin,
  Plus,
  RefreshCw,
  Package,
  BookOpen,
  Shirt,
  Armchair,
  Laptop,
  Gamepad2,
  CookingPot,
  GraduationCap,
  HandHeart,
  ArrowRight,
  AlertCircle,
  LoaderCircle,
  Pencil,
  Trash2,
  X,
  Handshake,
  CheckCircle2,
  Menu,
  LogOut,
  UserRound,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";

const categories = [
  "All",
  "Electronics",
  "Clothing",
  "Books",
  "Furniture",
  "Home & Kitchen",
  "Toys",
  "School Supplies",
  "Food & Groceries",
  "Other",
];

const categoryIcons = {
  Electronics: Laptop,
  Clothing: Shirt,
  Books: BookOpen,
  Furniture: Armchair,
  "Home & Kitchen": CookingPot,
  Toys: Gamepad2,
  "School Supplies": GraduationCap,
  "Food & Groceries": HandHeart,
  Other: Package,
};

const conditionLabels = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
  for_parts: "For parts",
  not_applicable: "Not applicable",
};

const typeLabels = {
  donation: "Free donation",
  exchange: "Exchange",
  request: "Community request",
};

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStoragePath(publicUrl) {
  if (!publicUrl) return null;

  try {
    const url = new URL(publicUrl);
    const marker = "/object/public/item-images/";
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(
      url.pathname.slice(index + marker.length)
    );
  } catch {
    return null;
  }
}

function ListingCard({
  item,
  isOwner,
  currentUserId,
  onDelete,
  onLoginRequired,
}) {
  const Icon = categoryIcons[item.category] || Package;

  const [imageFailed, setImageFailed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestFullName, setRequestFullName] = useState("");
  const [requestMobile, setRequestMobile] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");

    try {
      await onDelete(item);
    } catch (err) {
      setDeleteError(err.message || "Could not delete this listing.");
      setDeleting(false);
    }
  }

  async function handleRequestSubmit(event) {
    event.preventDefault();
    setRequestError("");
    setRequestSuccess(false);

    if (!currentUserId) {
      onLoginRequired();
      return;
    }

    const fullName = requestFullName.trim();
    const mobile = requestMobile.trim();
    const email = requestEmail.trim().toLowerCase();
    const message = requestMessage.trim();
    const digitsOnly = mobile.replace(/\D/g, "");

    if (fullName.length < 2) {
      setRequestError("Please enter your full name.");
      return;
    }

    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      setRequestError("Please enter a valid mobile number.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRequestError("Please enter a valid email address.");
      return;
    }

    if (currentUserId === item.user_id) {
      setRequestError("You cannot request your own listing.");
      return;
    }

    if (item.status !== "available") {
      setRequestError("This listing is no longer available.");
      return;
    }

    if (!["donation", "exchange"].includes(item.listing_type)) {
      setRequestError(
        "Only donation and exchange listings can be requested."
      );
      return;
    }

    setSubmittingRequest(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user || user.id !== currentUserId) {
        onLoginRequired();
        return;
      }

      const { data: existingRequest, error: lookupError } =
        await supabase
          .from("requests")
          .select("id, status")
          .eq("item_id", item.id)
          .eq("requester_id", user.id)
          .in("status", ["pending", "accepted"])
          .limit(1)
          .maybeSingle();

      if (lookupError) throw lookupError;

      if (existingRequest) {
        throw new Error(
          "You already have an active request for this item. Check My Requests."
        );
      }

      const { error: insertError } = await supabase
        .from("requests")
        .insert({
          item_id: item.id,
          requester_id: user.id,
          owner_id: item.user_id,
          requester_full_name: fullName,
          requester_mobile: mobile,
          requester_email: email,
          message: message || null,
          request_type: item.listing_type,
          status: "pending",
        });

      if (insertError) throw insertError;

      setRequestSuccess(true);
      setRequestFullName("");
      setRequestMobile("");
      setRequestEmail("");
      setRequestMessage("");
    } catch (err) {
      console.error("Could not create item request:", err);
      setRequestError(
        err.message || "Could not submit your request. Please try again."
      );
    } finally {
      setSubmittingRequest(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <article className="group overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 to-lime-50">
        {item.image_url && !imageFailed ? (
          <img
            src={item.image_url}
            alt={item.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-emerald-700 shadow-sm">
            <Icon size={44} strokeWidth={1.5} />
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
          {typeLabels[item.listing_type] || item.listing_type}
        </span>

        {isOwner && (
          <span className="absolute right-4 top-4 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">
            Your listing
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
            {item.category}
          </span>
          <span className="text-xs text-slate-400">
            {formatDate(item.created_at)}
          </span>
        </div>

        <h2 className="text-lg font-extrabold text-emerald-950">
          {item.title}
        </h2>

        <p className="mt-2 min-h-12 whitespace-pre-line break-words text-sm leading-6 text-slate-500">
          {item.description || "No description provided."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {conditionLabels[item.item_condition] || item.item_condition}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
          <MapPin size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>
            {[item.location, item.city].filter(Boolean).join(", ") ||
              "Location not specified"}
          </span>
        </div>

        {isOwner ? (
          <div className="mt-5 border-t border-slate-100 pt-4">
            {!confirmDelete ? (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={`/edit-item/${item.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-3 text-sm font-bold text-white hover:bg-emerald-800"
                >
                  <Pencil size={16} />
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-bold text-red-800">
                  Delete this listing?
                </p>
                <p className="mt-1 text-xs text-red-700">
                  This action cannot be undone.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border bg-white px-3 py-2 text-sm font-bold disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {deleting ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {deleting ? "Deleting..." : "Confirm"}
                  </button>
                </div>

                {deleteError && (
                  <p role="alert" className="mt-3 text-xs text-red-800">
                    {deleteError}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : item.listing_type === "request" ? (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-bold">Community request</p>
              <p className="mt-1 text-xs leading-5">
                This person is looking for an item, rather than offering one.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => {
                if (!currentUserId) {
                  onLoginRequired();
                  return;
                }

                setRequestOpen((open) => !open);
                setRequestError("");
                setRequestSuccess(false);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800"
            >
              <Handshake size={17} />
              Request Item
              <ArrowRight size={17} />
            </button>

            {requestSuccess && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <p className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={17} />
                  Request submitted successfully!
                </p>
                <Link
                  to="/requests"
                  className="mt-2 inline-block font-bold underline"
                >
                  View My Requests
                </Link>
              </div>
            )}

            {requestOpen && !requestSuccess && (
              <form
                onSubmit={handleRequestSubmit}
                className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4"
              >
                <h3 className="font-bold text-emerald-950">
                  {item.listing_type === "exchange"
                    ? "Request an exchange"
                    : "Request this donation"}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Your contact details will be included with your request.
                </p>

                <label
                  htmlFor={`request-name-${item.id}`}
                  className="mt-4 block text-sm font-semibold text-slate-700"
                >
                  Full name *
                </label>
                <input
                  id={`request-name-${item.id}`}
                  type="text"
                  autoComplete="name"
                  value={requestFullName}
                  onChange={(event) =>
                    setRequestFullName(event.target.value)
                  }
                  maxLength={100}
                  required
                  placeholder="Enter your full name"
                  className={fieldClass}
                />

                <label
                  htmlFor={`request-mobile-${item.id}`}
                  className="mt-4 block text-sm font-semibold text-slate-700"
                >
                  Mobile number *
                </label>
                <input
                  id={`request-mobile-${item.id}`}
                  type="tel"
                  autoComplete="tel"
                  value={requestMobile}
                  onChange={(event) =>
                    setRequestMobile(event.target.value)
                  }
                  maxLength={20}
                  required
                  placeholder="Enter your mobile number"
                  className={fieldClass}
                />

                <label
                  htmlFor={`request-email-${item.id}`}
                  className="mt-4 block text-sm font-semibold text-slate-700"
                >
                  Email address *
                </label>
                <input
                  id={`request-email-${item.id}`}
                  type="email"
                  autoComplete="email"
                  value={requestEmail}
                  onChange={(event) =>
                    setRequestEmail(event.target.value)
                  }
                  maxLength={254}
                  required
                  placeholder="you@example.com"
                  className={fieldClass}
                />

                <label
                  htmlFor={`request-message-${item.id}`}
                  className="mt-4 block text-sm font-semibold text-slate-700"
                >
                  Message to owner (optional)
                </label>
                <textarea
                  id={`request-message-${item.id}`}
                  value={requestMessage}
                  onChange={(event) =>
                    setRequestMessage(event.target.value)
                  }
                  maxLength={500}
                  rows={3}
                  placeholder={
                    item.listing_type === "exchange"
                      ? "What would you like to exchange?"
                      : "Introduce yourself or explain why you need this item..."
                  }
                  className={`${fieldClass} resize-y`}
                />

                {requestError && (
                  <p role="alert" className="mt-3 text-sm text-red-700">
                    {requestError}
                    {requestError.toLowerCase().includes("active request") && (
                      <>
                        {" "}
                        <Link
                          to="/requests"
                          className="font-bold underline"
                        >
                          View My Requests
                        </Link>
                      </>
                    )}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {submittingRequest && (
                      <LoaderCircle size={16} className="animate-spin" />
                    )}
                    {submittingRequest ? "Sending..." : "Send Request"}
                  </button>

                  <button
                    type="button"
                    disabled={submittingRequest}
                    onClick={() => {
                      setRequestOpen(false);
                      setRequestError("");
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Explore() {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState(
    () => new URLSearchParams(window.location.search).get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => new URLSearchParams(window.location.search).get("category") || "All"
  );
  const [selectedType, setSelectedType] = useState("All");

  const userId = user?.id ?? null;

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError) {
        console.error("Could not load session:", sessionError.message);
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    const searchTerm = params.get("search");

    setSelectedCategory(
      category && categories.includes(category) ? category : "All"
    );
    setSearch(searchTerm || "");
  }, [location.search]);

  const fetchItems = useCallback(async (isRefresh = false) => {
    setError("");
    setActionError("");

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("items")
        .select(
          "id, user_id, title, description, category, listing_type, item_condition, location, city, image_url, status, created_at"
        )
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err) {
      console.error("Failed to load community items:", err);
      setError(
        err.message ||
          "Could not load listings. Check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleLogout() {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      alert("Could not log out: " + logoutError.message);
      return;
    }

    setMenuOpen(false);
    navigate("/explore", { replace: true });
  }

  function requireLogin() {
    navigate("/login", { state: { from: location } });
  }

  async function deleteItem(item) {
    setActionError("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError) throw authError;

    const currentUser = authData?.user;

    if (!currentUser || currentUser.id !== item.user_id) {
      throw new Error("You can only delete your own listings.");
    }

    const { data: deletedItems, error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", item.id)
      .eq("user_id", currentUser.id)
      .select("id");

    if (deleteError) throw deleteError;

    if (!deletedItems || deletedItems.length === 0) {
      throw new Error(
        "Listing was not deleted. Check your login and Supabase permissions."
      );
    }

    setItems((previous) =>
      previous.filter((existing) => existing.id !== item.id)
    );

    const imagePath = getStoragePath(item.image_url);

    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from("item-images")
        .remove([imagePath]);

      if (storageError) {
        console.error("Image cleanup failed:", storageError);
        setActionError(
          "Listing deleted, but its image could not be removed from storage."
        );
      }
    }
  }

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      const searchableText = [
        item.title,
        item.description,
        item.category,
        item.city,
        item.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!term || searchableText.includes(term)) &&
        (selectedCategory === "All" ||
          item.category === selectedCategory) &&
        (selectedType === "All" ||
          item.listing_type === selectedType)
      );
    });
  }, [items, search, selectedCategory, selectedType]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#f8fbf8] text-[#18352a]">
      <header className="sticky top-0 z-30 border-b border-emerald-100 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link
            to="/home"
            onClick={closeMenu}
            className="flex shrink-0 items-center gap-3"
          >
            <div className="rounded-xl bg-emerald-700 p-2.5 text-white">
              <Recycle size={24} />
            </div>
            <div>
              <span className="text-xl font-black text-emerald-950">
                Waste<span className="text-emerald-600">2</span>Worth
              </span>
              <p className="text-xs text-slate-500">
                Give items a second life
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-5 text-sm font-semibold text-slate-600 lg:flex">
            <Link to="/home" className="hover:text-emerald-700">
              Home
            </Link>
            <Link to="/explore" className="text-emerald-700">
              Explore
            </Link>
            {user && (
              <>
                <Link to="/requests" className="hover:text-emerald-700">
                  My Requests
                </Link>
                <Link to="/my-listings" className="hover:text-emerald-700">
                  My Account
                </Link>
              </>
            )}
            <Link to="/how-it-works" className="hover:text-emerald-700">
              How it works
            </Link>
            <Link to="/about" className="hover:text-emerald-700">
              About
            </Link>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {!authLoading && !user ? (
              <Link
                to="/login"
                className="rounded-xl px-3 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50"
              >
                Log in / Sign up
              </Link>
            ) : !authLoading && user ? (
              <>
                <Link
                  to="/my-listings"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50"
                >
                  <UserRound size={17} />
                  My Account
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-3 text-sm font-bold text-white hover:bg-emerald-800"
                >
                  <LogOut size={17} />
                  Log Out
                </button>
              </>
            ) : null}

            <Link
              to={user ? "/add-item" : "/login"}
              state={!user ? { from: { pathname: "/add-item" } } : undefined}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800"
            >
              <Plus size={18} />
              <span className="hidden xl:inline">Add an item</span>
              <span className="xl:hidden">Add</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            className="rounded-xl border border-emerald-100 p-2.5 text-emerald-900 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-emerald-100 bg-white px-5 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <Link to="/home" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold hover:bg-emerald-50">
                Home
              </Link>
              <Link to="/explore" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold text-emerald-800 hover:bg-emerald-50">
                Explore Items
              </Link>
              <Link to="/how-it-works" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold hover:bg-emerald-50">
                How It Works
              </Link>
              <Link to="/about" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold hover:bg-emerald-50">
                About Us
              </Link>

              {user ? (
                <>
                  <Link to="/add-item" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold hover:bg-emerald-50">
                    Add an Item
                  </Link>
                  <Link to="/my-listings" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold hover:bg-emerald-50">
                    My Account
                  </Link>
                  <Link to="/requests" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold hover:bg-emerald-50">
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
                <>
                  <Link to="/login" onClick={closeMenu} className="rounded-xl px-4 py-3 font-semibold hover:bg-emerald-50">
                    Login / Sign Up
                  </Link>
                  <Link
                    to="/login"
                    state={{ from: { pathname: "/add-item" } }}
                    onClick={closeMenu}
                    className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
                  >
                    <Plus size={18} />
                    Add an Item
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
          <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-50">
              <Recycle size={17} />
              Community reuse marketplace
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Discover something useful.
              <span className="block text-emerald-300">
                Give something a new life.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-100 sm:text-lg">
              Explore donations, exchanges, and community requests. Every
              shared resource is another step toward less waste.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-full bg-white/10 px-4 py-2">
                {items.length} available listings
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2">
                Donate · Exchange · Request
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-emerald-950 sm:text-3xl">
                Explore community items
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Search and filter the latest listings from Supabase.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {user && (
                <Link
                  to="/requests"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50"
                >
                  <Handshake size={17} />
                  My Requests
                </Link>
              )}

              <button
                type="button"
                onClick={() => fetchItems(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
              >
                <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
                Refresh listings
              </button>
            </div>
          </div>

          {actionError && (
            <div role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{actionError}</p>
              <button type="button" aria-label="Dismiss message" onClick={() => setActionError("")} className="ml-auto">
                <X size={18} />
              </button>
            </div>
          )}

          <div className="mt-7 grid gap-4 md:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search items, categories, or locations..."
                className="w-full rounded-2xl border border-emerald-100 bg-white py-4 pl-12 pr-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-emerald-500"
            >
              <option value="All">All listing types</option>
              <option value="donation">Donations</option>
              <option value="exchange">Exchanges</option>
              <option value="request">Requests</option>
            </select>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                  selectedCategory === category
                    ? "bg-emerald-700 text-white shadow-md"
                    : "border border-emerald-100 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-800"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <LoaderCircle size={38} className="animate-spin text-emerald-700" />
              <p className="mt-4 font-bold text-emerald-950">
                Loading community listings...
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Fetching the latest items from Supabase.
              </p>
            </div>
          ) : error ? (
            <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-3 text-red-700">
                <AlertCircle size={23} className="mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-extrabold">We couldn't load the listings</h3>
                  <p className="mt-2 text-sm leading-6">{error}</p>
                  <button
                    type="button"
                    onClick={() => fetchItems()}
                    className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-emerald-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Package size={32} />
              </div>
              <h3 className="mt-5 text-xl font-black text-emerald-950">
                {items.length === 0 ? "Your community board is ready!" : "No matching items found"}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                {items.length === 0
                  ? "There are no available listings yet. Publish your first item to get started."
                  : "Try a different search term or select another filter."}
              </p>
              {items.length === 0 && (
                <Link
                  to={user ? "/add-item" : "/login"}
                  state={!user ? { from: { pathname: "/add-item" } } : undefined}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
                >
                  <Plus size={18} />
                  Publish your first listing
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="mb-5 mt-6 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-bold text-emerald-800">{filteredItems.length}</span>{" "}
                  {filteredItems.length === 1 ? "item" : "items"}
                </p>
                <span className="text-xs font-semibold text-slate-400">Newest first</span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <ListingCard
                    key={item.id}
                    item={item}
                    isOwner={Boolean(userId && userId === item.user_id)}
                    currentUserId={userId}
                    onDelete={deleteItem}
                    onLoginRequired={requireLogin}
                  />
                ))}
              </div>
            </>
          )}

          <div className="mt-12 rounded-3xl bg-emerald-50 p-7 sm:p-10">
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-2xl font-black text-emerald-950">
                  Have something useful to share?
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Help someone in your community by giving, exchanging, or
                  requesting resources responsibly.
                </p>
              </div>
              <Link
                to={user ? "/add-item" : "/login"}
                state={!user ? { from: { pathname: "/add-item" } } : undefined}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
              >
                Add an item <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-emerald-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>
            © {new Date().getFullYear()} Waste2Worth. Give resources a second
            life.
          </p>
          <Link to="/home" className="font-semibold text-emerald-700 hover:text-emerald-900">
            Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}