"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Music,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  IndianRupee,
  BarChart3,
  Image as ImageIcon,
} from "lucide-react";
import { useEventStore, Event } from "@/store/eventStore";
import toast from "react-hot-toast";

export default function AdminEventsPage() {
  const events = useEventStore((state) => state.events);
  const tickets = useEventStore((state) => state.tickets);
  const fetchEvents = useEventStore((state) => state.fetchEvents);
  const fetchTickets = useEventStore((state) => state.fetchTickets);
  const addEvent = useEventStore((state) => state.addEvent);
  const updateEvent = useEventStore((state) => state.updateEvent);
  const deleteEvent = useEventStore((state) => state.deleteEvent);
  const toggleEventActive = useEventStore((state) => state.toggleEventActive);
  const getBookedChairs = useEventStore((state) => state.getBookedChairs);

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    banner: "",
    artist: "",
    date: "",
    time: "20:00",
    venue: "",
    description: "",
    rules: "",
    ticketPrice: 999,
    totalChairs: 50,
    isActive: true,
  });

  useEffect(() => {
    fetchEvents();
    fetchTickets();
    setMounted(true);
  }, [fetchEvents, fetchTickets]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        banner: editing.banner,
        artist: editing.artist,
        date: editing.date,
        time: editing.time,
        venue: editing.venue,
        description: editing.description,
        rules: editing.rules,
        ticketPrice: editing.ticketPrice,
        totalChairs: editing.totalChairs,
        isActive: editing.isActive,
      });
    } else {
      setForm({
        name: "",
        banner: "",
        artist: "",
        date: "",
        time: "20:00",
        venue: "",
        description: "",
        rules: "",
        ticketPrice: 999,
        totalChairs: 50,
        isActive: true,
      });
    }
  }, [editing, showForm]);

  if (!mounted) {
    return <div className="text-slate-500 p-4">Loading events...</div>;
  }

  // Filter
  let filtered = events;
  if (activeFilter === "active") {
    filtered = filtered.filter((e) => e.isActive);
  } else if (activeFilter === "inactive") {
    filtered = filtered.filter((e) => !e.isActive);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.artist.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
    );
  }

  // Stats
  const totalRevenue = tickets.reduce(
    (sum, t) => (t.status !== "cancelled" ? sum + t.advancePaid : sum),
    0
  );
  const totalBookings = tickets.filter((t) => t.status !== "cancelled").length;
  const totalSeats = events.reduce((sum, e) => sum + e.totalChairs, 0);
  const bookedSeats = events.reduce(
    (sum, e) => sum + getBookedChairs(e.id).length,
    0
  );

  const counts = {
    all: events.length,
    active: events.filter((e) => e.isActive).length,
    inactive: events.filter((e) => !e.isActive).length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Please enter event name");
    if (!form.artist.trim()) return toast.error("Please enter artist name");
    if (!form.banner.trim()) return toast.error("Please add a banner image URL");
    if (!form.date) return toast.error("Please select a date");
    if (!form.venue.trim()) return toast.error("Please enter venue");
    if (form.ticketPrice <= 0) return toast.error("Enter valid ticket price");
    if (form.totalChairs < 1) return toast.error("Enter valid number of chairs");

    if (editing) {
      await updateEvent(editing.id, form);
      toast.success("Event updated");
    } else {
      await addEvent(form);
      toast.success("Event added");
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    const activeTickets = tickets.filter(
      (t) => t.eventId === id && t.status === "confirmed"
    );
    if (activeTickets.length > 0) {
      toast.error(`Cannot delete — ${activeTickets.length} active ticket(s) exist`);
      setConfirmDelete(null);
      return;
    }
    await deleteEvent(id);
    setConfirmDelete(null);
    toast.success("Event deleted");
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Event Management</span>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mt-1 md:mt-2">Events & Concerts</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Manage live concerts and event bookings</p>
        </div>

        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/30"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-orange-100 text-[#FF6B00] rounded-lg flex items-center justify-center flex-shrink-0"><Music className="w-3.5 h-3.5 md:w-4 md:h-4" /></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">Total Events</span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{counts.all}</div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">{counts.active} active</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"><Ticket className="w-3.5 h-3.5 md:w-4 md:h-4" /></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">Bookings</span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{totalBookings}</div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">tickets sold</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"><Users className="w-3.5 h-3.5 md:w-4 md:h-4" /></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">Seats Booked</span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">{bookedSeats}</div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">of {totalSeats}</div>
        </div>

        <div className="bg-white rounded-2xl p-3 md:p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0"><IndianRupee className="w-3.5 h-3.5 md:w-4 md:h-4" /></div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">Advance Collected</span>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString("en-IN")}</div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5">from confirmed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-3 md:p-4 border border-slate-100 mb-6 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name, artist or venue..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all capitalize whitespace-nowrap ${activeFilter === f ? "bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Music className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {filtered.map((event) => {
            const booked = getBookedChairs(event.id).length;
            const available = event.totalChairs - booked;
            const soldPercent = Math.round((booked / event.totalChairs) * 100);
            const eventTickets = tickets.filter((t) => t.eventId === event.id && t.status !== "cancelled");

            return (
              <div key={event.id} className="bg-white rounded-3xl border border-slate-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                {/* Banner */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={event.banner} alt={event.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  <button onClick={() => { toggleEventActive(event.id); toast.success(event.isActive ? "Event marked inactive" : "Event marked active"); }} className={`absolute top-3 right-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full shadow-lg transition-colors ${event.isActive ? "bg-green-500 text-white hover:bg-green-600" : "bg-slate-500 text-white hover:bg-slate-600"}`}>
                    {event.isActive ? <><Eye className="w-3.5 h-3.5" /> Active</> : <><EyeOff className="w-3.5 h-3.5" /> Inactive</>}
                  </button>

                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full shadow-lg">
                      <Ticket className="w-3.5 h-3.5 text-[#FF6B00]" />{eventTickets.length} tickets
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-black text-white tracking-tight leading-tight line-clamp-2 mb-1">{event.name}</h3>
                    <p className="text-sm text-white/80 line-clamp-1">feat. <span className="font-semibold text-white">{event.artist}</span></p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                      <span className="font-semibold text-xs md:text-sm truncate">{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                      <span className="font-semibold text-xs md:text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg col-span-2">
                      <MapPin className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                      <span className="font-semibold text-xs md:text-sm truncate">{event.venue}</span>
                    </div>
                  </div>

                  <div className="mb-5 flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500">{booked}/{event.totalChairs} seats booked</span>
                      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${soldPercent > 80 ? "text-red-600" : soldPercent > 50 ? "text-amber-600" : "text-green-600"}`}>{soldPercent}% sold</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${soldPercent > 80 ? "bg-red-500" : soldPercent > 50 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${soldPercent}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-[11px] md:text-xs text-slate-500">
                      <span className="font-medium">{available} seats available</span>
                      <span className="font-black text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded">₹{event.ticketPrice} / seat</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                    <Link href={`/admin/events/${event.id}`} className="flex-1 flex items-center justify-center gap-1.5 bg-[#3D1C00] hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-md">
                      <BarChart3 className="w-4 h-4" /> Bookings
                    </Link>
                    <button onClick={() => { setEditing(event); setShowForm(true); }} className="p-2.5 text-slate-500 bg-slate-100 hover:text-[#FF6B00] hover:bg-orange-50 rounded-xl transition-colors" aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDelete(event.id)} className="p-2.5 text-slate-500 bg-slate-100 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal (Same as before, just calling async handleSubmit) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div><span className="text-xs font-bold uppercase tracking-widest text-[#FF6B00]">{editing ? "Update" : "New"}</span><h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">{editing ? "Edit Event" : "Add Event"}</h2></div>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
               {/* Same Form Fields as before */}
               <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Event Name *</label>
                  <input type="text" placeholder="e.g., Live Sufi Night" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Artist / Performer *</label>
                  <input type="text" placeholder="e.g., Ustad Rahat Ali Khan" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Banner Image URL *</label>
                  <input type="url" placeholder="https://images.unsplash.com/..." value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base" />
                  {form.banner && <img src={form.banner} alt="Preview" className="w-full h-32 md:h-40 object-cover rounded-xl border border-slate-200 mt-2" />}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div><label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Date *</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base" /></div>
                <div><label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Time *</label><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base" /></div>
                <div className="sm:col-span-2"><label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Venue *</label><input type="text" placeholder="e.g., FoodieHub Rooftop Arena" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base" /></div>
              </div>
              <div className="space-y-4 pt-2">
                <div><label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Event Description *</label><textarea placeholder="Describe the event..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all resize-none text-sm md:text-base" /></div>
                <div><label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Rules / Instructions</label><textarea placeholder="e.g., Age 18+ only..." rows={2} value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all resize-none text-sm md:text-base" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div><label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Ticket Price (₹) *</label><input type="number" min="0" value={form.ticketPrice || ""} onChange={(e) => setForm({ ...form, ticketPrice: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base" /></div>
                <div><label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Total Chairs *</label><input type="number" min="1" value={form.totalChairs || ""} onChange={(e) => setForm({ ...form, totalChairs: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-[#FF6B00] focus:bg-white outline-none transition-all text-sm md:text-base" /></div>
              </div>
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-200 mt-2">
                <div><div className="font-bold text-slate-900 text-sm">Event Active</div><div className="text-xs text-slate-500 mt-0.5">Inactive events won&apos;t be visible to customers</div></div>
                <div className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${form.isActive ? "bg-[#FF6B00]" : "bg-slate-300"}`}><div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`}></div></div>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="hidden" />
              </label>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-xl transition-colors text-sm md:text-base">Cancel</button>
                <button type="submit" className="flex-1 bg-[#FF6B00] hover:bg-[#E56000] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 text-sm md:text-base">{editing ? "Update" : "Add Event"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 md:p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7" /></div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete this event?</h3>
            <p className="text-sm text-slate-500 mb-6">This action can&apos;t be undone. All associated tickets will also be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-colors text-sm md:text-base">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors text-sm md:text-base">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}