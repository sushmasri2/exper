import { Course } from "@/types/course";
import { CourseSetting } from "@/types/coursesetting";

// Validation error types
export interface ValidationError {
    field: string;
    message: string;
    type: 'required' | 'format' | 'length' | 'range' | 'custom';
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Field validation rules
export interface FieldValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    custom?: (value: unknown) => string | null;
}

// Common validation patterns
const patterns = {
    code: /^[A-Z0-9_-]+$/,
    optionalCode: /^[A-Z0-9_-]*$/,
    url: /^[a-z0-9-]*$/,
    number: /^[0-9]*$/,
    positiveNumber: /^[0-9]+$/,
    httpUrl: /^(https?:\/\/)/,
    imageUrl: /^(https?:\/\/.*\.(jpg|jpeg|png|gif|webp))|(\/.*\.(jpg|jpeg|png|gif|webp))$/i,
    urlOrPath: /^(https?:\/\/)|(\/)/,
    csvNumbers: /^[0-9]*(,[0-9]+)*$/,
    decimal: /^\d+(\.\d{1,2})?$/,
};

// Common validators
const validators = {

    validId: (value: unknown) =>
        !value || isNaN(Number(value)) ? 'Please select a valid option' : null,

    validDate: (value: unknown) =>
        value && typeof value === 'string' && isNaN(Date.parse(value)) ? 'Must be a valid date' : null,

    validUrl: (value: unknown) =>
        value && typeof value === 'string' && !patterns.httpUrl.test(value) ? 'Must be a valid URL' : null,

    imageFormat: (value: unknown) =>
        value && typeof value === 'string' && !value.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'Must be a valid image format' : null,

    rating: (value: unknown) => {
        if (!value) return null;
        const num = Number(value);
        if (isNaN(num) || num < 0 || num > 5) {
            return 'Rating must be between 0 and 5';
        }
        // Optional: Check decimal places
        const str = String(value);
        if (str.includes('.') && str.split('.')[1].length > 2) {
            return 'Rating can have at most 2 decimal places';
        }
        return null;
    },

    weekDays: (value: unknown) => {
        if (value && typeof value === 'string') {
            const parts = value.split(',').map(p => p.trim());
            const validWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            
            // Check if all parts are valid weekday names (case-insensitive)
            const allValid = parts.every(part => {
                return validWeekdays.some(validDay => validDay.toLowerCase() === part.toLowerCase());
            });
            
            if (!allValid) {
                return 'Must be comma-separated weekday names (Monday,Tuesday,Wednesday,etc.)';
            }
        }
        return null;
    },

    schedule: (value: unknown) =>
        value && typeof value === 'string' && !['daily', 'weekly', 'monthly', 'self-paced'].includes(value.toLowerCase())
            ? 'Must be one of: daily, weekly, monthly, self-paced' : null,

    speciality: (value: unknown) =>
        value && typeof value === 'string' && !['doctors', 'nurses', 'others'].includes(value.toLowerCase())
            ? 'Must be one of: doctors, nurses, others' : null,
};

// Helper to create validation rules
const rule = (config: FieldValidationRule) => config;

// Validation rules for Course fields
export const courseValidationRules: Record<keyof Partial<Course>, FieldValidationRule> = {
    course_name: rule({ required: true, minLength: 3, maxLength: 255 }),
    title: rule({ required: true, minLength: 3, maxLength: 255 }),
    course_card_title: rule({ required: true, maxLength: 255 }),
    one_line_description: rule({ required: true, minLength: 10, maxLength: 500 }),
    short_description: rule({ maxLength: 1000 }),
    description: rule({ minLength: 50, maxLength: 5000 }),
    category_id: rule({ required: true, custom: validators.validId }),
    course_type_id: rule({ required: true, custom: validators.validId }),
    seo_title: rule({ maxLength: 255 }),
    seo_description: rule({ maxLength: 500 }),
    seo_url: rule({ pattern: patterns.url, maxLength: 255 }),
    sem_url: rule({ pattern: patterns.url, maxLength: 255 }),
    cpd_points: rule({ min: 0, pattern: patterns.positiveNumber }),
    active_learners: rule({ min: 0, pattern: patterns.number }),
    rating_count: rule({ min: 0, pattern: patterns.positiveNumber }),
    rating: rule({ min: 0, max: 5, pattern: patterns.decimal, custom: validators.rating }),
    duration: rule({ maxLength: 100 }),
    kite_id: rule({ pattern: patterns.positiveNumber }),
};

// Validation rules for CourseSetting fields
export const courseSettingValidationRules: Record<string, FieldValidationRule> = {
    banner: rule({ maxLength: 500, pattern: patterns.urlOrPath, custom: validators.imageFormat }),
    overview: rule({ required: true, maxLength: 5000 }),
    duration_years: rule({ min: 0, pattern: patterns.number }),
    duration_months: rule({ min: 0, max: 12, pattern: patterns.number }),
    duration_days: rule({ min: 0, max: 365, pattern: patterns.number }),
    y_month: rule({ min: 0, max: 12, pattern: patterns.number }),
    y_day: rule({ min: 0, max: 31, pattern: patterns.number }),
    m_month: rule({ min: 0, max: 12, pattern: patterns.number }),
    m_day: rule({ min: 0, max: 31, pattern: patterns.number }),
    w_week: rule({ min: 0, pattern: patterns.number }),
    w_days: rule({ custom: validators.weekDays }),
    d_days: rule({ min: 0, pattern: patterns.number }),
    schedule: rule({  custom: validators.schedule }),
    end_date: rule({ custom: validators.validDate }),
    course_start_date: rule({ custom: validators.validDate }),
    accreditation: rule({ maxLength: 2000 }),
    extendedvalidity_years: rule({ min: 0, pattern: patterns.number }),
    extendedvalidity_months: rule({ min: 0, max: 12, pattern: patterns.number }),
    extendedvalidity_days: rule({ min: 0, max: 365, pattern: patterns.number }),
    brochure: rule({ maxLength: 500, custom: validators.validUrl }),
    financial_aid: rule({ maxLength: 2000 }),
    is_preferred_course: rule({ required: true }),
    what_you_will_learn: rule({ maxLength: 5000 }),
    course_demo_url: rule({ required: true, maxLength: 500, custom: validators.validUrl }),
    course_demo_mobile_url: rule({ required: true, maxLength: 500, custom: validators.validUrl }),
    is_kyc_required: rule({ required: true }),
    banner_alt_tag: rule({ required: true, maxLength: 255 }),
    enable_contact_programs: rule({ required: true}),
    enable_index_tag: rule({ required: true }),
    thumbnail_mobile: rule({ maxLength: 500, custom: (value) => value && typeof value === 'string' && !patterns.imageUrl.test(value) ? 'Must be a valid image URL' : null }),
    thumbnail_web: rule({ maxLength: 500, custom: (value) => value && typeof value === 'string' && !patterns.imageUrl.test(value) ? 'Must be a valid image URL' : null }),
    partner_coursecode: rule({ maxLength: 100, pattern: patterns.optionalCode }),
    disclosure: rule({ maxLength: 2000 }),
    summary: rule({ maxLength: 1000 }),
    speciality_type: rule({ custom: validators.speciality }),
};
export const coursePriceValidationRules: Record<string, FieldValidationRule> = {
    price: rule({ required: true, min: 0, pattern: patterns.positiveNumber }),
    future_price: rule({ min: 0, pattern: patterns.positiveNumber }),
    future_price_effect_from: rule({ custom: validators.validDate }),
    extended_validity_price: rule({ min: 0, pattern: patterns.positiveNumber }),
    major_update_price: rule({ min: 0, pattern: patterns.positiveNumber }),
};
export const courseSEOValidationRules: Record<string, FieldValidationRule> = {
    seo_title: rule({ maxLength: 255 }),
    seo_description: rule({ maxLength: 500 }),
    seo_url: rule({ pattern: patterns.url, maxLength: 255 }),
    sem_url: rule({ pattern: patterns.url, maxLength: 255 }),
};

export const coursePatronValidationRules: Record<string, FieldValidationRule> = {
    name: rule({ required: true, minLength: 2, maxLength: 255 }),
    designation: rule({ required: true, minLength: 2, maxLength: 255 }),
    image: rule({ required: true, maxLength: 500, custom: validators.imageFormat }),
};


// Helper to format field names
const formatFieldName = (fieldName: string) =>
    fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// Create validation error
const createError = (field: string, message: string, type: ValidationError['type']): ValidationError =>
    ({ field, message, type });

// Validation function
export function validateField(fieldName: string, value: unknown, rules: FieldValidationRule): ValidationError | null {
    const isEmpty = value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || value === '';

    // Required validation
    if (rules.required && isEmpty) {
        return createError(fieldName, `${formatFieldName(fieldName)} is required`, 'required');
    }

    // Skip other validations if empty and not required
    if (isEmpty) return null;

    const stringValue = String(value).trim();
    const numericValue = Number(value);
    const fieldDisplay = formatFieldName(fieldName);

    // Length validations
    if (rules.minLength && stringValue.length < rules.minLength) {
        return createError(fieldName, `${fieldDisplay} must be at least ${rules.minLength} characters`, 'length');
    }
    if (rules.maxLength && stringValue.length > rules.maxLength) {
        return createError(fieldName, `${fieldDisplay} must not exceed ${rules.maxLength} characters`, 'length');
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
        return createError(fieldName, `${fieldDisplay} format is invalid`, 'format');
    }

    // Numeric range validations
    if (rules.min !== undefined && !isNaN(numericValue) && numericValue < rules.min) {
        return createError(fieldName, `${fieldDisplay} must be at least ${rules.min}`, 'range');
    }
    if (rules.max !== undefined && !isNaN(numericValue) && numericValue > rules.max) {
        return createError(fieldName, `${fieldDisplay} must not exceed ${rules.max}`, 'range');
    }

    // Custom validation
    if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
            return createError(fieldName, customError, 'custom');
        }
    }

    return null;
}

// Validate data against rules
const validateData = (data: Record<string, unknown>, rules: Record<string, FieldValidationRule>, debugLabel?: string) => {
    const errors: ValidationError[] = [];

    // Check all rule fields, not just data fields - this ensures required fields are validated even if missing
    Object.entries(rules).forEach(([field, rule]) => {
        const value = data[field];
        const error = validateField(field, value, rule);
        // if (debugLabel && rule.required) {
        //     console.log(`- Field "${field}": value="${value}", required=${rule.required}, error=${error?.message || 'none'}`);
        // }
        if (error) {
            errors.push(error);
        }
    });

    if (debugLabel) {
        console.log(`- ${debugLabel} errors found: ${errors.length}`);
    }

    return errors;
};

// Validate entire form data
export function validateCourseData(courseData: Partial<Course>, courseSettings?: Partial<CourseSetting>): ValidationResult {

    // Validate course fields
    const courseErrors = validateData(courseData as Record<string, unknown>, courseValidationRules as Record<string, FieldValidationRule>, "Course");

    // For course settings, check both the separate courseSettings object AND the courseData object
    // because course settings fields might be mixed into the main form data
    const combinedData = { ...courseSettings, ...courseData };
    const settingErrors = validateData(combinedData as Record<string, unknown>, courseSettingValidationRules as Record<string, FieldValidationRule>, "CourseSettings");

    const errors = [...courseErrors, ...settingErrors];

    // Cross-field validation: date range
    const startDate = combinedData.course_start_date;
    const endDate = combinedData.end_date;

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            errors.push(createError('end_date', 'End date must be after start date', 'custom'));
        }
    }

    return { isValid: errors.length === 0, errors };
}

// Helper functions
export const getFieldError = (fieldName: string, errors: ValidationError[]) =>
    errors.find(e => e.field === fieldName)?.message || null;

export const hasFieldError = (fieldName: string, errors: ValidationError[]) =>
    errors.some(e => e.field === fieldName);