# SoftwarePar - Full-Stack Software Development Platform

## Overview

SoftwarePar is a professional software development platform built for SoftwarePar.Lat, featuring a complete multi-role system for clients, partners, and administrators. The platform enables software project management, partner referral programs, payment processing through MercadoPago, and comprehensive business operations management. It serves as both a client portal for software services and a partner network platform for revenue generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18.3.1 with TypeScript for type safety and modern development patterns
- **Build System**: Vite 5.4.19 for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessibility and consistency
- **Styling**: TailwindCSS 3.4.17 with CSS variables for theming and responsive design
- **State Management**: TanStack Query 5.60.5 for server state management and caching
- **Routing**: Wouter 3.3.5 for lightweight client-side routing
- **Forms**: React Hook Form 7.55.0 with Zod validation for type-safe form handling
- **Animations**: Framer Motion for smooth UI animations and transitions

### Backend Architecture
- **Runtime**: Node.js with Express 4.21.2 framework
- **Language**: TypeScript for end-to-end type safety
- **Database**: PostgreSQL via Neon cloud platform with connection pooling
- **ORM**: Drizzle ORM 0.39.3 for type-safe database operations and migrations
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Real-time**: WebSocket integration for live updates and notifications
- **Email**: Nodemailer 7.0.5 for transactional email capabilities

### Database Schema Design
- **Multi-tenancy**: Role-based access control with user, partner, and admin roles
- **Core Entities**: Users, Partners, Projects, Tickets, Notifications, Referrals, Payments
- **Referral System**: Partner tracking with commission calculations and earnings management
- **Project Management**: Complete project lifecycle with status tracking and client communication
- **Support System**: Ticket-based support with priority levels and resolution tracking

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with 7-day expiration
- **Role-based Access**: Three-tier system (client, partner, admin) with route protection
- **Password Security**: bcrypt hashing with salt rounds for secure password storage
- **Session Management**: Token-based sessions with automatic renewal

### API Architecture
- **RESTful Design**: Consistent REST endpoints with proper HTTP methods and status codes
- **Validation**: Zod schemas for request/response validation and type safety
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **CORS**: Cross-origin resource sharing configuration for frontend integration

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Connection Pooling**: @neondatabase/serverless for optimized database connections

### Payment Processing
- **MercadoPago**: Latin American payment gateway integration for project billing
- **Webhook Handling**: Secure payment status updates and commission calculations

### Email Services
- **Gmail SMTP**: Transactional email delivery for notifications and communications
- **Email Templates**: HTML email templates for welcome messages and notifications

### UI Components
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Lucide React**: Modern icon library with consistent design language
- **Chart Libraries**: Recharts for data visualization and analytics dashboards

### Development Tools
- **Drizzle Kit**: Database migration and schema management tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration
- **TypeScript**: Static type checking across the entire stack

### Real-time Features
- **WebSocket (ws)**: Server-side WebSocket implementation for live updates
- **TanStack Query**: Client-side caching and synchronization with optimistic updates