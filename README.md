# ReputaRank - Real Estate Review Management

A professional web application for real estate agents to collect, manage, and display client reviews with secure authentication and comprehensive dashboard features.

## Features

- **Client Management**: Add, edit, and organize client information
- **Review Requests**: Send and track review requests to clients
- **Testimonial Showcase**: Display client testimonials with ratings
- **Dashboard Analytics**: Overview of key metrics and recent activity
- **Secure Authentication**: JWT-based authentication with Supabase
- **Responsive Design**: Professional UI that works on all devices

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **UI Library**: Shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Supabase account (for authentication)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd reputarank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/reputarank
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   ```bash
   # Push schema to your database
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

## Project Structure

```
├── client/src/           # React frontend
│   ├── components/       # Reusable UI components
│   ├── pages/           # Main application pages
│   ├── lib/             # Utilities and configurations
│   └── hooks/           # Custom React hooks
├── server/              # Express backend
│   ├── middleware/      # Authentication middleware
│   ├── routes.ts        # API endpoints
│   └── storage.ts       # Database operations
├── shared/
│   └── schema.ts        # Database schema & types
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Database Schema

The application uses 4 main tables:
- `users` - Agent account information
- `clients` - Client contact and property details
- `review_requests` - Tracking of sent review invitations
- `testimonials` - Collected reviews and ratings

## Authentication Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Add them to your `.env` file
4. Authentication is handled automatically by the app

## API Endpoints

All API endpoints are protected with JWT authentication:

- `GET /api/auth/user` - Get current user
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET|POST /api/clients` - Client management
- `GET|POST /api/review-requests` - Review requests
- `GET|POST /api/testimonials` - Testimonials

## Production Deployment

The application is ready for deployment on platforms like:
- Vercel
- Netlify
- Railway
- Digital Ocean

Make sure to:
1. Set environment variables in your hosting platform
2. Set up your PostgreSQL database
3. Configure Supabase for production domain

## Support

For questions or issues, please refer to the documentation in `replit.md` or create an issue in the repository.

## License

MIT License - see LICENSE file for details.