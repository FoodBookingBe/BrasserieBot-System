# BrasserieBot Frontend

[![Netlify Status](https://api.netlify.com/api/v1/badges/54f0d686-505e-42c9-a1e4-bd88412d859c/deploy-status)](https://app.netlify.com/sites/foodbookingai/deploys)

This is the frontend application for BrasserieBot, an AI-driven hospitality operating system. Built with Next.js and deployed on Netlify.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app` - Next.js application pages and layouts
- `src/components` - Reusable UI components
- `src/lib` - Utility functions and custom hooks
- `src/types` - TypeScript type definitions
- `public` - Static assets

## Technologies Used

- **Next.js** - React framework with server-side rendering
- **TypeScript** - Type safety for development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and state management
- **Chart.js** - Data visualization

## Netlify Deployment

This project is set up for deployment on Netlify with optimized settings:

```bash
# Test Netlify deployment locally
npm run netlify:dev

# Build and preview
npm run netlify:build

# Deploy to production
npm run netlify:deploy
```

The site is automatically deployed on push to the main branch through GitHub integration. Check the current status with the badge at the top of this README.

## Environment Variables

The following environment variables need to be set in your Netlify dashboard:

- `NEXT_PUBLIC_API_URL` - The URL of the backend API
- `NODE_VERSION` - Set to 18 for compatibility

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
