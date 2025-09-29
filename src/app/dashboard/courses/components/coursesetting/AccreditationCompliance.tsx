"use client";

import Select2 from "@/components/ui/Select2";
import { Course } from "@/types/course";
import { CourseSettingsData, CourseSettingsActions } from "../../hooks/useCourseSettingsData";
import { ValidatedTextarea } from "../ValidatedFormComponents";

interface AccreditationComplianceProps {
    courseData?: Course | null;
    formData: Partial<Course>;
    data: CourseSettingsData;
    actions: CourseSettingsActions;
    onInputChange: (field: keyof Course, value: string | number | boolean | string[]) => void;
}

export default function AccreditationCompliance({
    data,
    actions,
    onInputChange,
    formData
}: AccreditationComplianceProps) {
    const {
        courseSettings,
        accreditationOptions,
        selectedAccreditationPartners
    } = data;

    const {
        setSelectedAccreditationPartners,
        validation: validationActions
    } = actions;

    return (
        <div className="px-5 py-3">
            <div>
                <ValidatedTextarea
                    label="Accreditation"
                    className="mb-4 px-3 py-2"
                    value={typeof formData?.accreditation === "string" ? formData.accreditation : (courseSettings?.accreditation || "") }
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        const value = e.target.value;
                        onInputChange('accreditation', value);
                        validationActions.validateSingleField('accreditation', value);
                    }}
                    error={validationActions.getFieldError('accreditation')}
                    placeholder="Enter Accreditation"
                    rows={3}
                />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-lg font-medium m-2">Accreditation Partners</label>
                    <Select2
                        options={accreditationOptions}
                        multiple={true}
                        value={selectedAccreditationPartners}
                        onChange={(val: string | string[]) => {
                            if (Array.isArray(val)) {
                                setSelectedAccreditationPartners(val);
                                onInputChange('accreditation_partners', val);
                            }
                        }}
                        placeholder="Select Accreditation Partners"
                        style={{ padding: '0.6rem' }}
                    />
                </div>
                <div>
                    <label className="text-lg font-medium m-2">Accreditation Partners List</label>
                    <Select2
                        options={[
                            { label: 'Select Accreditation Partners', value: '' },
                            { label: 'BAC', value: 'bac' },
                            { label: 'GAPIO', value: 'gapio' },
                        ]}
                        multiple={true}
                        value={['bac']}
                        onChange={(val: string | string[]) => {
                            console.log('Accreditation Partners selection changed:', val);
                            if (Array.isArray(val)) {
                                onInputChange('accreditation_partners', val);
                            }
                        }}
                        placeholder="Select Accreditation Partners List"
                        style={{ padding: '0.6rem' }}
                    />
                </div>
            </div>
        </div>
    );
}