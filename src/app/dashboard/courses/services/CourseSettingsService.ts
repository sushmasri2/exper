import { CourseFormData } from '../hooks/useCourseData';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: Record<string, string> | null;
}

export class CourseSettingsService {
  static async validateCourseData(data: CourseFormData): Promise<{ isValid: boolean; errors: Record<string, string> }> {
    const errors: Record<string, string> = {};

    // Same validation for both draft and publish
    if (!data.course_name?.trim()) {
      errors.course_name = 'Course name is required';
    }
    if (!data.category_id) {
      errors.category_id = 'Course category is required';
    }
    if (!data.course_type_id) {
      errors.course_type_id = 'Course type is required';
    }
    if (!data.description?.trim()) {
      errors.description = 'Course description is required';
    }

    // Additional validation rules
    if (data.course_name && data.course_name.length > 255) {
      errors.course_name = 'Course name must be less than 255 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static async saveCourse(courseData: CourseFormData, isDraft: boolean = false): Promise<ApiResponse> {
    try {
      // Validate data first
      const validation = await this.validateCourseData(courseData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Validation failed',
          data: validation.errors
        };
      }

      // Prepare data with status field
      const preparedData = this.prepareCourseDataForSave(courseData, isDraft);

      // Here you would make the actual API call to save the course
      // For now, this is a placeholder
      console.log('Saving course data:', preparedData);
      console.log('Is draft:', isDraft, 'Status:', preparedData.status);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: isDraft ? 'Course saved as draft successfully' : 'Course published successfully'
      };
    } catch (error) {
      console.error('Error saving course:', error);
      return {
        success: false,
        message: 'Failed to save course. Please try again.'
      };
    }
  }

  static async updateCourse(courseUuid: string, courseData: CourseFormData, isDraft: boolean = false): Promise<ApiResponse> {
    try {
      // Validate data first
      const validation = await this.validateCourseData(courseData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Validation failed',
          data: validation.errors
        };
      }

      // Prepare data with status field
      const preparedData = this.prepareCourseDataForSave(courseData, isDraft);

      // Here you would make the actual API call to update the course
      console.log('Updating course:', courseUuid, preparedData);
      console.log('Is draft:', isDraft, 'Status:', preparedData.status);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: isDraft ? 'Course updated as draft successfully' : 'Course published successfully'
      };
    } catch (error) {
      console.error('Error updating course:', error);
      return {
        success: false,
        message: 'Failed to update course. Please try again.'
      };
    }
  }

  static prepareCourseDataForSave(formData: CourseFormData, isDraft: boolean = false): CourseFormData {
    // Transform the form data into the format expected by the API
    const transformedData = { ...formData };

    // Set status based on whether it's draft or published
    // status = 0 for draft, status = 1 for published
    transformedData.status = isDraft ? 0 : 1;

    // Convert string values to appropriate types
    if (transformedData.category_id && typeof transformedData.category_id === 'string') {
      transformedData.category_id = parseInt(transformedData.category_id, 10);
    }
    if (transformedData.course_type_id && typeof transformedData.course_type_id === 'string') {
      transformedData.course_type_id = parseInt(transformedData.course_type_id, 10);
    }

    return transformedData;
  }
}