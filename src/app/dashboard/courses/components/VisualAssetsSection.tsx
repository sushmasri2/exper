"use client";
import { useState, useEffect } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { getCourseSettings } from "@/lib/coursesetting-api";
import { CourseSetting } from "@/types/coursesetting";
import { Course } from "@/types/course";
import { CourseFormData } from "../hooks/useCourseData";

interface VisualAssetsSectionProps {
  courseData?: Course | null;
  formData: CourseFormData;
  onFieldChange: (field: string, value: string) => void;
}

export default function VisualAssetsSection({
  courseData,
  formData,
  onFieldChange,
}: VisualAssetsSectionProps) {
  const [courseSettings, setCourseSettings] = useState<CourseSetting | null>(null);

  useEffect(() => {
    const fetchCourseSettings = async () => {
      if (courseData?.uuid) {
        try {
          const settings = await getCourseSettings(courseData.uuid);
          if (settings) {
            setCourseSettings(settings);
          }
        } catch (err) {
          console.error("Error fetching course settings:", err);
        }
      }
    };

    fetchCourseSettings();
  }, [courseData]);

  const getFieldValue = (field: keyof CourseSetting): string => {
    // First check formData, then courseSettings, then empty string
    const formValue = formData[field];
    if (typeof formValue === 'string') return formValue;
    
    const settingsValue = courseSettings?.[field];
    if (typeof settingsValue === 'string') return settingsValue;
    
    return "";
  };

  return (
    <AccordionItem className="border rounded-lg mt-3" value="visual-assets-media">
      <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
        <h2>Visual Assets & Media</h2>
      </AccordionTrigger>
      <AccordionContent className="px-5 py-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-lg font-medium m-2">Banner of the Course</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('banner')}
              onChange={(e) => onFieldChange('banner', e.target.value)}
              placeholder="Enter Banner URL"
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Web Thumbnail</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('thumbnail_web')}
              onChange={(e) => onFieldChange('thumbnail_web', e.target.value)}
              placeholder="Enter Web Thumbnail URL"
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Mobile Thumbnail</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('thumbnail_mobile')}
              onChange={(e) => onFieldChange('thumbnail_mobile', e.target.value)}
              placeholder="Enter Mobile Thumbnail URL"
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Course Banner URL Web</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('course_demo_url')}
              onChange={(e) => onFieldChange('course_demo_url', e.target.value)}
              placeholder="Enter Course Demo URL"
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Course Banner URL Mobile</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('course_demo_mobile_url')}
              onChange={(e) => onFieldChange('course_demo_mobile_url', e.target.value)}
              placeholder="Enter Mobile Demo URL"
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Banner Alt Tag</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('banner_alt_tag')}
              onChange={(e) => onFieldChange('banner_alt_tag', e.target.value)}
              placeholder="Enter Banner Alt Tag"
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Brochure</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('brochure')}
              placeholder="Enter Brochure URL"
              onChange={(e) => onFieldChange('brochure', e.target.value)}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}