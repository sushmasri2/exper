"use client";
import { useState, useEffect } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import Select2 from "@/components/ui/Select2";
import { getCourseSettings } from "@/lib/coursesetting-api";
import { CourseSetting } from "@/types/coursesetting";
import { Course } from "@/types/course";
import { CourseFormData } from "../hooks/useCourseData";

interface AccreditationSectionProps {
  courseData?: Course | null;
  formData: CourseFormData;
  onFieldChange: (field: string, value: string | string[]) => void;
}

export default function AccreditationSection({
  courseData,
  formData,
  onFieldChange,
}: AccreditationSectionProps) {
  const [courseSettings, setCourseSettings] = useState<CourseSetting | null>(null);
  const [selectedAccreditationPartners, setSelectedAccreditationPartners] = useState<string[]>(['BAC']);

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

  const getFieldValue = (field: keyof CourseSetting | keyof CourseFormData): string => {
    // First check formData, then courseSettings, then empty string
    const formValue = formData[field];
    if (typeof formValue === 'string') return formValue;
    
    const settingsValue = courseSettings?.[field as keyof CourseSetting];
    if (typeof settingsValue === 'string') return settingsValue;
    
    return "";
  };

  const handleAccreditationPartnersChange = (val: string | string[]) => {
    if (Array.isArray(val)) {
      setSelectedAccreditationPartners(val);
      onFieldChange('accreditation_partners', val);
    }
  };

  return (
    <AccordionItem className="border rounded-lg mt-3" value="accreditation-compliance">
      <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
        <h2>Accreditation & Compliance</h2>
      </AccordionTrigger>
      <AccordionContent className="px-5 py-3">
        <div>
          <label className="text-lg font-medium m-2">Accreditation</label>
          <Textarea
            className="mb-4 px-3 py-2"
            value={getFieldValue('accreditation')}
            onChange={(e) => onFieldChange('accreditation', e.target.value)}
            placeholder="Enter Accreditation"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-lg font-medium m-2">Accreditation Partners</label>
            <Select2
              options={[
                { label: 'BAC', value: 'bac' },
                { label: 'GAPIO', value: 'gapio' },
              ]}
              multiple={true}
              value={selectedAccreditationPartners}
              onChange={handleAccreditationPartnersChange}
              placeholder="Select Accreditation Partners"
              style={{ padding: '0.6rem' }}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Accreditation Partners List</label>
            <Select2
              options={[
                { label: 'BAC', value: 'bac' },
                { label: 'GAPIO', value: 'gapio' },
              ]}
              multiple={true}
              value={selectedAccreditationPartners}
              onChange={handleAccreditationPartnersChange}
              placeholder="Select Accreditation Partners List"
              style={{ padding: '0.6rem' }}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}