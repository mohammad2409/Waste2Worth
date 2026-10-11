
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Package,
  MapPin,
  Pencil,
  Trash2,
  LoaderCircle,
  AlertCircle,
  Recycle,
  RefreshCw,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";

function getStoragePath(imageUrl) {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const marker = "/object/public/item-images/";
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

function formatType(type) {
  const types = {
    donation: "Donation",
    exchange: "Exchange",
    request: "Request",
  };

  return types[type] || type || "Item";
}

function formatStatus(status) {
  const statuses = {
    available: "Available",
    reserved: "Reserved",
    completed: "Completed",
    unavailable: "Unavailable",
    removed: "Removed",
  };

  return statuses[status] || status || "Unknown";
}

function StatusBadge({ status }) {
  const styles = {
    available: "bg-emerald-100 text-emerald-800",
    reserved: "bg-amber-100 text-amber-800",
    completed: "bg-blue-100 text-blue-800",
    unavailable: "bg-gray-100 text-gray-600",
    removed: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

export default function MyListings() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [userId, setUserId] = useState(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        navigate("/login", {
          replace: true,
          state: { from: "/my-listings" },
        });
        return;
      }

      setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setItems(data || []);
    } catch (err) {
      console.error("Could not load your listings:", err);
      setError(err.message || "Could not load your listings.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUserId(null);
        navigate("/login", {
          replace: true,
          state: { from: "/my-listings" },
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");
    setNotice("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        navigate("/login", {
          replace: true,
          state: { from: "/my-listings" },
        });
        return;
      }

      if (user.id !== userId) {
        throw new Error("Your session changed. Please refresh and try again.");
      }

      const { data, error: deleteError } = await supabase
        .from("items")
        .delete()
        .eq("id", item.id)
        .eq("user_id", user.id)
        .select("id");

      if (deleteError) throw deleteError;

      if (!data || data.length === 0) {
        throw new Error(
          "The listing could not be deleted. Check your Supabase permissions and try again."
        );
      }

      // Remove the listing from the screen immediately.
      setItems((current) =>
        current.filter((listing) => listing.id !== item.id)
      );

      setNotice(`"${item.title}" was deleted successfully.`);

      // Image cleanup is separate: a failed cleanup should not undo the deletion.
      const storagePath = getStoragePath(item.image_url);

      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from("item-images")
          .remove([storagePath]);

        if (storageError) {
          console.warn("Image cleanup failed:", storageError.message);
          setNotice(
            `Listing deleted, but its image could not be removed from storage.`
          );
        }
      }
    } catch (err) {
      console.error("Could not delete listing:", err);
      setError(err.message || "Could not delete this listing.");
    } finally {
      setDeletingId(null);
    }
  }

  const availableCount = items.filter(
    (item) => item.status === "available"
  ).length;

  const completedCount = items.filter(
    (item) => item.status === "completed"
  ).length;

  if (loading && items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <LoaderCircle
            size={36}
            className="mx-auto animate-spin text-emerald-700"
          />
          <p className="mt-4 font-semibold text-gray-700">
            Loading your listings...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Getting your community contributions ready.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/explore"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-emerald-700"
        >
          <ArrowLeft size={18} />
          Back to Explore
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-700">
              <Recycle size={22} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Waste2Worth
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              My Listings
            </h1>

            <p className="mt-2 max-w-xl text-gray-600">
              Manage your shared items, update your listings, and see what is
              available to your community.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadItems}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              to="/add-item"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <Plus size={19} />
              Add New Item
            </Link>
          </div>
        </div>

        {/* LISTING STATISTICS */}
        <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-gray-500">
              <Package size={18} />
              <p className="text-sm">Total listings</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {items.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={18} />
              <p className="text-sm">Available</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {availableCount}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-5 sm:col-span-1">
            <div className="flex items-center gap-2 text-blue-700">
              <Clock3 size={18} />
              <p className="text-sm">Completed</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {completedCount}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {!loading && items.length === 0 && !error ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Package size={32} />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No listings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md leading-7 text-gray-600">
              Give usable items a second life. Add your first listing and help
              someone in your community.
            </p>

            <Link
              to="/add-item"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
            >
              <Plus size={19} />
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative flex h-52 items-center justify-center bg-gray-100">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.parentElement
                          ?.querySelector("[data-image-fallback]")
                          ?.classList.remove("hidden");
                      }}
                    />
                  ) : null}

                  <div
                    data-image-fallback
                    className={`flex flex-col items-center gap-2 text-gray-400 ${
                      item.image_url ? "hidden" : ""
                    }`}
                  >
                    <Package size={44} />
                    <span className="text-xs">No photo available</span>
                  </div>

                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    {formatType(item.listing_type)}
                  </span>
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-lg font-bold text-gray-900">
                      {item.title}
                    </h2>

                    <StatusBadge status={item.status} />
                  </div>

                  <p className="text-sm text-gray-500">
                    {item.category || "Uncategorized"}
                  </p>

                  {item.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                      {item.description}
                    </p>
                  )}

                  {(item.city || item.location) && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin size={16} className="shrink-0" />
                      {[item.location, item.city].filter(Boolean).join(", ")}
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                    <Link
                      to={`/edit-item/${item.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700 px-3 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>

                  <Link
                    to="/explore"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                  >
                    <Eye size={16} />
                    View community listings
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {loading && items.length > 0 && (
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500">
            <LoaderCircle size={16} className="animate-spin" />
            Refreshing listings...
          </p>
        )}

        {!loading && items.length > 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">
            You have shared {items.length}{" "}
            {items.length === 1 ? "item" : "items"} with your community. Keep
            giving useful things a second life!
          </p>
        )}
      </div>
    </main>
  );
}