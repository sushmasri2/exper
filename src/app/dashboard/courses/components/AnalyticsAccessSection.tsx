"use client";
import { useState, useEffect } from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import Select2 from "@/components/ui/Select2";
import { getSpecialities, getCourseIntendedAudiences } from "@/lib/specialities-api";
import { getCourseSettings } from "@/lib/coursesetting-api";
import { Specialty } from "@/types/specialities";
import { CourseSetting } from "@/types/coursesetting";
import { Course } from "@/types/course";
import { CourseFormData } from "../hooks/useCourseData";

interface AnalyticsAccessSectionProps {
  courseData?: Course | null;
  formData: CourseFormData;
  onFieldChange: (field: string, value: string | string[]) => void;
}

export default function AnalyticsAccessSection({
  courseData,
  formData,
  onFieldChange,
}: AnalyticsAccessSectionProps) {
  const [specialities, setSpecialities] = useState<Specialty[]>([]);
  const [selectedIntendedAudiences, setSelectedIntendedAudiences] = useState<string[]>([]);
  const [courseSettings, setCourseSettings] = useState<CourseSetting | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch specialities
        const specialitiesData = await getSpecialities().catch((err) => {
          console.warn("Failed to fetch specialities:", err);
          return [] as Specialty[];
        });
        setSpecialities(Array.isArray(specialitiesData) ? specialitiesData : []);

        if (courseData?.uuid) {
          // Fetch course settings
          const settings = await getCourseSettings(courseData.uuid);
          if (settings) {
            setCourseSettings(settings);
          }

          // Fetch intended audiences for this course
          try {
            const intendedAudiencesResponse = await getCourseIntendedAudiences(courseData.uuid);
            if (intendedAudiencesResponse.status === "success" && intendedAudiencesResponse.data?.intendedAudiences) {
              const audienceIds = intendedAudiencesResponse.data.intendedAudiences.map((audience) =>
                audience.specialities_id.toString()
              );
              setSelectedIntendedAudiences(audienceIds);
              onFieldChange('intended_audiences', audienceIds);
            }
          } catch (err) {
            console.error("Error fetching course intended audiences:", err);
            setSelectedIntendedAudiences([]);
          }
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      }
    };

    fetchData();
  }, [courseData, onFieldChange]);

  const handleIntendedAudienceChange = (val: string | string[]) => {
    if (Array.isArray(val)) {
      setSelectedIntendedAudiences(val);
      onFieldChange('intended_audiences', val);
    }
  };

  const getFieldValue = (field: keyof CourseSetting | keyof CourseFormData): string => {
    // First check formData, then courseData, then courseSettings, then empty string
    const formValue = formData[field];
    if (typeof formValue === 'string') return formValue;
    
    const courseValue = courseData?.[field as keyof Course];
    if (typeof courseValue === 'string' || typeof courseValue === 'number') return String(courseValue);
    
    const settingsValue = courseSettings?.[field as keyof CourseSetting];
    if (typeof settingsValue === 'string' || typeof settingsValue === 'number') return String(settingsValue);
    
    return "";
  };

  const getBooleanFieldValue = (field: keyof CourseSetting | keyof CourseFormData): string => {
    // First check formData, then courseSettings, then empty string
    const formValue = formData[field];
    if (typeof formValue === 'string') return formValue;
    
    const settingsValue = courseSettings?.[field as keyof CourseSetting];
    if (typeof settingsValue === 'number' || typeof settingsValue === 'boolean') return String(settingsValue);
    
    return "";
  };

  return (
    <AccordionItem className="border rounded-lg mt-3" value="analytics-access-control">
      <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
        <h2>Analytics & Access Control</h2>
      </AccordionTrigger>
      <AccordionContent className="px-5 py-3">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="text-lg font-medium m-2">Rating</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('rating')}
              onChange={(e) => onFieldChange('rating', e.target.value)}
              placeholder="Enter Rating"
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Rating Count</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('rating_count')}
              onChange={(e) => onFieldChange('rating_count', e.target.value)}
              placeholder="Enter Rating Count"
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Active Learners</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('active_learners')}
              onChange={(e) => onFieldChange('active_learners', e.target.value)}
              placeholder="Enter Active Learners"
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">CPD Points</label>
            <Input
              type="text"
              className="mb-4 px-3 py-0"
              value={getFieldValue('cpd_points')}
              onChange={(e) => onFieldChange('cpd_points', e.target.value)}
              placeholder="Enter CPD Points"
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Contact Program</label>
            <Select2
              options={[
                { label: 'Yes', value: '1' },
                { label: 'No', value: '0' },
              ]}
              value={getBooleanFieldValue('enable_contact_programs')}
              onChange={(val) => {
                if (typeof val === 'string' && (val === '1' || val === '0')) {
                  onFieldChange('enable_contact_programs', val);
                }
              }}
              placeholder="Select Yes or No"
              style={{ padding: '0.6rem' }}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">KYC Required</label>
            <Select2
              options={[
                { label: 'Yes', value: '1' },
                { label: 'No', value: '0' },
              ]}
              value={getBooleanFieldValue('is_kyc_required')}
              onChange={(val) => {
                if (typeof val === 'string' && (val === '1' || val === '0')) {
                  onFieldChange('is_kyc_required', val);
                }
              }}
              placeholder="Select Yes or No"
              style={{ padding: '0.6rem' }}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Preferred Course</label>
            <Select2
              options={[
                { label: 'Yes', value: '1' },
                { label: 'No', value: '0' },
              ]}
              value={getBooleanFieldValue('is_preferred_course')}
              onChange={(val) => {
                if (typeof val === 'string' && (val === '1' || val === '0')) {
                  onFieldChange('is_preferred_course', val);
                }
              }}
              placeholder="Select Yes or No"
              style={{ padding: '0.6rem' }}
            />
          </div>
          <div>
            <label className="text-lg font-medium m-2">Intended Audience</label>
            <Select2
              options={specialities.map(specialty => ({
                label: specialty.name,
                value: specialty.id.toString()
              }))}
              value={selectedIntendedAudiences}
              onChange={handleIntendedAudienceChange}
              multiple={true}
              placeholder="Select Intended Audience"
              style={{ padding: '0.6rem' }}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}