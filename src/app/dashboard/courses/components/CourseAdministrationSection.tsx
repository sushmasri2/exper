"use client";
import { useState, useEffect } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import Select2 from "@/components/ui/Select2";
import { getCourseInstructors, getCourseInstructorLinks } from "@/lib/instructor-api";
import { getCourseSettings } from "@/lib/coursesetting-api";
import { Instructor } from "@/types/instructor";
import { CourseSetting } from "@/types/coursesetting";
import { Course } from "@/types/course";
import { CourseFormData } from "../hooks/useCourseData";

interface CourseAdministrationSectionProps {
  courseData?: Course | null;
  formData: CourseFormData;
  onFieldChange: (field: string, value: string | string[]) => void;
}

export default function CourseAdministrationSection({
  courseData,
  formData,
  onFieldChange,
}: CourseAdministrationSectionProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [courseSettings, setCourseSettings] = useState<CourseSetting | null>(null);

  // Helper: convert ISO datetime -> YYYY-MM-DD string for date inputs
  const isoToDateInput = (iso?: string | null): string => {
    if (!iso) return "";
    if (iso.includes("T")) return iso.split("T")[0];
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch instructors
        const instructorsData = await getCourseInstructors().catch((err) => {
          console.warn("Failed to fetch instructors:", err);
          return [] as Instructor[];
        });
        setInstructors(Array.isArray(instructorsData) ? instructorsData : []);

        if (courseData?.uuid) {
          // Fetch course settings
          const settings = await getCourseSettings(courseData.uuid);
          if (settings) {
            setCourseSettings(settings);
          }

          // Fetch instructor links for this course
          try {
            const instructorLinks = await getCourseInstructorLinks(courseData.uuid);
            if (Array.isArray(instructorLinks)) {
              const instructorUuids = instructorLinks
                .filter(link => link.CourseInstructor && link.CourseInstructor.uuid)
                .map(link => link.CourseInstructor!.uuid);
              setSelectedInstructors(instructorUuids);
              onFieldChange('instructor', instructorUuids);
            }
          } catch (err) {
            console.error("Error fetching course instructor links:", err);
            setSelectedInstructors([]);
          }
        }
      } catch (err) {
        console.error("Error fetching course administration data:", err);
      }
    };

    fetchData();
  }, [courseData, onFieldChange]);

  const handleInstructorChange = (val: string | string[]) => {
    if (Array.isArray(val)) {
      setSelectedInstructors(val);
      onFieldChange('instructor', val);
    }
  };

  const getFieldValue = (field: keyof CourseSetting | keyof CourseFormData, isDate: boolean = false): string => {
    // First check formData, then courseSettings, then empty string
    const formValue = formData[field];
    if (typeof formValue === 'string') return formValue;
    
    const settingsValue = courseSettings?.[field as keyof CourseSetting];
    if (typeof settingsValue === 'string') {
      return isDate ? isoToDateInput(settingsValue) : settingsValue;
    }
    
    return "";
  };

  return (
    <AccordionItem className="border rounded-lg mt-3" value="course-administration">
      <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
        <h2>Course Administration</h2>
      </AccordionTrigger>
      <AccordionContent className="px-5 py-3">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-lg font-medium m-2">Course Instructor</label>
            <Select2
              options={instructors.map(instructor => ({
                label: instructor.name ||
                  `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() ||
                  `Instructor #${instructor.id}`,
                value: instructor.uuid
              }))}
              value={selectedInstructors}
              onChange={handleInstructorChange}
              multiple={true}
              placeholder="Select Instructor"
              style={{ padding: '0.6rem' }}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Course Start</label>
            <Input
              type="date"
              className="mb-4 px-3 py-0"
              value={getFieldValue('course_start_date', true)}
              onChange={(e) => onFieldChange('course_start_date', e.target.value)}
              placeholder="Enter Course Start Date"
              style={{ padding: '0.6rem' }}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Course Duration(Y/M/D)</label>
            <div className="flex gap-2">
              <Input
                type="text"
                className="mb-4 px-3 py-0"
                value={getFieldValue('duration_years')}
                placeholder="Years"
                onChange={(e) => onFieldChange('duration_years', e.target.value)}
              />
              <Input
                type="text"
                className="mb-4 px-3 py-0"
                value={getFieldValue('duration_months')}
                onChange={(e) => onFieldChange('duration_months', e.target.value)}
                placeholder="Months"
              />
              <Input
                type="text"
                className="mb-4 px-3 py-0"
                value={getFieldValue('duration_days')}
                onChange={(e) => onFieldChange('duration_days', e.target.value)}
                placeholder="Days"
              />
            </div>
          </div>
          <div>
            <label className="text-lg font-medium m-2">Course Schedule</label>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <Select2
                  options={[
                    { label: 'Select Schedule', value: '' },
                    { label: 'Daily', value: 'daily' },
                    { label: 'Weekly', value: 'weekly' },
                    { label: 'Monthly', value: 'monthly' },
                  ]}
                  value={getFieldValue('schedule')}
                  onChange={(val) => {
                    if (typeof val === 'string') {
                      onFieldChange('schedule', val);
                    }
                  }}
                  placeholder="Select Schedule"
                  className="w-full"
                  style={{ padding: '0.6rem', width: '100%' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  type="date"
                  className="mb-4 px-3 py-0 w-full"
                  value={getFieldValue('end_date', true)}
                  onChange={(e) => onFieldChange('end_date', e.target.value)}
                  placeholder="Enter End Date"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-lg font-medium m-2">Extended Validity</label>
            <div className="flex gap-2">
              <Input
                type="text"
                className="mb-4 px-3 py-0"
                value={getFieldValue('extendedvalidity_years')}
                onChange={(e) => onFieldChange('extendedvalidity_years', e.target.value)}
                placeholder="Years"
              />
              <Input
                type="text"
                className="mb-4 px-3 py-0"
                value={getFieldValue('extendedvalidity_months')}
                onChange={(e) => onFieldChange('extendedvalidity_months', e.target.value)}
                placeholder="Months"
              />
              <Input
                type="text"
                className="mb-4 px-3 py-0"
                value={getFieldValue('extendedvalidity_days')}
                onChange={(e) => onFieldChange('extendedvalidity_days', e.target.value)}
                placeholder="Days"
              />
            </div>
          </div>
          <div>
            <label className="text-lg font-medium m-2">Partner Course Code</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('partner_coursecode')}
              onChange={(e) => onFieldChange('partner_coursecode', e.target.value)}
              placeholder="Enter Partner Course Code"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}