"use client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Course } from "@/types/course";
import { useState, useEffect } from "react";
import { getCourseFAQs, createFAQ, updateFAQCourse, deleteFAQ } from "@/lib/faqs-api";
import { FAQs } from "@/types/faqs";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Select2 from "@/components/ui/Select2";

interface CourseFAQsProps {
    courseData?: Course | null;
}

// Reusable FAQ Form Component
interface FAQFormProps {
    question: string;
    answer: string;
    status: string;
    position: number;
    errors: { question?: string; answer?: string };
    onQuestionChange: (value: string) => void;
    onAnswerChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onPositionChange: (value: number) => void;
    onSave: () => void;
    onCancel: () => void;
    saveButtonText?: string;
    title?: string;
}

function FAQForm({
    question,
    answer,
    status,
    position,
    errors,
    onQuestionChange,
    onAnswerChange,
    onStatusChange,
    onPositionChange,
    onSave,
    onCancel,
    saveButtonText = "Save FAQ",
    title
}: FAQFormProps) {
    return (
        <div className="border p-4 rounded-lg mb-4">
            {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
            <label className="text-sm font-semibold block mb-2">Question</label>
            <Input
                value={question}
                onChange={(e) => onQuestionChange(e.target.value)}
                placeholder="Enter your question here"
                className={`mb-1 ${errors.question ? 'border-red-500' : ''}`}
            />
            {errors.question && (
                <div className="text-red-500 text-xs mb-2">{errors.question}</div>
            )}

            <label className="text-sm font-semibold block mb-2 mt-3">Answer</label>
            <Textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Enter your answer here"
                rows={4}
                className={`mb-1 ${errors.answer ? 'border-red-500' : ''}`}
            />
            {errors.answer && (
                <div className="text-red-500 text-xs mb-2">{errors.answer}</div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-3 mt-3">
                <div>
                    <label className="text-sm font-semibold block mb-2">Status</label>
                    <Select2
                        value={status}
                        onChange={(value) => onStatusChange(typeof value === 'string' ? value : value[0])}
                        options={[
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                        ]}
                    />
                </div>
                <div>
                    <label className="text-sm font-semibold block mb-2">Position</label>
                    <Input
                        type="number"
                        value={position}
                        onChange={(e) => onPositionChange(parseInt(e.target.value, 10) || 1)}
                        className="w-full"
                        min="1"
                    />
                </div>
            </div>

            <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primaryBtn" onClick={onSave}>
                    {saveButtonText}
                </Button>
            </div>
        </div>
    );
}

export default function CourseFAQs({ courseData }: CourseFAQsProps) {
    const [faqs, setFAQs] = useState<FAQs[]>([]);
    const [faqOpenItems, setFaqOpenItems] = useState<string[]>([]);

    // Form mode: 'none', 'add', or 'edit'
    const [formMode, setFormMode] = useState<'none' | 'add' | 'edit'>('none');
    const [formErrors, setFormErrors] = useState<{ question?: string; answer?: string }>({});

    // Form state (shared between add and edit)
    const [formQuestion, setFormQuestion] = useState("");
    const [formAnswer, setFormAnswer] = useState("");
    const [formStatus, setFormStatus] = useState("active");
    const [formPosition, setFormPosition] = useState(1);
    const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

    // Delete FAQ state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null);

    useEffect(() => {
        const fetchFAQs = async () => {
            if (courseData?.uuid) {
                const faqsResponse = await getCourseFAQs(courseData.uuid);
                console.log('Fetched FAQs:', faqsResponse.data);
                setFAQs(faqsResponse.data);
            }
        };

        fetchFAQs();
    }, [courseData?.uuid]);

    // Reset form
    const resetForm = () => {
        setFormQuestion("");
        setFormAnswer("");
        setFormStatus("active");
        setFormPosition(1);
        setFormErrors({});
        setFormMode('none');
        setEditingFaqId(null);
    };

    // Add FAQ functions
    const handleAddClick = () => {
        resetForm();
        setFormMode('add');
        setFormPosition(faqs.length + 1);
    };

    const handleSaveNewFAQ = async () => {
        const errors: { question?: string; answer?: string } = {};
        if (!formQuestion.trim()) {
            errors.question = "Please enter a question.";
        }
        if (!formAnswer.trim()) {
            errors.answer = "Please enter an answer.";
        }
        if (errors.question || errors.answer) {
            setFormErrors(errors);
            return;
        }

        const faqData = {
            course_id: courseData?.uuid || "",
            question: formQuestion,
            answers: formAnswer,
            position: formPosition,
            status: formStatus === "active" ? 1 : 0
        };
        console.log("Creating FAQ with data:", faqData);

        try {
            const response = await createFAQ(faqData);

            setFAQs([...faqs, Array.isArray(response.data) ? response.data[0] : response.data]);
            resetForm();
        } catch (error) {
            console.error("Error creating FAQ:", error);
        }
    };
    // Edit FAQ functions
    const handleEdit = (event: React.MouseEvent, faq: FAQs) => {
        event.preventDefault();
        event.stopPropagation();

        setFormMode('edit');
        setEditingFaqId(faq.uuid);
        setFormQuestion(faq.question);
        setFormAnswer(faq.answers);
        setFormStatus(faq.status === 1 ? "active" : "inactive");
        setFormPosition(faq.position || 1);
        setFormErrors({});
    };

    const handleSaveEdit = async () => {
        if (!editingFaqId) return;

        const errors: { question?: string; answer?: string } = {};
        if (!formQuestion.trim()) {
            errors.question = "Please enter a question.";
        }
        if (!formAnswer.trim()) {
            errors.answer = "Please enter an answer.";
        }
        if (errors.question || errors.answer) {
            setFormErrors(errors);
            return;
        }

        try {
            const response = await updateFAQCourse(
                editingFaqId,
                formQuestion,
                formAnswer,
                formStatus === "active" ? 1 : 0,
                formPosition
            );

            setFAQs(faqs.map(faq =>
                faq.uuid === editingFaqId ? (Array.isArray(response.data) ? response.data[0] : response.data) : faq
            ));

            resetForm();
        } catch (error) {
            console.error("Error updating FAQ:", error);
        }
    };

    // Delete FAQ functions
    const handleDelete = (event: React.MouseEvent, faqUuid: string) => {
        event.preventDefault();
        event.stopPropagation();
        setDeletingFaqId(faqUuid);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingFaqId) return;

        try {
            await deleteFAQ(deletingFaqId);
            setFAQs(faqs.filter(faq => faq.uuid !== deletingFaqId));
            setDeletingFaqId(null);
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting FAQ:", error);
        }
    };

    const closeDeleteModal = () => {
        setDeletingFaqId(null);
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <div className="flex justify-end items-center mb-4">
                <Button variant="primaryBtn" onClick={handleAddClick}>
                    Add FAQ
                </Button>
            </div>

            {formMode === 'add' && (
                <FAQForm
                    title="Add New FAQ"
                    question={formQuestion}
                    answer={formAnswer}
                    status={formStatus}
                    position={formPosition}
                    errors={formErrors}
                    onQuestionChange={setFormQuestion}
                    onAnswerChange={setFormAnswer}
                    onStatusChange={setFormStatus}
                    onPositionChange={setFormPosition}
                    onSave={handleSaveNewFAQ}
                    onCancel={resetForm}
                    saveButtonText="Save FAQ"
                />
            )}

            {formMode === 'edit' && (
                <FAQForm
                    title="Edit FAQ"
                    question={formQuestion}
                    answer={formAnswer}
                    status={formStatus}
                    position={formPosition}
                    errors={formErrors}
                    onQuestionChange={setFormQuestion}
                    onAnswerChange={setFormAnswer}
                    onStatusChange={setFormStatus}
                    onPositionChange={setFormPosition}
                    onSave={handleSaveEdit}
                    onCancel={resetForm}
                    saveButtonText="Update FAQ"
                />
            )}

            <Accordion type="multiple" value={faqOpenItems} onValueChange={setFaqOpenItems}>
                {faqs.length > 0 ? (
                    faqs.map((faq) => (
                        <AccordionItem
                            key={faq.uuid}
                            className="border rounded-lg mt-3"
                            value={`faq-${faq.uuid}`}
                        >
                            <AccordionTrigger arrowPosition="left" className="flex bg-[#f8f9fa] px-3">
                                <h4>{faq.question}</h4>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="ml-auto"
                                    onClick={(e) => handleEdit(e, faq)}
                                >
                                    <Edit size={16} />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="ml-2"
                                    onClick={(e) => handleDelete(e, faq.uuid)}
                                >
                                    <Trash2 size={16} color="red" />
                                </Button>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 py-2">
                                <p>{faq.answers}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))
                ) : (
                    <div className="text-gray-500 italic mt-3 px-3">
                        No FAQs available for this course.
                    </div>
                )}
            </Accordion>

            <Modal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                type="confirmation"
                variant="delete"
                title="Delete FAQ"
                message={`Are you sure you want to delete this FAQ? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={closeDeleteModal}
                destructive={true}
            />
        </>
    );
}