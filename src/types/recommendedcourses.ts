export interface RecommendedCourse {
    id: number;
    uuid: string;
    course_id: number;
    recomended_course_id: number;
    position: number;
    must_have: number;
    status: number;
    created_at: string;
    updated_at: string;
    recommendedCourse: {
        id: number;
        uuid: string;
        course_name: string;
        short_description: string | null;
        status: number;
    };
    [key: string]: unknown;
}

export interface RecommendedCourseResponse {
    status: string;
    data: {
        course: {
            id: number;
            uuid: string;
            name: string;
        };
        recommendations: RecommendedCourse[];
    };
}
