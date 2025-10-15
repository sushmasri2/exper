/**
 * Type Conversion Utilities for Course Settings API
 * Converts form string values to their appropriate types before sending to API
 */

import { Course } from "@/types/course";
import { CourseSetting } from "@/types/coursesetting";

// Define field type mappings based on the interfaces
export const COURSE_FIELD_TYPES: Record<keyof Course, 'string' | 'number' | 'boolean' | 'array'> = {
    id: 'number',
    uuid: 'string',
    course_name: 'string',
    title: 'string',
    course_card_title: 'string',
    one_line_description: 'string',
    short_description: 'string',
    description: 'string',
    duration: 'string',
    category_id: 'number',
    course_type_id: 'number',
    category_name: 'string',
    location: 'string',
    status: 'number',
    version: 'string',
    no_price: 'number',
    type_name: 'string',
    seo_title: 'string',
    seo_description: 'string',
    seo_url: 'string',
    sem_url: 'string',
    pricing: 'array',
    kite_id: 'number',
    course_zoho_id: 'string',
    cpd_points: 'number',
    active_learners: 'number',
    rating_count: 'number',
    rating: 'number',
    created_at: 'string',
    updated_at: 'string'
};

export const COURSE_SETTING_FIELD_TYPES: Record<keyof CourseSetting, 'string' | 'number' | 'boolean' | 'array'> = {
    id: 'number',
    uuid: 'string',
    course_id: 'number',
    banner: 'string',
    overview: 'string',
    course_demo: 'string',
    duration_years: 'number',
    duration_months: 'number',
    duration_days: 'number',
    schedule: 'string',
    end_date: 'string',
    y_month: 'number',
    y_day: 'number',
    m_month: 'number',
    m_day: 'number',
    w_week: 'number',
    w_days: 'string',
    d_days: 'number',
    accreditation: 'string',
    extendedvalidity_years: 'number',
    extendedvalidity_months: 'number',
    extendedvalidity_days: 'number',
    brochure: 'string',
    cohert_learning_image: 'string',
    cohert_learning_overview: 'string',
    course_demo_mobile: 'string',
    course_start_date: 'string',
    financial_aid: 'string',
    is_preferred_course: 'boolean',
    rating: 'string',
    what_you_will_learn: 'string',
    course_demo_url: 'string',
    course_demo_mobile_url: 'string',
    children_course: 'string',
    is_kyc_required: 'boolean',
    banner_alt_tag: 'string',
    enable_contact_programs: 'boolean',
    enable_index_tag: 'boolean',
    trending_courses_ordering: 'number',
    thumbnail_mobile: 'string',
    thumbnail_web: 'string',
    partner_coursecode: 'string',
    speciality_courses_ordering: 'number',
    disclosure: 'string',
    summary: 'string',
    speciality_type: 'string',
    created_at: 'string',
    updated_at: 'string'
};

/**
 * Converts a string value to the appropriate type based on field definition
 */
export function convertValueToType(value: unknown, targetType: 'string' | 'number' | 'boolean' | 'array'): unknown {
    // If value is null or undefined, return as is
    if (value === null || value === undefined) {
        return value;
    }

    // If value is already the correct type, return as is
    switch (targetType) {
        case 'string':
            if (typeof value === 'string') return value;
            return String(value);

        case 'number':
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
                // Handle empty strings as null/undefined for optional numeric fields
                if (value.trim() === '') return undefined;
                const numValue = Number(value);
                return isNaN(numValue) ? undefined : numValue;
            }
            return undefined;

        case 'boolean':
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') {
                // Handle empty strings as false
                if (value.trim() === '') return false;
                return value.toLowerCase() === 'true' || value === '1';
            }
            if (typeof value === 'number') {
                return value === 1;
            }
            return Boolean(value);

        case 'array':
            if (Array.isArray(value)) return value;
            return value;

        default:
            return value;
    }
}

/**
 * Converts form data values to their appropriate types for API submission
 */
export function convertFormDataToApiTypes(formData: Record<string, unknown>): Record<string, unknown> {
    const convertedData: Record<string, unknown> = {};

    Object.entries(formData).forEach(([key, value]) => {
        // Skip conversion if value is null or undefined
        if (value === null || value === undefined) {
            convertedData[key] = value;
            return;
        }

        // Check if it's a course field
        if (key in COURSE_FIELD_TYPES) {
            const targetType = COURSE_FIELD_TYPES[key as keyof Course];
            convertedData[key] = convertValueToType(value, targetType);
        }
        // Check if it's a course setting field
        else if (key in COURSE_SETTING_FIELD_TYPES) {
            const targetType = COURSE_SETTING_FIELD_TYPES[key as keyof CourseSetting];
            convertedData[key] = convertValueToType(value, targetType);
        }
        // If field is not recognized, keep original value
        else {
            convertedData[key] = value;
        }
    });

    return convertedData;
}

/**
 * Specifically converts course data fields to their proper types
 */
export function convertCourseDataTypes(courseData: Record<string, unknown>): Record<string, unknown> {
    const convertedData: Record<string, unknown> = {};

    Object.entries(courseData).forEach(([key, value]) => {
        if (key in COURSE_FIELD_TYPES) {
            const targetType = COURSE_FIELD_TYPES[key as keyof Course];
            convertedData[key] = convertValueToType(value, targetType);
        } else {
            convertedData[key] = value;
        }
    });

    return convertedData;
}

/**
 * Specifically converts course settings fields to their proper types
 */
export function convertCourseSettingsTypes(courseSettings: Record<string, unknown>): Record<string, unknown> {
    const convertedData: Record<string, unknown> = {};

    Object.entries(courseSettings).forEach(([key, value]) => {
        if (key in COURSE_SETTING_FIELD_TYPES) {
            const targetType = COURSE_SETTING_FIELD_TYPES[key as keyof CourseSetting];
            convertedData[key] = convertValueToType(value, targetType);
        } else {
            convertedData[key] = value;
        }
    });

    return convertedData;
}

/**
 * Helper function to log type conversion for debugging
 */
export function logTypeConversion(fieldName: string, originalValue: unknown, convertedValue: unknown, targetType: string): void {
    if (process.env.NODE_ENV === 'development') {
        if (originalValue !== convertedValue) {
            console.log(`🔄 Type conversion: ${fieldName}`, {
                original: originalValue,
                converted: convertedValue,
                targetType,
                originalType: typeof originalValue,
                convertedType: typeof convertedValue
            });
        }
    }
}