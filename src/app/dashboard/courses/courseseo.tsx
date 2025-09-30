"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";
import { ValidatedInput, ValidatedTextarea } from "./components/ValidatedFormComponents";
import { useCourseSeoValidation } from "./hooks/useCourseSeoValidation";

interface CourseSeoProps {
    courseData?: Course | null;
}

export default function Seo({ courseData }: CourseSeoProps) {
    // Form data state for tracking changes
    const [formData, setFormData] = useState<Partial<Course>>({});
    
    // Validation hook
    const [, validationActions] = useCourseSeoValidation();

    // Handler functions for form inputs
    const handleSeoChange = (field: keyof Course, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        validationActions.validateSeoField(String(field), value);
    };

    const handleFormSubmit = () => {
        const isValid = validationActions.validateAllSeo(formData);

        if (isValid) {
            // Submit the form data
            console.log('Submitting SEO data:', formData);
            // Add your API call here
        } else {
            console.log('Form validation failed');
        }
    };

    const handleCancel = () => {
        // Reset form to original data
        const originalSeoData = {
            seo_title: courseData?.seo_title || '',
            seo_description: courseData?.seo_description || '',
            seo_url: courseData?.seo_url || '',
            sem_url: courseData?.sem_url || ''
        };
        setFormData(originalSeoData);
        validationActions.clearSeoErrors();
    };

    // Initialize form data when courseData changes
    useEffect(() => {
        if (courseData) {
            const initialSeoData = {
                seo_title: courseData.seo_title || '',
                seo_description: courseData.seo_description || '',
                seo_url: courseData.seo_url || '',
                sem_url: courseData.sem_url || ''
            };
            setFormData(initialSeoData);
        }
    }, [courseData]);

    return <>
        <div className="grid grid-cols-3 gap-4">
            <div>
                <label className="text-md font-semibold text-gray-600">SEO Title</label>
                <ValidatedInput
                    type="text"
                    placeholder="Enter SEO title"
                    value={formData?.seo_title || ''}
                    onChange={(e) => handleSeoChange('seo_title', e.target.value)}
                    error={validationActions.getFieldError('seo_title')}
                    className={validationActions.hasFieldError('seo_title') ? 'border-red-500' : ''}
                />
            </div>
            <div>
                <label className="text-md font-semibold text-gray-600">SEO URL</label>
                <ValidatedInput
                    type="text"
                    placeholder="Enter SEO url"
                    value={formData?.seo_url || ''}
                    onChange={(e) => handleSeoChange('seo_url', e.target.value)}
                    error={validationActions.getFieldError('seo_url')}
                    className={validationActions.hasFieldError('seo_url') ? 'border-red-500' : ''}
                />
            </div>
            <div>
                <label className="text-md font-semibold text-gray-600">SEM URL</label>
                <ValidatedInput
                    type="text"
                    placeholder="Enter SEM url"
                    value={formData?.sem_url || ''}
                    onChange={(e) => handleSeoChange('sem_url', e.target.value)}
                    error={validationActions.getFieldError('sem_url')}
                    className={validationActions.hasFieldError('sem_url') ? 'border-red-500' : ''}
                />
            </div>
        </div>
        <div>
            <label className="text-md font-semibold text-gray-600">SEO Description</label>
            <ValidatedTextarea
                rows={4}
                placeholder="Enter SEO description"
                value={formData?.seo_description || ''}
                onChange={(e) => handleSeoChange('seo_description', e.target.value)}
                error={validationActions.getFieldError('seo_description')}
                className={validationActions.hasFieldError('seo_description') ? 'border-red-500' : ''}
            />
        </div>
        <div className="flex justify-end mt-4">
            <Button className="me-2" onClick={handleCancel}>Cancel</Button>
            <Button variant='courseCreate' onClick={handleFormSubmit}>
                {!courseData ? 'Create' : 'Update'}
            </Button>
        </div>
    </>;
}