"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  MessageSquare,
  Eye,
  Send,
  RefreshCw,
  CheckCheck,
  Inbox,
  User,
  Bookmark,
} from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  status: "Unread" | "Read" | "Responded" | "Archived" | string;
  createdAt: string;
  updatedAt: string;
}

interface Enquiry {
  id: number;
  name: string;
  email?: string;
  phone: string;
  source: string;
  status: string; // Pending, FollowUp, Converted, Closed
  notes?: string;
  assignedTo?: string;
  createdAt: string;
}

export default function AdminEnquiriesPage() {
  const [activeTab, setActiveTab] = useState<"contact" | "walkin">("contact");

  // Contact Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [contactSearch, setContactSearch] = useState("");
  const [contactStatusFilter, setContactStatusFilter] = useState("ALL");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);

  // Walk-in Enquiries State
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);
  const [enquirySearch, setEnquirySearch] = useState("");
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState("ALL");
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryFormData, setEnquiryFormData] = useState({
    id: 0,
    name: "",
    email: "",
    phone: "",
    source: "Walk-in",
    status: "Pending",
    notes: "",
    assignedTo: "",
  });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");

  // Fetch Contact Messages
  const fetchContactMessages = async () => {
    try {
      setMessagesLoading(true);
      const res = await fetch("/api/admin/contact-messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching contact messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Fetch Walk-in Enquiries
  const fetchEnquiries = async () => {
    try {
      setEnquiriesLoading(true);
      const res = await fetch("/api/admin/enquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching enquiries:", err);
    } finally {
      setEnquiriesLoading(false);
    }
  };

  useEffect(() => {
    fetchContactMessages();
    fetchEnquiries();
  }, []);

  const triggerGlobalUpdate = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("enquiriesUpdated"));
    }
  };

  // Open Message Details & Mark as Read automatically if unread
  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);

    if (!msg.isRead || msg.status === "Unread") {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: true, status: "Read" } : m))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        const res = await fetch("/api/admin/contact-messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: msg.id, isRead: true, status: "Read" }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount);
          }
          triggerGlobalUpdate();
        }
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    }
  };

  // Update Contact Message Status
  const handleUpdateContactStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingMessageId(id);
      const isRead = newStatus !== "Unread";

      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus, isRead } : m))
      );
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus, isRead } : null));
      }

      const res = await fetch("/api/admin/contact-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, isRead }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
        triggerGlobalUpdate();
      } else {
        fetchContactMessages();
      }
    } catch (err) {
      console.error("Error updating contact status:", err);
      fetchContactMessages();
    } finally {
      setUpdatingMessageId(null);
    }
  };

  // Mark all messages as read
  const handleMarkAllRead = async () => {
    if (!confirm("Are you sure you want to mark all contact messages as read?")) return;
    try {
      const res = await fetch("/api/admin/contact-messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (res.ok) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true, status: m.status === "Unread" ? "Read" : m.status })));
        setUnreadCount(0);
        triggerGlobalUpdate();
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Delete Contact Message
  const handleDeleteContactMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact submission permanently?")) return;
    try {
      const res = await fetch("/api/admin/contact-messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
        triggerGlobalUpdate();
      }
    } catch (err) {
      console.error("Error deleting contact message:", err);
    }
  };

  // Walk-in Enquiries Handlers
  const handleOpenCreateEnquiry = () => {
    setEnquiryFormData({
      id: 0,
      name: "",
      email: "",
      phone: "",
      source: "Walk-in",
      status: "Pending",
      notes: "",
      assignedTo: "",
    });
    setEnquiryError("");
    setShowEnquiryModal(true);
  };

  const handleOpenEditEnquiry = (e: Enquiry) => {
    setEnquiryFormData({
      id: e.id,
      name: e.name,
      email: e.email || "",
      phone: e.phone,
      source: e.source,
      status: e.status,
      notes: e.notes || "",
      assignedTo: e.assignedTo || "",
    });
    setEnquiryError("");
    setShowEnquiryModal(true);
  };

  const handleSubmitEnquiry = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setEnquirySubmitting(true);
    setEnquiryError("");

    try {
      const method = enquiryFormData.id ? "PATCH" : "POST";
      const res = await fetch("/api/admin/enquiries", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiryFormData),
      });

      if (res.ok) {
        setShowEnquiryModal(false);
        fetchEnquiries();
      } else {
        const d = await res.json();
        setEnquiryError(d.error || "Failed to save enquiry.");
      }
    } catch {
      setEnquiryError("Network error while saving.");
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleDeleteEnquiry = async (id: number) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchEnquiries();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Contact Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((item) => {
      const query = contactSearch.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        (item.phone && item.phone.includes(query)) ||
        (item.subject && item.subject.toLowerCase().includes(query)) ||
        (item.message && item.message.toLowerCase().includes(query));

      const matchesStatus =
        contactStatusFilter === "ALL" ||
        (contactStatusFilter === "Unread" && (!item.isRead || item.status === "Unread")) ||
        (contactStatusFilter === "Read" && item.isRead && item.status === "Read") ||
        item.status === contactStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, contactSearch, contactStatusFilter]);

  // Filtered Walk-in Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const query = enquirySearch.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.phone.includes(query) ||
        (item.email && item.email.toLowerCase().includes(query));

      const matchesStatus = enquiryStatusFilter === "ALL" || item.status === enquiryStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enquiries, enquirySearch, enquiryStatusFilter]);

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
    } catch {
      return { date: dateStr, time: "" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0D0D12] border border-white/10 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Inbox className="w-3.5 h-3.5" /> Communications &amp; Leads Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase tracking-tight flex items-center gap-3">
            Gym Enquiries &amp; Submissions
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-xs font-black tracking-normal animate-pulse shadow-lg shadow-emerald-500/30">
                {unreadCount} UNREAD
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time Contact Us messages from website visitors and prospective gym member enquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              fetchContactMessages();
              fetchEnquiries();
            }}
            title="Refresh submissions"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${messagesLoading ? "animate-spin text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {activeTab === "contact" && unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}

          {activeTab === "walkin" && (
            <button
              onClick={handleOpenCreateEnquiry}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" /> Add Lead
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "contact"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Contact Us Submissions</span>
          {unreadCount > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "contact" ? "bg-black text-emerald-400" : "bg-emerald-500 text-black"
              }`}
            >
              {unreadCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("walkin")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "walkin"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Walk-in &amp; Direct Leads</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 text-[10px] font-mono">
            {enquiries.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CONTACT US SUBMISSIONS */}
      {activeTab === "contact" && (
        <div className="space-y-4">
          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0D0D12] border border-white/10 p-4 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search name, email, phone, subject, message..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
              <span className="text-xs text-gray-500 font-bold uppercase mr-1 shrink-0">Filter:</span>
              {["ALL", "Unread", "Read", "Responded", "Archived"].map((st) => (
                <button
                  key={st}
                  onClick={() => setContactStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    contactStatusFilter === st
                      ? "bg-emerald-500 text-black shadow-md"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {st}
                  {st === "Unread" && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-black/30 text-[9px] font-black">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions Table / List */}
          <div className="bg-[#0D0D12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {messagesLoading ? (
              <div className="p-16 text-center text-gray-500">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading contact form submissions from database...
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-16 text-center text-gray-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-emerald-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-300">No Contact Submissions Found</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {contactSearch || contactStatusFilter !== "ALL"
                    ? "No contact submissions match your search or filter criteria."
                    : "When users submit the Contact Us form on your website, their submissions will appear here in real-time."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-4 px-6">Sender Details</th>
                      <th className="py-4 px-6">Subject &amp; Message Preview</th>
                      <th className="py-4 px-6">Date &amp; Time</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredMessages.map((msg) => {
                      const isUnread = !msg.isRead || msg.status === "Unread";
                      const dt = formatDateTime(msg.createdAt);

                      return (
                        <tr
                          key={msg.id}
                          className={`transition-colors cursor-pointer ${
                            isUnread ? "bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]" : "hover:bg-white/[0.02]"
                          }`}
                          onClick={() => handleOpenMessage(msg)}
                        >
                          {/* Sender */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {isUnread && (
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 shrink-0" />
                              )}
                              <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                  {msg.name}
                                  {isUnread && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[9px] font-black uppercase">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                  <Mail className="w-3 h-3 text-emerald-400/80" /> {msg.email}
                                </div>
                                {msg.phone && (
                                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                    <Phone className="w-3 h-3 text-emerald-400/80" /> {msg.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Subject & Message */}
                          <td className="py-4 px-6 max-w-md">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                              <Bookmark className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{msg.subject || "General Inquiry"}</span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                              {msg.message}
                            </p>
                          </td>

                          {/* Date/Time */}
                          <td className="py-4 px-6 text-xs whitespace-nowrap">
                            <div className="text-gray-300 font-medium">{dt.date}</div>
                            <div className="text-[11px] text-gray-500">{dt.time}</div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={msg.status}
                              disabled={updatingMessageId === msg.id}
                              onChange={(e) => handleUpdateContactStatus(msg.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-bold border appearance-none text-center cursor-pointer transition-all ${
                                msg.status === "Unread" || !msg.isRead
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-black"
                                  : msg.status === "Responded"
                                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                  : msg.status === "Archived"
                                  ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              }`}
                            >
                              <option value="Unread" className="bg-[#121218] text-white">Unread</option>
                              <option value="Read" className="bg-[#121218] text-white">Read</option>
                              <option value="Responded" className="bg-[#121218] text-white">Responded</option>
                              <option value="Archived" className="bg-[#121218] text-white">Archived</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenMessage(msg)}
                                title="View Message Details"
                                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors text-gray-300"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <a
                                href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || "Your inquiry at Pinaka Fitness")}`}
                                title="Reply via Email"
                                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-gray-300"
                              >
                                <Send className="w-4 h-4" />
                              </a>
                              {msg.phone && (
                                <a
                                  href={`tel:${msg.phone}`}
                                  title="Call Prospect"
                                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors text-gray-300"
                                >
                                  <Phone className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteContactMessage(msg.id)}
                                title="Delete Message"
                                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 transition-colors text-gray-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WALK-IN & DIRECT LEADS */}
      {activeTab === "walkin" && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0D0D12] border border-white/10 p-4 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={enquirySearch}
                onChange={(e) => setEnquirySearch(e.target.value)}
                placeholder="Search by prospect name, phone, email..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
              <span className="text-xs text-gray-500 font-bold uppercase mr-1">Status:</span>
              {["ALL", "Pending", "FollowUp", "Converted", "Closed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setEnquiryStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    enquiryStatusFilter === st
                      ? "bg-emerald-500 text-black shadow-md"
                      : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Enquiries List */}
          <div className="bg-[#0D0D12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {enquiriesLoading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading enquiries...
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <Building2 className="w-10 h-10 text-emerald-500/40 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No Enquiries Found</p>
                <p className="text-xs text-gray-500">Add walk-in or prospective phone enquiries to start tracking leads.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-4 px-6">Prospect Name</th>
                      <th className="py-4 px-6">Contact Info</th>
                      <th className="py-4 px-6">Source</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6">Assigned To</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredEnquiries.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[10px] text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                        </td>

                        <td className="py-4 px-6 text-xs space-y-0.5">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Phone className="w-3 h-3 text-emerald-400" /> {item.phone}
                          </div>
                          {item.email && (
                            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                              <Mail className="w-3 h-3 text-gray-500" /> {item.email}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6 text-xs text-gray-400">
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px]">
                            {item.source}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              item.status === "Converted"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : item.status === "FollowUp"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : item.status === "Closed"
                                ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-xs text-gray-400">
                          {item.assignedTo || "—"}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditEnquiry(item)}
                              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors text-gray-300"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEnquiry(item.id)}
                              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 transition-colors text-gray-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTACT MESSAGE DETAILS VIEW MODAL */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[150] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                      Website Contact Form Submission
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatDateTime(selectedMessage.createdAt).date} at {formatDateTime(selectedMessage.createdAt).time}
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-black text-white uppercase tracking-tight">
                    {selectedMessage.subject || "Contact Form Inquiry"}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Prospect Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Sender Name */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" /> Prospect Name
                  </span>
                  <div className="text-sm font-bold text-white truncate">{selectedMessage.name}</div>
                </div>

                {/* Sender Email */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email Address
                  </span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-xs font-mono text-emerald-400 hover:underline truncate block"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

                {/* Sender Phone */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone Number
                  </span>
                  <div className="text-xs font-mono text-white">
                    {selectedMessage.phone ? (
                      <a href={`tel:${selectedMessage.phone}`} className="hover:text-emerald-400 transition-colors">
                        {selectedMessage.phone}
                      </a>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Message Box */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Complete Submitted Message
                </span>
                <div className="p-5 rounded-2xl bg-black/60 border border-white/10 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-60 overflow-y-auto custom-scrollbar">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Status Selector & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase">Update Status:</span>
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleUpdateContactStatus(selectedMessage.id, e.target.value)}
                    className="bg-[#121218] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Unread">Unread</option>
                    <option value="Read">Read</option>
                    <option value="Responded">Responded</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || "Inquiry at Pinaka Fitness")}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="w-3.5 h-3.5" /> Reply Email
                  </a>

                  {selectedMessage.phone && (
                    <a
                      href={`https://wa.me/${selectedMessage.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      WhatsApp
                    </a>
                  )}

                  <button
                    onClick={() => handleDeleteContactMessage(selectedMessage.id)}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
                    title="Delete Submission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT WALK-IN ENQUIRY MODAL */}
      <AnimatePresence>
        {showEnquiryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowEnquiryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D0D12] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-heading font-bold text-white uppercase">
                  {enquiryFormData.id ? "Edit Enquiry" : "Log New Enquiry"}
                </h3>
                <button onClick={() => setShowEnquiryModal(false)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Prospect Name</label>
                  <input
                    type="text"
                    required
                    value={enquiryFormData.name}
                    onChange={(e) => setEnquiryFormData((d) => ({ ...d, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Full Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={enquiryFormData.phone}
                      onChange={(e) => setEnquiryFormData((d) => ({ ...d, phone: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Email (Optional)</label>
                    <input
                      type="email"
                      value={enquiryFormData.email}
                      onChange={(e) => setEnquiryFormData((d) => ({ ...d, email: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Lead Source</label>
                    <select
                      value={enquiryFormData.source}
                      onChange={(e) => setEnquiryFormData((d) => ({ ...d, source: e.target.value }))}
                      className="w-full bg-[#121218] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Walk-in">Walk-in</option>
                      <option value="Website">Website</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Lead Status</label>
                    <select
                      value={enquiryFormData.status}
                      onChange={(e) => setEnquiryFormData((d) => ({ ...d, status: e.target.value }))}
                      className="w-full bg-[#121218] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="FollowUp">FollowUp</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Assigned Staff / Admin</label>
                  <input
                    type="text"
                    value={enquiryFormData.assignedTo}
                    onChange={(e) => setEnquiryFormData((d) => ({ ...d, assignedTo: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Staff name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Notes / Preferences</label>
                  <textarea
                    rows={3}
                    value={enquiryFormData.notes}
                    onChange={(e) => setEnquiryFormData((d) => ({ ...d, notes: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Interested in yearly membership, weight loss training..."
                  />
                </div>

                {enquiryError && (
                  <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {enquiryError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEnquiryModal(false)}
                    className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold uppercase text-gray-400 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={enquirySubmitting}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs uppercase shadow-lg disabled:opacity-50"
                  >
                    {enquirySubmitting ? "Saving..." : "Save Enquiry"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
