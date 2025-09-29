"use client";

import Select2 from "@/components/ui/Select2";
import { Course } from "@/types/course";
import { CourseSettingsData, CourseSettingsActions } from "../../hooks/useCourseSettingsData";
import { ValidatedInput, ValidatedTextarea } from "../ValidatedFormComponents";
import { Input } from "@/components/ui/input";

interface CourseInformationProps {
    courseData?: Course | null;
    courseSettings?: Partial<CourseSettingsData>;
    formData: Partial<Course>;
    data: CourseSettingsData;
    actions: CourseSettingsActions;
    onInputChange: (field: keyof Course, value: string | number | boolean | string[]) => void;
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
        eligibilities,
        courses,
        courseSettings,
        selectedCategory,
        selectedCourseType,
        selectedEligibilities,
        keywords
    } = data;
    
    const {
        setSelectedCategory,
        setSelectedCourseType,
        setSelectedEligibilities,
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
                        label="Course Card Title"
                        placeholder="Course Title"
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
                    <label className="text-lg font-medium m-2">Child Course</label>
                    <Select2
                        options={[
                            { label: 'Select Child Course', value: '' },
                            ...courses
                                .filter(c => !courseData || c.uuid !== courseData.uuid)
                                .map(c => ({
                                    label: c.course_name || c.title || `Course #${c.id}`,
                                    value: c.uuid || String(c.id)
                                }))
                        ]}
                        value={
                            // First try to get from formData.child_course, then fall back to courseSettings.children_course
                            (() => {
                                const selectedChild = typeof formData.child_course === 'string' ? formData.child_course :
                                    (courseSettings && typeof courseSettings.children_course === 'string' ? courseSettings.children_course : '');
                                return selectedChild;
                            })()
                        }
                        onChange={(val: string | string[]) => {
                            if (typeof val === 'string') {
                                onInputChange('child_course', val);
                            }
                        }}
                        placeholder="Select Child Course"
                        style={{ padding: '0.6rem' }}
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
                    <label className="text-lg font-medium m-2">Course Eligibility</label>
                    <Select2
                        options={eligibilities.length > 0 ?
                            eligibilities.map(eligibility => ({
                                label: eligibility.name,
                                value: eligibility.uuid.toString()
                            }))
                            : []
                        }
                        value={selectedEligibilities}
                        onChange={(val: string | string[]) => {
                            if (Array.isArray(val)) {
                                setSelectedEligibilities(val);
                                onInputChange('eligibility_ids', val);
                            }
                        }}
                        multiple={true}
                        placeholder="Select Eligibilities"
                        style={{ padding: '0.6rem' }}
                    />
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
                <div>
                    <label className="text-lg font-medium m-2">Specialty Type</label>
                    <Select2
                        options={[
                            { label: 'Select Specialty Type', value: '' },
                            { label: 'Doctors', value: 'doctors' },
                            { label: 'Nurses', value: 'nurses' },
                            { label: 'Others', value: 'others' },
                        ]}
                        value={typeof formData.speciality_type === 'string' ? formData.speciality_type : (courseSettings?.speciality_type || '')}
                        onChange={(val: string | string[]) => {
                            if (typeof val === 'string') {
                                onInputChange('speciality_type', val);
                                validationActions.validateSingleField('speciality_type', val); // true indicates it's a CourseSetting field
                            }
                        }}
                        placeholder="Select Specialty Type"
                        style={{ padding: '0.6rem' }}
                    />
                    {validationActions.getFieldError('speciality_type') && (
                        <p className="text-sm text-red-600 mt-1 px-3" role="alert">
                            {validationActions.getFieldError('speciality_type')}
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-4">
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

            <div className="mb-4">
                <ValidatedTextarea
                    name="summary"
                    label="Course Summary"
                    placeholder="Course summary"
                    value={typeof formData.summary === "string" ? formData.summary : (courseSettings?.summary || "")}
                    error={validationActions.getFieldError('summary')}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const value = e.target.value;
                        onInputChange('summary', value);
                        validationActions.validateSingleField('summary', value);
                    }}
                    rows={3}
                />
            </div>
        </div>
    );
}