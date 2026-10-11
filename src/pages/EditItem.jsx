
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  X,
  LoaderCircle,
  Save,
  AlertCircle,
  Recycle,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";

const categories = [
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

const conditions = [
  { value: "new", label: "Brand new" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good condition" },
  { value: "fair", label: "Fair condition" },
  { value: "for_parts", label: "For parts / repair" },
  { value: "not_applicable", label: "Not applicable" },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getStoragePath(publicUrl) {
  if (!publicUrl) return null;

  try {
    const url = new URL(publicUrl);
    const marker = "/object/public/item-images/";
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Other",
    listing_type: "donation",
    item_condition: "good",
    location: "",
    city: "",
    image_url: null,
  });

  const [userId, setUserId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItem() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        const user = authData?.user;

        if (!user) {
          navigate("/login", {
            replace: true,
            state: { from: `/edit-item/${id}` },
          });
          return;
        }

        const { data: item, error: itemError } = await supabase
          .from("items")
          .select(
            "id, user_id, title, description, category, listing_type, item_condition, location, city, image_url, status"
          )
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (itemError) throw itemError;

        if (!item) {
          if (active) {
            setError(
              "Listing not found, or you do not have permission to edit it."
            );
          }
          return;
        }

        if (!active) return;

        setUserId(user.id);
        setForm({
          title: item.title || "",
          description: item.description || "",
          category: item.category || "Other",
          listing_type: item.listing_type || "donation",
          item_condition: item.item_condition || "good",
          location: item.location || "",
          city: item.city || "",
          image_url: item.image_url || null,
        });
        setPreviewUrl(item.image_url || "");
      } catch (err) {
        console.error("Load listing error:", err);
        if (active) setError(err.message || "Could not load this listing.");
      } finally {
        if (active) setLoadingPage(false);
      }
    }

    loadItem();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function chooseImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Your image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setPreviewUrl("");
    setForm((previous) => ({ ...previous, image_url: null }));

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.title.trim().length < 3) {
      setError("The title must contain at least 3 characters.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!userId) {
      setError("Your session could not be verified. Please log in again.");
      return;
    }

    setSaving(true);
    let newlyUploadedPath = null;

    try {
      let imageUrl = form.image_url;

      if (imageFile) {
        const extension = imageFile.name.split(".").pop()?.toLowerCase();
        const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension)
          ? extension
          : "jpg";

        newlyUploadedPath = `${userId}/${crypto.randomUUID()}.${safeExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(newlyUploadedPath, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("item-images")
          .getPublicUrl(newlyUploadedPath);

        imageUrl = urlData.publicUrl;
      }

      const { data: updatedItems, error: updateError } = await supabase
        .from("items")
        .update({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          listing_type: form.listing_type,
          item_condition: form.item_condition,
          location: form.location.trim() || null,
          city: form.city.trim(),
          image_url: imageUrl,
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select("id");

      if (updateError) throw updateError;

      if (!updatedItems || updatedItems.length === 0) {
        throw new Error("Listing was not updated. Please verify ownership.");
      }

      // Remove the previous image only after the database update succeeds.
      const oldPath = getStoragePath(form.image_url);

      if (oldPath && oldPath !== newlyUploadedPath) {
        await supabase.storage.from("item-images").remove([oldPath]);
      }

      navigate("/explore", {
        replace: true,
        state: { listingUpdated: true, itemId: id },
      });
    } catch (err) {
      console.error("Update listing error:", err);

      if (newlyUploadedPath) {
        await supabase.storage
          .from("item-images")
          .remove([newlyUploadedPath]);
      }

      setError(err.message || "Could not update your listing.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingPage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5faf6]">
        <div className="flex items-center gap-3 font-semibold text-emerald-800">
          <LoaderCircle className="animate-spin" />
          Loading your listing...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5faf6] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/explore"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
        >
          <ArrowLeft size={18} />
          Back to Explore
        </Link>

        <div className="mb-7">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <Recycle size={25} />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
            Manage your resource
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Edit your listing
          </h1>
          <p className="mt-3 text-slate-600">
            Update your details or replace the photo.
          </p>
        </div>

        {error && !form.title ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-white p-5 text-red-700"
          >
            {error}
            <div className="mt-4">
              <Link
                to="/explore"
                className="font-bold text-emerald-800 underline"
              >
                Return to Explore
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-8"
          >
            <section>
              <label className="mb-2 block text-sm font-bold text-slate-800">
                Item photo
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={chooseImage}
                className="hidden"
              />

              {previewUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <img
                    src={previewUrl}
                    alt="Listing preview"
                    className="max-h-80 w-full bg-slate-50 object-contain"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm font-bold text-emerald-800 hover:underline"
                    >
                      Change photo
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:underline"
                    >
                      <X size={16} />
                      Remove photo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-5 py-9 text-center hover:bg-emerald-50"
                >
                  <ImagePlus size={30} className="mb-2 text-emerald-800" />
                  <span className="font-bold text-slate-800">
                    Add an item photo
                  </span>
                  <span className="mt-1 text-sm text-slate-500">
                    JPG, PNG or WebP · Maximum 5 MB
                  </span>
                </button>
              )}
            </section>

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Item title *
              </label>
              <input
                id="title"
                name="title"
                required
                minLength={3}
                maxLength={120}
                value={form.title}
                onChange={updateField}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                maxLength={2000}
                value={form.description}
                onChange={updateField}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={updateField}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="listing_type"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Listing type *
                </label>
                <select
                  id="listing_type"
                  name="listing_type"
                  value={form.listing_type}
                  onChange={updateField}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <option value="donation">Give away / Donate</option>
                  <option value="exchange">Exchange / Barter</option>
                  <option value="request">Request an item</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="item_condition"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Item condition *
              </label>
              <select
                id="item_condition"
                name="item_condition"
                value={form.item_condition}
                onChange={updateField}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                {conditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  required
                  maxLength={100}
                  value={form.city}
                  onChange={updateField}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Area / locality
                </label>
                <input
                  id="location"
                  name="location"
                  maxLength={150}
                  value={form.location}
                  onChange={updateField}
                  placeholder="e.g. Boisar West"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={20} className="animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save changes
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default EditItem;