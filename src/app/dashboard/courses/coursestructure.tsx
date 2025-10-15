"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Video,
  FileText,
  PlayCircle,
  MessageSquare,
  Award,
} from "lucide-react";

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
  const [sections] = useState<Section[]>([
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
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 py-3">
              <div className="space-y-3 relative">
                {section.activities.map((activity) => (
                  <div key={activity.id}>
                    <div className="flex items-center gap-3 rounded-md border bg-white px-4 py-3 shadow-sm hover:bg-gray-50 transition-all duration-200 cursor-pointer">
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
                        <p className="font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {activity.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
