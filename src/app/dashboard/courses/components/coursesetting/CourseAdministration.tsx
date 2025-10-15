"use client";

import Select2 from "@/components/ui/Select2";
import { Course } from "@/types/course";
import { CourseSettingsPartialFormData } from "@/types/course-settings-form";
import { CourseSettingsData, CourseSettingsActions } from "../../hooks/useCourseSettingsData";
import { ValidatedInput } from "../ValidatedFormComponents";

interface CourseAdministrationProps {
    courseData?: Course | null;
    formData: CourseSettingsPartialFormData;
    data: CourseSettingsData;
    actions: CourseSettingsActions;
    onInputChange: (field: keyof CourseSettingsPartialFormData, value: string | string[]) => void;
}

export default function CourseAdministration({ courseData, formData, data, actions, onInputChange }: CourseAdministrationProps) {
    const { instructors, courseSettings, selectedInstructors } = data;
    const { setSelectedInstructors, validation: validationActions } = actions;
    
    // Helper function to format date from ISO string to yyyy-MM-dd format
    const formatDateForInput = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        try {
            // Handle ISO date format (2025-10-09T00:00:00.000Z) and convert to yyyy-MM-dd
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return '';
        }
    };
    const scheduleOptions = [
        { label: 'Select Schedule', value: '' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' }
    ];

    const weekdays = [
        { label: 'Monday', value: 'Monday' }, { label: 'Tuesday', value: 'Tuesday' }, { label: 'Wednesday', value: 'Wednesday' },{ label: 'Thursday', value: 'Thursday' }, { label: 'Friday', value: 'Friday' }, { label: 'Saturday', value: 'Saturday' }, { label: 'Sunday', value: 'Sunday' }
    ];
    const months = [
        { label: 'January', value: '1' }, { label: 'February', value: '2' }, { label: 'March', value: '3' },
        { label: 'April', value: '4' }, { label: 'May', value: '5' }, { label: 'June', value: '6' },
        { label: 'July', value: '7' }, { label: 'August', value: '8' }, { label: 'September', value: '9' },
        { label: 'October', value: '10' }, { label: 'November', value: '11' }, { label: 'December', value: '12' }
    ];

    const currentSchedule = typeof formData.schedule === 'string' ? formData.schedule : (courseSettings?.schedule ? String(courseSettings.schedule).toLowerCase() : '');

    // Helper to normalize Select2 value for multi-select
    function getMultiValue(val: unknown): string[] {
        if (Array.isArray(val)) return val.map(String);
        if (typeof val === 'string' && val.includes(',')) return val.split(',').map(s => s.trim());
        if (val === undefined || val === null || val === '') return [];
        return [String(val)];
    }

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    {/* Version */}
                    <label className="block text-lg font-medium">Version</label>
                    <ValidatedInput
                        className="px-3 py-2"
                        value={typeof formData.version === 'string' ? formData.version : (typeof courseData?.version === 'string' ? courseData.version : "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('version', value);
                            validationActions.validateSingleField('version', value);
                        }}
                        error={validationActions.getFieldError('version')}
                        placeholder="Enter Version"
                    />
                </div>
                {/* Kite ID */  }
                <div>
                    <label className="block text-lg font-medium">Kite ID</label>
                    <ValidatedInput
                        className="px-3 py-2"
                        value={formData.kite_id?.toString() || courseData?.kite_id?.toString() || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('kite_id', value);
                            validationActions.validateSingleField('kite_id', value);
                        }}
                        error={validationActions.getFieldError('kite_id')}
                        placeholder="Enter Kite ID"
                    />
                </div>
                 {/* Zoho ID */  }
                <div>
                    <label className="block text-lg font-medium">Zoho ID</label>
                    <ValidatedInput
                        className="px-3 py-2"
                        value={typeof formData.course_zoho_id === 'string' ? formData.course_zoho_id : (typeof courseData?.course_zoho_id === 'string' ? courseData.course_zoho_id : "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('course_zoho_id', value);
                            validationActions.validateSingleField('course_zoho_id', value);
                        }}
                        error={validationActions.getFieldError('course_zoho_id')}
                        placeholder="Enter Zoho ID"
                    />
                </div>
                {/* Duration */}
                <div>
                    <label className="block text-lg font-medium">Duration</label>
                    <ValidatedInput
                        className="px-3 py-2"
                        value={typeof formData.duration === 'string' ? formData.duration : (typeof courseData?.duration === 'string' ? courseData.duration : "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('duration', value);
                            validationActions.validateSingleField('duration', value);
                        }}
                        error={validationActions.getFieldError('duration')}
                        placeholder="Enter Duration"
                    />
                </div>
                {/* Specialty Type */}
                <div>
                    <label className="text-lg font-medium m-2">Specialty Type</label>
                    <Select2
                        options={[
                            { label: 'Select Specialty Type', value: '' },
                            { label: 'Doctors', value: 'doctors' },
                            { label: 'Nurses', value: 'nurses' },
                            { label: 'Others', value: 'others' },
                        ]}
                        value={typeof formData.speciality_type === 'string' ? formData.speciality_type : (courseSettings?.speciality_type || '')}
                        onChange={(val: string | string[]) => {
                            if (typeof val === 'string') {
                                onInputChange('speciality_type', val);
                                validationActions.validateSingleField('speciality_type', val); // true indicates it's a CourseSetting field
                            }
                        }}
                        placeholder="Select Specialty Type"
                        style={{ padding: '0.6rem' }}
                    />
                    {validationActions.getFieldError('speciality_type') && (
                        <p className="text-sm text-red-600 mt-1 px-3" role="alert">
                            {validationActions.getFieldError('speciality_type')}
                        </p>
                    )}
                </div>
                {/* Instructor */}
                <div>
                    <label className="block text-lg font-medium">Course Instructor</label>
                    <Select2
                        options={instructors.map(i => ({
                            label: i.name || `${i.first_name || ''} ${i.last_name || ''}`.trim() || `Instructor #${i.id}`,
                            value: i.uuid
                        }))}
                        value={selectedInstructors}
                        onChange={(val: string | string[]) => Array.isArray(val) && (setSelectedInstructors(val), onInputChange('instructor', val))}
                        multiple={true}
                        placeholder="Select Instructor"
                        style={{ padding: '0.6rem' }}
                    />
                    {/* End of Partner Code section */}
                </div>
                {/* Partner Code */}
                <div>
                    <ValidatedInput
                        label="Partner Course Code"
                        className="px-3 py-2"
                        value={typeof formData.partner_coursecode === 'string' ? formData.partner_coursecode : (courseSettings?.partner_coursecode ?? "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('partner_coursecode', value);
                            validationActions.validateSingleField('partner_coursecode', value);
                        }}
                        error={validationActions.getFieldError('partner_coursecode')}
                        placeholder="Enter Partner Course Code"
                    />
                </div>
                {/* Location */}
                <div>
                    <label className="block text-lg font-medium">Course Location</label>
                    <Select2
                        options={[
                            { label: 'Select Location', value: '' },
                            { label: 'India', value: 'IN' },
                            { label: 'USA', value: 'US' },
                            { label: 'UK', value: 'UK' },
                            { label: 'UAE', value: 'AE' },
                            { label: 'Bangladesh', value: 'BD' },
                            { label: 'Indonesia', value: 'ID' }
                        ]}
                        value={(() => {
                            // Handle location value - convert string to array for multi-select
                            const locationValue = typeof formData.location === 'string' ? formData.location :
                                (typeof courseData?.location === 'string' ? courseData.location : '');
                            if (!locationValue) return [];
                            return locationValue.includes(',') ? locationValue.split(',').map(s => s.trim()) : [locationValue];
                        })()}
                        onChange={(val: string | string[]) => {
                            // Convert array back to comma-separated string for storage
                            if (Array.isArray(val)) {
                                const locationString = val.filter(v => v !== '').join(',');
                                onInputChange('location', locationString);
                                validationActions.validateSingleField('location', locationString);
                            } else if (typeof val === 'string') {
                                onInputChange('location', val);
                                validationActions.validateSingleField('location', val);
                            }
                        }}
                        multiple={true}
                        placeholder="Select Location"
                        style={{ padding: '0.6rem' }}
                    />
                </div>
                {/* Start Date */}
                <div>
                    <ValidatedInput
                        label="Course Start Date"
                        type="date"
                        className="px-3 py-2"
                        value={typeof formData.course_start_date === 'string' ? formatDateForInput(formData.course_start_date) : formatDateForInput(courseSettings?.course_start_date)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('course_start_date', value);
                            validationActions.validateSingleField('course_start_date', value);
                        }}
                        error={validationActions.getFieldError('course_start_date')}
                        style={{ padding: '0.6rem' }}
                    />
                </div>
                {/* Duration */}
                <div>
                    <label className="block text-lg font-medium">Duration (Y/M/D)</label>
                    <div className="flex gap-2">
                        <ValidatedInput
                            className="px-3 py-2"
                            value={formData.duration_years || courseSettings?.duration_years?.toString() || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                onInputChange('duration_years', value);
                                validationActions.validateSingleField('duration_years', value);
                            }}
                            placeholder="Years" />
                        <ValidatedInput
                            className="px-3 py-2"
                            value={formData.duration_months || courseSettings?.duration_months?.toString() || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                onInputChange('duration_months', value);
                                validationActions.validateSingleField('duration_months', value);
                            }}
                            placeholder="Months" />
                        <ValidatedInput
                            className="px-3 py-2"
                            value={formData.duration_days || courseSettings?.duration_days?.toString() || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                onInputChange('duration_days', value);
                                validationActions.validateSingleField('duration_days', value);
                            }}
                            placeholder="Days" />
                    </div>
                    <p className="text-red-500">
                        {validationActions.getFieldError('duration_years') ||
                            validationActions.getFieldError('duration_months') ||
                            validationActions.getFieldError('duration_days')}
                    </p>
                </div>
                {/* Extended Validity */}
                <div>
                    <label className="block text-lg font-medium">Extended Validity (Y/M/D)</label>
                    <div className="flex gap-2">
                        <ValidatedInput
                            className="px-3 py-2"
                            value={formData.extendedvalidity_years || courseSettings?.extendedvalidity_years?.toString() || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                onInputChange('extendedvalidity_years', value);
                                validationActions.validateSingleField('extendedvalidity_years', value);
                            }}
                            placeholder="Years" />
                        <ValidatedInput
                            className="px-3 py-2"
                            value={formData.extendedvalidity_months || courseSettings?.extendedvalidity_months?.toString() || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                onInputChange('extendedvalidity_months', value);
                                validationActions.validateSingleField('extendedvalidity_months', value);
                            }}
                            placeholder="Months" />
                        <ValidatedInput
                            className="px-3 py-2"
                            value={formData.extendedvalidity_days || courseSettings?.extendedvalidity_days?.toString() || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                onInputChange('extendedvalidity_days', value);
                                validationActions.validateSingleField('extendedvalidity_days', value);
                            }}
                            placeholder="Days" />
                    </div>
                    <p className="text-red-500">
                        {validationActions.getFieldError('extendedvalidity_years') ||
                            validationActions.getFieldError('extendedvalidity_months') ||
                            validationActions.getFieldError('extendedvalidity_days')}
                    </p>
                </div>
                {/* Schedule */}
                <div>
                    <label className="block text-lg font-medium">Course Schedule</label>
                    <div className="flex gap-2">
                        <Select2
                            options={scheduleOptions}
                            value={currentSchedule}
                            onChange={(val: string | string[]) => typeof val === 'string' && onInputChange('schedule', val)}
                            placeholder="Select Schedule"
                            className="flex-1"
                            style={{ padding: '0.6rem' }}
                        />
                        <ValidatedInput
                            type="date"
                            className="px-3 py-2 flex-1"
                            value={typeof formData.end_date === 'string' ? formatDateForInput(formData.end_date) : formatDateForInput(courseSettings?.end_date)}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                onInputChange('end_date', value);
                                validationActions.validateSingleField('end_date', value);
                            }}
                            error={validationActions.getFieldError('end_date')}
                            placeholder="End Date"
                        />
                    </div>
                </div>
            </div>

            {/* Schedule Config */}
            {
                currentSchedule && (
                    <div className="mt-6  bg-gray-50 rounded-lg">
                        {currentSchedule === 'daily' && (
                            <>
                                <p className="text-sm text-gray-600 mb-3">Adding 2 days here, will repeat the Course every 2 days until the end date.</p>
                                <ValidatedInput
                                    className="px-3 py-2 max-w-xs"
                                    label="Number of Days"
                                    value={formData.d_days || courseSettings?.d_days?.toString() || ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const value = e.target.value;
                                        onInputChange('d_days', value);
                                        validationActions.validateSingleField('d_days', value);
                                    }}
                                    error={validationActions.getFieldError('d_days')}
                                    placeholder="Enter number of days" />
                            </>
                        )}

                        {currentSchedule === 'weekly' && (
                            <>
                                <p className="text-sm text-gray-600 mb-3">Adding 2 Week & Selecting Monday, Tuesday here, will repeat the Course every 2 weeks on Monday Tuesday until the end date.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <ValidatedInput
                                            className="px-3 py-2"
                                            label="Number of Weeks"
                                            value={typeof formData.w_week === 'string' ? formData.w_week : (courseSettings?.w_week ?? "")}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                onInputChange('w_week', value);
                                                validationActions.validateSingleField('w_week', value);
                                            }}
                                            error={validationActions.getFieldError('w_week')}
                                            placeholder="Enter number of weeks"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-medium">Select Days</label>
                                        <Select2
                                            options={weekdays}
                                            value={getMultiValue(formData.w_days ?? courseSettings?.w_days)}
                                            onChange={(value) => {
                                                const stringValue = Array.isArray(value) ? value.join(',') : value;
                                                onInputChange('w_days', stringValue);
                                                validationActions.validateSingleField('w_days', stringValue);
                                            }}
                                            multiple={true}
                                            placeholder="Select weekdays"
                                            style={{ padding: '0.6rem' }}
                                        />
                                        {validationActions.getFieldError('w_days') && (
                                            <p className="text-sm text-red-600 mt-1" role="alert">
                                                {validationActions.getFieldError('w_days')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {currentSchedule === 'monthly' && (
                            <>
                                <p className="text-sm text-gray-600 mb-3">Adding 2 Month & Day 5 here, will repeat the Course every 2 months (ie. January, March, May...) on the 5th day until the end date.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-lg font-medium mb-2">Select Month</label>
                                        <Select2
                                            options={months}
                                            value={typeof formData.m_month === 'string' ? formData.m_month : (courseSettings?.m_month ? String(courseSettings.m_month) : "")}
                                            onChange={(value) => onInputChange('m_month', typeof value === 'string' ? value : value[0])}
                                            placeholder="Select month"
                                            style={{ padding: '0.6rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-medium mb-2">Date</label>
                                        <ValidatedInput
                                            className="px-3 py-2"
                                            value={typeof formData.m_day === 'string' ? formData.m_day : (courseSettings?.m_day ?? "")}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                onInputChange('m_day', value);
                                                validationActions.validateSingleField('m_day', value);
                                            }}
                                            error={validationActions.getFieldError('m_day')}
                                            placeholder="Enter date"
                                            min={1} max={31} type="number" />
                                    </div>
                                </div>
                            </>
                        )}

                        {currentSchedule === 'yearly' && (
                            <>
                                <p className="text-sm text-gray-600 mb-3">Selecting Month Jan & Day 5 here, will repeat the Course every Year on January 5th until the end date.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-lg font-medium mb-2">Select Month</label>
                                        <Select2
                                            options={months}
                                            value={typeof formData.y_month === 'string' ? formData.y_month : (courseSettings?.y_month ? String(courseSettings.y_month) : "")}
                                            onChange={(value) => onInputChange('y_month', typeof value === 'string' ? value : value[0])}
                                            placeholder="Select month"
                                            style={{ padding: '0.6rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-medium mb-2">Date</label>
                                        <ValidatedInput
                                            className="px-3 py-2"
                                            value={typeof formData.y_day === 'string' ? formData.y_day : (courseSettings?.y_day ?? "")}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const value = e.target.value;
                                                onInputChange('y_day', value);
                                                validationActions.validateSingleField('y_day', value);
                                            }}
                                            error={validationActions.getFieldError('y_day')}
                                            placeholder="Enter date" min={1} max={31} type="number" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )
            }
        </div >
    );
}