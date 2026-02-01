# SloaneX

Production-ready Next.js (App Router) site designed for Vercel. It supports real uploads, storage, and deletion of images/videos via Vercel Blob, and metadata storage via Vercel KV.

## Features
- Pink + purple themed responsive UI.
- Public browsing for exclusive images/videos.
- Secure admin upload/delete for banner, profile, images, and videos.
- Support form with rate limiting + honeypot (SMTP email).
- Terms gate modal and under-construction placeholders.

## Getting Started
```bash
npm install
npm run dev
```

## Environment Variables
Copy `.env.example` and fill in the values:
```bash
cp .env.example .env.local
```

## Deployment
Deploy directly to Vercel with no custom server. Configure the environment variables in your Vercel project settings.
