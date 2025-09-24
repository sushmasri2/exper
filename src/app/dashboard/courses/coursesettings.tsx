"use client";
import { useState } from "react";
import { Course } from "@/types/course";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useCourseData } from "./hooks/useCourseData";
import { CourseSettingsService } from "./services/CourseSettingsService";
import CourseInformationSection from "./components/CourseInformationSection";
import VisualAssetsSection from "./components/VisualAssetsSection";
import CourseContentSection from "./components/CourseContentSection";
import CourseAdministrationSection from "./components/CourseAdministrationSection";
import AccreditationSection from "./components/AccreditationSection";
import AnalyticsAccessSection from "./components/AnalyticsAccessSection";

interface CourseSettingsProps {
  courseData?: Course | null;
}

export default function CourseSettings({ courseData }: CourseSettingsProps) {
  const { formData, updateField, updateMultipleFields } = useCourseData(courseData);
  
  // Complete list of all accordion items
  const allItemIds = [
    "course-information",
    "visual-assets-media",
    "course-content-support",
    "course-administration",
    "accreditation-compliance",
    "analytics-access-control",
  ];

  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Toggle all accordion sections
  const toggleAll = () => {
    if (openItems.length === allItemIds.length) {
      setOpenItems([]); // collapse all
    } else {
      setOpenItems(allItemIds); // expand all
    }
  };

  const handleSave = async (isDraft: boolean = true) => {
    setIsLoading(true);
    setValidationErrors({});

    try {
      let result;
      if (courseData?.uuid) {
        // Update existing course
        result = await CourseSettingsService.updateCourse(courseData.uuid, formData, isDraft);
      } else {
        // Create new course
        result = await CourseSettingsService.saveCourse(formData, isDraft);
      }

      if (result.success) {
        // Show success message
        console.log(result.message);
        // You can replace this with your preferred toast/notification system
        alert(result.message);
      } else {
        if (result.data && typeof result.data === 'object') {
          setValidationErrors(result.data);
        }
        console.error(result.message);
        alert(result.message);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('An unexpected error occurred while saving the course.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string | string[]) => {
    updateField(field, value);
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleMultipleFieldsChange = (fields: Record<string, string | number | boolean | string[] | null | undefined>) => {
    updateMultipleFields(fields);
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 justify-end">
        <Button onClick={toggleAll} disabled={isLoading}>
          {openItems.length === allItemIds.length ? "Collapse All" : "Expand All"}
        </Button>
      </div>

      {/* Display validation errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
          <ul className="text-red-700 text-sm">
            {Object.entries(validationErrors).map(([field, error]) => (
              <li key={field} className="mb-1">• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
        <CourseInformationSection
          courseData={courseData}
          formData={formData}
          onFieldChange={handleFieldChange}
          onMultipleFieldsChange={handleMultipleFieldsChange}
        />

        <VisualAssetsSection
          courseData={courseData}
          formData={formData}
          onFieldChange={handleFieldChange}
        />

        <CourseContentSection
          courseData={courseData}
          formData={formData}
          onFieldChange={handleFieldChange}
        />

        <CourseAdministrationSection
          courseData={courseData}
          formData={formData}
          onFieldChange={handleFieldChange}
        />

        <AccreditationSection
          courseData={courseData}
          formData={formData}
          onFieldChange={handleFieldChange}
        />

        <AnalyticsAccessSection
          courseData={courseData}
          formData={formData}
          onFieldChange={handleFieldChange}
        />
      </Accordion>

      <div className="flex justify-end gap-2 mt-4">
        <Button 
          variant="secondary" 
          onClick={() => handleSave(true)}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save as Draft"}
        </Button>
        <Button 
          variant="courseCreate" 
          onClick={() => handleSave(false)}
          disabled={isLoading}
        >
          {isLoading ? "Publishing..." : "Publish Course"}
        </Button>
      </div>
    </div>
  );
}