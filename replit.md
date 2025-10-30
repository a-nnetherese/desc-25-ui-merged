# Ecosina - Smart Meal Planning & Grocery Management

## Overview
Ecosina is a meal planning and grocery management application designed specifically for college students living in dorms. The app helps students plan meals efficiently, generate shopping lists automatically, and track their grocery inventory to reduce food waste.

## Project Structure
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js with in-memory storage
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query)

## Key Features

### 1. Smart Recipe Basket
- Browse recipes organized by meal type (Breakfast, Lunch, Dinner)
- View detailed recipe information with ingredients and instructions
- Customize serving quantities with automatic ingredient scaling
- Add recipes to basket with selected portions

### 2. Auto-synced Grocery List
- Automatically generate shopping list from selected recipes
- Consolidated ingredient list to avoid duplicates
- Check off items while shopping
- Clear purchased items from the list

### 3. Smart Grocery Scanner & Auto-Tracker
- Add grocery items to inventory with purchase/expiry dates
- Automatic categorization of items
- Expiration date tracking with visual warnings
- Smart sorting by expiration urgency (expired, urgent, soon, fresh)
- **html5-qrcode**: QR code scanning functionality for mobile devices

## Pages
- `/` - Home page with hero section and recipe browsing
- `/grocery-list` - Shopping list with checkbox interface
- `/inventory` - Inventory tracker with expiration monitoring

## Color Scheme
- **Primary**: Forest green (#4A7C59) - represents eco-friendly, sustainable living
- **Secondary**: Vibrant pink/magenta (#E91E8C) - adds energy and student appeal
- **Background**: Light beige/cream - warm, approachable feel
- **Cards**: White with subtle borders

## User Preferences
- Target audience: College dormers with limited cooking experience
- Priority: Simple, visual interface with minimal text
- Focus: Reducing food waste and simplifying meal planning

## Recent Changes
- Initial project setup (Oct 27, 2025)
- Implemented green and pink color scheme matching Ecosina branding
- Built all frontend components with exceptional visual quality
- Created smooth scroll functionality from hero to recipe sections
- Designed expandable recipe modal with ingredient scaling
