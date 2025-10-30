# Ecosina Design Guidelines

## Design Approach
**Selected Approach:** Clean Modern Utility System  
**Justification:** As a meal planning and grocery management tool for busy college students, the design prioritizes clarity, efficiency, and ease of use. The interface draws inspiration from productivity tools like Notion and Todoist, emphasizing content hierarchy and functional interactions.

## Core Design Elements

### A. Typography
**Font Families:**
- Primary: Inter (via Google Fonts CDN)
- Headings: font-bold
- Body: font-normal
- Small text/labels: font-medium

**Scale:**
- Hero headline: text-5xl md:text-6xl, font-bold
- Section headers: text-3xl md:text-4xl, font-bold
- Recipe card titles: text-xl, font-semibold
- Body text: text-base
- Labels/metadata: text-sm
- Small text: text-xs

### B. Layout System
**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6
- Element margins: mb-4, mb-6, mb-8

**Container Structure:**
- Max-width container: max-w-7xl mx-auto px-4 md:px-6
- Content sections: py-16 md:py-20
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

### C. Component Library

**Header:**
- Fixed top navigation with subtle shadow
- Logo on left (text-2xl font-bold)
- Navigation links centered/right
- Height: h-16
- Background: slightly elevated with subtle border-bottom
- Padding: px-6

**Hero Section:**
- Full-width container with centered content
- Generous vertical padding: py-20 md:py-32
- Hero image: Large appetizing food photography as background with overlay
- Headline centered above subtext
- CTA button: Large rounded-full button with px-8 py-4
- Include supporting text about helping students save time and reduce waste
- Image description: Vibrant overhead shot of fresh ingredients, colorful vegetables, and meal prep containers arranged aesthetically

**Recipe Cards:**
- Rounded corners: rounded-xl
- Hover state: slight lift with shadow transition
- Image container: aspect-ratio square, object-cover
- Content padding: p-6
- Card structure:
  - Recipe image (top)
  - Recipe title (text-xl font-semibold)
  - Prep time + servings (text-sm with icons)
  - Quick description snippet (text-sm, 2 lines)
- Grid: 1 column mobile, 2 columns tablet, 3-4 columns desktop

**Expanded Recipe Modal:**
- Full-screen overlay with backdrop blur
- Centered modal: max-w-4xl
- Close button top-right
- Layout:
  - Left: Large recipe image (50% width on desktop)
  - Right: Recipe details scrollable
  - Title: text-3xl font-bold
  - Description: text-base, mb-6
  - Ingredients list: Checklist style with quantities
  - Servings selector: Number input with +/- buttons
  - "Add to Basket" button: Prominent, full-width on mobile
- Rounded corners: rounded-2xl
- Padding: p-8

**Section Headers:**
- Meal type sections (Breakfast, Lunch, Dinner, Snacks)
- Left-aligned or centered based on layout
- Icon next to section name (Heroicons for meal types)
- Subtle divider or spacing: mb-8
- Section padding: py-12

**Buttons:**
- Primary: Rounded-full with generous padding (px-8 py-3)
- Secondary: Outlined style with rounded-full
- Icon buttons: Square with rounded-lg, p-2
- Button text: font-medium
- Hover states: Subtle scale and opacity transitions

**Recipe Grid:**
- Responsive grid with consistent gaps
- gap-6 md:gap-8
- Smooth scroll behavior for section navigation
- Clear visual separation between meal type sections

**Icons:**
- Use Heroicons (via CDN)
- Icon sizes: h-5 w-5 for inline, h-6 w-6 for buttons, h-8 w-8 for section headers
- Icons for: meal types, clock (prep time), users (servings), shopping basket, checkmarks

### D. Interactions & Animations
**Scroll Behavior:**
- Smooth scroll when "Browse Recipes" button is clicked
- Scroll to breakfast section with offset for fixed header
- scroll-behavior: smooth

**Card Interactions:**
- Hover: Subtle lift (translate-y-1) with enhanced shadow
- Click: Open modal with fade-in animation
- Transition: transition-all duration-300

**Modal Transitions:**
- Fade in backdrop
- Scale and fade in modal content
- Duration: 200-300ms
- Backdrop click closes modal

**Minimal Animations:**
- Use sparingly for state changes only
- No unnecessary motion
- Respect prefers-reduced-motion

## Images
**Hero Image:** 
- Full-width background image with overlay
- Description: Overhead shot of colorful fresh ingredients (tomatoes, leafy greens, grains, proteins) arranged in an organized, appealing layout with natural lighting
- Treatment: Semi-transparent dark overlay for text readability

**Recipe Card Images:**
- Description: High-quality photos of finished dishes, well-lit and appetizing
- Each meal type should have visually distinct food photography
- Aspect ratio: Square (1:1)
- Treatment: Slight rounded corners matching card style

## Accessibility
- Maintain WCAG AA contrast standards throughout
- Focus states on all interactive elements: ring-2 ring-offset-2
- Semantic HTML structure for screen readers
- Keyboard navigation support for modal and recipe selection
- Alt text for all recipe images describing the dish
- Consistent form input styling with clear labels