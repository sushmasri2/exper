import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import CategoryCreateUpdateForm from "./category-form";

export default function CategoryCreateUpdate() {
    return (
        <div>
            <Suspense fallback={
                <div className="flex justify-center items-center min-h-[400px]">
                    <LoadingSpinner size="lg" text="Loading..." />
                </div>
            }>
                <CategoryCreateUpdateForm />
            </Suspense>
        </div>
    );
}