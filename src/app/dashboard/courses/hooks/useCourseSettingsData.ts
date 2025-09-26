import { useState, useEffect, useCallback } from 'react';
import { Course } from "@/types/course";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
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
        validation: validationActions,
    };

    return [data, actions];
}