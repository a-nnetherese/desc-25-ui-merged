# PantryPal - Smart Meal Planning & Grocery Management

## Overview
Ecosina is a meal planning and grocery management application designed specifically for college students living in dorms. The app helps students plan meals efficiently, generate shopping lists automatically, and track their grocery inventory to reduce food waste.

## Project Structure
- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js with in-memory storage
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query)

## Key Features

### 1. Smart Recipe Basket
- Browse recipes organized by meal type (Breakfast, Lunch, Dinner, Snacks)
- View detailed recipe information with ingredients and instructions
- Customize serving quantities with automatic ingredient scaling
- Add recipes to basket with selected portions
- Create custom recipes with category selection
- Delete custom recipes (only user-created recipes can be deleted)
- "See All" pages for each category with 3-column grid layout

### 2. Auto-synced Grocery List
- Automatically generate shopping list from selected recipes
- Consolidated ingredient list to avoid duplicates
- Check off items while shopping
- Clear purchased items from the list
- OCR-based photo scanning for receipts and grocery lists
- Smart item detection and categorization from photos

### 3. Smart Grocery Scanner & Auto-Tracker
- Add grocery items to inventory with purchase/expiry dates
- Automatic categorization of items
- Expiration date tracking with visual warnings
- Smart sorting by expiration urgency (expired, urgent, soon, fresh)
- **OCR.space API**: Photo scanning for receipt/list text extraction

## Pages
- `/` - Home page with hero section and recipe browsing
- `/category/:category` - Category view showing all recipes in 3-column grid
- `/grocery-list` - Shopping list with checkbox interface and photo scanning
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
- Implemented green and pink color scheme matching PantryPal branding
- Built all frontend components with exceptional visual quality
- Created smooth scroll functionality from hero to recipe sections
- Designed expandable recipe modal with ingredient scaling
- Added isCustom field to schema to distinguish user-created recipes from seeded recipes (Nov 8, 2025)
- Implemented delete functionality for custom recipes with trash icon button in RecipeModal (Nov 8, 2025)
- Created category-recipes.tsx page displaying all recipes in a category with 3-column grid layout (Nov 8, 2025)
- Removed QR code scanner and replaced with OCR-based PhotoScanModal using OCR.space API (Nov 8, 2025)
- Integrated OCR photo scanning for receipts and grocery lists with proper category validation (Nov 8, 2025)
- Removed pink hover circle from recipe cards for cleaner UI (Nov 8, 2025)
- Updated all "See all" links to navigate to category-specific pages (Nov 8, 2025)
- **V2/V3 Updates** (Nov 8, 2025):
  - Replaced image URL input with photo upload feature in add-recipe-dialog (take photo or upload image)
  - Enhanced OCR scanning accuracy with OCR Engine 2, auto-scaling, and orientation detection
  - Improved text preprocessing for better handling of blurry photos and OCR errors
  - Added auto-scroll to top when navigating to category pages via "See all" button
  - Removed dark mode feature completely (removed ThemeToggle and ThemeProvider)
