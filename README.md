This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:4000](http://localhost:4000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load fonts.

## Authentication

This project supports two authentication methods:

1. **OTP Authentication**: Users can enter their email or mobile number and receive a one-time password.
2. **Google Authentication**: Users can sign in using their Google accounts.

### Google Authentication Setup

The Google authentication uses both FedCM (Federated Credential Management) API and traditional OAuth 2.0 as a fallback.

To set up Google authentication:

1. Create OAuth 2.0 credentials in the [Google Cloud Console](https://console.cloud.google.com/)
2. Add your Client ID to the `.env` or `.env.local` file as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
3. Add your Client Secret to the `.env.local` file as `GOOGLE_CLIENT_SECRET`
4. Add `http://localhost:3000/api/auth/google-callback` to the authorized redirect URIs in your Google Cloud Console project

The application will automatically handle FedCM issues by falling back to the traditional OAuth flow.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Docker
This project is configured for easy deployment on Docker. You can build and run the Docker container using the following commands:

```bash
# Build the Docker image
docker build -t cms-ui-app .

# Run the Docker container
docker run -p 5000:5000 cms-ui-app
```

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
