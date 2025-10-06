"use client";

import { Course } from "@/types/course";
import { CourseSettingsPartialFormData } from "@/types/course-settings-form";
import { CourseSettingsData, CourseSettingsActions } from "../../hooks/useCourseSettingsData";
import { ValidatedInput } from "../ValidatedFormComponents";

interface VisualAssetsProps {
    courseData?: Course | null;
    formData: CourseSettingsPartialFormData;
    data: CourseSettingsData;
    actions: CourseSettingsActions;
    onInputChange: (field: keyof CourseSettingsPartialFormData, value: string | number | boolean | string[]) => void;
}

export default function VisualAssets({
    data,
    actions,
    formData,
    onInputChange
}: VisualAssetsProps) {
    const { courseSettings } = data;
    const { validation: validationActions } = actions;

    return (
        <div className="px-5 py-3">
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-lg font-medium m-2">Banner of the Course</label>
                    <ValidatedInput
                        type="text"
                        name="banner"
                        className="mb-4 px-3 py-0"
                        value={typeof formData.banner === "string" ? formData.banner : (courseSettings?.banner || "")}
                        onChange={(e) => {
                            const value = e.target.value;
                            onInputChange('banner', value);
                            validationActions.validateSingleField('banner', value);
                        }}
                        error={validationActions.getFieldError('banner')}
                    />
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Web Thumbnail</label>
                    <ValidatedInput
                        type="text"
                        name="thumbnail_web"
                        className="mb-4 px-3 py-0"
                        placeholder="Enter Web Thumbnail URL"
                        value={typeof formData.thumbnail_web === "string" ? formData.thumbnail_web : (courseSettings?.thumbnail_web || "")}
                        onChange={(e) => {
                            const value = e.target.value;
                            onInputChange('thumbnail_web', value);
                            validationActions.validateSingleField('thumbnail_web', value);
                        }}
                        error={validationActions.getFieldError('thumbnail_web')}
                    />
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Mobile Thumbnail</label>
                    <ValidatedInput
                        type="text"
                        name="thumbnail_mobile"
                        className="mb-4 px-3 py-0"
                        placeholder="Enter Mobile Thumbnail URL"
                        value={typeof formData.thumbnail_mobile === "string" ? formData.thumbnail_mobile : (courseSettings?.thumbnail_mobile || "")}
                        onChange={(e) => {
                            const value = e.target.value;
                            onInputChange('thumbnail_mobile', value);
                            validationActions.validateSingleField('thumbnail_mobile', value);
                        }}
                        error={validationActions.getFieldError('thumbnail_mobile')}
                    />
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Course Banner URL Web</label>
                    <ValidatedInput
                        type="text"
                        name="course_demo_url"
                        className="mb-4 px-3 py-0"
                        placeholder="Enter Course Banner URL Web"
                        value={typeof formData.course_demo_url === "string" ? formData.course_demo_url : (courseSettings?.course_demo_url || "")}
                        onChange={(e) => {
                            const value = e.target.value;
                            onInputChange('course_demo_url', value);
                            validationActions.validateSingleField('course_demo_url', value);
                        }}
                        error={validationActions.getFieldError('course_demo_url')}
                        required
                    />
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Course Banner URL Mobile</label>
                    <ValidatedInput
                        type="text"
                        name="course_demo_mobile_url"
                        className="mb-4 px-3 py-0"
                        placeholder="Enter Course Banner URL Mobile"
                        value={typeof formData.course_demo_mobile_url === "string" ? formData.course_demo_mobile_url : (courseSettings?.course_demo_mobile_url || "")}
                        onChange={(e) => {
                            const value = e.target.value;
                            onInputChange('course_demo_mobile_url', value);
                            validationActions.validateSingleField('course_demo_mobile_url', value);
                        }}
                        error={validationActions.getFieldError('course_demo_mobile_url')}
                        required
                    />
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Banner Alt Tag</label>
                    <ValidatedInput
                        type="text"
                        name="banner_alt_tag"
                        className="mb-4 px-3 py-0"
                        placeholder="Enter Banner Alt Tag"
                        value={typeof formData.banner_alt_tag === "string" ? formData.banner_alt_tag : (courseSettings?.banner_alt_tag || "")}
                        onChange={(e) => {
                            const value = e.target.value;
                            onInputChange('banner_alt_tag', value);
                            validationActions.validateSingleField('banner_alt_tag', value);
                        }}
                        error={validationActions.getFieldError('banner_alt_tag')}
                        required
                    />
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Brochure</label>
                    <ValidatedInput
                        type="text"
                        name="brochure"
                        className="mb-4 px-3 py-0"
                        value={typeof formData.brochure === "string" ? formData.brochure : (courseSettings?.brochure || "")}
                        placeholder="Enter Brochure URL"
                        onChange={(e) => {
                            const value = e.currentTarget.value;
                            onInputChange('brochure', value);
                            validationActions.validateSingleField('brochure', value);
                        }}
                        error={validationActions.getFieldError('brochure')}
                        required
                    />
                </div>
            </div>
        </div>
    );
}