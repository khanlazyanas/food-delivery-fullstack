"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useMenuStore } from "@/store/menuStore";
import { useCategoryStore } from "@/store/categoryStore";
import { MenuItem } from "@/lib/menuData";
import toast from "react-hot-toast";

export default function AdminMenuPage() {
  // 👇 SAARE HOOKS COMPONENT KE ANDAR HONGE
  const items = useMenuStore((state) => state.items);
  const fetchMenu = useMenuStore((state) => state.fetchMenu); // 👈 Hook yahan aayega
  const addItem = useMenuStore((state) => state.addItem);
  const updateItem = useMenuStore((state) => state.updateItem);
  const deleteItem = useMenuStore((state) => state.deleteItem);
  const toggleAvailability = useMenuStore((state) => state.toggleAvailability);
  const resetToDefault = useMenuStore((state) => state.resetToDefault);

  const allCategories = useCategoryStore((state) => state.categories);
  
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  // 👇 MongoDB string ID ke liye isko update kiya
  const [confirmDelete, setConfirmDelete] = useState<string | number | null>(null); 

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "Main Course",
    subcategory: "",
    isVeg: true,
    isBestseller: false,
    rating: 4.5,
  });

  // 👇 Backend se data fetch karne ke liye
  useEffect(() => {
    fetchMenu(); 
  }, [fetchMenu]);

  // 👇 Local hydration check ke liye
  useEffect(() => {
    useMenuStore.persist.rehydrate();
    useCategoryStore.persist.rehydrate();
    setMounted(true);
  }, []);

  

  // Get available subcategories for the current form category from store
  const selectedCategoryData = allCategories.find(c => c.name === form.category);
  const availableSubcategories = selectedCategoryData ? selectedCategoryData.subcategories : [];

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description,
        price: editing.price,
        image: editing.image,
        category: editing.category,
        subcategory: editing.subcategory || "",
        isVeg: editing.isVeg,
        isBestseller: editing.isBestseller,
        rating: editing.rating,
      });
    } else {
      const defaultCat = allCategories.length > 0 ? allCategories[0].name : "Main Course";
      setForm({
        name: "",
        description: "",
        price: 0,
        image: "",
        category: defaultCat,
        subcategory: "",
        isVeg: true,
        isBestseller: false,
        rating: 4.5,
      });
    }
  }, [editing, showForm, allCategories]);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading...</div>;
  }

  let filtered = items;
  if (categoryFilter !== "All") {
    filtered = filtered.filter((i) => i.category === categoryFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.description.trim() || form.price <= 0) {
      toast.error("Please fill name, description and price");
      return;
    }
    if (!form.image.trim()) {
      toast.error("Please add an image URL");
      return;
    }
    if (!form.subcategory.trim()) {
      toast.error("Please select a subcategory");
      return;
    }

    if (editing) {
      updateItem(editing.id, form);
      toast.success("Item updated");
    } else {
      addItem({ ...form, isAvailable: true });
      toast.success("Item added");
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string | number) => {
  deleteItem(id);
  setConfirmDelete(null);
  toast.success("Item deleted");
};

  const handleReset = () => {
    if (confirm("Reset all items to default menu? This will delete all your changes.")) {
      resetToDefault();
      toast.success("Menu reset to default");
    }
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Menu Management
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">
            Food Items
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            {items.length} items · {items.filter((i) => i.isAvailable !== false).length} available
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
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:border-orange-500 outline-none cursor-pointer"
        >
          <option value="All">All Categories</option>
          {allCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items List - Responsive Grid/Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500">No items found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <div className="col-span-5">Item</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 md:px-5 items-center hover:bg-slate-50/50 transition-colors">
                
                {/* Item Info */}
                <div className="md:col-span-5 flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 md:w-12 md:h-12 rounded-xl object-cover flex-shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 border-2 rounded-sm flex-shrink-0 flex items-center justify-center ${item.isVeg ? "border-green-600" : "border-red-600"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`}></div>
                      </div>
                      <span className="font-bold text-slate-900 truncate text-sm md:text-base">
                        {item.name}
                      </span>
                      {item.isBestseller && (
                        <Star className="w-3.5 h-3.5 text-[#FF6B00] fill-[#FF6B00] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] md:text-xs text-slate-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="md:col-span-2 flex items-center justify-between md:justify-start">
                  <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Category</span>
                  <div className="flex flex-col items-end md:items-start gap-1">
                    <span className="text-[10px] md:text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full w-fit">
                      {item.category}
                    </span>
                    {item.subcategory && (
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.subcategory}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="md:col-span-2 flex items-center justify-between md:justify-start">
                  <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Price</span>
                  <span className="font-black text-slate-900 text-sm md:text-base">
                    ₹{item.price}
                  </span>
                </div>

                {/* Status */}
                <div className="md:col-span-2 flex items-center justify-between md:justify-start">
                  <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Status</span>
                  <button
                    onClick={() => {
                      toggleAvailability(item.id);
                      toast.success(
                        item.isAvailable !== false
                          ? "Marked unavailable"
                          : "Marked available"
                      );
                    }}
                    className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-full transition-colors ${
                      item.isAvailable !== false
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    {item.isAvailable !== false ? (
                      <><Eye className="w-3 h-3" /> Available</>
                    ) : (
                      <><EyeOff className="w-3 h-3" /> Out of Stock</>
                    )}
                  </button>
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex items-center justify-end gap-2 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-slate-100 md:border-0">
                  <button
                    onClick={() => {
                      setEditing(item);
                      setShowForm(true);
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center p-2 bg-slate-50 text-slate-500 hover:text-[#FF6B00] hover:bg-orange-50 rounded-xl transition-colors border border-slate-200 hover:border-orange-200"
                    aria-label="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(item.id)}
                    className="flex-1 md:flex-none flex items-center justify-center p-2 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200 hover:border-red-200"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                  {editing ? "Edit Item" : "Add Item"}
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
                placeholder="Item name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
              />

              <textarea
                placeholder="Description *"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none text-sm md:text-base"
              />

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Image URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
              </div>

              {form.image && (
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-32 md:h-40 object-cover rounded-xl border border-slate-200 mt-2"
                />
              )}

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Price *</label>
                  <input
                    type="number"
                    placeholder="e.g., 250"
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="4.5"
                    value={form.rating || ""}
                    onChange={(e) =>
                      setForm({ ...form, rating: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                      subcategory: "", // reset subcategory on category change
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all cursor-pointer text-sm md:text-base"
                >
                  {allCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                  Subcategory *
                </label>
                <select
                  value={form.subcategory}
                  onChange={(e) =>
                    setForm({ ...form, subcategory: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all cursor-pointer text-sm md:text-base"
                >
                  <option value="">Select subcategory</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={form.isVeg}
                    onChange={(e) =>
                      setForm({ ...form, isVeg: e.target.checked })
                    }
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Is Veg?
                  </span>
                </label>
                <label className="flex-1 flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-200">
                  <input
                    type="checkbox"
                    checked={form.isBestseller}
                    onChange={(e) =>
                      setForm({ ...form, isBestseller: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#FF6B00]"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Bestseller?
                  </span>
                </label>
              </div>

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
                  {editing ? "Update" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRM ============ */}
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
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Delete this item?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              This action can&apos;t be undone.
            </p>
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