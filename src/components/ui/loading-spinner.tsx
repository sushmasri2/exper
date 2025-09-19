"use client";

import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
};

/**
 * A reusable loading spinner component with optional text
 * @param size - The size of the spinner (sm, md, lg)
 * @param className - Additional classes to apply to the container
 * @param text - Optional text to display below the spinner
 */
export function LoadingSpinner({
  size = "md",
  className,
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-t-transparent",
          "border-primary",
          sizeClasses[size]
        )}
      />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

type PageLoadingProps = {
  message?: string;
};

/**
 * A full-page loading component for use while page data is loading
 * @param message - Optional message to display below the spinner
 */
export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <LoadingSpinner size="lg" text={message} />
    </div>
  );
}

export default PageLoading;