import { NextResponse } from 'next/server';
import { coursesList } from '@/lib/data/courses-data';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: coursesList,
      total: coursesList.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
// export async function GET() {
//   try {
//     // Call your real API here
//     const response = await fetch('https://your-real-api.com/courses', {
//       headers: {
//         'Authorization': 'Bearer your-token',
//         'Content-Type': 'application/json'
//       }
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to fetch from external API');
//     }
    
//     const courses = await response.json();
    
//     return NextResponse.json({
//       success: true,
//       data: courses,
//       total: courses.length
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, message: 'Failed to fetch courses' },
//       { status: 500 }
//     );
//   }
// }