
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MessageSquare,
  Package,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-slate-100 text-slate-700",
};

function Requests() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      setUser(null);
      setRequests([]);
      setError("Please log in to view your requests.");
      setLoading(false);
      return;
    }

    setUser(currentUser);

    const { data, error: queryError } = await supabase
      .from("requests")
      .select(`
        id,
        item_id,
        requester_id,
        owner_id,
        message,
        request_type,
        status,
        created_at,
        items!requests_item_id_fkey (
          title,
          category,
          image_url,
          city,
          location,
          listing_type
        )
      `)
      .or(
        `requester_id.eq.${currentUser.id},owner_id.eq.${currentUser.id}`
      )
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setRequests([]);
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function updateStatus(request, nextStatus) {
    if (!user) return;

    const allowed =
      request.owner_id === user.id
        ? (
            (request.status === "pending" &&
              ["accepted", "rejected"].includes(nextStatus)) ||
            (request.status === "accepted" &&
              nextStatus === "completed")
          )
        : request.requester_id === user.id &&
          request.status === "pending" &&
          nextStatus === "cancelled";

    if (!allowed) {
      setError("This action is not allowed for your account.");
      return;
    }

    setBusyId(request.id);
    setError("");
    setNotice("");

    const { error: updateError } = await supabase
      .from("requests")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setNotice(`Request marked as ${nextStatus}.`);
      await loadRequests();
    }

    setBusyId(null);
  }

  const visibleRequests = requests.filter((request) => {
    if (filter === "incoming") return request.owner_id === user?.id;
    if (filter === "outgoing") return request.requester_id === user?.id;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#f7faf7] px-4 py-8 text-slate-800 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/explore"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
        >
          <ArrowLeft size={17} />
          Back to Explore
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Your community activity
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              My Requests
            </h1>
            <p className="mt-2 max-w-xl text-slate-600">
              Manage items you've requested and respond to people interested
              in your listings.
            </p>
          </div>

          <button
            onClick={loadRequests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {[
            ["all", "All Requests"],
            ["incoming", "Received"],
            ["outgoing", "Sent"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                filter === value
                  ? "bg-emerald-800 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {notice && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {notice}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
            {error.toLowerCase().includes("log in") && (
              <Link to="/login" className="ml-2 font-bold underline">
                Go to Login
              </Link>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
            <LoaderCircle className="animate-spin" />
            Loading your requests...
          </div>
        ) : !error && visibleRequests.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Package className="mx-auto text-emerald-700" size={42} />
            <h2 className="mt-4 text-xl font-bold">No requests yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              When you request an item or someone requests one of yours, it
              will appear here.
            </p>
            <Link
              to="/explore"
              className="mt-6 inline-flex items-center rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white hover:bg-emerald-900"
            >
              Explore items
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {visibleRequests.map((request) => {
              const incoming = request.owner_id === user?.id;
              const item = request.items;
              const busy = busyId === request.id;

              return (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                    <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-36">
                      {item?.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title || "Requested item"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package size={36} className="text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            statusStyles[request.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {request.status}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                          {request.request_type}
                        </span>
                        <span className="text-xs text-slate-500">
                          {incoming ? "Received request" : "Your request"}
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-bold">
                        {item?.title || "Item listing"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {[item?.category, item?.city || item?.location]
                          .filter(Boolean)
                          .join(" · ") || "Community item"}
                      </p>

                      {request.message && (
                        <p className="mt-3 flex gap-2 text-sm leading-6 text-slate-600">
                          <MessageSquare
                            size={16}
                            className="mt-1 shrink-0"
                          />
                          {request.message}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-slate-400">
                        Submitted{" "}
                        {new Date(request.created_at).toLocaleString()}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {incoming &&
                          request.status === "pending" && (
                            <>
                              <button
                                disabled={busy}
                                onClick={() =>
                                  updateStatus(request, "accepted")
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                              >
                                <CheckCircle2 size={16} />
                                Accept
                              </button>
                              <button
                                disabled={busy}
                                onClick={() =>
                                  updateStatus(request, "rejected")
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                              >
                                <XCircle size={16} />
                                Reject
                              </button>
                            </>
                          )}

                        {incoming && request.status === "accepted" && (
                          <button
                            disabled={busy}
                            onClick={() =>
                              updateStatus(request, "completed")
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                          >
                            <CheckCircle2 size={16} />
                            Mark completed
                          </button>
                        )}

                        {!incoming && request.status === "pending" && (
                          <button
                            disabled={busy}
                            onClick={() =>
                              updateStatus(request, "cancelled")
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Cancel request
                          </button>
                        )}

                        {busy && (
                          <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                            <LoaderCircle
                              size={16}
                              className="animate-spin"
                            />
                            Updating...
                          </span>
                        )}

                        {request.status === "pending" && (
                          <span className="inline-flex items-center gap-2 self-center text-xs text-slate-500">
                            <Clock3 size={14} />
                            Waiting for a response
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Requests;