# replit.md

## Overview

This is a full-stack web application for Farmacia Fátima Díaz Guillén & Centro Médico Clodina, a Spanish pharmacy and medical center. The application provides a modern digital presence with services including online appointments, product catalog, blog, testimonials, and virtual consultations. Built with React/TypeScript frontend and Express.js backend, using PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **Build Tool**: Vite for development and production builds
- **Component System**: shadcn/ui components with Radix UI primitives

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon PostgreSQL (serverless)
- **Session Management**: Express session middleware
- **Email Service**: Nodemailer with SendGrid integration
- **File Upload**: Local storage handling

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Users**: Customer accounts with loyalty points and role-based access
- **Testimonials**: Customer reviews with approval workflow
- **Blog Posts**: Content management with categories and SEO-friendly slugs
- **Contact Messages**: Customer inquiries with status tracking
- **Products**: Pharmacy inventory with categories and pricing
- **Appointments**: Medical appointment scheduling system

## Key Components

### Authentication & Authorization
- Session-based authentication with role-based access control
- User roles: customer, admin
- Protected routes for admin functionality
- User registration with approval workflow

### Content Management
- Admin dashboard for managing all content
- Rich text editor for blog posts
- Product catalog management
- Testimonial moderation system
- Contact message handling with reply functionality

### Accessibility Features
- Comprehensive accessibility support with voice navigation
- Screen reader optimization
- High contrast mode and large text options
- Keyboard navigation enhancements
- Multi-language support (Spanish primary)

### Virtual Consultations
- Integrated video/chat consultation system
- Doctor availability scheduling
- Appointment management interface

### Email System
- Automated email notifications for appointments and contacts
- Template-based email system
- SendGrid integration for reliable delivery

## Data Flow

1. **User Registration/Login**: Users register and wait for admin approval
2. **Content Creation**: Admins create and manage blog posts, products, and testimonials
3. **Appointment Booking**: Authenticated users can book medical appointments
4. **Contact Management**: Contact form submissions are stored and managed by admins
5. **Product Browsing**: Public product catalog with search and filtering
6. **Virtual Consultations**: Real-time consultation system with doctor matching

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@sendgrid/mail**: Email service integration
- **express-session**: Session management
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation

### UI Components
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **framer-motion**: Animation library
- **react-helmet**: SEO and meta tag management

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution for server
- **esbuild**: Fast bundling for production

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized static assets to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle Kit handles schema migrations

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key
- `SENDGRID_API_KEY`: Email service authentication

### Production Setup
1. Install dependencies: `npm install`
2. Build application: `npm run build`
3. Push database schema: `npm run db:push`
4. Start production server: `npm start`

### Development Setup
1. Install dependencies: `npm install`
2. Set up environment variables
3. Push database schema: `npm run db:push`
4. Start development server: `npm run dev`

## Changelog

```
Changelog:
- July 02, 2025. Initial setup
- July 02, 2025. Added comprehensive doctor scheduling system:
  * Doctor schedule management (weekly availability)
  * Doctor exception handling (vacations, special hours)
  * Appointment duration configuration by specialty
  * Real-time availability checking
  * Enhanced appointment selector with time slots
  * Doctor dashboard for appointment management
  * Email confirmation system when appointments are confirmed
  * Doctor-specific area for managing their own appointments and schedules
- July 02, 2025. Enhanced contact management system:
  * Fixed contact form JSON parsing errors with proper apiRequest handling
  * Implemented comprehensive contact message management interface
  * Added real-time statistics dashboard (total, unread, replied, daily messages)
  * Built email response system with automatic client notifications
  * Created advanced filtering and search capabilities
  * Added message archiving and deletion functionality
  * Updated pharmacy contact information to real Tenerife location
- July 02, 2025. Implemented comprehensive captcha security system:
  * Added unified Captcha component supporting Google reCAPTCHA and hCaptcha
  * Integrated captcha validation in contact form (home section)
  * Integrated captcha validation in user registration form
  * Connected captcha system to security configuration settings
  * Server-side captcha configuration endpoint for dynamic enabling/disabling
  * Captcha automatically appears when enabled in admin security settings
- July 21, 2025. Implemented comprehensive iCal calendar synchronization:
  * Built custom iCal RFC 5545 compliant generator for appointment events
  * Created full-featured iCal API endpoints with filtering capabilities
  * Added administrative interface for calendar management and export
  * Implemented doctor-specific calendar feeds with individual URLs
  * Built filterable calendar export (by doctor, specialty, date range)
  * Created subscription URLs for external calendar applications
  * Added comprehensive documentation and setup instructions
  * Integrated iCal sync into admin navigation menu
- July 21, 2025. Updated "About Us" section with new content and image:
  * Replaced previous text with comprehensive 20+ year history narrative
  * Added new real exterior photo of the pharmacy building
  * Enhanced service descriptions with detailed explanations
  * Improved visual layout with better formatting and emphasis
- July 21, 2025. Implemented comprehensive staff management system:
  * Built complete database schema for staff with professional profiles
  * Created full CRUD operations with API routes for staff management
  * Implemented professional cards matching user-provided design screenshots
  * Added "Personal" menu to admin navigation with complete staff lifecycle management
  * Updated team page to display dynamic staff data from database
  * Added staff creation with professional details, availability, ratings, and certifications
  * Integrated department separation (medical center vs pharmacy) for proper organization
- July 21, 2025. Enhanced staff management with file upload system:
  * Implemented comprehensive file upload system using multer for staff photos
  * Created ImageUpload component with file validation and preview functionality
  * Fixed JSON parsing conflicts between FormData uploads and Express middleware
  * Resolved form data loading issues for staff editing functionality
  * Added proper error handling and user feedback for upload operations
  * Configured static file serving for uploaded staff images
  * Fixed cache synchronization between admin staff management and public team page
  * Added smart middleware routing to prevent body parsing conflicts with file uploads
  * Ensured real-time updates across all staff-related views
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```