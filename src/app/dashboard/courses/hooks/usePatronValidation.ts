import { useState, useCallback } from 'react';
import { CoursePatron } from "@/types/coursepatrons";
import { coursePatronValidationRules, validateField } from '../utils/validation';

export interface PatronValidationState {
    errors: { [key: string]: string | null };
    isValidating: boolean;
    isValid: boolean;
}

export interface PatronValidationActions {
    validatePatronField: (fieldName: string, value: unknown) => string | null;
    validateAllPatron: (patronData: Partial<CoursePatron>) => boolean;
    clearPatronErrors: () => void;
    clearFieldError: (fieldName: string) => void;
    getFieldError: (fieldName: string) => string | null;
    hasFieldError: (fieldName: string) => boolean;
}

export function usePatronValidation(): [PatronValidationState, PatronValidationActions] {
    const [patronErrors, setPatronErrors] = useState<{ [key: string]: string | null }>({});
    const [isValidating, setIsValidating] = useState(false);

    const validatePatronField = useCallback((
        fieldName: string, 
        value: unknown
    ): string | null => {
        const rules = coursePatronValidationRules[fieldName];
        if (!rules) return null;

        const error = validateField(fieldName, value, rules);
        const errorMessage = error?.message || null;
        
        setPatronErrors(prev => ({
            ...prev,
            [fieldName]: errorMessage
        }));

        return errorMessage;
    }, []);

    const validateAllPatron = useCallback((patronData: Partial<CoursePatron>): boolean => {
        setIsValidating(true);
        const newErrors: { [key: string]: string | null } = {};

        // Define patron fields to validate using coursePatronValidationRules
        const patronFields = Object.keys(coursePatronValidationRules);

        // Validate each patron field
        patronFields.forEach(field => {
            const value = patronData[field as keyof CoursePatron];
            const rules = coursePatronValidationRules[field];
            if (rules) {
                const error = validateField(field, value, rules);
                if (error) {
                    newErrors[field] = error.message;
                }
            }
        });

        setPatronErrors(newErrors);
        setIsValidating(false);
        
        return Object.keys(newErrors).length === 0;
    }, []);

    const clearPatronErrors = useCallback(() => {
        setPatronErrors({});
    }, []);

    const clearFieldError = useCallback((fieldName: string) => {
        setPatronErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    const getFieldError = useCallback((fieldName: string): string | null => {
        return patronErrors[fieldName] || null;
    }, [patronErrors]);

    const hasFieldError = useCallback((fieldName: string): boolean => {
        return !!patronErrors[fieldName];
    }, [patronErrors]);

    const state: PatronValidationState = {
        errors: patronErrors,
        isValidating,
        isValid: Object.keys(patronErrors).length === 0
    };

    const actions: PatronValidationActions = {
        validatePatronField,
        validateAllPatron,
        clearPatronErrors,
        clearFieldError,
        getFieldError,
        hasFieldError
    };

    return [state, actions];
}