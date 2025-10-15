import { useState, useCallback } from 'react';
import { Course } from "@/types/course";
import { CourseSetting } from "@/types/coursesetting";
import {
    ValidationError,
    ValidationResult,
    validateCourseData,
    getFieldError,
    hasFieldError,
    courseValidationRules,
    courseSettingValidationRules,
    validateField,
    coursePriceValidationRules,
    courseSEOValidationRules,
} from '../utils/validation';
import { CoursePricing } from '@/types/course-pricing';

export interface ValidationState {
    getFieldError(arg0: string): string | null | undefined;
    validateSingleField: (fieldName: string, value: unknown) => ValidationError | null;
    errors: ValidationError[]; 
    isValidating: boolean;
    isValid: boolean;
}

export interface ValidationActions {
    validateForm: (courseData: Partial<Course>, courseSettings?: Partial<CourseSetting>) => ValidationResult;
    validateSingleField: (fieldName: string, value: unknown) => ValidationError | null;
    clearErrors: () => void;
    clearFieldError: (fieldName: string) => void;
    getFieldError: (fieldName: string) => string | null;
    hasFieldError: (fieldName: string) => boolean;
    setErrors: (errors: ValidationError[]) => void;
}

export function useFormValidation(): [ValidationState, ValidationActions] {
    const [validationState, setValidationState] = useState<ValidationState>({
        errors: [],
        isValidating: false,
        isValid: true,
        getFieldError: (fieldName: string) => getFieldError(fieldName, []),
        validateSingleField: () => null,
    });

    const validateForm = useCallback((
        courseData: Partial<Course>,
        courseSettings?: Partial<CourseSetting>
    ): ValidationResult => {
        setValidationState(prev => ({
            ...prev,
            isValidating: true,
        }));

        const result = validateCourseData(courseData, courseSettings);

        setValidationState(prev => ({
            ...prev,
            errors: result.errors,
            isValidating: false,
            isValid: result.isValid,
        }));

        return result;
    }, []);

    const validateSingleField = useCallback((
        fieldName: string,
        value: unknown
    ): ValidationError | null => {
        const rules = courseSettingValidationRules[fieldName as keyof CourseSetting] || courseValidationRules[fieldName as keyof Course] || coursePriceValidationRules[fieldName as keyof CoursePricing] || courseSEOValidationRules[fieldName as keyof Course];

        if (!rules) {
            return null;
        }

        const error = validateField(fieldName, value, rules);

        setValidationState(prev => {
            const newErrors = prev.errors.filter(e => e.field !== fieldName);
            if (error) {
                newErrors.push(error);
            }

            return {
                ...prev,
                errors: newErrors,
                isValid: newErrors.length === 0,
            };
        });

        return error;
    }, []);

    const clearErrors = useCallback(() => {
        setValidationState(prev => ({
            ...prev,
            errors: [],
            isValid: true,
        }));
    }, []);

    const clearFieldError = useCallback((fieldName: string) => {
        setValidationState(prev => ({
            ...prev,
            errors: prev.errors.filter(e => e.field !== fieldName),
            isValid: prev.errors.filter(e => e.field !== fieldName).length === 0,
        }));
    }, []);

    const getFieldErrorMessage = useCallback((fieldName: string): string | null => {
        return getFieldError(fieldName, validationState.errors);
    }, [validationState.errors]);

    const hasFieldErrorFlag = useCallback((fieldName: string): boolean => {
        return hasFieldError(fieldName, validationState.errors);
    }, [validationState.errors]);

    const setErrors = useCallback((errors: ValidationError[]) => {
        setValidationState(prev => ({
            ...prev,
            errors,
            isValid: errors.length === 0,
        }));
    }, []);

    const actions: ValidationActions = {
        validateForm,
        validateSingleField,
        clearErrors,
        clearFieldError,
        getFieldError: getFieldErrorMessage,
        hasFieldError: hasFieldErrorFlag,
        setErrors,
    };

    return [validationState, actions];
}

// Real-time validation hook for individual fields
export function useFieldValidation(
    fieldName: string,
    isCourseSetting = false
) {
    const [error, setError] = useState<string | null>(null);

    const validate = useCallback((value: unknown) => {
        const rules = isCourseSetting 
            ? courseSettingValidationRules[fieldName as keyof CourseSetting]
            : courseValidationRules[fieldName as keyof Course];

        if (!rules) {
            setError(null);
            return null;
        }

        const validationError = validateField(fieldName, value, rules);
        const errorMessage = validationError ? validationError.message : null;
        
        setError(errorMessage);
        return errorMessage;
    }, [fieldName, isCourseSetting]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        error,
        validate,
        clearError,
        hasError: !!error,
    };
}
