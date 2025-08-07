# ReputaRank

## Overview

ReputaRank is a web application designed for real estate agents to collect, manage, and display client reviews. The platform provides a comprehensive review management system with secure authentication, client relationship management, review request tracking, and testimonial showcase capabilities. Built as a full-stack application with a React frontend and Express backend, it focuses on helping real estate professionals transform client feedback into a competitive advantage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected route implementation
- **UI Components**: Comprehensive component library built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack React Query for server state management and caching
- **Authentication Flow**: JWT-based authentication with automatic token validation and route protection

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **API Design**: RESTful API with protected routes using JWT middleware
- **Request Handling**: Express middleware for logging, error handling, and authentication validation
- **Development Setup**: Hot reload development server with Vite integration for seamless full-stack development

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Centralized schema definitions with automatic TypeScript type generation
- **Migration System**: Drizzle Kit for database schema migrations and updates

### Authentication & Authorization
- **Provider**: Supabase Auth for user authentication and session management
- **Token Strategy**: JWT tokens validated server-side using Supabase Admin API
- **Route Protection**: Custom middleware validates tokens on all `/api/*` endpoints
- **Client Protection**: Protected route component ensures authentication before rendering sensitive pages

### Data Models
- **Users**: Agent accounts with role-based access
- **Clients**: Customer information with contact details and property types
- **Review Requests**: Tracking system for sent review invitations with status management
- **Testimonials**: Collected reviews with ratings and public/private visibility controls

## External Dependencies

### Authentication Service
- **Supabase**: Complete authentication solution providing user management, JWT token generation, and session handling
- **Integration**: Client-side SDK for authentication flows and server-side validation using service role keys

### Database Hosting
- **Neon**: Serverless PostgreSQL hosting with connection pooling and automatic scaling
- **Configuration**: Environment-based database URL configuration for different deployment environments

### UI Component Libraries
- **Radix UI**: Unstyled, accessible component primitives for building the user interface
- **Tailwind CSS**: Utility-first CSS framework with custom design system configuration
- **Lucide React**: Icon library providing consistent iconography throughout the application

### Development & Build Tools
- **TypeScript**: Type safety across the entire application stack
- **Vite**: Fast development server and optimized production builds
- **ESBuild**: High-performance bundling for server-side code
- **PostCSS**: CSS processing with Tailwind CSS integration

### State Management & HTTP
- **TanStack React Query**: Server state management with caching, background updates, and optimistic updates
- **Wouter**: Lightweight client-side routing with hook-based navigation
- **Date-fns**: Date manipulation and formatting utilities