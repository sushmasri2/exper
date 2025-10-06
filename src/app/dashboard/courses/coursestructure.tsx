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

export default function CourseSections() {
  const [sections, setSections] = useState<Section[]>([
    {
      id: "section-1",
      title: "Introduction",
      activities: [
        { id: "a1", title: "Welcome Video", type: "activity", icon: Video },
        { id: "a2", title: "Course Overview", type: "resource", icon: BookOpen },
      ],
    },
  ]);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const addSection = useCallback(() => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: `New Section`,
      activities: [],
    };
    setSections((prev) => [...prev, newSection]);
  }, []);

  const renameSection = (id: string) => {
    const newName = prompt("Enter new section name:");
    if (!newName) return;
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newName } : s))
    );
  };

  const deleteSection = (id: string) => {
    if (confirm("Delete this section?"))
      setSections((prev) => prev.filter((s) => s.id !== id));
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

  const renameActivity = (sectionId: string, actId: string) => {
    const newName = prompt("Enter new activity name:");
    if (!newName) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              activities: s.activities.map((a) =>
                a.id === actId ? { ...a, title: newName } : a
              ),
            }
          : s
      )
    );
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

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
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
                <span>{section.title}</span>
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    renameSection(section.id);
                  }}
                  className="text-gray-500 hover:text-blue-600 cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </span>
              </div>

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
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => renameSection(section.id)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit section
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteSection(section.id)}>
                      Delete section
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 py-3">
              <div className="space-y-0 relative">
                {section.activities.map((activity, index) => (
                  <div key={activity.id}>
                    {index > 0 && (
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
                      draggable
                      onDragStart={onDragStart(activity.id)}
                      onDragOver={onDragOver}
                      onDrop={onDrop(section.id, activity.id)}
                      className="flex items-center gap-3 rounded-md border bg-white px-4 py-3 shadow-sm hover:bg-gray-50"
                    >
                      <span className="cursor-grab p-2 text-gray-400">
                        <GripVertical className="h-4 w-4" />
                      </span>

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
                        <p className="font-medium text-blue-600 hover:underline">
                          {activity.title}
                        </p>
                      </div>

                      <button
                        onClick={() => renameActivity(section.id, activity.id)}
                        className="text-gray-500 hover:text-blue-600 text-sm"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded p-1 hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              renameActivity(section.id, activity.id)
                            }
                          >
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {/* Add Activity Button (last one) */}
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

      <div className="flex justify-start mt-4">
        <button
          onClick={addSection}
          className="rounded border border-blue-400 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
        >
          + Add topic
        </button>
      </div>
    </div>
  );
}
