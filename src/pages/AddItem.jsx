
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  X,
  Upload,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Recycle,
  MapPin,
  Package,
  Sparkles,
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

const initialForm = {
  title: "",
  description: "",
  category: "Other",
  listing_type: "donation",
  item_condition: "good",
  location: "",
  city: "",
};

function AddItem() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewRef = useRef("");

  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!active) return;

      if (sessionError) {
        console.error("Session check failed:", sessionError.message);
        setError("Unable to verify your login. Please try again.");
        setCheckingSession(false);
        return;
      }

      if (!data.session?.user) {
        navigate("/login", {
          replace: true,
          state: { from: "/add-item" },
        });
        return;
      }

      setCheckingSession(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session?.user) {
        navigate("/login", {
          replace: true,
          state: { from: "/add-item" },
        });
      } else {
        setCheckingSession(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();

      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, [navigate]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function chooseImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Your image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const newPreview = URL.createObjectURL(file);

    previewRef.current = newPreview;
    setPreviewUrl(newPreview);
    setImageFile(file);
    setError("");
  }

  function removeImage() {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    previewRef.current = "";
    setImageFile(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const title = form.title.trim();
    const description = form.description.trim();
    const city = form.city.trim();
    const location = form.location.trim();

    if (title.length < 3) {
      setError("Your title must contain at least 3 characters.");
      return;
    }

    if (title.length > 120) {
      setError("Your title cannot exceed 120 characters.");
      return;
    }

    if (!city) {
      setError("Please enter your city.");
      return;
    }

    if (!categories.includes(form.category)) {
      setError("Please select a valid category.");
      return;
    }

    if (!conditions.some((condition) => condition.value === form.item_condition)) {
      setError("Please select a valid item condition.");
      return;
    }

    if (!["donation", "exchange", "request"].includes(form.listing_type)) {
      setError("Please select a valid listing type.");
      return;
    }

    setLoading(true);
    let uploadedPath = null;

    try {
      // Confirm the user is logged in before uploading or saving.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        navigate("/login", {
          replace: true,
          state: { from: "/add-item" },
        });
        return;
      }

      let imageUrl = null;

      // Upload the optional photo to Supabase Storage.
      if (imageFile) {
        setUploading(true);

        const extension = imageFile.name
          .split(".")
          .pop()
          ?.toLowerCase();

        const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(
          extension
        )
          ? extension
          : "jpg";

        const uniqueId = crypto.randomUUID();
        uploadedPath = `${user.id}/${uniqueId}.${safeExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(uploadedPath, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("item-images")
          .getPublicUrl(uploadedPath);

        imageUrl = publicUrlData.publicUrl;
        setUploading(false);
      }

      // Save the listing in the existing items table.
      const { data: insertedItem, error: insertError } = await supabase
        .from("items")
        .insert({
          user_id: user.id,
          title,
          description: description || "",
          category: form.category,
          listing_type: form.listing_type,
          item_condition: form.item_condition,
          location: location || null,
          city,
          image_url: imageUrl,
          status: "available",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Remove the temporary browser preview.
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
        previewRef.current = "";
      }

      navigate("/explore", {
        replace: true,
        state: {
          listingCreated: true,
          itemId: insertedItem.id,
        },
      });
    } catch (err) {
      console.error("Create listing error:", err);

      // If saving failed after the image upload, remove the orphaned image.
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from("item-images")
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError.message);
        }
      }

      setError(
        err.message ||
          "Something went wrong while creating your listing. Please try again."
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5faf6] px-4">
        <div className="text-center">
          <LoaderCircle
            size={36}
            className="mx-auto animate-spin text-emerald-700"
          />
          <p className="mt-4 font-semibold text-slate-700">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5faf6] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/explore"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
        >
          <ArrowLeft size={18} />
          Back to Explore
        </Link>

        <div className="mb-7">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <Recycle size={25} />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
            Give resources a second life
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Create a listing
          </h1>

          <p className="mt-3 max-w-xl leading-7 text-slate-600">
            Share something useful with your community. Add a photo and tell
            people what you have to offer.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* PHOTO UPLOAD */}
          <section>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Item photo{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={chooseImage}
              className="hidden"
              aria-label="Choose an item photo"
            />

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={previewUrl}
                  alt="Preview of your item"
                  className="max-h-80 w-full bg-slate-50 object-contain"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove selected photo"
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow transition hover:bg-red-50 hover:text-red-600"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-3">
                  <span className="max-w-[70%] truncate text-sm text-slate-600">
                    {imageFile?.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-bold text-emerald-800 hover:underline"
                  >
                    Change photo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-5 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
              >
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <ImagePlus size={28} />
                </span>

                <span className="font-bold text-slate-800">
                  Click to choose a photo
                </span>

                <span className="mt-1 text-sm text-slate-500">
                  JPG, PNG or WebP · Maximum 5 MB
                </span>

                <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">
                  <Upload size={16} />
                  Select image
                </span>
              </button>
            )}
          </section>

          {/* ITEM DETAILS */}
          <section className="space-y-5">
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
                placeholder="e.g. School books in good condition"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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
                placeholder="Describe the item, its condition, and anything the next person should know..."
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {form.description.length}/2000
              </p>
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
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                {conditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* LOCATION */}
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <MapPin size={19} className="text-emerald-700" />
              <h2 className="font-bold text-slate-900">Item location</h2>
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
                  placeholder="e.g. Palghar"
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
          </section>

          {/* ERRORS */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          {/* COMMUNITY SAFETY NOTE */}
          <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <p>
                Share only items you are allowed to give away or exchange.
                Avoid including private information in your photos.
              </p>
            </div>
          </div>

          {/* PUBLISH */}
          <button
            type="submit"
            disabled={loading || checkingSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={20} />
                {uploading ? "Uploading photo..." : "Creating listing..."}
              </>
            ) : (
              <>
                <Package size={20} />
                Publish listing
                <Sparkles size={17} />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            Your listing will be visible to the Waste2Worth community.
          </p>
        </form>
      </div>
    </main>
  );
}

export default AddItem;