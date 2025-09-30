"use client";
import { getCoursesCategory } from "@/lib/coursecategory-api";
import { useEffect, useState, useMemo } from "react";
import { CourseCategory } from "@/types/coursecategory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Categories() {
    const [categories, setCategories] = useState<CourseCategory[]>([]);
    const [sortByOption, setSortByOption] = useState("Newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const sortBy = [
        { label: "Newest", value: "newest" },
        { label: "Oldest", value: "oldest" },
        { label: "A-Z", value: "a-z" },
        { label: "Z-A", value: "z-a" },
    ];

    const sortedCategories = useMemo(() => {
        let result = [...categories];

        if (searchQuery) {
            result = result.filter((c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortByOption === "A-Z") {
            result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortByOption === "Z-A") {
            result.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortByOption === "Newest") {
            result.sort((a, b) => (b.created_at && a.created_at ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : 0));
        } else if (sortByOption === "Oldest") {
            result.sort((a, b) => (a.created_at && b.created_at ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : 0));
        }

        return result;
    }, [categories, sortByOption, searchQuery]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await getCoursesCategory();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <>
            <div className="flex justify-between items-center mb-6 gap-4">
                <Input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-2/4"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex-[3] gap-2 rounded-lg border-gray-300 text-left justify-between"
                        >
                            <span className="truncate">{sortByOption}</span>
                            <ChevronDown size={16} className="flex-shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {sortBy.map((sortby) => (
                            <DropdownMenuItem
                                key={sortby.value}
                                onClick={() => setSortByOption(sortby.label)}
                            >
                                {sortby.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="courseCreate">Add Course Category</Button>
            </div>
            {loading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                    <LoadingSpinner size="lg" text="Loading categories..." />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedCategories.map((category) => (
                        <div key={category.id} className="p-4 border rounded-lg shadow-sm grid grid-cols-2">
                            <div className="mb-3">
                                <Image
                                    src={category.image || '/placeholder-image.png'}
                                    alt={category.name || 'Category image'}
                                    width={120}
                                    height={120}
                                    className="object-cover h-[120px]"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-image.png';
                                    }}
                                    priority={false}
                                />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold">{category.name}</h2>
                                {category.description && (
                                    <p className="text-sm text-gray-600">{category.description}</p>
                                )}
                                {category.position && (
                                    <p className="text-xs text-gray-500">Position: {category.position}</p>
                                )}
                                <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                                <Button variant="outline" size="sm" ><Trash2 className="w-4 h-4" color="red" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}