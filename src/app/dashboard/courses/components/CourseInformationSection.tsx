"use client";
import { useState, useEffect } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Select2 from "@/components/ui/Select2";
import { getCoursesCategory } from "@/lib/coursecategory-api";
import { CourseCategory } from "@/types/coursecategory";
import { getCoursesType } from "@/lib/coursetype-api";
import { CourseType } from "@/types/coursetype";
import { getEligibilities, getCourseEligibilities } from "@/lib/eligibility-api";
import { Eligibility } from "@/types/eligibility";
import { getCourses } from "@/lib/courses-api";
import { Course } from "@/types/course";
import { getCourseKeywords } from "@/lib/keywords-api";
import { CourseFormData } from "../hooks/useCourseData";
import { getCourseSettings } from "@/lib/coursesetting-api";
import { CourseSetting } from "@/types/coursesetting";

interface CourseInformationSectionProps {
  courseData?: Course | null;
  formData: CourseFormData;
  onFieldChange: (field: string, value: string | string[]) => void;
  onMultipleFieldsChange: (fields: Partial<CourseFormData>) => void;
}

export default function CourseInformationSection({
  courseData,
  formData,
  onFieldChange,
}: CourseInformationSectionProps) {
  // State for dropdowns
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [selectedCourseType, setSelectedCourseType] = useState("");
  const [eligibilities, setEligibilities] = useState<Eligibility[]>([]);
  const [selectedEligibilities, setSelectedEligibilities] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseSettings, setCourseSettings] = useState<CourseSetting | null>(null);
  const [keywords, setKeywords] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, courseTypesData, eligibilitiesData, coursesData] = await Promise.all([
          getCoursesCategory(),
          getCoursesType(),
          getEligibilities(),
          getCourses().catch((err) => {
            console.warn("Failed to fetch courses:", err);
            return [] as Course[];
          }),
        ]);

        setCategories(categoriesData);
        setCourseTypes(courseTypesData);
        setEligibilities(eligibilitiesData);
        setCourses(Array.isArray(coursesData) ? coursesData : []);

        // Prefill selections if editing an existing course
        if (courseData) {
          const category = categoriesData.find(
            (c) => c.id === Number(courseData.category_id)
          );
          if (category) setSelectedCategory(category.name);

          const courseType = courseTypesData.find(
            (ct) => ct.id === Number(courseData.course_type_id)
          );
          if (courseType) setSelectedCourseType(courseType.name);

          // Fetch course-specific data if UUID exists
          if (courseData.uuid) {
            try {
              // Fetch course settings to get children_course data
              const settings = await getCourseSettings(courseData.uuid);
              if (settings) {
                setCourseSettings(settings);
                // Set child course if it exists in settings
                if (settings.children_course) {
                  onFieldChange('child_course', settings.children_course);
                }
                // Set summary if it exists in settings
                if (settings.summary) {
                  onFieldChange('summary', settings.summary);
                }
              }

              // Fetch selected eligibilities for this course
              const courseEligibilities = await getCourseEligibilities(courseData.uuid);
              if (Array.isArray(courseEligibilities)) {
                const eligibilityIds = courseEligibilities.map(e => e.uuid.toString());
                setSelectedEligibilities(eligibilityIds);
                onFieldChange('eligibility_ids', eligibilityIds);
              }

              // Fetch keywords for this course
              const keywordList = await getCourseKeywords(courseData.uuid);
              if (Array.isArray(keywordList)) {
                const keywordString = keywordList
                  .map(k => k?.keyword_text || '')
                  .filter(text => text.length > 0)
                  .join(", ");
                setKeywords(keywordString);
              }
            } catch (err) {
              console.error("Error fetching course-specific data:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };

    fetchData();
  }, [courseData, onFieldChange]);

  const handleCategoryChange = (val: string | string[]) => {
    if (typeof val === 'string') {
      const category = categories.find(cat => cat.id.toString() === val);
      setSelectedCategory(category?.name || '');
      onFieldChange('category_id', val);
    }
  };

  const handleCourseTypeChange = (val: string | string[]) => {
    if (typeof val === 'string') {
      const courseType = courseTypes.find(ct => ct.id.toString() === val);
      setSelectedCourseType(courseType?.name || '');
      onFieldChange('course_type_id', val);
    }
  };

  const handleEligibilityChange = (val: string | string[]) => {
    if (Array.isArray(val)) {
      setSelectedEligibilities(val);
      onFieldChange('eligibility_ids', val);
    }
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeywords(value);
    onFieldChange('keywords', value);
  };

  return (
    <AccordionItem className="border rounded-lg" value="course-information">
      <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
        <h2>Course Information</h2>
      </AccordionTrigger>
      <AccordionContent className="px-5 py-3">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-lg font-medium m-2">Course Card Title</label>
            <Input
              type="text"
              placeholder="Course Title"
              className="mb-4 px-3 py-0"
              value={formData?.course_name || courseData?.course_name || ""}
              onChange={(e) => onFieldChange('course_name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Child Course</label>
            <Select2
              options={[
                { label: 'Select Child Course', value: '' },
                ...courses
                  .filter(c => !courseData || c.uuid !== courseData.uuid)
                  .map(c => ({
                    label: c.course_name || c.title || `Course #${c.id}`,
                    value: c.uuid || String(c.id)
                  }))
              ]}
              value={courseSettings?.children_course || (typeof formData.child_course === 'string' ? formData.child_course : '')}
              onChange={(val) => {
                if (typeof val === 'string') {
                  onFieldChange('child_course', val);
                }
              }}
              placeholder="Select Child Course"
              style={{ padding: '0.6rem' }}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Course Type</label>
            <Select2
              options={courseTypes.length > 0 ? [
                { label: 'Select Course Type', value: '' },
                ...courseTypes.map(type => ({ label: type.name, value: type.id.toString() }))
              ] : [{ label: 'Select Course Type', value: '' }]}
              value={selectedCourseType === '' ? '' : courseTypes.find(ct => ct.name === selectedCourseType)?.id.toString() || ''}
              onChange={handleCourseTypeChange}
              placeholder="Select Course Type"
              style={{ padding: '0.6rem' }}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Course Eligibility</label>
            <Select2
              options={eligibilities.length > 0 ?
                eligibilities.map(eligibility => ({
                  label: eligibility.name,
                  value: eligibility.uuid.toString()
                }))
                : []
              }
              value={selectedEligibilities}
              onChange={handleEligibilityChange}
              multiple={true}
              placeholder="Select Eligibilities"
              style={{ padding: '0.6rem' }}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Course Category</label>
            <Select2
              options={categories.length > 0 ? [
                { label: 'Select Category', value: '' },
                ...categories.map(cat => ({ label: cat.name, value: cat.id.toString() }))
              ] : [{ label: 'Select Category', value: '' }]}
              value={selectedCategory === '' ? '' : categories.find(cat => cat.name === selectedCategory)?.id.toString() || ''}
              onChange={handleCategoryChange}
              placeholder="Select Category"
              style={{ padding: '0.6rem' }}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Keywords</label>
            <Input
              type="text"
              placeholder="Keywords (comma separated)"
              className="mb-4 px-3 py-0"
              value={keywords}
              onChange={handleKeywordsChange}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Specialty Type</label>
            <Select2
              options={[
                { label: 'Select Specialty Type', value: '' },
                { label: 'Doctors', value: 'doctors' },
                { label: 'Nurses', value: 'nurses' },
                { label: 'Others', value: 'others' },
              ]}
              value={typeof formData.specialty_type === 'string' ? formData.specialty_type : ''}
              onChange={(val) => {
                if (typeof val === 'string') {
                  onFieldChange('specialty_type', val);
                }
              }}
              placeholder="Select Specialty Type"
              style={{ padding: '0.6rem' }}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-lg font-medium m-2">One Line Description</label>
          <Textarea
            placeholder="One line description of the course"
            className="mb-4 px-3 py-2"
            value={typeof formData.one_line_description === "string" ? formData.one_line_description : (courseData?.one_line_description || "")}
            onChange={(e) => onFieldChange('one_line_description', e.target.value)}
            rows={2}
          />
        </div>
        <div className="mb-4">
          <label className="text-lg font-medium m-2">Description</label>
          <Textarea
            placeholder="Course description"
            className="mb-4 px-3 py-2"
            value={typeof formData.description === "string" ? formData.description : (courseData?.description || "")}
            onChange={(e) => onFieldChange('description', e.target.value)}
            rows={4}
          />
        </div>
        <div className="mb-4">
          <label className="text-lg font-medium m-2">Course Summary</label>
          <Textarea
            placeholder="Course summary"
            className="mb-4 px-3 py-2"
            value={courseSettings?.summary || (typeof formData.summary === "string" ? formData.summary : "")}
            onChange={(e) => onFieldChange('summary', e.target.value)}
            rows={3}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}