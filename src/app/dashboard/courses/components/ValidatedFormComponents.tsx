"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string | null;
    label?: string;
    required?: boolean;
}

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string | null;
    label?: string;
    required?: boolean;
}

// Validated Input Component
export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
    ({ className, error, label, required, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className={cn(
                        "text-lg font-medium m-2",
                        required && "after:content-['*'] after:text-red-500 after:ml-1"
                    )}>
                        {label}
                    </label>
                )}
                <Input
                    className={cn(
                        "mb-4 px-3 py-0",
                        error && "border-red-500 focus:border-red-500",
                        className
                    )}
                    ref={ref}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${props.id || props.name}-error` : undefined}
                    name={props.name || props.id}
                    {...props}
                />
                {error && (
                    <p 
                        id={`${props.id || props.name}-error`}
                        className="text-sm text-red-600 mt-1 px-3"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

ValidatedInput.displayName = "ValidatedInput";

// Validated Textarea Component
export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
    ({ className, error, label, required, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className={cn(
                        "text-lg font-medium m-2",
                        required && "after:content-['*'] after:text-red-500 after:ml-1"
                    )}>
                        {label}
                    </label>
                )}
                <Textarea
                    className={cn(
                        "mb-4 px-3 py-2",
                        error && "border-red-500 focus:border-red-500",
                        className
                    )}
                    ref={ref}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${props.id || props.name}-error` : undefined}
                    name={props.name || props.id}
                    {...props}
                />
                {error && (
                    <p 
                        id={`${props.id || props.name}-error`}
                        className="text-sm text-red-600 mt-1 px-3"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

ValidatedTextarea.displayName = "ValidatedTextarea";

// Validated Select2 Component
interface ValidatedSelect2Props {
    error?: string | null;
    label?: string;
    required?: boolean;
    children: React.ReactNode;
}

export function ValidatedSelect2({ error, label, required, children }: ValidatedSelect2Props) {
    return (
        <div className="space-y-2">
            {label && (
                <label className={cn(
                    "text-lg font-medium m-2",
                    required && "after:content-['*'] after:text-red-500 after:ml-1"
                )}>
                    {label}
                </label>
            )}
            <div className={cn(error && "border-red-500 rounded")}>
                {children}
            </div>
            {error && (
                <p className="text-sm text-red-600 mt-1 px-3" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

// Form section component with validation summary
interface FormSectionProps {
    title: string;
    errors?: string[];
    children: React.ReactNode;
}

export function FormSection({ title, errors, children }: FormSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{title}</h3>
                {errors && errors.length > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                        {errors.length} error{errors.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>
            {errors && errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <ul className="text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-red-500 mr-2">•</span>
                                {error}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {children}
        </div>
    );
}