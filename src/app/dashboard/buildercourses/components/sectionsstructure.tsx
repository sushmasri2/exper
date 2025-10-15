"use client";

import { useState, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  GripVertical,
  BookOpen,
  Video,
  Pencil,
  Link2,
  Plus,
  FileText,
  PlayCircle,
  MessageSquare,
  Award,
} from "lucide-react";

import { AddActivityModal } from "@/components/ui/addactivitymodal";

type Activity = {
  id: string;
  title: string;
  type: "activity" | "resource";
  icon?: React.ElementType;
};

type Section = {
  id: string;
  title: string;
  activities: Activity[];
};

interface CourseSectionsProps {
  editMode?: boolean;
}

export default function CourseSections({ editMode = false }: CourseSectionsProps) {
  const [sections, setSections] = useState<Section[]>([
    {
      id: "section-1",
      title: "Introduction",
      activities: [
        { id: "a1", title: "Welcome Video", type: "activity", icon: Video },
        { id: "a2", title: "Course Overview", type: "resource", icon: BookOpen },
      ],
    },
    {
      id: "section-2",
      title: "Core Content",
      activities: [
        { id: "a3", title: "Lesson 1: Fundamentals", type: "activity", icon: PlayCircle },
        { id: "a4", title: "Reading Material", type: "resource", icon: FileText },
        { id: "a5", title: "Practice Exercise", type: "activity", icon: Video },
      ],
    },
    {
      id: "section-3",
      title: "Assessments",
      activities: [
        { id: "a6", title: "Quiz 1", type: "activity", icon: Award },
        { id: "a7", title: "Discussion Forum", type: "activity", icon: MessageSquare },
      ],
    },
  ]);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const addSection = useCallback(() => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `New Section`,
      activities: [],
    };
    setSections((prev) => [...prev, newSection]);
  }, []);

  const startEditingSection = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (section) {
      setEditingSection(id);
      setTempTitle(section.title);
    }
  };

  const saveSection = (id: string) => {
    if (tempTitle.trim()) {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: tempTitle.trim() } : s))
      );
    }
    setEditingSection(null);
    setTempTitle("");
  };

  const cancelEditingSection = () => {
    setEditingSection(null);
    setTempTitle("");
  };


  const deleteSection = (id: string) => {
    if (confirm("Are you sure you want to delete this section? This action cannot be undone.")) {
      setSections((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const duplicateSection = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (section) {
      const newSection: Section = {
        ...section,
        id: `section-${Date.now()}`,
        title: `${section.title} (Copy)`,
        activities: section.activities.map(activity => ({
          ...activity,
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      setSections((prev) => {
        const index = prev.findIndex(s => s.id === id);
        const newSections = [...prev];
        newSections.splice(index + 1, 0, newSection);
        return newSections;
      });
    }
  };

  // ✅ Add activity with optional index (middle insert)
  const addActivity = (
    sectionId: string,
    activity: Activity,
    index: number | null = null
  ) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const newActivities = [...s.activities];
        if (index !== null) newActivities.splice(index, 0, activity);
        else newActivities.push(activity);
        return { ...s, activities: newActivities };
      })
    );
  };

  const startEditingActivity = (sectionId: string, actId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const activity = section?.activities.find(a => a.id === actId);
    if (activity) {
      setEditingActivity(actId);
      setTempTitle(activity.title);
    }
  };

  const saveActivity = (sectionId: string, actId: string) => {
    if (tempTitle.trim()) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
              ...s,
              activities: s.activities.map((a) =>
                a.id === actId ? { ...a, title: tempTitle.trim() } : a
              ),
            }
            : s
        )
      );
    }
    setEditingActivity(null);
    setTempTitle("");
  };

  const cancelEditingActivity = () => {
    setEditingActivity(null);
    setTempTitle("");
  };


  const deleteActivity = (sectionId: string, actId: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
              ...s,
              activities: s.activities.filter((a) => a.id !== actId),
            }
            : s
        )
      );
    }
  };

  const duplicateActivity = (sectionId: string, actId: string) => {
    const section = sections.find(s => s.id === sectionId);
    const activity = section?.activities.find(a => a.id === actId);
    if (activity) {
      const newActivity: Activity = {
        ...activity,
        id: `act-${Date.now()}`,
        title: `${activity.title} (Copy)`
      };
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
              ...s,
              activities: [...s.activities, newActivity],
            }
            : s
        )
      );
    }
  };


  // ✅ Modal select handler (now respects insertIndex)
  const handleSelectActivity = (item: { name: string; type: string; icon: React.ComponentType }) => {
    if (!activeSection) return;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: item.name,
      type: item.type === "resource" ? "resource" : "activity",
      icon: item.icon, // ✅ include the icon
    };

    addActivity(activeSection, newActivity, insertIndex);
    setModalOpen(false);
    setInsertIndex(null);
  };

  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggedItem(id);
    // Add some visual feedback
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragEnd = () => {
    setDraggedItem(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop =
    (sectionId: string, targetId: string) => (e: React.DragEvent) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      if (draggedId === targetId) return;

      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          const items = [...s.activities];
          const draggedIndex = items.findIndex((a) => a.id === draggedId);
          const targetIndex = items.findIndex((a) => a.id === targetId);
          if (draggedIndex === -1 || targetIndex === -1) return s;
          const [moved] = items.splice(draggedIndex, 1);
          items.splice(targetIndex, 0, moved);
          return { ...s, activities: items };
        })
      );
      setDraggedItem(null);
    };

  return (
    <div className="space-y-4 relative">
      <Accordion type="multiple" className="w-full">
        {sections.map((section) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="rounded-lg border bg-white mb-4"
          >
            <AccordionTrigger className="relative flex items-center justify-between px-4 py-2 hover:bg-gray-50">
              <div className="flex items-center gap-2 font-semibold text-lg">
                {editMode && editingSection === section.id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveSection(section.id);
                        if (e.key === 'Escape') cancelEditingSection();
                      }}
                    />
                    <button
                      onClick={() => saveSection(section.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEditingSection}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{section.title}</span>
                    {editMode && (
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEditingSection(section.id);
                        }}
                        className="text-gray-500 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </span>
                    )}
                  </>
                )}
              </div>

              {editMode && (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="absolute right-10"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="rounded p-1 hover:bg-gray-100 cursor-pointer">
                        <MoreVertical className="h-4 w-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => startEditingSection(section.id)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit section name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateSection(section.id)}>
                        📋 Duplicate section
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          navigator.clipboard.writeText(window.location.href)
                        }
                      >
                        <Link2 className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteSection(section.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        🗑️ Delete section
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </AccordionTrigger>

            <AccordionContent className="px-4 py-3">
              <div className="space-y-0 relative">
                {section.activities.map((activity, index) => (
                  <div key={activity.id}>
                    {editMode && index > 0 && (
                      <div className="group relative flex justify-center -my-1">
                        <button
                          onClick={() => {
                            setActiveSection(section.id);
                            setInsertIndex(index);
                            setModalOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-gray-300 bg-white rounded-full h-6 w-6 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 shadow-sm"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    <div
                      draggable={editMode}
                      onDragStart={editMode ? onDragStart(activity.id) : undefined}
                      onDragEnd={editMode ? onDragEnd : undefined}
                      onDragOver={editMode ? onDragOver : undefined}
                      onDrop={editMode ? onDrop(section.id, activity.id) : undefined}
                      className={`group flex items-center gap-3 rounded-md border bg-white px-4 py-3 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 hover:border-blue-200 ${editMode && draggedItem === activity.id ? 'opacity-50 scale-95' : ''
                        } ${editMode ? '' : 'mb-3'}`}
                    >
                      {editMode && (
                        <span className="cursor-grab p-2 text-gray-400 group-hover:text-gray-600 transition-colors">
                          <GripVertical className="h-4 w-4" />
                        </span>
                      )}

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        {activity.icon ? (
                          (() => {
                            const Icon = activity.icon;
                            return <Icon className="h-4 w-4" />;
                          })()
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                      </span>

                      <div className="flex-1">
                        {editMode && editingActivity === activity.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value)}
                              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveActivity(section.id, activity.id);
                                if (e.key === 'Escape') cancelEditingActivity();
                              }}
                            />
                            <button
                              onClick={() => saveActivity(section.id, activity.id)}
                              className="text-green-600 hover:text-green-700 text-xs"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEditingActivity}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <p className="font-medium text-blue-600 hover:underline cursor-pointer">
                            {activity.title}
                          </p>
                        )}
                      </div>

                      {editMode && (
                        <>
                          <button
                            onClick={() => startEditingActivity(section.id, activity.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-600 text-sm transition-all duration-200 hover:bg-blue-50 rounded p-1"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="opacity-0 group-hover:opacity-100 rounded p-1 hover:bg-gray-100 transition-all duration-200">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => startEditingActivity(section.id, activity.id)}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit name
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => duplicateActivity(section.id, activity.id)}
                              >
                                📋 Duplicate activity
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteActivity(section.id, activity.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                🗑️ Delete activity
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Activity Button (last one) */}
                {editMode && (
                  <div
                    onClick={() => {
                      setActiveSection(section.id);
                      setInsertIndex(null);
                      setModalOpen(true);
                    }}
                    className="flex items-center gap-2 w-full border border-blue-400 bg-blue-50 text-blue-600 rounded-md px-4 py-3 mt-4 cursor-pointer hover:bg-blue-100 transition"
                  >
                    <div className="flex items-center justify-center border border-blue-400 rounded-full h-6 w-6 text-blue-600">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">
                      Add an activity or resource
                    </span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <AddActivityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelectActivity}
      />

      {editMode && (
        <div className="flex justify-start mt-6">
          <button
            onClick={addSection}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-blue-300 px-6 py-3 text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add new section
          </button>
        </div>
      )}
    </div>
  );
}
