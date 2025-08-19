# Felix's 12-Month Workout App

A comprehensive mobile-first workout tracking application built with React and Supabase.

## Features

- **Complete 12-Month Program**: 6-day Arnold split with pre-exhaustion protocols
- **Smart Progression**: Automatic weight and rep progression based on training phases
- **Cloud Storage**: Workout progress saved permanently with Supabase
- **Cross-Device Sync**: Access from any device with your account
- **Progress Tracking**: Visual charts showing strength gains over time
- **Mobile Optimized**: Perfect for gym use on your phone

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Deployment**: Vercel

## Workout Program

- **Monday/Thursday**: Chest & Back
- **Tuesday/Friday**: Shoulders & Arms  
- **Wednesday/Saturday**: Legs & Core
- **Sunday**: Rest Day

## Getting Started

1. Sign up with your email
2. Start tracking your workouts
3. Watch your progress over the 12-month journey

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env.local` file with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

