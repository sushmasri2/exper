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

// Validation rules for Course fields
export const courseValidationRules: Record<keyof Partial<Course>, FieldValidationRule> = {
    course_name: {
        required: true,
        minLength: 3,
        maxLength: 255,
    },
    title: {
        required: true,
        minLength: 3,
        maxLength: 255,
    },
    course_card_title: {
        maxLength: 255,
    },
    one_line_description: {
        required: true,
        minLength: 10,
        maxLength: 500,
    },
    short_description: {
        maxLength: 1000,
    },
    description: {
        required: true,
        minLength: 50,
        maxLength: 5000,
    },
    category_id: {
        required: true,
        custom: (value) => {
            if (!value || isNaN(Number(value))) {
                return 'Please select a valid category';
            }
            return null;
        }
    },
    course_type_id: {
        required: true,
        custom: (value) => {
            if (!value || isNaN(Number(value))) {
                return 'Please select a valid course type';
            }
            return null;
        }
    },
    course_code: {
        required: true,
        minLength: 3,
        maxLength: 50,
        pattern: /^[A-Z0-9_-]+$/,
    },
    short_code: {
        maxLength: 20,
        pattern: /^[A-Z0-9_-]*$/,
    },
    seo_title: {
        maxLength: 255,
    },
    seo_description: {
        maxLength: 500,
    },
    seo_url: {
        pattern: /^[a-z0-9-]*$/,
        maxLength: 255,
    },
    sem_url: {
        pattern: /^[a-z0-9-]*$/,
        maxLength: 255,
    },
    cpd_points: {
        min: 0,
        pattern: /^[0-9]+$/,
    },
    active_learners: {
        min: 0,
        pattern: /^[0-9]*$/,
    },
    rating_count: {
        min: 0,
        pattern: /^[0-9]*$/,
    },
    rating: {
        min: 0,
        max: 5, 
        custom: (value: unknown) => {
            const stringValue = String(value);
            if (stringValue && (!/^[0-9]*$/.test(stringValue) || isNaN(Number(stringValue)) || Number(stringValue) < 0 || Number(stringValue) > 5)) {
                return 'Rating must be a number between 0 and 5';
            }
            return null;
        },
        pattern: /^[0-9]*$/,
    },
    no_price: {
        custom: (value) => {
            if (value !== undefined && value !== 0 && value !== 1) {
                return 'Price flag must be 0 (paid) or 1 (free)';
            }
            return null;
        }
    },
    duration: {
        maxLength: 100,
    },
};

// Validation rules for CourseSetting fields
export const courseSettingValidationRules: Partial<Record<keyof CourseSetting, FieldValidationRule>> = {
    banner: {
        maxLength: 500,
        pattern: /^(https?:\/\/)|(\/)/,
        custom: (value) => {
            if (value && typeof value === 'string' && !value.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                return 'Banner must be a valid image URL (jpg, jpeg, png, gif, webp)';
            }
            return null;
        }
    },
    overview: {
        required: true,
        maxLength: 5000,
    },
    duration_years: {
        min: 0,
        pattern: /^[0-9]*$/,
    },
    duration_months: {
        min: 0,
        max: 12,
        pattern: /^[0-9]*$/,
    },
    duration_days: {
        min: 0,
        max: 365,
        pattern: /^[0-9]*$/,
    },
    y_day: {
        min: 0,
        max: 31,
        pattern: /^[0-9]*$/,
    },
    m_day: {
        min: 0,
        max: 31,
        pattern: /^[0-9]*$/,
    },
    w_days: {
        min: 0,
        pattern: /^[0-9]*$/,
    },
    d_days
        : {
        min: 0,
        pattern: /^[0-9]*$/,
    },
    schedule: {
        custom: (value) => {
            if (value && typeof value === 'string' && !['daily', 'weekly', 'monthly', 'self-paced'].includes(value.toLowerCase())) {
                return 'Schedule must be one of: daily, weekly, monthly, self-paced';
            }
            return null;
        }
    },
    end_date: {
        custom: (value) => {
            if (value && typeof value === 'string' && isNaN(Date.parse(value))) {
                return 'End date must be a valid date';
            }
            return null;
        }
    },
    course_start_date: {
        custom: (value) => {
            if (value && typeof value === 'string' && isNaN(Date.parse(value))) {
                return 'Start date must be a valid date';
            }
            return null;
        }
    },
    accreditation: {
        maxLength: 2000,
    },
    extendedvalidity_years: {
        min: 0,
        pattern: /^[0-9]*$/,
    },
    extendedvalidity_months: {
        min: 0,
        max: 12,
        pattern: /^[0-9]*$/,
    },
    extendedvalidity_days: {
        min: 0,
        max: 365,
        pattern: /^[0-9]*$/,
    },
    brochure: {
        maxLength: 500,
        custom: (value) => {
            if (value && typeof value === 'string' && !value.match(/^(https?:\/\/)|(\/)/)) {
                return 'Brochure must be a valid URL';
            }
            return null;
        }
    },
    financial_aid: {
        maxLength: 2000,
    },
    is_preferred_course: {
        custom: (value) => {
            if (value !== undefined && value !== 0 && value !== 1) {
                return 'Preferred course must be 0 (no) or 1 (yes)';
            }
            return null;
        }
    },
    what_you_will_learn: {
        maxLength: 5000,
    },
    course_demo_url: {
        required: true,
        maxLength: 500,
        custom: (value) => {
            if (value && typeof value === 'string' && !value.match(/^(https?:\/\/)/)) {
                return 'Web demo must be URL format';
            }
            return null;
        }
    },
    course_demo_mobile_url: {
        required: true,
        maxLength: 500,
        custom: (value) => {
            if (value && typeof value === 'string' && !value.match(/^(https?:\/\/)/)) {
                return 'Mobile demo must be URL format';
            }
            return null;
        }
    },
    is_kyc_required: {
        custom: (value) => {
            if (value !== undefined && value !== 0 && value !== 1) {
                return 'KYC required must be 0 (no) or 1 (yes)';
            }
            return null;
        }
    },
    banner_alt_tag: {
        maxLength: 255,
        required: true
    },
    enable_contact_programs: {
        custom: (value) => {
            if (value !== undefined && value !== 0 && value !== 1) {
                return 'Contact programs must be 0 (disabled) or 1 (enabled)';
            }
            return null;
        }
    },
    thumbnail_mobile: {
        maxLength: 500,
        custom: (value) => {
            if (value && typeof value === 'string') {
                // Must be a valid URL format (http/https or local path) with image extension
                if (!value.match(/^(https?:\/\/.*\.(jpg|jpeg|png|gif|webp))|(\/.*\.(jpg|jpeg|png|gif|webp))$/i)) {
                    return 'Mobile thumbnail must be a valid URL with image extension (jpg, jpeg, png, gif, webp)';
                }
            }
            return null;
        }
    },
    thumbnail_web: {
        maxLength: 500,
        custom: (value) => {
            if (value && typeof value === 'string') {
                // Must be a valid URL format (http/https or local path) with image extension
                if (!value.match(/^(https?:\/\/.*\.(jpg|jpeg|png|gif|webp))|(\/.*\.(jpg|jpeg|png|gif|webp))$/i)) {
                    return 'Web thumbnail must be a valid URL with image extension (jpg, jpeg, png, gif, webp)';
                }
            }
            return null;
        }
    },
    partner_coursecode: {
        maxLength: 100,
        pattern: /^[A-Z0-9_-]*$/,
    },
    disclosure: {
        maxLength: 2000,
    },
    summary: {
        maxLength: 1000,
    },
    speciality_type: {
        custom: (value) => {
            if (value && typeof value === 'string' && !['doctors', 'nurses', 'others'].includes(value.toLowerCase())) {
                return 'Specialty type must be one of: doctors, nurses, others';
            }
            return null;
        }
    },
};

// Validation function
export function validateField(
    fieldName: string,
    value: unknown,
    rules: FieldValidationRule
): ValidationError | null {
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return {
            field: fieldName,
            message: `${fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`,
            type: 'required'
        };
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return null;
    }

    const stringValue = String(value).trim();
    const numericValue = Number(value);

    // Length validations
    if (rules.minLength && stringValue.length < rules.minLength) {
        return {
            field: fieldName,
            message: `${fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be at least ${rules.minLength} characters`,
            type: 'length'
        };
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
        return {
            field: fieldName,
            message: `${fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must not exceed ${rules.maxLength} characters`,
            type: 'length'
        };
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
        return {
            field: fieldName,
            message: `${fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} format is invalid`,
            type: 'format'
        };
    }

    // Numeric range validations
    if (rules.min !== undefined && !isNaN(numericValue) && numericValue < rules.min) {
        return {
            field: fieldName,
            message: `${fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be at least ${rules.min}`,
            type: 'range'
        };
    }

    if (rules.max !== undefined && !isNaN(numericValue) && numericValue > rules.max) {
        return {
            field: fieldName,
            message: `${fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must not exceed ${rules.max}`,
            type: 'range'
        };
    }

    // Custom validation
    if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
            return {
                field: fieldName,
                message: customError,
                type: 'custom'
            };
        }
    }

    return null;
}

// Validate entire form data
export function validateCourseData(
    courseData: Partial<Course>,
    courseSettings?: Partial<CourseSetting>
): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate course fields
    Object.entries(courseData).forEach(([field, value]) => {
        const rule = courseValidationRules[field as keyof Course];
        if (rule) {
            const error = validateField(field, value, rule);
            if (error) {
                errors.push(error);
            }
        }
    });

    // Validate course settings fields
    if (courseSettings) {
        Object.entries(courseSettings).forEach(([field, value]) => {
            const rule = courseSettingValidationRules[field as keyof CourseSetting];
            if (rule) {
                const error = validateField(field, value, rule);
                if (error) {
                    errors.push(error);
                }
            }
        });
    }

    // Cross-field validations
    if (courseSettings?.course_start_date && courseSettings?.end_date) {
        const startDate = new Date(courseSettings.course_start_date);
        const endDate = new Date(courseSettings.end_date);

        if (startDate >= endDate) {
            errors.push({
                field: 'end_date',
                message: 'End date must be after start date',
                type: 'custom'
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Helper function to get field error
export function getFieldError(fieldName: string, errors: ValidationError[]): string | null {
    const error = errors.find(e => e.field === fieldName);
    return error ? error.message : null;
}

// Helper function to check if field has error
export function hasFieldError(fieldName: string, errors: ValidationError[]): boolean {
    return errors.some(e => e.field === fieldName);
}