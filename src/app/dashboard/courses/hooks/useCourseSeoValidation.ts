// Create: src/app/dashboard/courses/hooks/useCourseSeoValidation.ts

import { useState, useCallback } from 'react';
import { Course } from "@/types/course";
import { courseSEOValidationRules, validateField } from '../utils/validation';

export interface CourseSeoValidationState {
    errors: { [key: string]: string | null };
    isValidating: boolean;
    isValid: boolean;
}

export interface CourseSeoValidationActions {
    validateSeoField: (fieldName: string, value: unknown) => string | null;
    validateAllSeo: (seoData: Partial<Course>) => boolean;
    clearSeoErrors: () => void;
    clearFieldError: (fieldName: string) => void;
    getFieldError: (fieldName: string) => string | null;
    hasFieldError: (fieldName: string) => boolean;
}

export function useCourseSeoValidation(): [CourseSeoValidationState, CourseSeoValidationActions] {
    const [seoErrors, setSeoErrors] = useState<{ [key: string]: string | null }>({});
    const [isValidating, setIsValidating] = useState(false);

    const validateSeoField = useCallback((
        fieldName: string, 
        value: unknown
    ): string | null => {
        const rules = courseSEOValidationRules[fieldName];
        if (!rules) return null;

        const error = validateField(fieldName, value, rules);
        const errorMessage = error?.message || null;
        
        setSeoErrors(prev => ({
            ...prev,
            [fieldName]: errorMessage
        }));

        return errorMessage;
    }, []);

    const validateAllSeo = useCallback((seoData: Partial<Course>): boolean => {
        setIsValidating(true);
        const newErrors: { [key: string]: string | null } = {};

        // Define SEO fields to validate using courseSEOValidationRules
        const seoFields = Object.keys(courseSEOValidationRules);

        // Validate each SEO field
        seoFields.forEach(field => {
            const value = seoData[field as keyof Course];
            const rules = courseSEOValidationRules[field];
            if (rules) {
                const error = validateField(field, value, rules);
                if (error) {
                    newErrors[field] = error.message;
                }
            }
        });

        setSeoErrors(newErrors);
        setIsValidating(false);
        
        return Object.keys(newErrors).length === 0;
    }, []);

    const clearSeoErrors = useCallback(() => {
        setSeoErrors({});
    }, []);

    const clearFieldError = useCallback((fieldName: string) => {
        setSeoErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    const getFieldError = useCallback((fieldName: string): string | null => {
        return seoErrors[fieldName] || null;
    }, [seoErrors]);

    const hasFieldError = useCallback((fieldName: string): boolean => {
        return !!seoErrors[fieldName];
    }, [seoErrors]);

    const state: CourseSeoValidationState = {
        errors: seoErrors,
        isValidating,
        isValid: Object.keys(seoErrors).length === 0
    };

    const actions: CourseSeoValidationActions = {
        validateSeoField,
        validateAllSeo,
        clearSeoErrors,
        clearFieldError,
        getFieldError,
        hasFieldError
    };

    return [state, actions];
}