import { useState, useEffect, useCallback } from 'react';
import { getCourses, UpdateCourse } from "@/lib/courses-api";
import { getCourseInstructors, getCourseInstructorLinks } from "@/lib/instructor-api";
import { getSpecialities, getCourseIntendedAudiences } from "@/lib/specialities-api";
import { getAccreditationPartners, getCourseAccreditationPartners } from '@/lib/accreditation-partners-api';
import { getCourseKeywords } from "@/lib/keywords-api";
import { getCourseSettings } from "@/lib/coursesetting-api";
import { createCourseSettings, updateCourseSettings } from "@/lib/coursesetting-api";
import { validateCourseData } from "../utils/validation";
import { convertCourseDataTypes, convertCourseSettingsTypes, logTypeConversion } from "../utils/typeConversion";
import { Course } from "@/types/course";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
import { Eligibility } from "@/types/eligibility";
import { Instructor } from "@/types/instructor";
import { Specialty } from "@/types/specialities";
import type { CourseSetting } from "@/types/coursesetting";
import { AccreditationPartner } from '@/types/accreditation-partners';
import { useFormValidation, ValidationState, ValidationActions } from './useFormValidation';

import { getCoursesCategory } from "@/lib/coursecategory-api";
import { getCoursesType } from "@/lib/coursetype-api";
import { getEligibilities, getCourseEligibilities } from "@/lib/eligibility-api";

export interface CourseSettingsData {
    // Static data
    categories: CourseCategory[];
    courseTypes: CourseType[];
    eligibilities: Eligibility[];
    courses: Course[];
    instructors: Instructor[];
    specialities: Specialty[];
    accreditationOptions: { label: string; value: string }[];

    // Course-specific data
    courseSettings: CourseSetting | null;
    selectedEligibilities: string[];
    keywords: string;
    selectedInstructors: string[];
    selectedIntendedAudiences: string[];
    selectedAccreditationPartners: string[];

    // Selected values
    selectedCategory: string;
    selectedCourseType: string;

    // Loading states
    isLoading: boolean;
    error: string | null;

    // Validation state
    validation: ValidationState;
}

export interface CourseSettingsActions {
    setSelectedCategory: (category: string) => void;
    setSelectedCourseType: (courseType: string) => void;
    setSelectedEligibilities: (eligibilities: string[]) => void;
    setKeywords: (keywords: string) => void;
    setSelectedInstructors: (instructors: string[]) => void;
    setSelectedIntendedAudiences: (audiences: string[]) => void;
    setSelectedAccreditationPartners: (partners: string[]) => void;
    setCourseSettings: (settings: CourseSetting | null) => void;

    // Validation actions
    validation: ValidationActions;

    // Update course handler
    updateCourse: (courseData: Partial<Course>, formData: Record<string, unknown>) => Promise<void>;
}

// Helper function to determine which fields belong to courseData vs courseSettings
function separateFields(formData: Record<string, unknown>) {
    // Course fields from the validation rules
    const courseFields = [
        'course_name', 'title', 'course_card_title', 'one_line_description', 'short_description', 
        'description', 'category_id', 'course_type_id',
        'seo_title', 'seo_description', 'seo_url', 'sem_url', 'cpd_points', 'active_learners', 
        'rating_count', 'rating', 'duration', 'kite_id', 'course_zoho_id', 'no_price'
    ];

    // Course settings fields from the validation rules
    const courseSettingFields = [
        'banner', 'overview', 'duration_years', 'duration_months', 'duration_days',
        'y_month', 'y_day', 'm_month', 'm_day', 'w_week', 'w_days', 'd_days',
        'schedule', 'end_date', 'course_start_date', 'accreditation',
        'extendedvalidity_years', 'extendedvalidity_months', 'extendedvalidity_days',
        'brochure', 'financial_aid', 'is_preferred_course', 'what_you_will_learn',
        'course_demo_url', 'course_demo_mobile_url', 'is_kyc_required', 'banner_alt_tag',
        'enable_contact_programs', 'enable_index_tag', 'thumbnail_mobile', 'thumbnail_web',
        'partner_coursecode', 'disclosure', 'summary', 'speciality_type', 'children_course'
    ];

    const courseDataFields: Record<string, unknown> = {};
    const courseSettingsFields: Record<string, unknown> = {};

    Object.entries(formData).forEach(([key, value]) => {
        if (courseFields.includes(key)) {
            courseDataFields[key] = value;
        } else if (courseSettingFields.includes(key)) {
            courseSettingsFields[key] = value;
        }
    });

    // Apply type conversion to each separated field group
    const convertedCourseDataFields = convertCourseDataTypes(courseDataFields);
    const convertedCourseSettingsFields = convertCourseSettingsTypes(courseSettingsFields);

    // Log type conversions for debugging in development
    if (process.env.NODE_ENV === 'development') {
        Object.entries(courseDataFields).forEach(([key, originalValue]) => {
            const convertedValue = convertedCourseDataFields[key];
            if (originalValue !== convertedValue) {
                logTypeConversion(key, originalValue, convertedValue, 'course field');
            }
        });

        Object.entries(courseSettingsFields).forEach(([key, originalValue]) => {
            const convertedValue = convertedCourseSettingsFields[key];
            if (originalValue !== convertedValue) {
                logTypeConversion(key, originalValue, convertedValue, 'course setting field');
            }
        });
    }

    return { 
        courseDataFields: convertedCourseDataFields, 
        courseSettingsFields: convertedCourseSettingsFields 
    };
}

export function useCourseSettingsData(courseData?: Course | null): [CourseSettingsData, CourseSettingsActions] {
    // Static data states
    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
    const [eligibilities, setEligibilities] = useState<Eligibility[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [specialities, setSpecialities] = useState<Specialty[]>([]);
    const [accreditationOptions, setAccreditationOptions] = useState<{ label: string; value: string }[]>([]);

    // Course-specific data states
    const [courseSettings, setCourseSettings] = useState<CourseSetting | null>(null);
    const [selectedEligibilities, setSelectedEligibilities] = useState<string[]>([]);
    const [keywords, setKeywords] = useState<string>("");
    const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
    const [selectedIntendedAudiences, setSelectedIntendedAudiences] = useState<string[]>([]);
    const [selectedAccreditationPartners, setSelectedAccreditationPartners] = useState<string[]>([]);

    // Selection states
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCourseType, setSelectedCourseType] = useState("");

    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Validation hook
    const [validationState, validationActions] = useFormValidation();

    const resetSelections = useCallback(() => {
        setSelectedCategory("");
        setSelectedCourseType("");
        setSelectedEligibilities([]);
        setKeywords("");
        setSelectedInstructors([]);
        setSelectedIntendedAudiences([]);
        setSelectedAccreditationPartners([]);
    }, []);

    const fetchCourseSpecificData = useCallback(async (courseUuid: string) => {
        try {
            // Fetch course eligibilities
            const courseEligibilities = await getCourseEligibilities(courseUuid);
            if (Array.isArray(courseEligibilities)) {
                setSelectedEligibilities(courseEligibilities.map(e => e.uuid.toString()));
            } else {
                console.warn("Course eligibilities response is not an array:", courseEligibilities);
                setSelectedEligibilities([]);
            }

            // Fetch keywords
            const keywordList = await getCourseKeywords(courseUuid);
            if (Array.isArray(keywordList)) {
                setKeywords(keywordList
                    .map(k => k?.keyword_text || '')
                    .filter(text => text.length > 0)
                    .join(", ")
                );
            } else {
                console.warn("Course keywords response is not an array:", keywordList);
                setKeywords("");
            }

            // Fetch course settings
            const settings = await getCourseSettings(courseUuid);
            // if (!settings) {
            //     console.log('No course settings found for course:', courseUuid);
            // } else {
            //     console.log('Course settings found for course:', courseUuid, settings);
            // }
            setCourseSettings(settings);

            // Fetch instructor links
            try {
                const instructorLinks = await getCourseInstructorLinks(courseUuid);
                if (Array.isArray(instructorLinks)) {
                    const instructorUuids = instructorLinks
                        .filter(link => link.CourseInstructor && link.CourseInstructor.uuid)
                        .map(link => link.CourseInstructor!.uuid);
                    setSelectedInstructors(instructorUuids);
                } else {
                    console.warn("Course instructor links response is not an array:", instructorLinks);
                    setSelectedInstructors([]);
                }
            } catch (err) {
                console.error("Error fetching course instructor links:", err);
                setSelectedInstructors([]);
            }

            // Fetch intended audiences
            try {
                const intendedAudiencesResponse = await getCourseIntendedAudiences(courseUuid);
                if (intendedAudiencesResponse.status === "success" && intendedAudiencesResponse.data?.intendedAudiences) {
                    const audienceIds = intendedAudiencesResponse.data.intendedAudiences.map((audience: { specialities_id: number }) =>
                        audience.specialities_id.toString()
                    );
                    setSelectedIntendedAudiences(audienceIds);
                }
            } catch (err) {
                console.error("Error fetching course intended audiences:", err);
                setSelectedIntendedAudiences([]);
            }


            // Fetch accreditation partners
            try {
                const courseAccreditationPartners = await getCourseAccreditationPartners(courseUuid);
                if (Array.isArray(courseAccreditationPartners)) {
                    const partnerUuids = courseAccreditationPartners.map(partner => partner.uuid);
                    setSelectedAccreditationPartners(partnerUuids);
                } else {
                    console.warn("Course accreditation partners response is not an array:", courseAccreditationPartners);
                    setSelectedAccreditationPartners([]);
                }
            } catch (err) {
                console.error("Error fetching course accreditation partners:", err);
                setSelectedAccreditationPartners([]);
            }
        } catch (err) {
            console.error("Error fetching course-specific data:", err);
            resetSelections();
        }
    }, [resetSelections]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch all static data
                const [
                    categoriesData,
                    courseTypesData,
                    eligibilitiesData,
                    coursesData,
                    instructorsData,
                    specialitiesData,
                    accreditationPartnersData
                ] = await Promise.all([
                    getCoursesCategory(),
                    getCoursesType(),
                    getEligibilities(),
                    getCourses().catch((err: Error) => {
                        console.warn("Failed to fetch courses:", err);
                        return [] as Course[];
                    }),
                    getCourseInstructors().catch((err: Error) => {
                        console.warn("Failed to fetch instructors:", err);
                        return [] as Instructor[];
                    }),
                    getSpecialities().catch((err: Error) => {
                        console.warn("Failed to fetch specialities:", err);
                        return [] as Specialty[];
                    }),
                    getAccreditationPartners().catch((err: Error) => {
                        console.warn("Failed to fetch accreditation partners:", err);
                        return [];
                    })
                ]);

                // Set static data
                setCategories(categoriesData);
                setCourseTypes(courseTypesData);
                setEligibilities(eligibilitiesData);
                setCourses(Array.isArray(coursesData) ? coursesData : []);
                setInstructors(Array.isArray(instructorsData) ? instructorsData : []);
                setSpecialities(Array.isArray(specialitiesData) ? specialitiesData : []);

                // Set accreditation options
                const accreditationPatternsList = [
                    { label: 'Select Accreditation Partners', value: '' },
                    ...accreditationPartnersData.map((partner: AccreditationPartner) => ({
                        label: partner.name,
                        value: partner.uuid ? String(partner.uuid) : partner.name
                    }))
                ];
                setAccreditationOptions(accreditationPatternsList);

                // Handle course-specific data if editing
                if (courseData) {
                    // Set category and course type selections
                    const category = categoriesData.find(
                        (c: CourseCategory) => c.id === Number(courseData.category_id)
                    );
                    if (category) setSelectedCategory(category.name);

                    const courseType = courseTypesData.find(
                        (ct: CourseType) => ct.id === Number(courseData.course_type_id)
                    );
                    if (courseType) setSelectedCourseType(courseType.name);

                    // Fetch course-specific data if UUID exists
                    if (courseData.uuid) {
                        await fetchCourseSpecificData(courseData.uuid);
                    }
                } else {
                    // Reset selections for new course
                    resetSelections();
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
                setError("Failed to load course data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [courseData, fetchCourseSpecificData, resetSelections]);

    // Main update course handler
    const updateCourse = useCallback(async (originalCourseData: Partial<Course>, formData: Record<string, unknown>) => {
        if (!originalCourseData?.uuid) {
            throw new Error('Course UUID is required for update');
        }

        // Separate fields into courseData and courseSettings
        const { courseDataFields, courseSettingsFields } = separateFields(formData);


        console.log("Course data fields:", courseDataFields.no_price);
        // Check if fields have actually changed
        const hasCourseDataChanges = Object.keys(courseDataFields).some(key => 
            courseDataFields[key] !== originalCourseData[key as keyof Course]
        );
        
        const hasCourseSettingsChanges = Object.keys(courseSettingsFields).length > 0;

        // Validate based on what's changing
        let validationResult = { isValid: true, errors: [] as import("../utils/validation").ValidationError[] };
        
        if (hasCourseDataChanges || hasCourseSettingsChanges) {
            validationResult = validateCourseData(
                hasCourseDataChanges ? courseDataFields as Partial<Course> : {},
                hasCourseSettingsChanges ? courseSettingsFields as Partial<CourseSetting> : {}
            );
        }

        if (!validationResult.isValid) {
            console.error("Validation failed:", validationResult.errors);
            throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
        }

        // Execute API calls based on what changed
        const promises: Promise<unknown>[] = [];

        // 1. Update course data if needed
        if (hasCourseDataChanges && Object.keys(courseDataFields).length > 0) {
            console.log("🔄 Calling UpdateCourse API...");
            promises.push(UpdateCourse(originalCourseData.uuid!, courseDataFields as Partial<Course>));
        }

        // 2. Create or update course settings if needed
        if (hasCourseSettingsChanges && Object.keys(courseSettingsFields).length > 0) {
            // Decide based on whether course settings exist or not
            if (courseSettings) {
                // Course settings exist, so UPDATE
                console.log("🔄 Course settings exist, updating...");
                promises.push(updateCourseSettings(courseSettings.uuid, courseSettingsFields as Partial<CourseSetting>));
            } else {
                // No course settings exist, so CREATE
                console.log("🆕 No course settings found, creating new ones...");
                promises.push(createCourseSettings(originalCourseData.uuid!, courseSettingsFields as Partial<CourseSetting>));
            }
        }

        // Execute all API calls
        if (promises.length > 0) {
            try {
                const results = await Promise.all(promises);
                
                // Refresh local state based on what was updated
                let courseDataResultIndex = -1;
                let settingsResultIndex = -1;
                
                // Determine result indices based on promise order
                if (hasCourseDataChanges && Object.keys(courseDataFields).length > 0) {
                    courseDataResultIndex = 0;
                    if (hasCourseSettingsChanges && Object.keys(courseSettingsFields).length > 0) {
                        settingsResultIndex = 1;
                    }
                } else if (hasCourseSettingsChanges && Object.keys(courseSettingsFields).length > 0) {
                    settingsResultIndex = 0;
                }
                
                // Refresh course data state if it was updated
                if (hasCourseDataChanges && courseDataResultIndex !== -1) {
                    const courseDataResult = results[courseDataResultIndex];
                    if (courseDataResult && typeof courseDataResult === 'object') {
                        // Update the local courses array to reflect the changes
                        setCourses(prevCourses => 
                            prevCourses.map(course => 
                                course.uuid === originalCourseData.uuid 
                                    ? { ...course, ...courseDataFields, ...courseDataResult }
                                    : course
                            )
                        );
                        console.log("🔄 Course data state refreshed");
                    }
                }
                
                // Refresh course settings state if it was updated/created
                if (hasCourseSettingsChanges && settingsResultIndex !== -1) {
                    const settingsResult = results[settingsResultIndex];
                    
                    if (settingsResult && typeof settingsResult === 'object') {
                        // If we have existing course settings, merge the updated fields
                        if (courseSettings) {
                            setCourseSettings({
                                ...courseSettings,
                                ...courseSettingsFields,
                                ...(settingsResult as Partial<CourseSetting>)
                            });
                        } else {
                            // If this was a create operation, set the new course settings
                            setCourseSettings(settingsResult as CourseSetting);
                        }
                        console.log("🔄 Course settings state refreshed");
                    }
                }
                
                if (!originalCourseData) {
                    console.log("🚀 Course published successfully!");
                } else {
                    console.log("✏️ Course updated successfully!", originalCourseData);
                }
                
                console.log("✅ All updates completed successfully!");
            } catch (error) {
                console.error("❌ Error during API calls:", error);
                throw error;
            }
        } else {
            console.log("ℹ️ No changes detected, skipping API calls");
        }
    }, [courseSettings]);

    const data: CourseSettingsData = {
        categories,
        courseTypes,
        eligibilities,
        courses,
        instructors,
        specialities,
        accreditationOptions,
        courseSettings,
        selectedEligibilities,
        keywords,
        selectedInstructors,
        selectedIntendedAudiences,
        selectedAccreditationPartners,
        selectedCategory,
        selectedCourseType,
        isLoading,
        error,
        validation: validationState,
    };

    const actions: CourseSettingsActions = {
        setSelectedCategory,
        setSelectedCourseType,
        setSelectedEligibilities,
        setKeywords,
        setSelectedInstructors,
        setSelectedIntendedAudiences,
        setSelectedAccreditationPartners,
        setCourseSettings,
        validation: validationActions,
        updateCourse,
    };

    return [data, actions];
}