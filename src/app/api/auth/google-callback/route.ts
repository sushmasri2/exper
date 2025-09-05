import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  id_token: string;
}

// Handle POST request with Google ID token
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    // Check if id_token is provided
    if (!body?.id_token) {
      console.error('No ID token provided');
      return NextResponse.json(
        { success: false, message: 'No ID token provided' },
        { status: 400 }
      );
    }

    console.log('Google ID token received, verifying...');

    // Verify the ID token with Google
    const userInfo = await verifyGoogleIdToken(body.id_token);

    if (!userInfo) {
      console.error('Failed to verify Google ID token');
      return NextResponse.json(
        { success: false, message: 'Invalid Google ID token' },
        { status: 401 }
      );
    }

    console.log('User info from Google token:', userInfo);

    // Create auth token
    const token = generateAuthToken(userInfo);

    // Return user data and token
    return NextResponse.json({
      success: true,
      user: {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture,
      },
      accessToken: token,
    });

  } catch (error) {
    console.error('Google authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Verifies a Google ID token
 * @param idToken The ID token from Google Sign-In
 * @returns User information if the token is valid, null otherwise
 */
async function verifyGoogleIdToken(idToken: string) {
  try {
    // Get the Google client ID from environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId) {
      console.error('Missing Google client ID');
      return null;
    }

    // Verify the token with Google's OAuth2 tokeninfo endpoint
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!response.ok) {
      console.error('Token verification failed:', response.statusText);
      return null;
    }

    const tokenInfo = await response.json();

    // Verify the audience matches our client ID
    if (tokenInfo.aud !== clientId) {
      console.error('Token audience mismatch:', {
        expected: clientId,
        received: tokenInfo.aud,
      });
      return null;
    }

    // Check if the token is expired
    const now = Math.floor(Date.now() / 1000);
    if (tokenInfo.exp && parseInt(tokenInfo.exp) < now) {
      console.error('Token is expired');
      return null;
    }

    // Return user info from the token
    return {
      id: tokenInfo.sub,
      email: tokenInfo.email,
      name: tokenInfo.name,
      picture: tokenInfo.picture,
      email_verified: tokenInfo.email_verified === 'true',
    };
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    return null;
  }
}

interface GoogleUserInfo {
  id: string;
  name: string;
  email: string;
  picture: string;
  email_verified?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Generates an authentication token for the user
 * @param userInfo The user information from Google
 * @returns A token string
 */
function generateAuthToken(userInfo: GoogleUserInfo) {
  // In a real application, you would use a JWT library
  // For this example, we'll just base64 encode the user info
  const payload = JSON.stringify({
    user: {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
      avatar: userInfo.picture,
    },
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  });

  return Buffer.from(payload).toString('base64');
}
