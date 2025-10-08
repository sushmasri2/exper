import { useState, useEffect, useCallback } from 'react';
import { Course } from "@/types/course";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
import { UpdateCourse } from "@/lib/courses-api";
import { createCourseSettings, updateCourseSettings } from "@/lib/coursesetting-api";
import { validateFormData, ValidationResult } from "../utils/validation";
import { CourseSettingsPartialFormData } from "@/types/course-settings-form";
import { Eligibility } from "@/types/eligibility";
import { Instructor } from "@/types/instructor";
import { Specialty } from "@/types/specialities";
import type { CourseSetting } from "@/types/coursesetting";
import { AccreditationPartner } from '@/types/accreditation-partners';
import { FAQs } from "@/types/faqs";
import { useFormValidation, ValidationState, ValidationActions } from './useFormValidation';

import { getCoursesCategory } from "@/lib/coursecategory-api";
import { getCoursesType } from "@/lib/coursetype-api";
import { getEligibilities, getCourseEligibilities } from "@/lib/eligibility-api";
import { getCourses } from "@/lib/courses-api";
import { getCourseInstructors, getCourseInstructorLinks } from "@/lib/instructor-api";
import { getSpecialities, getCourseIntendedAudiences } from "@/lib/specialities-api";
import { getAccreditationPartners, getCourseAccreditationPartners } from '@/lib/accreditation-partners-api';
import { getCourseKeywords } from "@/lib/keywords-api";
import { getCourseSettings } from "@/lib/coursesetting-api";
import { getCourseFAQs } from "@/lib/faqs-api";

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
    faqs: FAQs[];
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
    setFAQs: (faqs: FAQs[]) => void;
    setSelectedAccreditationPartners: (partners: string[]) => void;
    setCourseSettings: (settings: CourseSetting | null) => void;
    
    // Update functions
    updateCourseData: (formData: CourseSettingsPartialFormData, validationData?: CourseSettingsPartialFormData) => Promise<ValidationResult & { success?: boolean; data?: Course | CourseSetting }>;
    
    // Validation actions
    validation: ValidationActions;
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
    const [faqs, setFAQs] = useState<FAQs[]>([]);
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
        setFAQs([]);
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
            try {
                const settings = await getCourseSettings(courseUuid);
                if (settings) {
                    setCourseSettings(settings);
                }
            } catch (err) {
                console.error("Error fetching course settings:", err);
            }

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

            // Fetch FAQs
            try {
                const faqsResponse = await getCourseFAQs(courseUuid);
                if (faqsResponse.status === "success" && Array.isArray(faqsResponse.data)) {
                    setFAQs(faqsResponse.data);
                } else {
                    console.warn("Course FAQs response is not in expected format:", faqsResponse);
                    setFAQs([]);
                }
            } catch (err) {
                console.error("Error fetching course FAQs:", err);
                setFAQs([]);
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

    // Function to separate course fields from course settings fields
    const separateFormData = useCallback((formData: CourseSettingsPartialFormData) => {
        const courseFields = [
            'course_name', 'title', 'course_card_title', 'one_line_description', 'short_description', 
            'description', 'category_id', 'course_type_id', 'course_code', 'short_code', 
            'seo_title', 'seo_description', 'seo_url', 'sem_url', 'duration', 'location', 
            'status', 'version', 'no_price'
        ];

        const courseData: Partial<Course> = {};
        const courseSettingsData: Partial<CourseSetting> = {};

        Object.entries(formData).forEach(([key, value]) => {
            if (courseFields.includes(key)) {
                (courseData as Record<string, unknown>)[key] = value;
            } else {
                (courseSettingsData as Record<string, unknown>)[key] = value;
            }
        });

        return { courseData, courseSettingsData };
    }, []);

    // Function to detect what has changed
    const detectChanges = useCallback((formData: CourseSettingsPartialFormData, originalCourse?: Course | null, originalSettings?: CourseSetting | null) => {
        const { courseData: newCourseData, courseSettingsData: newSettingsData } = separateFormData(formData);
        
        let courseChanged = false;
        let settingsChanged = false;

        // Check course changes
        if (originalCourse) {
            Object.keys(newCourseData).forEach(key => {
                if (newCourseData[key as keyof Course] !== originalCourse[key as keyof Course]) {
                    courseChanged = true;
                }
            });
        } else if (Object.keys(newCourseData).length > 0) {
            courseChanged = true;
        }

        // Check settings changes
        if (originalSettings) {
            Object.keys(newSettingsData).forEach(key => {
                if (newSettingsData[key as keyof CourseSetting] !== originalSettings[key as keyof CourseSetting]) {
                    settingsChanged = true;
                }
            });
        } else if (Object.keys(newSettingsData).length > 0) {
            settingsChanged = true;
        }

        return { courseChanged, settingsChanged, courseData: newCourseData, courseSettingsData: newSettingsData };
    }, [separateFormData]);

    // Main update function
    const updateCourseData = useCallback(async (formData: CourseSettingsPartialFormData, validationData?: CourseSettingsPartialFormData): Promise<ValidationResult & { success?: boolean; data?: Course | CourseSetting }> => {
        try {
            
            // Separate and detect changes
            const { courseChanged, settingsChanged, courseData: courseDataToUpdate, courseSettingsData: settingsDataToUpdate } = detectChanges(
                formData, 
                courseData, 
                courseSettings
            );

            console.log('Change detection results:', {
                courseChanged,
                settingsChanged,
                courseDataToUpdate,
                settingsDataToUpdate
            });

            // Use validation data if provided, otherwise use form data
            const dataForValidation = validationData || formData;
            const { courseData: completeCourseData, courseSettingsData: completeSettingsData } = separateFormData(dataForValidation);
            const validationResult = validateFormData(completeCourseData, completeSettingsData);
            
            console.log('Validation result:', validationResult);
            
            if (!validationResult.isValid) {
                console.log('Validation failed:', validationResult.errors);
                return {
                    isValid: false,
                    errors: validationResult.errors,
                    success: false
                };
            }

            let updatedData: Course | CourseSetting | null = null;

            // Check if we have a course UUID to work with
            if (!courseData?.uuid) {
                return {
                    isValid: false,
                    errors: [{
                        field: 'general',
                        message: 'Course UUID is required for updates',
                        type: 'custom'
                    }],
                    success: false
                };
            }

            // Determine which APIs to call based on changes
            if (courseChanged && settingsChanged) {
                // Both changed - call both APIs
                console.log('Updating both course data and settings...');
                
                const updatedCourse = await UpdateCourse(courseData.uuid, courseDataToUpdate);
                updatedData = updatedCourse;

                if (courseSettings) {
                    const updatedSettings = await updateCourseSettings(courseData.uuid, settingsDataToUpdate);
                    updatedData = updatedSettings;
                } else {
                    const createdSettings = await createCourseSettings(courseData.uuid, settingsDataToUpdate);
                    updatedData = createdSettings;
                    setCourseSettings(createdSettings);
                }
            } else if (courseChanged && !settingsChanged) {
                // Only course changed
                console.log('Updating course data only...');
                updatedData = await UpdateCourse(courseData.uuid, courseDataToUpdate);
            } else if (!courseChanged && settingsChanged) {
                // Only settings changed
                console.log('Updating course settings only...',courseData.uuid);
                console.log('Course settings exist, updating...',courseSettings);
                if (courseSettings) {
                    updatedData = await updateCourseSettings(courseData.uuid, settingsDataToUpdate);
                } else {
                    updatedData = await createCourseSettings(courseData.uuid, settingsDataToUpdate);
                    setCourseSettings(updatedData);
                }
            } else {
                // No changes detected
                return {
                    isValid: true,
                    errors: [],
                    success: true,
                    data: undefined
                };
            }

            return {
                isValid: true,
                errors: [],
                success: true,
                data: updatedData || undefined
            };

        } catch (error) {
            console.error('Error updating course data:', error);
            
            return {
                isValid: false,
                errors: [{
                    field: 'general',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                    type: 'custom'
                }],
                success: false
            };
        }
    }, [courseData, courseSettings, detectChanges, separateFormData]);

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
        faqs,
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
        setFAQs,
        setSelectedAccreditationPartners,
        setCourseSettings,
        updateCourseData,
        validation: validationActions,
    };

    return [data, actions];
}