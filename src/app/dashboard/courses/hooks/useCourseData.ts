import { useState, useCallback } from 'react';
import { Course } from '@/types/course';

export interface CourseFormData extends Partial<Course> {
  // Additional fields that might not be in the base Course type
  [key: string]: string | number | boolean | string[] | null | undefined;
}

export const useCourseData = (initialData?: Course | null) => {
  const [formData, setFormData] = useState<CourseFormData>({
    ...(initialData as CourseFormData),
  });

  const updateField = useCallback((
    field: keyof Course | string,
    value: string | number | boolean | string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateMultipleFields = useCallback((fields: Partial<CourseFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  }, []);

  const resetForm = useCallback((newData?: Course | null) => {
    setFormData({ ...(newData as CourseFormData) });
  }, []);

  const getFieldValue = useCallback((field: keyof Course | string, fallback: string | number | boolean | string[] | null = '') => {
    return formData[field] ?? fallback;
  }, [formData]);

  return {
    formData,
    updateField,
    updateMultipleFields,
    resetForm,
    getFieldValue,
  };
};