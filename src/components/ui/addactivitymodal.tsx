"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  GraduationCap,
  ClipboardList,
  MessageCircle,
  Users,
  BarChart3,
  Book,
  HelpCircle,
  FileArchive,
  Link2,
  Video,
  File,
  Folder,
  FileText,
  LayoutGrid,
  Image,
  Music,
  Newspaper,
  Calendar,
} from "lucide-react";

type AddActivityModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: { name: string; type: string; icon: React.ComponentType }) => void;
};

export function AddActivityModal({ open, onClose, onSelect }: AddActivityModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "activity" | "resource">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  const items = [
    // 🎯 Activities
    { name: "Assignment", type: "activity", icon: GraduationCap, color: "text-green-600 bg-green-100" },
    { name: "Quiz", type: "activity", icon: ClipboardList, color: "text-pink-600 bg-pink-100" },
    { name: "Forum", type: "activity", icon: MessageCircle, color: "text-orange-600 bg-orange-100" },
    { name: "Chat", type: "activity", icon: MessageCircle, color: "text-blue-600 bg-blue-100" },
    { name: "Workshop", type: "activity", icon: Users, color: "text-rose-600 bg-rose-100" },
    { name: "Survey", type: "activity", icon: BarChart3, color: "text-purple-600 bg-purple-100" },
    { name: "Lesson", type: "activity", icon: Book, color: "text-indigo-600 bg-indigo-100" },
    { name: "Feedback", type: "activity", icon: HelpCircle, color: "text-yellow-600 bg-yellow-100" },
    { name: "SCORM Package", type: "activity", icon: FileArchive, color: "text-teal-600 bg-teal-100" },
    { name: "External Tool", type: "activity", icon: Link2, color: "text-gray-700 bg-gray-100" },
    { name: "Video", type: "activity", icon: Video, color: "text-blue-700 bg-blue-100" },

    // 📘 Resources
    { name: "File", type: "resource", icon: File, color: "text-purple-700 bg-purple-100" },
    { name: "Folder", type: "resource", icon: Folder, color: "text-teal-700 bg-teal-100" },
    { name: "Page", type: "resource", icon: FileText, color: "text-gray-700 bg-gray-100" },
    { name: "Book", type: "resource", icon: Book, color: "text-indigo-700 bg-indigo-100" },
    { name: "URL", type: "resource", icon: Link2, color: "text-blue-700 bg-blue-100" },
    { name: "Label", type: "resource", icon: LayoutGrid, color: "text-sky-700 bg-sky-100" },
    { name: "Image", type: "resource", icon: Image, color: "text-pink-700 bg-pink-100" },
    { name: "Audio", type: "resource", icon: Music, color: "text-orange-700 bg-orange-100" },
    { name: "Video Resource", type: "resource", icon: Video, color: "text-green-700 bg-green-100" },
    { name: "Page Article", type: "resource", icon: Newspaper, color: "text-amber-700 bg-amber-100" },
    { name: "Calendar Event", type: "resource", icon: Calendar, color: "text-emerald-700 bg-emerald-100" },
  ];

  // ✅ Apply tab + search filters
  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const modalContent = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1100px] rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Add an activity or resource</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search activities and resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 py-3 text-sm font-medium border-b border-gray-100">
          {[
            { id: "all", label: "All" },
            { id: "activity", label: "Activities" },
            { id: "resource", label: "Resources" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "all" | "activity" | "resource")}
              className={`pb-2 border-b-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid Items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-6 py-6 bg-white rounded-b-2xl">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => onSelect(item)}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-6 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 text-center shadow-sm"
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{item.type}</p>
              </button>
            );
          })}

          {filteredItems.length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-10 text-sm">
              No matching items found.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
