"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Check,
  Tag,
  Calendar,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  UtensilsCrossed,
} from "lucide-react";
import { useOfferStore, ExtendedOffer } from "@/store/offerStore";
import { categories, menuItems } from "@/lib/menuData";
import toast from "react-hot-toast";

const MAX_IMAGE_SIZE_KB = 800;

export default function AdminOffersPage() {
  const offers = useOfferStore((state) => state.offers);
  const addOffer = useOfferStore((state) => state.addOffer);
  const updateOffer = useOfferStore((state) => state.updateOffer);
  const deleteOffer = useOfferStore((state) => state.deleteOffer);
  const toggleOfferActive = useOfferStore((state) => state.toggleOfferActive);
  const resetToDefault = useOfferStore((state) => state.resetToDefault);

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ExtendedOffer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itemSearch, setItemSearch] = useState("");

  const emptyForm = {
    title: "",
    description: "",
    image: "",
    discount: "",
    category: "Main Course",
    startDate: "",
    validUntil: "",
    terms: "",
    badge: "",
    applicableItems: [] as string[],
    isActive: true,
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    useOfferStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        description: editing.description,
        image: editing.image,
        discount: editing.discount,
        category: editing.category,
        startDate: editing.startDate || "",
        validUntil: editing.validUntil,
        terms: editing.terms,
        badge: editing.badge,
        applicableItems: editing.applicableItems || [],
        isActive: editing.isActive,
      });
      setImageMode(editing.image.startsWith("data:") ? "upload" : "url");
    } else {
      setForm(emptyForm);
      setImageMode("url");
    }
    setItemSearch("");
  }, [editing, showForm]);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading offers...</div>;
  }

  let filtered = offers;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q) ||
        o.badge.toLowerCase().includes(q)
    );
  }

  const stats = {
    total: offers.length,
    active: offers.filter((o) => o.isActive).length,
    inactive: offers.filter((o) => !o.isActive).length,
    categories: new Set(offers.map((o) => o.category)).size,
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const sizeKB = file.size / 1024;
    if (sizeKB > MAX_IMAGE_SIZE_KB) {
      toast.error(`Image too large. Max ${MAX_IMAGE_SIZE_KB} KB allowed.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image: reader.result as string }));
      toast.success("Image uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleItem = (name: string) => {
    setForm((prev) => ({
      ...prev,
      applicableItems: prev.applicableItems.includes(name)
        ? prev.applicableItems.filter((i) => i !== name)
        : [...prev.applicableItems, name],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Please enter offer title");
    if (!form.description.trim()) return toast.error("Please enter description");
    if (!form.discount.trim()) return toast.error("Please enter discount value");
    if (!form.image.trim()) return toast.error("Please add an image (URL or upload)");
    if (!form.startDate) return toast.error("Please select start date");
    if (!form.validUntil) return toast.error("Please select end date");
    if (new Date(form.startDate) > new Date(form.validUntil)) return toast.error("Start date cannot be after end date");
    if (!form.badge.trim()) return toast.error("Please enter a badge");

    if (editing) {
      updateOffer(editing.id, form);
      toast.success("Offer updated");
    } else {
      addOffer(form);
      toast.success("Offer added");
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    deleteOffer(id);
    setConfirmDelete(null);
    toast.success("Offer deleted");
  };

  const handleReset = () => {
    if (!confirm("Reset all offers to default? This will delete all your changes.")) return;
    resetToDefault();
    toast.success("Offers reset to default");
  };

  const filteredMenuItems = menuItems.filter((m) =>
    m.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Offer Management
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">
            Weekly Offers
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Manage promotional offers displayed on your website
          </p>
        </div>

        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={handleReset}
            className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/30"
          >
            <Plus className="w-4 h-4" /> Add Offer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
              <Tag className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Total
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{stats.total}</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Active
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{stats.active}</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Inactive
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{stats.inactive}</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Categories
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{stats.categories}</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search offers by title, category or badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
          />
        </div>
      </div>

      {/* Offers Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No offers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((offer) => {
            const validDate = new Date(offer.validUntil);
            const startDate = offer.startDate ? new Date(offer.startDate) : null;
            const isExpired = validDate < new Date();
            const notStarted = startDate && startDate > new Date();

            return (
              <div
                key={offer.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all flex flex-col ${
                  offer.isActive
                    ? "border-slate-100 hover:border-orange-200 hover:shadow-lg"
                    : "border-slate-200 opacity-60"
                }`}
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  <button
                    onClick={() => {
                      toggleOfferActive(offer.id);
                      toast.success(
                        offer.isActive
                          ? "Offer marked inactive"
                          : "Offer marked active"
                      );
                    }}
                    className={`absolute top-3 right-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg transition-colors ${
                      offer.isActive
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-slate-500 text-white hover:bg-slate-600"
                    }`}
                  >
                    {offer.isActive ? (
                      <><Eye className="w-3 h-3" /> Active</>
                    ) : (
                      <><EyeOff className="w-3 h-3" /> Inactive</>
                    )}
                  </button>

                  <div className="absolute bottom-3 left-3">
                    <span className="inline-block bg-[#FF6B00] text-white text-sm md:text-base font-black px-3 py-1 rounded-lg shadow-lg">
                      {offer.discount} OFF
                    </span>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="inline-block bg-white text-slate-900 text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                      {offer.badge}
                    </span>
                  </div>

                  {notStarted && (
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-block bg-blue-500 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow">
                        Scheduled
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] mb-1">
                    <Tag className="w-3 h-3" />
                    {offer.category}
                  </div>
                  <h3 className="font-black text-slate-900 text-sm md:text-base mb-2 leading-tight line-clamp-2">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                    {offer.description}
                  </p>

                  {offer.applicableItems && offer.applicableItems.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md mb-2 w-fit">
                      <UtensilsCrossed className="w-3 h-3" />
                      {offer.applicableItems.length} {offer.applicableItems.length === 1 ? "item" : "items"}
                    </div>
                  )}

                  <div className={`flex items-center gap-1.5 text-[10px] md:text-[11px] font-semibold mb-3 flex-wrap mt-auto pt-2 ${isExpired ? "text-red-600" : "text-slate-500"}`}>
                    <Calendar className="w-3 h-3" />
                    {offer.startDate ? new Date(offer.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"} →{" "}
                    {isExpired ? (
                      <span className="text-red-600">Expired</span>
                    ) : (
                      validDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
                    <button
                      onClick={() => {
                        setEditing(offer);
                        setShowForm(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(offer.id)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors bg-slate-50"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============ FORM MODAL ============ */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => {
            setShowForm(false);
            setEditing(null);
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                  {editing ? "Update" : "New"}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {editing ? "Edit Offer" : "Add Offer"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <input
                type="text"
                placeholder="Offer Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
              />

              <textarea
                placeholder="Description *"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none text-sm md:text-base"
              />

              {/* IMAGE SECTION */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" /> Offer Image *
                </label>

                <div className="flex bg-slate-100 rounded-xl p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      imageMode === "url" ? "bg-white text-[#FF6B00] shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      imageMode === "upload" ? "bg-white text-[#FF6B00] shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                </div>

                {imageMode === "url" ? (
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={form.image.startsWith("data:") ? "" : form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                  />
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="hidden"
                      id="offer-image-upload"
                    />
                    <label
                      htmlFor="offer-image-upload"
                      className="flex flex-col items-center justify-center w-full px-4 py-6 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-[#FF6B00] hover:bg-orange-50 cursor-pointer transition-all text-center"
                    >
                      <Upload className="w-6 h-6 text-slate-400 mb-2" />
                      <span className="text-sm font-bold text-slate-700">Click to upload image</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP · max {MAX_IMAGE_SIZE_KB} KB</span>
                    </label>
                  </div>
                )}

                {form.image && (
                  <div className="relative mt-3">
                    <img src={form.image} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-slate-200" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Discount * (30%, ₹100)"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
                />
                <input
                  type="text"
                  placeholder="Badge * (Weekly Special)"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all cursor-pointer text-sm md:text-base"
                >
                  {categories.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Combo">Combo</option>
                  <option value="Delivery">Delivery</option>
                  <option value="First Order">First Order</option>
                </select>
              </div>

              {/* APPLICABLE ITEMS MULTI-SELECT */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3 h-3" /> Applicable Food Items
                  <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <p className="text-[10px] md:text-xs text-slate-500 mb-2">Select specific dishes. Leave empty to apply to the entire category.</p>

                {form.applicableItems.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.applicableItems.map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-[10px] md:text-xs font-bold px-2 py-1 rounded-md">
                        {item}
                        <button type="button" onClick={() => toggleItem(item)} className="hover:text-red-600 transition-colors" aria-label={`Remove ${item}`}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl p-1 bg-white">
                  {filteredMenuItems.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-4">No items found</div>
                  ) : (
                    filteredMenuItems.map((item) => {
                      const checked = form.applicableItems.includes(item.name);
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => toggleItem(item.name)}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm transition-colors ${checked ? "bg-orange-50 text-orange-800" : "hover:bg-slate-50 text-slate-700"}`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? "bg-[#FF6B00] border-[#FF6B00]" : "border-slate-300"}`}>
                            {checked && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="flex-1 font-medium truncate">{item.name}</span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">{item.category}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* DATES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> End Date *
                  </label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
                  />
                </div>
              </div>

              <textarea
                placeholder="Terms & Conditions *"
                rows={2}
                value={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none text-sm md:text-base"
              />

              <label className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-200 mt-2">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Offer Active</div>
                  <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">Inactive offers won&apos;t be shown to customers</div>
                </div>
                <div className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${form.isActive ? "bg-[#FF6B00]" : "bg-slate-300"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`}></div>
                </div>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="hidden"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-xl transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 text-sm md:text-base"
                >
                  {editing ? "Update" : "Add Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 md:p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete this offer?</h3>
            <p className="text-sm text-slate-500 mb-6">This action can&apos;t be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors text-sm md:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}