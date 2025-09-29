"use client";

import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";
import { ValidatedInput, ValidatedTextarea } from "./components/ValidatedFormComponents";
import { CourseSettingsActions, CourseSettingsData } from "./hooks/useCourseSettingsData";

interface CourseSeoProps {
    courseData?: Course | null;
    formData: Partial<Course>;
    data: CourseSettingsData;
    actions: CourseSettingsActions;
    onInputChange: (field: keyof Course, value: string | number | boolean | string[]) => void;
}
export default function Seo({ courseData, formData, actions, onInputChange }: CourseSeoProps) {
    const {
        validation: validationActions
    } = actions;
    return <>
        <div className="grid grid-cols-3 gap-4">
            <div>
                <label className="text-md font-semibold text-gray-600">Seo Title</label>
                <ValidatedInput
                    type="text"
                    placeholder="Enter SEO title"
                    value={typeof formData?.seo_title === 'string' ? formData.seo_title : (courseData ? String(courseData.seo_title) : "")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        onInputChange?.('seo_title', value);
                        validationActions?.validateSingleField('seo_title', value);
                    }}
                    error={validationActions?.getFieldError('seo_title')}
                />
            </div>
            <div>
                <label className="text-md font-semibold text-gray-600">Seo URL</label>
                <ValidatedInput
                    type="text"
                    placeholder="Enter SEO url"
                    value={typeof formData?.seo_url === 'string' ? formData.seo_url : (courseData?.seo_url || '')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        onInputChange?.('seo_url', value);
                        validationActions?.validateSingleField('seo_url', value);
                    }}
                    error={validationActions?.getFieldError('seo_url')}
                />
            </div>
            <div>
                <label className="text-md font-semibold text-gray-600">SEM URL</label>
                <ValidatedInput
                    type="text"
                    placeholder="Enter SEM url"
                    value={typeof formData?.sem_url === 'string' ? formData.sem_url : (courseData?.sem_url || '')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value;
                        onInputChange?.('sem_url', value);
                        validationActions?.validateSingleField('sem_url', value);
                    }}
                    error={validationActions?.getFieldError('sem_url')}
                />
            </div>
        </div>
        <div>
            <label className="text-md font-semibold text-gray-600">SEO Description</label>
            <ValidatedTextarea
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Enter SEO description"
                value={typeof formData?.seo_description === 'string' ? formData.seo_description : (courseData?.seo_description || '')}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const value = e.target.value;
                    onInputChange?.('seo_description', value);
                    validationActions?.validateSingleField('seo_description', value);
                }}
                error={validationActions?.getFieldError('seo_description')}
            />
        </div>
        <div className="flex justify-end mt-4">
            <Button className="me-2">Cancel</Button>
            <Button variant='courseCreate'>
                {!courseData ? 'Create' : 'Update'}
            </Button>
        </div>
    </>;
}