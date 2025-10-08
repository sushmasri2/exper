"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Course } from "@/types/course";
import { CourseSettingsPartialFormData } from "@/types/course-settings-form";
import { CourseSettingsData, CourseSettingsActions } from "../../hooks/useCourseSettingsData";
import { ValidatedTextarea } from "../ValidatedFormComponents";
import Select2 from "@/components/ui/Select2";

interface CourseContentProps {
    courseData?: Course | null;
    formData: CourseSettingsPartialFormData;
    data: CourseSettingsData;
    actions: CourseSettingsActions;
    onInputChange: (field: keyof CourseSettingsPartialFormData, value: string | number | boolean | string[]) => void;
}

export default function CourseContent({
    courseData,
    formData,
    data,
    actions,
    onInputChange
}: CourseContentProps) {
    const { courseSettings, faqs, courses } = data;
    const { validation: validationActions } = actions;
    const [faqOpenItems, setFaqOpenItems] = useState<string[]>([]);

    return (
        <div className="px-5 py-3">
            <div className="grid grid-cols-3 gap-4 mb-4">
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
                        onChange={(val: string | string[]) => {
                            if (typeof val === 'string') {
                                onInputChange('child_course', val);
                            }
                        }}
                        placeholder="Select Child Course"
                        style={{ padding: '0.6rem' }}
                    />
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Course Eligibility</label>
                    <Select2
                        options={data.eligibilities.length > 0 ?
                            data.eligibilities.map(eligibility => ({
                                label: eligibility.name,
                                value: eligibility.uuid.toString()
                            }))
                            : []
                        }
                        value={data.selectedEligibilities}
                        onChange={(val: string | string[]) => {
                            if (Array.isArray(val)) {
                                actions.setSelectedEligibilities(val);
                                onInputChange('eligibility_ids', val);
                            }
                        }}
                        multiple={true}
                        placeholder="Select Eligibilities"
                        style={{ padding: '0.6rem' }}
                    />
                </div>
            </div>
            <div className="mb-4">
                <ValidatedTextarea
                    name="summary"
                    label="Course Summary"
                    placeholder="Course summary"
                    value={typeof formData.summary === "string" ? formData.summary : (courseSettings?.summary || "")}
                    error={validationActions.getFieldError('summary')}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const value = e.target.value;
                        onInputChange('summary', value);
                        validationActions.validateSingleField('summary', value);
                    }}
                    rows={3}
                />
            </div>
            <div className="mb-4">
                <ValidatedTextarea
                    label="Special Features"
                    placeholder="Special features of the course"
                    className="mb-4 px-3 py-2"
                    value={typeof formData?.what_you_will_learn === "string" ? formData.what_you_will_learn : (courseSettings?.what_you_will_learn || "")}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const value = e.target.value;
                        onInputChange('what_you_will_learn', value);
                        validationActions.validateSingleField('what_you_will_learn', value);
                    }}
                    error={validationActions.getFieldError('what_you_will_learn')}
                    rows={3}
                />
            </div>

            <div className="mb-4">
                <ValidatedTextarea
                    label="What You Will Gain"
                    placeholder="What students will gain from this course"
                    className="mb-4 px-3 py-2"
                    value={typeof formData?.overview === "string" ? formData.overview : (courseSettings?.overview || "")}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const value = e.target.value;
                        onInputChange('overview', value);
                        validationActions.validateSingleField('overview', value);
                    }}
                    error={validationActions.getFieldError('overview')}
                    rows={3}
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                    <ValidatedTextarea
                        label="Disclosure"
                        placeholder="Course disclosure information"
                        className="mb-4 px-3 py-2"
                        value={typeof formData?.disclosure === "string" ? formData.disclosure : (courseSettings?.disclosure || "")}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const value = e.target.value;
                            onInputChange('disclosure', value);
                            validationActions.validateSingleField('disclosure', value);
                        }}
                        error={validationActions.getFieldError('disclosure')}
                        rows={3}
                    />
                </div>
                <div>
                    <ValidatedTextarea
                        label="Financial Aid"
                        placeholder="Financial Aid details"
                        className="mb-4 px-3 py-2"
                        value={typeof formData?.financial_aid === "string" ? formData.financial_aid : (courseSettings?.financial_aid || "")}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const value = e.target.value;
                            onInputChange('financial_aid', value);
                            validationActions.validateSingleField('financial_aid', value);
                        }}
                        error={validationActions.getFieldError('financial_aid')}
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
                                <AccordionTrigger className="flex bg-[#f8f9fa] px-3">
                                    <h4>{faq.question}</h4>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 py-2">
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
        </div>
    );
}