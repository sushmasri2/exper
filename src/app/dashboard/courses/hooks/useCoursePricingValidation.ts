// Create: src/app/dashboard/courses/hooks/useCoursePricingValidation.ts

import { useState, useCallback } from 'react';
import { CoursePricing } from "@/types/course-pricing";
import { useFormValidation } from './useFormValidation';

export interface CoursePricingValidationState {
    errors: { [key: string]: string | null };
    isValidating: boolean;
    isValid: boolean;
}

export interface CoursePricingValidationActions {
    validatePricingField: (currency: string, fieldName: string, value: unknown) => string | null;
    validateAllPricing: (pricingData: { INR: Partial<CoursePricing>; USD: Partial<CoursePricing> }) => boolean;
    clearPricingErrors: () => void;
    clearFieldError: (currency: string, fieldName: string) => void;
    getFieldError: (currency: string, fieldName: string) => string | null;
    hasFieldError: (currency: string, fieldName: string) => boolean;
}

export function useCoursePricingValidation(): [CoursePricingValidationState, CoursePricingValidationActions] {
    const [, validationActions] = useFormValidation();
    const [pricingErrors, setPricingErrors] = useState<{ [key: string]: string | null }>({});
    const [isValidating, setIsValidating] = useState(false);

    const validatePricingField = useCallback((
        currency: string, 
        fieldName: string, 
        value: unknown
    ): string | null => {
        const fieldKey = `${fieldName}_${currency}`;
        const error = validationActions.validateSingleField(fieldName, value);
        
        setPricingErrors(prev => ({
            ...prev,
            [fieldKey]: error?.message || null
        }));

        return error?.message || null;
    }, [validationActions]);

    const validateAllPricing = useCallback((pricingData: { 
        INR: Partial<CoursePricing>; 
        USD: Partial<CoursePricing> 
    }): boolean => {
        setIsValidating(true);
        const newErrors: { [key: string]: string | null } = {};

        // Validate INR pricing
        Object.entries(pricingData.INR).forEach(([field, value]) => {
            const error = validationActions.validateSingleField(field, value);
            if (error) {
                newErrors[`${field}_INR`] = error.message;
            }
        });

        // Validate USD pricing
        Object.entries(pricingData.USD).forEach(([field, value]) => {
            const error = validationActions.validateSingleField(field, value);
            if (error) {
                newErrors[`${field}_USD`] = error.message;
            }
        });

        setPricingErrors(newErrors);
        setIsValidating(false);
        
        return Object.keys(newErrors).length === 0;
    }, [validationActions]);

    const clearPricingErrors = useCallback(() => {
        setPricingErrors({});
    }, []);

    const clearFieldError = useCallback((currency: string, fieldName: string) => {
        const fieldKey = `${fieldName}_${currency}`;
        setPricingErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldKey];
            return newErrors;
        });
    }, []);

    const getFieldError = useCallback((currency: string, fieldName: string): string | null => {
        const fieldKey = `${fieldName}_${currency}`;
        return pricingErrors[fieldKey] || null;
    }, [pricingErrors]);

    const hasFieldError = useCallback((currency: string, fieldName: string): boolean => {
        const fieldKey = `${fieldName}_${currency}`;
        return !!pricingErrors[fieldKey];
    }, [pricingErrors]);

    const state: CoursePricingValidationState = {
        errors: pricingErrors,
        isValidating,
        isValid: Object.keys(pricingErrors).length === 0
    };

    const actions: CoursePricingValidationActions = {
        validatePricingField,
        validateAllPricing,
        clearPricingErrors,
        clearFieldError,
        getFieldError,
        hasFieldError
    };

    return [state, actions];
}