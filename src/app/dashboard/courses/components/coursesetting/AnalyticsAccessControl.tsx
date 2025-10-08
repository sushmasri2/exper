"use client";

import Select2 from "@/components/ui/Select2";
import { Course } from "@/types/course";
import { CourseSettingsPartialFormData } from "@/types/course-settings-form";
import { CourseSettingsData, CourseSettingsActions } from "../../hooks/useCourseSettingsData";
import { ValidatedInput } from "../ValidatedFormComponents";

interface AnalyticsAccessControlProps {
    courseData?: Course | null;
    formData: CourseSettingsPartialFormData;
    data: CourseSettingsData;
    actions: CourseSettingsActions;
    onInputChange: (field: keyof CourseSettingsPartialFormData, value: string | number | boolean | string[]) => void;
}

export default function AnalyticsAccessControl({
    courseData,
    formData,
    data,
    actions,
    onInputChange
}: AnalyticsAccessControlProps) {
    const {
        specialities,
        courseSettings,
        selectedIntendedAudiences,
    } = data;

    const {
        setSelectedIntendedAudiences,
        validation: validationActions
    } = actions;

    return (
        <div className="px-5 py-3">
            <div className="grid grid-cols-4 gap-4">
                <div>
                    <ValidatedInput
                        type="text"
                        className="mb-4 px-3 py-0"
                        label="Rating"
                        value={typeof formData?.rating === 'string' ? formData.rating : (courseData ? String(courseData.rating) : "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('rating', value);
                            validationActions.validateSingleField('rating', value);
                        }}
                        error={validationActions.getFieldError('rating')}
                    />
                </div>
                <div>
                    <ValidatedInput
                        type="text"
                        className="mb-4 px-3 py-0"
                        label="Rating Count"
                        value={typeof formData?.rating_count === 'string' ? formData.rating_count : (courseData ? String(courseData.rating_count) : "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('rating_count', value);
                            validationActions.validateSingleField('rating_count', value);
                        }}
                        error={validationActions.getFieldError('rating_count')}
                    />
                </div>
                <div>
                    <ValidatedInput
                        label="Active Learners"
                        type="text"
                        className="mb-4 px-3 py-0"
                        value={typeof formData?.active_learners === 'string' ? formData.active_learners : (courseData ? String(courseData.active_learners) : "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('active_learners', value);
                            validationActions.validateSingleField('active_learners', value);
                        }}
                        error={validationActions.getFieldError('active_learners')}
                    />
                </div>
                <div>
                    <ValidatedInput
                        label="CPD Points"
                        type="text"
                        className="mb-4 px-3 py-0"
                        value={typeof formData?.cpd_points === 'string' ? formData.cpd_points : (courseData ? String(courseData.cpd_points) : "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('cpd_points', value);
                            validationActions.validateSingleField('cpd_points', value);
                        }}
                        error={validationActions.getFieldError('cpd_points')}
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
                        onChange={(val: string | string[]) => {
                            if (typeof val === 'string' && (val === '1' || val === '0')) {
                                onInputChange('enable_contact_programs' as keyof Course, val);
                                validationActions.validateSingleField('enable_contact_programs', val);
                            }
                        }}
                        placeholder="Select Yes or No"
                        style={{ padding: '0.6rem' }}
                    />
                    {validationActions.getFieldError('enable_contact_programs') && (
                        <p className="text-sm text-red-600 mt-1 px-3" role="alert">
                            {validationActions.getFieldError('enable_contact_programs')}
                        </p>
                    )}
                </div>
                <div>
                    <label className="text-lg font-medium m-2">KYC Required</label>
                    <Select2
                        options={[
                            { label: 'Yes', value: '1' },
                            { label: 'No', value: '0' },
                        ]}
                        value={typeof formData?.is_kyc_required === 'string' ? formData.is_kyc_required : (courseSettings ? String(courseSettings.is_kyc_required) : '')}
                        onChange={(val: string | string[]) => {
                            if (typeof val === 'string' && (val === '1' || val === '0')) {
                                onInputChange('is_kyc_required' as keyof Course, val);
                                validationActions.validateSingleField('is_kyc_required', val);
                            }
                        }}
                        placeholder="Select Yes or No"
                        style={{ padding: '0.6rem' }}
                    />
                    {validationActions.getFieldError('is_kyc_required') && (
                        <p className="text-sm text-red-600 mt-1 px-3" role="alert">
                            {validationActions.getFieldError('is_kyc_required')}
                        </p>
                    )}
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Preferred Course</label>
                    <Select2
                        options={[
                            { label: 'Yes', value: '1' },
                            { label: 'No', value: '0' },
                        ]}
                        value={typeof formData?.is_preferred_course === 'string' ? formData.is_preferred_course : (courseSettings ? String(courseSettings.is_preferred_course) : '')}
                        onChange={(val: string | string[]) => {
                            if (typeof val === 'string' && (val === '1' || val === '0')) {
                                onInputChange('is_preferred_course' as keyof Course, val);
                                validationActions.validateSingleField('is_preferred_course', val);
                            }
                        }}
                        placeholder="Select Yes or No"
                        style={{ padding: '0.6rem' }}
                    />
                    {validationActions.getFieldError('is_preferred_course') && (
                        <p className="text-sm text-red-600 mt-1 px-3" role="alert">
                            {validationActions.getFieldError('is_preferred_course')}
                        </p>
                    )}
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Enable Index Tag</label>
                    <Select2
                        options={[
                            { label: 'Yes', value: '1' },
                            { label: 'No', value: '0' },
                        ]}
                        value={typeof formData?.enable_index_tag === 'string' ? formData.enable_index_tag : (courseSettings ? String(courseSettings.enable_index_tag) : '')}
                        onChange={(val: string | string[]) => {
                            if (typeof val === 'string' && (val === '1' || val === '0')) {
                                onInputChange('enable_index_tag' as keyof Course, val);
                                validationActions.validateSingleField('enable_index_tag', val);
                            }
                        }}
                        placeholder="Select Yes or No"
                        style={{ padding: '0.6rem' }}
                    />
                    {validationActions.getFieldError('enable_index_tag') && (
                        <p className="text-sm text-red-600 mt-1 px-3" role="alert">
                            {validationActions.getFieldError('enable_index_tag')}
                        </p>
                    )}
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
                        onChange={(val: string | string[]) => {
                            console.log('Intended Audience selection changed:', val);
                            if (Array.isArray(val)) {
                                setSelectedIntendedAudiences(val);
                                onInputChange('intended_audiences', val);
                            }
                        }}
                        multiple={true}
                        placeholder="Select Intended Audience"
                        style={{ padding: '0.6rem' }}
                    />
                </div>
            </div>
        </div>
    );
}