# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a file manager application with a dual-project structure:
- `src/`: Main Next.js file manager application (port 8080)
- `template-admin/next/`: Admin dashboard template (Mosaic Next.js template)

## Development Commands

### Primary Application (src/)
```bash
# Setup dependencies
make setup

# Development server (runs on port 8080 with Turbopack)
make dev

# Build production
make build

# Start production server
make start

# Lint code
make lint
```

Note: The `make dev` command automatically kills any process running on port 8080 before starting.

### Admin Template (template-admin/next/)
```bash
cd template-admin/next
npm run dev    # Development server
npm run build  # Build production
npm run start  # Start production server
npm run lint   # Lint code
```

## Architecture Overview

### Main Application (src/)
- **Framework**: Next.js 15.4.5 with App Router
- **Styling**: Tailwind CSS v4
- **Runtime**: React 19.1.0
- **Development**: Turbopack for fast development builds
- **Port**: 8080 (configured in package.json)

### Admin Template (template-admin/next/)
- **Framework**: Next.js 15.1.6 with TypeScript
- **Styling**: Tailwind CSS v4 with forms plugin
- **UI Components**: Headless UI, Radix UI
- **Charts**: Chart.js with moment adapter
- **Theme**: next-themes for dark/light mode
- **Date Handling**: date-fns, react-day-picker

### Key Directories

#### Main App Structure (src/)
- `src/app/`: Next.js App Router pages and layouts
- `src/app/globals.css`: Global styles
- `public/`: Static assets (SVG icons)

#### Admin Template Structure (template-admin/next/)
- `app/(default)/`: Main dashboard pages (analytics, ecommerce, jobs, etc.)
- `app/(auth)/`: Authentication pages (signin, signup, password reset)
- `app/(alternative)/`: Alternative layouts (components library, finance)
- `app/(double-sidebar)/`: Two-sidebar layouts (inbox, messages, community)
- `app/(onboarding)/`: User onboarding flow
- `components/`: Reusable UI components including charts
- `components/ui/`: Core UI components (header, sidebar, calendar)
- `lib/`: Utility functions

## Development Notes

- The main application uses a Makefile for consistent command execution
- Both projects use Tailwind CSS v4 (latest version)
- The admin template includes comprehensive dashboard components with charts, tables, and forms
- All development servers use Turbopack for faster builds
- The main app runs on port 8080 to avoid conflicts with the default Next.js port