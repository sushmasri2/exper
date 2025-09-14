import { NextRequest, NextResponse } from 'next/server';
import { coursesList } from '@/lib/data/courses-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const course = coursesList.find(c => c.id === courseId);
    
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}