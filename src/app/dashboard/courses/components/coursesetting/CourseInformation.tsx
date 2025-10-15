"use client";

import Select2 from "@/components/ui/Select2";
import { Course } from "@/types/course";
import { CourseSettingsPartialFormData } from "@/types/course-settings-form";
import { CourseSettingsData, CourseSettingsActions } from "../../hooks/useCourseSettingsData";
import { ValidatedInput, ValidatedTextarea } from "../ValidatedFormComponents";
import { Input } from "@/components/ui/input";

interface CourseInformationProps {
    courseData?: Course | null;
    courseSettings?: Partial<CourseSettingsData>;
    formData: CourseSettingsPartialFormData;
    data: CourseSettingsData;
    actions: CourseSettingsActions;
    onInputChange: (field: keyof CourseSettingsPartialFormData, value: string | number | boolean | string[]) => void;
}
export default function CourseInformation({
    courseData,
    formData,
    data,
    actions,
    onInputChange
}: CourseInformationProps) {
    const {
        categories,
        courseTypes,
        selectedCategory,
        selectedCourseType,
        keywords
    } = data;

    const {
        setSelectedCategory,
        setSelectedCourseType,
        setKeywords,
        validation: validationActions
    } = actions;

    return (
        <div className="px-5 py-3">
            {/* Course Title */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <ValidatedInput
                        type="text"
                        name="course_name"
                        label="Course Name"
                        placeholder="Course Name"
                        value={typeof formData.course_name === "string" ? formData.course_name : (courseData?.course_name || "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('course_name', value);
                            validationActions.validateSingleField('course_name', value);
                        }}
                        error={validationActions.getFieldError('course_name')}
                        required
                    />
                </div>
                <div>
                    <ValidatedInput
                        type="text"
                        name="course_card_title"
                        label="Course Card Title"
                        placeholder="Course Card Title"
                        value={typeof formData.course_card_title === "string" ? formData.course_card_title : (courseData?.course_card_title || "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('course_card_title', value);
                            validationActions.validateSingleField('course_card_title', value);
                        }}
                        error={validationActions.getFieldError('course_card_title')}
                        required
                    />
                </div>
                <div>
                    <ValidatedInput
                        type="text"
                        name="title"
                        label="Title"
                        placeholder="Title"
                        value={typeof formData.title === "string" ? formData.title : (courseData?.title || "")}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            onInputChange('title', value);
                            validationActions.validateSingleField('title', value);
                        }}
                        error={validationActions.getFieldError('title')}
                        required
                    />
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Course Type</label>
                    <Select2
                        options={courseTypes.length > 0 ? [{ label: 'Select Course Type', value: '' }, ...courseTypes.map(type => ({ label: type.name, value: type.id.toString() }))] : [{ label: 'Select Course Type', value: '' }]}
                        value={selectedCourseType === '' ? '' : courseTypes.find(ct => ct.name === selectedCourseType)?.id.toString() || ''}
                        onChange={(val: string | string[]) => {
                            if (typeof val === 'string') {
                                setSelectedCourseType(courseTypes.find(ct => ct.id.toString() === val)?.name || '');
                                onInputChange('course_type_id', val);
                                validationActions.validateSingleField('course_type_id', val);
                            }
                        }}
                        placeholder="Select Course Type"
                        style={{ padding: '0.6rem' }}
                    />
                    {validationActions.getFieldError('course_type_id') && (
                        <p className="text-sm text-red-600 mt-1 px-3" role="alert">
                            {validationActions.getFieldError('course_type_id')}
                        </p>
                    )}
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Course Category</label>
                    <Select2
                        options={categories.length > 0 ? [{ label: 'Select Category', value: '' }, ...categories.map(cat => ({ label: cat.name, value: cat.id.toString() }))] : [{ label: 'Select Category', value: '' }]}
                        value={selectedCategory === '' ? '' : categories.find(cat => cat.name === selectedCategory)?.id.toString() || ''}
                        onChange={(val: string | string[]) => {
                            if (typeof val === 'string') {
                                setSelectedCategory(categories.find(cat => cat.id.toString() === val)?.name || '');
                                onInputChange('category_id', val);
                                validationActions.validateSingleField('category_id', val);
                            }
                        }}
                        placeholder="Select Category"
                        style={{ padding: '0.6rem' }}
                    />
                    {validationActions.getFieldError('category_id') && (
                        <p className="text-sm text-red-600 mt-1 px-3" role="alert">
                            {validationActions.getFieldError('category_id')}
                        </p>
                    )}
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Keywords</label>
                    <Input
                        type="text"
                        placeholder="Keywords (comma separated)"
                        value={keywords}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const value = e.target.value;
                            setKeywords(value);
                            // Keywords are stored separately, not validated as a single field
                        }}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <ValidatedTextarea
                        name="one_line_description"
                        label="One Line Description"
                        placeholder="One line description of the course"
                        value={typeof formData.one_line_description === "string" ? formData.one_line_description : (courseData?.one_line_description || "")}
                        error={validationActions.getFieldError('one_line_description')}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const value = e.target.value;
                            onInputChange('one_line_description', value);
                            validationActions.validateSingleField('one_line_description', value);
                        }}
                        rows={2}
                    />
                </div>
                <div>
                    <ValidatedTextarea
                        name="short_description"
                        label="Short Description"
                        placeholder="short description"
                        value={typeof formData.short_description === "string" ? formData.short_description : (courseData?.short_description || "")}
                        error={validationActions.getFieldError('short_description')}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const value = e.target.value;
                            onInputChange('short_description', value);
                            validationActions.validateSingleField('short_description', value);
                        }}
                        rows={2}
                    />
                </div>
            </div>
            <div className="mb-4">
                <ValidatedTextarea
                    name="description"
                    label="Description"
                    placeholder="Course description"
                    value={typeof formData.description === "string" ? formData.description : (courseData?.description || "")}
                    error={validationActions.getFieldError('description')}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const value = e.target.value;
                        onInputChange('description', value);
                        validationActions.validateSingleField('description', value);
                    }}
                    rows={4}
                />
            </div>
        </div>
    );
}