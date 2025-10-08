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
};

// Common validators
const validators = {
    binaryFlag: (value: unknown) => {
        if (value === undefined || value === null) return null;
        return (value !== true && value !== false && value !== 0 && value !== 1 && value !== '0' && value !== '1') ? 'Must be Yes or No' : null;
    },

    validId: (value: unknown) => {
        // Allow 0 as a valid ID, and check if it's a valid number or numeric string
        if (value === undefined || value === null || value === '') return 'Please select a valid option';
        const numValue = Number(value);
        return isNaN(numValue) ? 'Please select a valid option' : null;
    },

    validDate: (value: unknown) => {
        if (!value) return null; // Empty dates are allowed unless field is required
        if (typeof value !== 'string') return 'Must be a valid date';
        const date = new Date(value);
        return isNaN(date.getTime()) ? 'Must be a valid date' : null;
    },

    validUrl: (value: unknown) => {
        if (!value) return null; // Empty URLs are allowed unless field is required
        if (typeof value !== 'string') return 'Must be a valid URL';
        // Accept both absolute URLs and relative paths
        return (patterns.httpUrl.test(value) || value.startsWith('/')) ? null : 'Must be a valid URL or path';
    },

    imageFormat: (value: unknown) => {
        if (!value) return null; // Empty images are allowed unless field is required
        if (typeof value !== 'string') return 'Must be a valid image format';
        // More flexible image validation - accept URLs and paths
        return value.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? null : 'Must be a valid image format (jpg, jpeg, png, gif, webp)';
    },

    rating: (value: unknown) => {
        const str = String(value);
        return str && (!patterns.number.test(str) || Number(str) > 5) ? 'Rating must be between 0 and 5' : null;
    },

    weekDays: (value: unknown) => {
        if (value && typeof value === 'string') {
            const validDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const days = value.split(',').map(d => d.trim());
            const invalidDays = days.filter(day => !validDayNames.includes(day));
            return invalidDays.length > 0 ? 'Must be comma-separated valid weekday names (Monday, Tuesday, etc.)' : null;
        }
        return null;
    },

    schedule: (value: unknown) =>
        value && typeof value === 'string' && !['daily', 'weekly', 'monthly', 'yearly', 'self-paced'].includes(value.toLowerCase())
            ? 'Must be one of: daily, weekly, monthly, yearly, self-paced' : null,

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
    course_code: rule({ required: true, minLength: 3, maxLength: 50, pattern: patterns.code }),
    short_code: rule({ required: true, maxLength: 20, pattern: patterns.optionalCode }),
    seo_title: rule({ maxLength: 255 }),
    seo_description: rule({ maxLength: 500 }),
    seo_url: rule({ pattern: patterns.url, maxLength: 255 }),
    sem_url: rule({ pattern: patterns.url, maxLength: 255 }),
    duration: rule({ maxLength: 100 }),
    location: rule({ maxLength: 255 }),
    status: rule({ custom: validators.binaryFlag }),
    version: rule({ maxLength: 20 }),
    no_price: rule({ custom: validators.binaryFlag }),
};

// Validation rules for CourseSetting fields
export const courseSettingValidationRules: Partial<Record<keyof CourseSetting, FieldValidationRule>> = {
    banner: rule({ maxLength: 500, pattern: patterns.urlOrPath, custom: validators.imageFormat }),
    overview: rule({ required: true, maxLength: 5000 }),
    course_demo: rule({ maxLength: 500, custom: validators.validUrl }),
    duration_years: rule({ min: 0, pattern: patterns.number }),
    duration_months: rule({ min: 0, max: 12, pattern: patterns.number }),
    duration_days: rule({ min: 0, max: 365, pattern: patterns.number }),
    y_month: rule({ min: 0, max: 12, pattern: patterns.number }),
    y_day: rule({ min: 0, max: 31, pattern: patterns.number }),
    m_month: rule({ min: 0, max: 12, pattern: patterns.number }),
    m_day: rule({ min: 0, max: 31, pattern: patterns.number }),
    w_week: rule({ min: 0, pattern: patterns.positiveNumber }),
    w_days: rule({ required: true, custom: validators.weekDays }),
    d_days: rule({ min: 0, pattern: patterns.number }),
    schedule: rule({ required: true, custom: validators.schedule }),
    end_date: rule({ custom: validators.validDate }),
    course_start_date: rule({ custom: validators.validDate }),
    accreditation: rule({ maxLength: 2000 }),
    extendedvalidity_years: rule({ min: 0, pattern: patterns.number }),
    extendedvalidity_months: rule({ min: 0, max: 12, pattern: patterns.number }),
    extendedvalidity_days: rule({ min: 0, max: 365, pattern: patterns.number }),
    brochure: rule({ maxLength: 500, custom: validators.validUrl }),
    cohert_learning_image: rule({ maxLength: 500, custom: validators.imageFormat }),
    cohert_learning_overview: rule({ maxLength: 2000 }),
    course_demo_mobile: rule({ maxLength: 500, custom: validators.validUrl }),
    financial_aid: rule({ maxLength: 2000 }),
    is_preferred_course: rule({ required: true, custom: validators.binaryFlag }),
    rating: rule({ maxLength: 10 }),
    what_you_will_learn: rule({ maxLength: 5000 }),
    course_demo_url: rule({ required: true, maxLength: 500, custom: validators.validUrl }),
    course_demo_mobile_url: rule({ required: true, maxLength: 500, custom: validators.validUrl }),
    children_course: rule({ maxLength: 500 }),
    is_kyc_required: rule({ required: true, custom: validators.binaryFlag }),
    banner_alt_tag: rule({ required: true, maxLength: 255 }),
    enable_contact_programs: rule({ required: true, custom: validators.binaryFlag }),
    enable_index_tag: rule({ required: true, custom: validators.binaryFlag }),
    trending_courses_ordering: rule({ min: 0, pattern: patterns.number }),
    thumbnail_mobile: rule({ maxLength: 500, custom: (value) => value && typeof value === 'string' && !patterns.imageUrl.test(value) ? 'Must be a valid image URL' : null }),
    thumbnail_web: rule({ maxLength: 500, custom: (value) => value && typeof value === 'string' && !patterns.imageUrl.test(value) ? 'Must be a valid image URL' : null }),
    partner_coursecode: rule({ maxLength: 100, pattern: patterns.optionalCode }),
    speciality_courses_ordering: rule({ min: 0, pattern: patterns.number }),
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
const validateData = (
    data: Record<string, unknown>, 
    rules: Record<string, FieldValidationRule>,
    options: { fieldsToValidate?: string[]; validateOnlyPresent?: boolean } = {}
) => {
    const allErrors: ValidationError[] = [];
    const { fieldsToValidate, validateOnlyPresent = false } = options;

    // Determine which fields to validate
    const fieldsToCheck = fieldsToValidate ? fieldsToValidate : Object.keys(rules);

    fieldsToCheck.forEach(field => {
        const rule = rules[field];
        if (!rule) return; // Skip if no rule defined for this field

        const hasFieldInData = Object.prototype.hasOwnProperty.call(data, field);
        const value = data[field];
        
        // Validation logic:
        // 1. If validateOnlyPresent is true, only validate fields present in data
        // 2. Otherwise, validate if field is present OR is required
        const shouldValidate = validateOnlyPresent 
            ? hasFieldInData 
            : (hasFieldInData || rule.required);

        if (shouldValidate) {
            const error = validateField(field, value, rule);
            if (error) {
                allErrors.push(error);
            }
        }
    });

    return allErrors;
};

// Validate user interactions only (only validates fields that user has touched)
export function validateUserInteractions(courseData: Partial<Course>, courseSettings?: Partial<CourseSetting>): ValidationResult {
    console.log('🔍 Validating user interactions only:', Object.keys(courseData), Object.keys(courseSettings || {}));

    const errors = [
        ...validateData(courseData as Record<string, unknown>, courseValidationRules as Record<string, FieldValidationRule>, { validateOnlyPresent: true }),
        ...(courseSettings ? validateData(courseSettings as Record<string, unknown>, courseSettingValidationRules as Record<string, FieldValidationRule>, { validateOnlyPresent: true }) : [])
    ];

    if (errors.length > 0) {
        console.log('❌ User interaction validation errors found:', errors.map(e => `${e.field}: ${e.message}`));
    } else {
        console.log('✅ All user interaction validation passed');
    }

    // Cross-field validation: date range (only if both fields are present)
    if (courseSettings?.course_start_date && courseSettings?.end_date) {
        const startDate = new Date(courseSettings.course_start_date);
        const endDate = new Date(courseSettings.end_date);

        if (startDate >= endDate) {
            errors.push(createError('end_date', 'End date must be after start date', 'custom'));
        }
    }

    return { isValid: errors.length === 0, errors };
}

// Validate form data (validates present fields and required fields for submission)
export function validateFormData(courseData: Partial<Course>, courseSettings?: Partial<CourseSetting>): ValidationResult {
    console.log('🔍 Validating complete form data fields:', Object.keys(courseData), Object.keys(courseSettings || {}));

    const errors = [
        ...validateData(courseData as Record<string, unknown>, courseValidationRules as Record<string, FieldValidationRule>, { validateOnlyPresent: false }),
        ...(courseSettings ? validateData(courseSettings as Record<string, unknown>, courseSettingValidationRules as Record<string, FieldValidationRule>, { validateOnlyPresent: false }) : [])
    ];

    if (errors.length > 0) {
        console.log('❌ Form validation errors found:', errors.map(e => `${e.field}: ${e.message}`));
    } else {
        console.log('✅ All form validation passed');
    }

    // Cross-field validation: date range
    if (courseSettings?.course_start_date && courseSettings?.end_date) {
        const startDate = new Date(courseSettings.course_start_date);
        const endDate = new Date(courseSettings.end_date);

        if (startDate >= endDate) {
            errors.push(createError('end_date', 'End date must be after start date', 'custom'));
        }
    }

    return { isValid: errors.length === 0, errors };
}

// Validate entire form data (comprehensive validation for submission)
export function validateCourseData(courseData: Partial<Course>, courseSettings?: Partial<CourseSetting>): ValidationResult {
    console.log('🔍 Validating course data fields:', Object.keys(courseData));
    console.log('🔍 Validating course settings fields:', courseSettings ? Object.keys(courseSettings) : 'none');

    const errors = [
        ...validateData(courseData as Record<string, unknown>, courseValidationRules as Record<string, FieldValidationRule>),
        ...(courseSettings ? validateData(courseSettings as Record<string, unknown>, courseSettingValidationRules as Record<string, FieldValidationRule>) : [])
    ];

    if (errors.length > 0) {
        console.log('❌ Validation errors found:', errors.map(e => `${e.field}: ${e.message}`));
    } else {
        console.log('✅ All validation passed');
    }

    // Cross-field validation: date range
    if (courseSettings?.course_start_date && courseSettings?.end_date) {
        const startDate = new Date(courseSettings.course_start_date);
        const endDate = new Date(courseSettings.end_date);

        if (startDate >= endDate) {
            errors.push(createError('end_date', 'End date must be after start date', 'custom'));
        }
    }

    return { isValid: errors.length === 0, errors };
}

// Validate specific fields only (useful for real-time validation)
export function validateSpecificFields(
    fieldNames: string[], 
    courseData: Partial<Course>, 
    courseSettings?: Partial<CourseSetting>
): ValidationError[] {
    const courseErrors = validateData(
        courseData as Record<string, unknown>, 
        courseValidationRules as Record<string, FieldValidationRule>,
        { fieldsToValidate: fieldNames, validateOnlyPresent: true }
    );

    const settingsErrors = courseSettings ? validateData(
        courseSettings as Record<string, unknown>, 
        courseSettingValidationRules as Record<string, FieldValidationRule>,
        { fieldsToValidate: fieldNames, validateOnlyPresent: true }
    ) : [];

    return [...courseErrors, ...settingsErrors];
}

// Helper functions
export const getFieldError = (fieldName: string, errors: ValidationError[]) =>
    errors.find(e => e.field === fieldName)?.message || null;

export const hasFieldError = (fieldName: string, errors: ValidationError[]) =>
    errors.some(e => e.field === fieldName);