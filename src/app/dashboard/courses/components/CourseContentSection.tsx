"use client";
import { useState, useEffect } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent, Accordion } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { getCourseSettings } from "@/lib/coursesetting-api";
import { getCourseFAQs } from "@/lib/faqs-api";
import { CourseSetting } from "@/types/coursesetting";
import { FAQs } from "@/types/faqs";
import { Course } from "@/types/course";
import { CourseFormData } from "../hooks/useCourseData";

interface CourseContentSectionProps {
  courseData?: Course | null;
  formData: CourseFormData;
  onFieldChange: (field: string, value: string) => void;
}

export default function CourseContentSection({
  courseData,
  formData,
  onFieldChange,
}: CourseContentSectionProps) {
  const [courseSettings, setCourseSettings] = useState<CourseSetting | null>(null);
  const [faqs, setFAQs] = useState<FAQs[]>([]);
  const [faqOpenItems, setFaqOpenItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (courseData?.uuid) {
        try {
          // Fetch course settings
          const settings = await getCourseSettings(courseData.uuid);
          if (settings) {
            setCourseSettings(settings);
          }

          // Fetch FAQs
          const faqsResponse = await getCourseFAQs(courseData.uuid);
          if (faqsResponse.status === "success" && Array.isArray(faqsResponse.data)) {
            setFAQs(faqsResponse.data);
          } else {
            console.warn("Course FAQs response is not in expected format:", faqsResponse);
            setFAQs([]);
          }
        } catch (err) {
          console.error("Error fetching course content data:", err);
          setFAQs([]);
        }
      }
    };

    fetchData();
  }, [courseData]);

  const getFieldValue = (field: keyof CourseSetting | keyof CourseFormData): string => {
    // First check formData, then courseSettings, then empty string
    const formValue = formData[field];
    if (typeof formValue === 'string') return formValue;
    
    const settingsValue = courseSettings?.[field as keyof CourseSetting];
    if (typeof settingsValue === 'string') return settingsValue;
    
    return "";
  };

  return (
    <AccordionItem className="border rounded-lg mt-3" value="course-content-support">
      <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
        <h2>Course Content & Support</h2>
      </AccordionTrigger>
      <AccordionContent className="px-5 py-3">
        <div className="mb-4">
          <label className="text-lg font-medium m-2">Special Features</label>
          <Textarea
            placeholder="Special features of the course"
            className="mb-4 px-3 py-2"
            value={getFieldValue('what_you_will_learn')}
            onChange={(e) => onFieldChange('what_you_will_learn', e.target.value)}
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="text-lg font-medium m-2">What You Will Gain</label>
          <Textarea
            placeholder="What students will gain from this course"
            className="mb-4 px-3 py-2"
            value={getFieldValue('overview')}
            onChange={(e) => onFieldChange('overview', e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="text-lg font-medium m-2">Disclosure</label>
            <Textarea
              placeholder="Course disclosure information"
              className="mb-4 px-3 py-2"
              value={getFieldValue('disclosure')}
              onChange={(e) => onFieldChange('disclosure', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Financial Aid</label>
            <Textarea
              placeholder="Financial Aid details"
              className="mb-4 px-3 py-2"
              value={getFieldValue('financial_aid')}
              onChange={(e) => onFieldChange('financial_aid', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div>
          <label className="text-lg font-medium m-2">FAQs</label>
          <Accordion type="multiple" value={faqOpenItems} onValueChange={setFaqOpenItems}>
            {faqs.length > 0 ? (
              faqs.map((faq) => (
                <AccordionItem
                  key={faq.uuid}
                  className="border rounded-lg mt-3"
                  value={`faq-${faq.uuid}`}
                >
                  <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                    <h3>{faq.question}</h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 py-3">
                    <p>{faq.answers}</p>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="text-gray-500 italic mt-3 px-3">
                No FAQs available for this course.
              </div>
            )}
          </Accordion>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}