"use client";
import { useState, useEffect } from "react";
import { Course } from "@/types/course";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCoursesCategory } from "@/lib/coursecategory-api";
import { CourseCategory } from "@/types/coursecategory";
import { getCoursesType } from "@/lib/coursetype-api";
import { CourseType } from "@/types/coursetype";
import { getEligibilities, getCourseEligibilities } from "@/lib/eligibility-api";
import { Eligibility } from "@/types/eligibility";
import Select2 from "@/components/ui/Select2";
import { getCourseKeywords } from "@/lib/keywords-api";
import { getCourseSettings } from "@/lib/coursesetting-api";
import type { CourseSetting } from "@/types/coursesetting";
import { getCourses } from "@/lib/courses-api";
import { getCourseInstructors, getCourseInstructorLinks } from "@/lib/instructor-api";
import { Instructor } from "@/types/instructor";
import { getSpecialities, getCourseIntendedAudiences } from "@/lib/specialities-api";
import { Specialty } from "@/types/specialities";
import { getCourseFAQs } from "@/lib/faqs-api";
import { FAQs } from "@/types/faqs";
interface CourseSettingsProps {
    courseData?: Course | null;
}

export default function CourseSettings({ courseData }: CourseSettingsProps) {
    // Helper: convert ISO datetime -> YYYY-MM-DD string for date inputs
    const isoToDateInput = (iso?: string | null): string => {
        if (!iso) return "";
        if (iso.includes("T")) return iso.split("T")[0];
        // Fallback: try parsing and normalizing
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return "";
            return d.toISOString().slice(0, 10);
        } catch {
            return "";
        }
    };
    // Complete list of all accordion items
    const allItemIds = [
        "course-information",
        "visual-assets-media",
        "course-content-support",
        "course-administration",
        "accreditation-compliance",
        "analytics-access-control",
    ];

    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
    const [selectedCourseType, setSelectedCourseType] = useState("");
    const [eligibilities, setEligibilities] = useState<Eligibility[]>([]);
    const [selectedEligibilities, setSelectedEligibilities] = useState<string[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    const [openItems, setOpenItems] = useState<string[]>([]);
    const [faqOpenItems, setFaqOpenItems] = useState<string[]>([]);
    const [formData, setFormData] = useState<Partial<Course>>({
        ...courseData,
    });
    const [courseSettings, setCourseSettings] = useState<CourseSetting | null>(null);
    console.log("Course Settings state:", courseSettings);
    // State for keywords
    const [keywords, setKeywords] = useState<string>("");
    // State for instructors
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
    // State for intended audiences
    const [specialities, setSpecialities] = useState<Specialty[]>([]);
    const [selectedIntendedAudiences, setSelectedIntendedAudiences] = useState<string[]>([]);

    // State for FAQs
    const [faqs, setFAQs] = useState<FAQs[]>([]);

    // Fetch categories, course types, and eligibilities
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, courseTypesData, eligibilitiesData, coursesData, instructorsData, specialitiesData] = await Promise.all([
                    getCoursesCategory(),
                    getCoursesType(),
                    getEligibilities(),
                    getCourses().catch((err) => {
                        console.warn("Failed to fetch courses:", err);
                        return [] as Course[];
                    }),
                    getCourseInstructors().catch((err) => {
                        console.warn("Failed to fetch instructors:", err);
                        return [] as Instructor[];
                    }),
                    getSpecialities().catch((err) => {
                        console.warn("Failed to fetch specialities:", err);
                        return [] as Specialty[];
                    })
                ]);

                setCategories(categoriesData);
                setCourseTypes(courseTypesData);
                setEligibilities(eligibilitiesData);
                setCourses(Array.isArray(coursesData) ? coursesData : []);
                setInstructors(Array.isArray(instructorsData) ? instructorsData : []);
                setSpecialities(Array.isArray(specialitiesData) ? specialitiesData : []);


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
                            // Fetch selected eligibilities for this course
                            const courseEligibilities = await getCourseEligibilities(courseData.uuid);
                            if (Array.isArray(courseEligibilities)) {
                                // Make sure the IDs are strings to match Select2 option values
                                setSelectedEligibilities(courseEligibilities.map(e => e.uuid.toString()));
                            } else {
                                console.warn("Course eligibilities response is not an array:", courseEligibilities);
                                setSelectedEligibilities([]);
                            }

                            // Fetch keywords for this course
                            const keywordList = await getCourseKeywords(courseData.uuid);
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

                            // Fetch course settings (overview, summary, disclosure, what_you_will_learn, etc.)
                            try {
                                const settings = await getCourseSettings(courseData.uuid);
                                if (settings) {
                                    setCourseSettings(settings);

                                    // Debug: Log the children_course value from API
                                    // Merge relevant fields into local form state used by the UI controls
                                    setFormData(prev => {
                                        const prevStart = prev['course_start_date'];
                                        const prevTrending = prev['trending_courses_ordering'];
                                        const prevEnableContact = prev['enable_contact_programs'];
                                        const prevSchedule = prev['schedule'];
                                        const prevEndDate = prev['end_date'];
                                        return {
                                            ...prev,
                                            // map API fields to existing UI fields
                                            description: typeof settings.overview === "string" ? settings.overview : prev.description,
                                            summary: typeof settings.summary === "string" ? settings.summary : prev.summary,
                                            disclosure: typeof settings.disclosure === "string" ? settings.disclosure : prev.disclosure,
                                            learning_outcomes: typeof settings.what_you_will_learn === "string" ? settings.what_you_will_learn : prev.learning_outcomes,
                                            enable_contact_programs: typeof settings.enable_contact_programs === "number"
                                                ? String(settings.enable_contact_programs)
                                                : (typeof prevEnableContact === 'string' ? prevEnableContact : undefined),
                                            course_start_date: settings.course_start_date
                                                ? isoToDateInput(settings.course_start_date)
                                                : (typeof prevStart === 'string' ? prevStart : ''),
                                            trending_courses_ordering: typeof settings.trending_courses_ordering === 'number'
                                                ? settings.trending_courses_ordering
                                                : (typeof prevTrending === 'number' ? prevTrending : undefined),
                                            schedule: settings.schedule
                                                ? String(settings.schedule).toLowerCase()
                                                : (typeof prevSchedule === 'string' ? prevSchedule : undefined),
                                            end_date: settings.end_date
                                                ? isoToDateInput(settings.end_date)
                                                : (typeof prevEndDate === 'string' ? prevEndDate : ''),
                                            // Set child course from course settings - children_course should contain the UUID
                                            child_course: typeof settings.children_course === "string" ? settings.children_course : prev.child_course,
                                        };
                                    });
                                }
                            } catch (err) {
                                console.error("Error fetching course settings:", err);
                            }

                            // Fetch instructor links for this course
                            try {
                                const instructorLinks = await getCourseInstructorLinks(courseData.uuid);
                                if (Array.isArray(instructorLinks)) {
                                    // Extract instructor UUIDs from the CourseInstructor nested objects
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

                            // Fetch intended audiences for this course
                            try {
                                const intendedAudiencesResponse = await getCourseIntendedAudiences(courseData.uuid);
                                if (intendedAudiencesResponse.status === "success" && intendedAudiencesResponse.data?.intendedAudiences) {
                                    const audienceIds = intendedAudiencesResponse.data.intendedAudiences.map((audience) =>
                                        audience.specialities_id.toString()
                                    );
                                    setSelectedIntendedAudiences(audienceIds);
                                }
                            } catch (err) {
                                console.error("Error fetching course intended audiences:", err);
                                setSelectedIntendedAudiences([]);
                            }

                            // Fetch FAQs for this course
                            try {
                                const faqsResponse = await getCourseFAQs(courseData.uuid);
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
                        } catch (err) {
                            console.error("Error fetching course-specific data:", err);
                            setSelectedEligibilities([]);
                            setKeywords("");
                            setSelectedInstructors([]);
                            setSelectedIntendedAudiences([]);
                            setFAQs([]);
                        }
                    }
                } else {
                    // Reset states for new course creation
                    setSelectedCategory("");
                    setSelectedCourseType("");
                    setSelectedEligibilities([]);
                    setKeywords("");
                    setSelectedInstructors([]);
                    setSelectedIntendedAudiences([]);
                    setFAQs([]);
                }
            } catch (err) {
                console.error("Error fetching initial data:", err);
            }
        };

        fetchData();
    }, [courseData]);

    // Toggle all accordion sections
    const toggleAll = () => {
        if (openItems.length === allItemIds.length) {
            setOpenItems([]); // collapse all
        } else {
            setOpenItems(allItemIds); // expand all
        }
    };

    const handleInputChange = (
        field: keyof Course,
        value: string | number | boolean | string[]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Helper functions for intended audiences - removed as we'll use direct Select2 multiple selection like instructors

    return (
        <div>
            <div className="flex gap-2 mb-4 justify-end">
                <Button onClick={toggleAll}>
                    {openItems.length === allItemIds.length ? "Collapse All" : "Expand All"}
                </Button>
            </div>

            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
                <AccordionItem className="border rounded-lg" value="course-information" >
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Course Information</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        {/* Course Title */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="text-lg font-medium m-2">Course Card Title</label>
                                <Input
                                    type="text"
                                    placeholder="Course Title"
                                    className="mb-4 px-3 py-0"
                                    value={courseData?.course_name || ""}
                                    onChange={(e) => handleInputChange('course_name', e.target.value)}
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
                                    value={
                                        // First try to get from formData.child_course, then fall back to courseSettings.children_course
                                        (() => {
                                            const selectedChild = typeof formData.child_course === 'string' ? formData.child_course :
                                                (courseSettings && typeof courseSettings.children_course === 'string' ? courseSettings.children_course : '');
                                            return selectedChild;
                                        })()
                                    }
                                    onChange={val => {
                                        if (typeof val === 'string') {
                                            handleInputChange('child_course', val);
                                        }
                                    }}
                                    placeholder="Select Child Course"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Course Type</label>
                                <Select2
                                    options={courseTypes.length > 0 ? [{ label: 'Select Course Type', value: '' }, ...courseTypes.map(type => ({ label: type.name, value: type.id.toString() }))] : [{ label: 'Select Course Type', value: '' }]}
                                    value={selectedCourseType === '' ? '' : courseTypes.find(ct => ct.name === selectedCourseType)?.id.toString() || ''}
                                    onChange={val => {
                                        if (typeof val === 'string') {
                                            setSelectedCourseType(courseTypes.find(ct => ct.id.toString() === val)?.name || '');
                                            handleInputChange('course_type_id', val);
                                        }
                                    }}
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
                                    onChange={val => {
                                        if (Array.isArray(val)) {
                                            setSelectedEligibilities(val);
                                            handleInputChange('eligibility_ids', val);
                                        }
                                    }}
                                    multiple={true}
                                    placeholder="Select Eligibilities"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Course Category</label>
                                <Select2
                                    options={categories.length > 0 ? [{ label: 'Select Category', value: '' }, ...categories.map(cat => ({ label: cat.name, value: cat.id.toString() }))] : [{ label: 'Select Category', value: '' }]}
                                    value={selectedCategory === '' ? '' : categories.find(cat => cat.name === selectedCategory)?.id.toString() || ''}
                                    onChange={val => {
                                        if (typeof val === 'string') {
                                            setSelectedCategory(categories.find(cat => cat.id.toString() === val)?.name || '');
                                            handleInputChange('category_id', val);
                                        }
                                    }}
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
                                    onChange={(e) => setKeywords(e.target.value)}
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
                                    onChange={val => {
                                        if (typeof val === 'string') {
                                            handleInputChange('specialty_type', val);
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
                                onChange={(e) => handleInputChange('one_line_description', e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-lg font-medium m-2">Description</label>
                            <Textarea
                                placeholder="Course description"
                                className="mb-4 px-3 py-2"
                                value={typeof formData.description === "string" ? formData.description : (courseData?.description || "")}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-lg font-medium m-2">Course Summary</label>
                            <Textarea
                                placeholder="Course summary"
                                className="mb-4 px-3 py-2"
                                value={typeof formData.summary === "string" ? formData.summary : ""}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

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
                                    value={courseSettings?.banner ?? ""}
                                    onChange={(e) => handleInputChange('banner', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Web Thumbnail</label>
                                <Input
                                    type="text"
                                    className="mb-4 px-3 py-0"
                                    value={courseSettings?.thumbnail_web ?? ""}
                                    onChange={(e) => handleInputChange('thumbnail_web', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Mobile Thumbnail</label>
                                <Input
                                    type="text"
                                    className="mb-4 px-3 py-0"
                                    value={courseSettings?.thumbnail_mobile ?? ""}
                                    onChange={(e) => handleInputChange('thumbnail_mobile', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Course Banner URL Web</label>
                                <Input
                                    type="text"
                                    className="mb-4 px-3 py-0"
                                    value={courseSettings?.course_demo_url ?? ""}
                                    onChange={(e) => handleInputChange('course_demo_url', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Course Banner URL Mobile</label>
                                <Input
                                    type="text"
                                    className="mb-4 px-3 py-0"
                                    value={courseSettings?.course_demo_mobile_url ?? ""}
                                    onChange={(e) => handleInputChange('course_demo_mobile_url', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Banner Alt Tag</label>
                                <Input
                                    type="text"
                                    className="mb-4 px-3 py-0"
                                    value={courseSettings?.banner_alt_tag ?? ""}
                                    onChange={(e) => handleInputChange('banner_alt_tag', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Brochure</label>
                                <Input
                                    type="text"
                                    className="mb-4 px-3 py-0"
                                    value={courseSettings?.brochure ?? ""}
                                    placeholder="Enter Brochure URL"
                                    onChange={(e) => handleInputChange('brochure', e.currentTarget.value)}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

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
                                value={typeof courseSettings?.what_you_will_learn === "string" ? courseSettings?.what_you_will_learn : ""}
                                onChange={(e) => handleInputChange('what_you_will_learn', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="text-lg font-medium m-2">What You Will Gain</label>
                            <Textarea
                                placeholder="What students will gain from this course"
                                className="mb-4 px-3 py-2"
                                value={typeof courseSettings?.overview === "string" ? courseSettings?.overview : ""}
                                onChange={(e) => handleInputChange('overview', e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <label className="text-lg font-medium m-2">Disclosure</label>
                                <Textarea
                                    placeholder="Course disclosure information"
                                    className="mb-4 px-3 py-2"
                                    value={typeof formData?.disclosure === "string" ? formData.disclosure : ""}
                                    onChange={(e) => handleInputChange('disclosure', e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Financial Aid</label>
                                <Textarea
                                    placeholder="Financial Aid details"
                                    className="mb-4 px-3 py-2"
                                    value={typeof formData?.financial_aid === "string" ? formData.financial_aid : (courseSettings?.financial_aid || "")}
                                    onChange={(e) => handleInputChange('financial_aid', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-lg font-medium m-2">FAQs</label>
                            <Accordion type="multiple" value={faqOpenItems} onValueChange={setFaqOpenItems} >
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

                <AccordionItem className="border rounded-lg mt-3" value="course-administration">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Course Administration</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-lg font-medium m-2">Course Instructor</label>
                                <Select2
                                    options={[
                                        ...instructors.map(instructor => ({
                                            label: instructor.name ||
                                                `${instructor.first_name || ''} ${instructor.last_name || ''}`.trim() ||
                                                `Instructor #${instructor.id}`,
                                            value: instructor.uuid
                                        }))
                                    ]}
                                    value={selectedInstructors}
                                    onChange={val => {
                                        console.log('Instructor selection changed:', val);
                                        if (Array.isArray(val)) {
                                            setSelectedInstructors(val);
                                            handleInputChange('instructor', val);
                                        }
                                    }}
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
                                    value={typeof formData.course_start_date === 'string' ? formData.course_start_date : (courseSettings?.course_start_date ? courseSettings.course_start_date.split('T')[0] : '')}
                                    onChange={(e) => handleInputChange('course_start_date', e.currentTarget.value)}
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
                                        value={courseSettings?.duration_years ?? ""}
                                        placeholder="Enter Course Duration"
                                        onChange={(e) => handleInputChange('duration_years', e.currentTarget.value)}
                                    />
                                    <Input
                                        type="text"
                                        className="mb-4 px-3 py-0"
                                        value={courseSettings?.duration_months ?? ""}
                                        onChange={(e) => handleInputChange('duration_months', e.currentTarget.value)}
                                        placeholder="Enter Course Duration (Months)"
                                    />
                                    <Input
                                        type="text"
                                        className="mb-4 px-3 py-0"
                                        value={courseSettings?.duration_days ?? ""}
                                        onChange={(e) => handleInputChange('duration_days', e.currentTarget.value)}
                                        placeholder="Enter Course Duration (Days)"
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
                                            value={typeof formData.schedule === 'string' ? formData.schedule : (courseSettings?.schedule ? String(courseSettings.schedule).toLowerCase() : '')}
                                            onChange={(val) => {
                                                if (typeof val === 'string') {
                                                    handleInputChange('schedule', val);
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
                                            value={typeof formData.end_date === 'string' ? formData.end_date : (courseSettings?.end_date ? courseSettings.end_date.split('T')[0] : '')}
                                            onChange={(e) => handleInputChange('end_date', e.currentTarget.value)}
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
                                        value={courseSettings?.extendedvalidity_years ?? ""}
                                        onChange={(e) => handleInputChange('extendedvalidity_years', e.currentTarget.value)}
                                        placeholder="Enter Extended Validity"
                                    />
                                    <Input
                                        type="text"
                                        className="mb-4 px-3 py-0"
                                        value={courseSettings?.extendedvalidity_months ?? ""}
                                        onChange={(e) => handleInputChange('extendedvalidity_years', e.currentTarget.value)}
                                        placeholder="Enter Extended Validity"
                                    />
                                    <Input
                                        type="text"
                                        className="mb-4 px-3 py-0"
                                        value={courseSettings?.extendedvalidity_days ?? ""}
                                        onChange={(e) => handleInputChange('extendedvalidity_years', e.currentTarget.value)}
                                        placeholder="Enter Extended Validity"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Partner Course Code</label>
                                <Input
                                    type="text"
                                    className="mb-4 px-3 py-0"
                                    value={courseSettings?.partner_coursecode ?? ""}
                                    onChange={(e) => handleInputChange('partner_coursecode', e.currentTarget.value)}
                                    placeholder="Enter Partner Course Code"
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem className="border rounded-lg mt-3" value="accreditation-compliance">
                    <AccordionTrigger className="flex bg-[#e4e7eb] px-5">
                        <h2>Accreditation & Compliance</h2>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-3">
                        <div>
                            <label className="text-lg font-medium m-2">Accreditation</label>
                            <Textarea
                                className="mb-4 px-3 py-2"
                                value={courseSettings?.accreditation ?? ""}
                                onChange={(e) => handleInputChange('accreditation', e.currentTarget.value)}
                                placeholder="Enter Accreditation"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-lg font-medium m-2">Accreditation Partners</label>
                                <Select2
                                    options={[
                                        { label: 'Select Accreditation Partners', value: '' },
                                        { label: 'BAC', value: 'bac' },
                                        { label: 'GAPIO', value: 'gapio' },
                                    ]}
                                    multiple={true}
                                    value={['BAC']}
                                    onChange={val => {
                                        console.log('Accreditation Partners selection changed:', val);
                                        if (Array.isArray(val)) {
                                            // setSelectedAccreditationPartners(val);
                                            handleInputChange('accreditation_partners', val);
                                        }
                                    }}
                                    placeholder="Select Accreditation Partners"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Accredation Partners List</label>
                                <Select2
                                    options={[
                                        { label: 'Select Accreditation Partners', value: '' },
                                        { label: 'BAC', value: 'bac' },
                                        { label: 'GAPIO', value: 'gapio' },
                                    ]}
                                    multiple={true}
                                    value={['BAC']}
                                    onChange={val => {
                                        console.log('Accreditation Partners selection changed:', val);
                                        if (Array.isArray(val)) {
                                            // setSelectedAccreditationPartners(val);
                                            handleInputChange('accreditation_partners', val);
                                        }
                                    }}
                                    placeholder="Select Accreditation Partners List"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>


                        </div>
                    </AccordionContent>
                </AccordionItem>

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
                                    value={courseData?.rating ?? ""}
                                    onChange={(e) => handleInputChange('rating', e.currentTarget.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Rating Count</label>
                                <Input
                                    type="text"
                                    className="mb-4 px-3 py-0"
                                    value={courseData?.rating_count ?? ""}
                                    onChange={(e) => handleInputChange('rating_count', e.currentTarget.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Active Learners</label>
                                <Input
                                    type="text"
                                    className="mb-4 px-3 py-0"
                                    value={courseData?.active_learners ?? ""}
                                    onChange={(e) => handleInputChange('active_learners', e.currentTarget.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">CPD Points</label>
                                <Input
                                    type="text"
                                    className="mb-4 px-3 py-0"
                                    value={courseData?.cpd_points ?? ""}
                                    onChange={(e) => handleInputChange('cpd_points', e.currentTarget.value)}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Contact Program</label>
                                <Select2
                                    options={[
                                        { label: 'Yes', value: '1' },
                                        { label: 'No', value: '0' },
                                    ]}
                                    value={
                                        typeof formData?.enable_contact_programs === 'string'
                                            ? formData.enable_contact_programs
                                            : (courseSettings ? String(courseSettings.enable_contact_programs) : '')
                                    }
                                    onChange={(val) => {
                                        if (typeof val === 'string' && (val === '1' || val === '0')) {
                                            handleInputChange('enable_contact_programs' as keyof Course, val);
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

                                    value={typeof formData?.is_kyc_required === 'string' ? formData.is_kyc_required : (courseSettings ? String(courseSettings.is_kyc_required) : '')}
                                    onChange={val => {
                                        if (typeof val === 'string' && (val === '1' || val === '0')) {
                                            handleInputChange('is_kyc_required' as keyof Course, val);
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

                                    value={typeof formData?.is_preferred_course === 'string' ? formData.is_preferred_course : (courseSettings ? String(courseSettings.is_preferred_course) : '')}
                                    onChange={val => {
                                        if (typeof val === 'string' && (val === '1' || val === '0')) {
                                            handleInputChange('is_preferred_course' as keyof Course, val);
                                        }
                                    }}
                                    placeholder="Select Yes or No"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                            <div>
                                <label className="text-lg font-medium m-2">Intended Audience</label>
                                <Select2
                                    options={[
                                        ...specialities.map(specialty => ({
                                            label: specialty.name,
                                            value: specialty.id.toString()
                                        }))
                                    ]}
                                    value={selectedIntendedAudiences}
                                    onChange={val => {
                                        console.log('Intended Audience selection changed:', val);
                                        if (Array.isArray(val)) {
                                            setSelectedIntendedAudiences(val);
                                            handleInputChange('intended_audiences', val);
                                        }
                                    }}
                                    multiple={true}
                                    placeholder="Select Intended Audience"
                                    style={{ padding: '0.6rem' }}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="flex justify-end">
                <Button className="mt-4" variant="secondary">Save as Draft</Button>
                <Button className="mt-4 ml-2" variant="courseCreate">Publish Course</Button>
            </div>
        </div>
    );
}