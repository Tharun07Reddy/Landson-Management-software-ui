# Landson Management

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Modern UI**: Built with Next.js, React, and Tailwind CSS
- **API Integration**: Production-grade API configuration with Axios
- **Device Fingerprinting**: Advanced device identification using FingerprintJS

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## API Configuration

This project includes a production-grade API configuration using Axios. The API client is set up with interceptors, error handling, and environment-based configuration.

### Environment Variables

Copy the `.env.example` file to `.env.local` and adjust the values as needed:

```bash
cp .env.example .env.local
```

### API Structure

The API configuration is organized in the following structure:

- `lib/api/axios.ts` - Core Axios client configuration with interceptors
- `lib/api/config.ts` - Environment-specific API settings
- `lib/api/errorHandler.ts` - Error handling utilities
- `lib/api/useApi.ts` - React hooks for making API requests
- `lib/api/index.ts` - Exports all API modules

### Usage Examples

#### Using the API Client Directly

```typescript
import { apiClient } from '@/lib/api';

// Get all examples
const response = await apiClient.get('/examples', { params: { page: 1, limit: 10 } });
const examples = response.data;

// Get example by ID
const response = await apiClient.get(`/examples/123`);
const example = response.data;

// Create a new example
const response = await apiClient.post('/examples', { name: 'Example' });
const newExample = response.data;
```

#### Using React Hooks

```typescript
import { useGet, usePost } from '@/lib/api';

// In a React component
function ExampleComponent() {
  // Auto-fetch data on component mount
  const { data, isLoading, error } = useGet('/examples', { autoFetch: true });
  
  // Manual fetch with execute function
  const { execute: createExample, isLoading: isCreating } = usePost('/examples');
  
  const handleSubmit = async (formData) => {
    try {
      const result = await createExample(formData);
      console.log('Created:', result);
    } catch (error) {
      console.error('Error creating example:', error);
    }
  };
  
  return (
    // Component JSX
  );
}
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
