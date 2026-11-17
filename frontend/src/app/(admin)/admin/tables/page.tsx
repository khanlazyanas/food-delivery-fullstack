"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Check,
  Users,
  MapPin,
  Grid3x3,
  LayoutGrid,
  Building2,
  TreePine,
  Home,
} from "lucide-react";
import { useBookingStore, Table } from "@/store/bookingStore";
import { useSettingsStore } from "@/store/settingsStore";
import toast from "react-hot-toast";

type Section = "Indoor" | "Outdoor" | "Private" | "Rooftop";

const SECTIONS: { key: Section; icon: typeof Home; color: string }[] = [
  { key: "Indoor", icon: Home, color: "from-blue-500 to-blue-600" },
  { key: "Outdoor", icon: TreePine, color: "from-green-500 to-green-600" },
  { key: "Private", icon: Building2, color: "from-purple-500 to-purple-600" },
  { key: "Rooftop", icon: LayoutGrid, color: "from-orange-500 to-orange-600" },
];

export default function AdminTablesPage() {
  const tables = useBookingStore((state) => state.tables);
  const addTable = useBookingStore((state) => state.addTable);
  const updateTable = useBookingStore((state) => state.updateTable);
  const deleteTable = useBookingStore((state) => state.deleteTable);
  const toggleTableActive = useBookingStore((state) => state.toggleTableActive);
  const resetToDefault = useBookingStore((state) => state.resetToDefault);
  const bookings = useBookingStore((state) => state.bookings);
  const settings = useSettingsStore((state) => state.settings);

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState<Section | "All">("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm] = useState({
    number: "",
    capacity: 2,
    section: "Indoor" as Section,
    isActive: true,
  });

  useEffect(() => {
    useBookingStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({
        number: editing.number,
        capacity: editing.capacity,
        section: editing.section,
        isActive: editing.isActive,
      });
    } else {
      setForm({
        number: "",
        capacity: 2,
        section: "Indoor",
        isActive: true,
      });
    }
  }, [editing, showForm]);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading...</div>;
  }

  // Filter
  let filtered = tables;
  if (sectionFilter !== "All") {
    filtered = filtered.filter((t) => t.section === sectionFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((t) => t.number.toLowerCase().includes(q));
  }

  // Stats
  const stats = {
    total: tables.length,
    active: tables.filter((t) => t.isActive).length,
    totalSeats: tables.reduce((sum, t) => sum + t.capacity, 0),
    activeSeats: tables
      .filter((t) => t.isActive)
      .reduce((sum, t) => sum + t.capacity, 0),
  };

  const sectionCounts = {
    Indoor: tables.filter((t) => t.section === "Indoor").length,
    Outdoor: tables.filter((t) => t.section === "Outdoor").length,
    Private: tables.filter((t) => t.section === "Private").length,
    Rooftop: tables.filter((t) => t.section === "Rooftop").length,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.number.trim()) {
      toast.error("Please enter table number");
      return;
    }
    if (form.capacity < 1 || form.capacity > 30) {
      toast.error("Capacity must be between 1 and 30");
      return;
    }

    if (editing) {
      updateTable(editing.id, form);
      toast.success("Table updated");
    } else {
      addTable(form);
      toast.success("Table added");
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    const activeBookings = bookings.filter(
      (b) =>
        b.tableId === id &&
        (b.status === "confirmed" || b.status === "pending")
    );
    if (activeBookings.length > 0) {
      toast.error(
        `Cannot delete — ${activeBookings.length} active booking(s) exist`
      );
      setConfirmDelete(null);
      return;
    }
    deleteTable(id);
    setConfirmDelete(null);
    toast.success("Table deleted");
  };

  const handleReset = () => {
    if (
      !confirm(
        "Reset all tables to default? This will delete custom tables and all bookings."
      )
    )
      return;
    resetToDefault();
    toast.success("Tables reset to default");
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Table Management
          </span>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">
            Tables & Seating
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Manage your restaurant tables and seating capacity
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
            <Plus className="w-4 h-4" /> Add Table
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0">
              <Grid3x3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Total Tables
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">
            {stats.total}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">
            {stats.active} active
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Total Seats
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">
            {stats.totalSeats}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">
            {stats.activeSeats} active
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Bookings
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">
            {bookings.length}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">All-time</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
              Max Guests
            </span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">
            {settings.maxGuestsPerBooking}
          </div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">Per booking</div>
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const count = sectionCounts[s.key];
          const isActive = sectionFilter === s.key;
          return (
            <button
              key={s.key}
              onClick={() =>
                setSectionFilter(isActive ? "All" : (s.key as Section))
              }
              className={`relative p-3 md:p-5 rounded-2xl border-2 transition-all text-left ${
                isActive
                  ? "border-[#FF6B00] bg-orange-50 shadow-lg shadow-orange-500/10"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div
                className={`w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br ${s.color} text-white rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-3 shadow-md`}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="font-bold text-slate-900 text-xs md:text-sm">{s.key}</div>
              <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                {count} table{count !== 1 ? "s" : ""}
              </div>
              {isActive && (
                <div className="absolute top-2 right-2 md:top-3 md:right-3 w-4 h-4 md:w-5 md:h-5 bg-[#FF6B00] rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search table number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base"
          />
        </div>
        {sectionFilter !== "All" && (
          <button
            onClick={() => setSectionFilter("All")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 text-[#FF6B00] text-xs md:text-sm font-bold hover:bg-orange-100 transition-colors whitespace-nowrap"
          >
            <X className="w-4 h-4" /> Clear filter
          </button>
        )}
      </div>

      {/* Table List - Responsive */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Grid3x3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No tables found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <div className="col-span-4">Table</div>
            <div className="col-span-3">Section</div>
            <div className="col-span-2">Capacity</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-100">
            {filtered.map((table) => {
              const sectionData = SECTIONS.find((s) => s.key === table.section);
              const SectionIcon = sectionData?.icon || Home;

              return (
                <div key={table.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 md:px-5 items-center hover:bg-slate-50/50 transition-colors">
                  
                  {/* Table Info */}
                  <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-11 md:h-11 bg-orange-100 text-[#FF6B00] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Grid3x3 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-sm md:text-base">
                          {table.number}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {table.id}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile Actions (Right aligned in row 1) */}
                    <div className="flex md:hidden items-center gap-1">
                      <button
                        onClick={() => {
                          setEditing(table);
                          setShowForm(true);
                        }}
                        className="p-2 bg-slate-50 text-slate-500 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-colors border border-slate-200"
                        aria-label="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(table.id)}
                        className="p-2 bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Section */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-start">
                    <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Section</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 bg-gradient-to-br ${sectionData?.color || "from-slate-500 to-slate-600"} text-white rounded-lg flex items-center justify-center`}>
                        <SectionIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs md:text-sm font-bold text-slate-700">
                        {table.section}
                      </span>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="md:col-span-2 flex items-center justify-between md:justify-start">
                    <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Capacity</span>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-900 text-sm md:text-base">{table.capacity}</span>
                      <span className="text-[10px] md:text-xs text-slate-500">seats</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2 flex items-center justify-between md:justify-start mt-1 md:mt-0 pt-2 md:pt-0 border-t border-slate-50 md:border-0">
                    <span className="md:hidden text-[10px] font-bold uppercase text-slate-400">Status</span>
                    <button
                      onClick={() => {
                        toggleTableActive(table.id);
                        toast.success(
                          table.isActive
                            ? "Table marked inactive"
                            : "Table marked active"
                        );
                      }}
                      className={`inline-flex items-center gap-1.5 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-full transition-colors ${
                        table.isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {table.isActive ? (
                        <>
                          <Eye className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Inactive
                        </>
                      )}
                    </button>
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden md:flex md:col-span-1 items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditing(table);
                        setShowForm(true);
                      }}
                      className="p-2 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(table.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
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
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">
                  {editing ? "Update" : "New"}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {editing ? "Edit Table" : "Add Table"}
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
              {/* Table Number */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Table Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g., T-11"
                  value={form.number}
                  onChange={(e) =>
                    setForm({ ...form, number: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all font-bold text-sm md:text-base"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Seating Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm md:text-base"
                />
                <div className="flex gap-1.5 md:gap-2 mt-2">
                  {[2, 4, 6, 8, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, capacity: n })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                        form.capacity === n
                          ? "bg-[#FF6B00] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                  Section *
                </label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    const isActive = form.section === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setForm({ ...form, section: s.key })}
                        className={`relative flex items-center gap-2 p-2.5 md:p-3 rounded-xl border-2 transition-all ${
                          isActive
                            ? "border-[#FF6B00] bg-orange-50"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br ${s.color} text-white rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-xs md:text-sm font-bold ${
                            isActive ? "text-slate-900" : "text-slate-600"
                          }`}
                        >
                          {s.key}
                        </span>
                        {isActive && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#FF6B00] rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-200 mt-2">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Table Active
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">
                    Inactive tables won&apos;t be bookable
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

              {/* Buttons */}
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
                  {editing ? "Update" : "Add Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRM ============ */}
      {confirmDelete && (
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
              Delete this table?
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