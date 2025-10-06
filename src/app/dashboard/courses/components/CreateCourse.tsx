import React, { useState } from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CourseCategory } from "@/types/coursecategory";
import { CourseType } from "@/types/coursetype";
import Select2 from "@/components/ui/Select2";

interface CreateCourseProps {
    courseCategoryList: CourseCategory[];
    courseTypeList: CourseType[];
    isOpen: boolean;
    onClose: () => void;
}

export const CreateCourse: React.FC<CreateCourseProps> = ({
    courseCategoryList,
    courseTypeList,
    isOpen,
    onClose
}) => {
    const [modalCategory, setModalCategory] = useState('');
    const [modalCourseType, setModalCourseType] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [modalDescription, setModalDescription] = useState('');

    // Debug: Log the data to see if it's valid
    React.useEffect(() => {
        console.log('CreateCourse Props:', {
            courseCategoryList,
            courseTypeList,
            isOpen
        });
        
        // Log the actual data structure to verify
        console.log('Sample category item:', courseCategoryList[0]);
        console.log('Sample course type item:', courseTypeList[0]);
    }, [courseCategoryList, courseTypeList, isOpen]);

    return (
        <Modal
            open={isOpen}
            onClose={() => {
                onClose();
                // Reset form fields when closing
                setModalCategory('');
                setModalCourseType('');
                setModalTitle('');
                setModalDescription('');
            }}
            title="Create New Course"
            footer={
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"   
                        onClick={() => {
                            onClose();
                            // Reset form fields when canceling
                            setModalCategory('');
                            setModalCourseType('');
                            setModalTitle('');
                            setModalDescription('');
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primaryBtn"
                        onClick={() => {
                            console.log("Course Created", {
                                category: modalCategory,
                                courseType: modalCourseType,
                                title: modalTitle,
                                description: modalDescription
                            });
                            onClose();
                            // Reset form fields after creation
                            setModalCategory('');
                            setModalCourseType('');
                            setModalTitle('');
                            setModalDescription('');
                        }}
                    >
                        Create Course
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Type</label>
                    <Select2
                        className="w-full"
                        value={modalCategory}
                        options={[
                            { value: '', label: 'Select Category' },
                            ...courseCategoryList.map(cat => ({
                                value: String(cat.id),
                                label: cat.name
                            }))
                        ]}
                        onChange={(value: string | string[]) => {
                            console.log('Category onChange triggered with:', value);
                            const selectedValue = typeof value === 'string' ? value : '';
                            setModalCategory(selectedValue);
                            console.log('Category state updated to:', selectedValue);
                            
                            // Find and log the selected category object
                            const selectedCat = courseCategoryList.find(cat => String(cat.id) === selectedValue);
                            console.log('Selected category object:', selectedCat);
                        }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
                    <Select2
                        className="w-full"
                        value={modalCourseType}
                        options={[
                            { value: '', label: 'Select Course Type' },
                            ...courseTypeList.map(type => ({
                                value: String(type.id),
                                label: type.name
                            }))
                        ]}
                        onChange={(value: string | string[]) => {
                            console.log('Course type onChange triggered with:', value);
                            const selectedValue = typeof value === 'string' ? value : '';
                            setModalCourseType(selectedValue);
                            console.log('Course type state updated to:', selectedValue);
                            
                            // Find and log the selected course type object
                            const selectedType = courseTypeList.find(type => String(type.id) === selectedValue);
                            console.log('Selected course type object:', selectedType);
                        }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                    <Input
                        name="courseTitle"
                        placeholder="Enter Course Title"
                        value={modalTitle}
                        onChange={(e) => setModalTitle(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">One Line Description</label>
                    <Textarea
                        name="courseDescription"
                        placeholder="Enter a one line description"
                        value={modalDescription}
                        onChange={(e) => setModalDescription(e.target.value)}
                        className="w-full resize-none"
                        rows={3}
                    />
                </div>
            </div>
        </Modal>
    );
};