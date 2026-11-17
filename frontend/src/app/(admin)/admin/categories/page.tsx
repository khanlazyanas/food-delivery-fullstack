"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Check,
  Layers,
  ListTree,
} from "lucide-react";
import { useCategoryStore } from "@/store/categoryStore";
import { useMenuStore } from "@/store/menuStore";
import { Category } from "@/lib/menuData";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const categories = useCategoryStore((state) => state.categories);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const updateCategory = useCategoryStore((state) => state.updateCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const toggleCategoryActive = useCategoryStore(
    (state) => state.toggleCategoryActive
  );
  const reorderCategories = useCategoryStore(
    (state) => state.reorderCategories
  );

  const menuItems = useMenuStore((state) => state.items);

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    subcategories: "", // Comma separated string for form
    isActive: true,
  });

  useEffect(() => {
    useCategoryStore.persist.rehydrate();
    useMenuStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        subcategories: editing.subcategories.join(", "),
        isActive: editing.isActive,
      });
    } else {
      setForm({ name: "", subcategories: "", isActive: true });
    }
  }, [editing, showForm]);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading categories...</div>;
  }

  // Sort by order
  let sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // Filter by search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    sortedCategories = sortedCategories.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter category name");
      return;
    }

    // Convert comma separated string to array
    const subcatsArray = form.subcategories
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    if (editing) {
      updateCategory(editing.id, {
        name: form.name,
        subcategories: subcatsArray,
        isActive: form.isActive,
      });
      toast.success("Category updated");
    } else {
      addCategory(form.name, subcatsArray);
      toast.success("Category added");
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    // Optional: Prevent deleting if items exist
    const categoryName = categories.find(c => c.id === id)?.name;
    const itemsInCategory = menuItems.filter(i => i.category === categoryName);
    
    if (itemsInCategory.length > 0) {
      toast.error(`Cannot delete: ${itemsInCategory.length} items are using this category.`);
      setConfirmDelete(null);
      return;
    }

    deleteCategory(id);
    setConfirmDelete(null);
    toast.success("Category deleted");
  };

  const moveCategory = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sortedCategories.length - 1) return;

    const newCategories = [...sortedCategories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap items
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    // Reassign order property
    const updatedCategories = newCategories.map((c, i) => ({
      ...c,
      order: i + 1
    }));

    reorderCategories(updatedCategories);
    toast.success("Order updated");
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
            Categories
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Manage your food categories, subcategories, and display order.
          </p>
        </div>

        <div className="w-full lg:w-auto">
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="w-full lg:w-auto flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/30"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-3 md:space-y-4">
        {sortedCategories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No categories found</p>
          </div>
        ) : (
          sortedCategories.map((cat, index) => {
            const itemCount = menuItems.filter(i => i.category === cat.name).length;
            
            return (
              <div
                key={cat.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  cat.isActive ? "border-slate-100 shadow-sm" : "border-slate-200 opacity-60 bg-slate-50"
                }`}
              >
                <div className="p-3 md:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                  
                  {/* Order Controls */}
                  <div className="flex flex-row sm:flex-col items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 w-full sm:w-auto justify-center sm:justify-start">
                    <button
                      onClick={() => moveCategory(index, "up")}
                      disabled={index === 0}
                      className="flex-1 sm:flex-none flex justify-center p-1.5 text-slate-400 hover:text-[#FF6B00] hover:bg-white rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-black text-slate-500 px-2">{cat.order}</span>
                    <button
                      onClick={() => moveCategory(index, "down")}
                      disabled={index === sortedCategories.length - 1}
                      className="flex-1 sm:flex-none flex justify-center p-1.5 text-slate-400 hover:text-[#FF6B00] hover:bg-white rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2 md:gap-3 mb-1">
                      <h3 className={`text-base md:text-lg font-black tracking-tight truncate ${cat.isActive ? "text-slate-900" : "text-slate-500 line-through"}`}>
                        {cat.name}
                      </h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {itemCount} items
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <ListTree className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
                      {cat.subcategories.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No subcategories</span>
                      ) : (
                        cat.subcategories.map((sub, i) => (
                          <span key={i} className="text-[10px] md:text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded truncate max-w-[120px] md:max-w-none">
                            {sub}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:ml-4 w-full sm:w-auto pt-3 sm:pt-0 border-t border-slate-100 sm:border-0 mt-1 sm:mt-0">
                    <button
                      onClick={() => {
                        toggleCategoryActive(cat.id);
                        toast.success(cat.isActive ? "Category hidden" : "Category visible");
                      }}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                        cat.isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    >
                      {cat.isActive ? (
                        <><Eye className="w-3.5 h-3.5" /> Active</>
                      ) : (
                        <><EyeOff className="w-3.5 h-3.5" /> Inactive</>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setEditing(cat);
                        setShowForm(true);
                      }}
                      className="p-2 bg-slate-50 text-slate-500 hover:text-[#FF6B00] hover:bg-orange-50 rounded-xl transition-colors border border-slate-200 hover:border-orange-200"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(cat.id)}
                      className="p-2 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200 hover:border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

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
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                  {editing ? "Update" : "New"}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {editing ? "Edit Category" : "Add Category"}
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

            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Starters, Main Course"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Subcategories (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Veg Curries, Non-Veg Curries"
                  value={form.subcategories}
                  onChange={(e) => setForm({ ...form, subcategories: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
                />
                <p className="text-[10px] text-slate-400 mt-1">Separate multiple subcategories with a comma.</p>
              </div>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Visible to Customers
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Inactive categories won't appear on the website
                  </div>
                </div>
                <div
                  className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${
                    form.isActive ? "bg-[#FF6B00]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      form.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  ></div>
                </div>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
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
                  {editing ? "Update" : "Add"}
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
              Delete this category?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              This action can&apos;t be undone. If any food items are using this category, they won't be deleted but will lose their category tag.
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