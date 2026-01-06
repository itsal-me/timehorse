# TimeHorse Design System

## Professional UI/UX Guidelines

This document outlines the design principles and implementation for TimeHorse's professional interface.

---

## Typography

### Primary Font: Inter

-   **Rationale**: Industry-standard for modern web apps (used by Linear, Vercel, GitHub)
-   **Benefits**:
    -   Excellent readability at all sizes
    -   Optimized for screens with proper hinting
    -   Professional and neutral appearance
    -   Wide language support
-   **Implementation**: `font-family: Inter` with `display: swap` for performance

### Font Weights

-   **Regular (400)**: Body text, descriptions
-   **Medium (500)**: UI labels, navigation
-   **Semibold (600)**: Section headers, card titles
-   **Bold (700)**: Page titles, main headings

---

## Color Palette

### Primary Colors (Professional Gradient)

```
Indigo: #4F46E5 (indigo-600) → #3B82F6 (blue-600)
- Use for: Primary buttons, key CTAs, brand elements
- Conveys: Trust, professionalism, stability
```

### Neutral Colors (Slate)

```
Backgrounds:
- Light: slate-50, slate-100
- Dark: slate-900, slate-950

Text:
- Primary: slate-900 (light) / white (dark)
- Secondary: slate-600 / slate-400
- Tertiary: slate-500 / slate-500
```

### Accent Colors (Feature Cards)

```
Indigo/Blue: Primary features
Cyan/Blue: Calendar sync features
Emerald/Green: Energy/productivity features
Violet/Purple: Performance features
Slate/Gray: Security features
Sky/Indigo: AI features
```

---

## Component Design Principles

### Buttons

#### Primary Button

```css
bg-gradient-to-r from-indigo-600 to-blue-600
hover:from-indigo-700 hover:to-blue-700
rounded-xl
shadow-lg hover:shadow-xl
font-semibold
```

#### Outline Button

```css
border-slate-300 dark:border-slate-600
hover:bg-slate-100 dark:hover:bg-slate-800
rounded-lg
shadow-sm hover:shadow-md
font-medium
```

### Cards

#### Feature Cards

```css
padding: 1.75rem (p-7)
background: gradient (feature-specific color at 50-80% opacity)
border: 1px solid (color-200/50)
hover: shadow-lg + border-color-300
transition: all 300ms
```

#### Content Cards

```css
background: white/90 or slate-800/90
border: 1px solid slate-200 or slate-700
backdrop-blur: xl
shadow: lg
rounded: xl
```

### Shadows

```css
sm: Subtle elements (0-2px blur)
md: Interactive elements (2-4px blur)
lg: Cards, modals (4-8px blur)
xl: Important CTAs (8-16px blur)
```

### Border Radius

```css
sm: 0.25rem - Tags, badges
md: 0.375rem - Small buttons
lg: 0.5rem - Standard buttons, inputs
xl: 0.75rem - Cards, panels
2xl: 1rem - Large containers
```

---

## Layout & Spacing

### Container Max Widths

```
Small: 42rem (672px) - Forms, focused content
Medium: 48rem (768px) - Standard content
Large: 64rem (1024px) - Features grid
Extra Large: 80rem (1280px) - Full dashboard
```

### Spacing Scale

```
xs: 0.5rem (8px)
sm: 0.75rem (12px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

---

## Interaction States

### Hover

-   Slight color shift (darker shade)
-   Subtle shadow increase
-   Smooth transition (200-300ms)
-   No dramatic transforms (avoid scale > 1.02)

### Focus

-   Visible outline or ring (accessibility)
-   Maintain context (no dramatic changes)

### Active

-   Slight darkening
-   Shadow reduction
-   Immediate feedback

### Disabled

-   Reduced opacity (50-60%)
-   No hover effects
-   Cursor: not-allowed

---

## Dark Mode

### Background Layers

```
Base: gray-950, slate-950
Elevated: slate-900, gray-900
Surface: slate-800 (with opacity)
```

### Text Contrast

```
Primary: white
Secondary: slate-300
Tertiary: slate-400
Muted: slate-500
```

### Border & Dividers

```
Subtle: slate-800
Standard: slate-700
Prominent: slate-600
```

---

## Accessibility

### Color Contrast

-   Minimum 4.5:1 for normal text
-   Minimum 3:1 for large text
-   Minimum 3:1 for UI components

### Interactive Elements

-   Minimum 44x44px touch targets
-   Visible focus indicators
-   Keyboard navigation support
-   Clear hover states

### Typography

-   Line height: 1.5-1.75 for body text
-   Paragraph max-width: 65-75 characters
-   Sufficient spacing between interactive elements

---

## Animation & Motion

### Transitions

```css
Default: transition-all 200ms ease-in-out
Hover: 150-200ms
Complex: 300ms with easing
```

### Easing Functions

-   ease-in-out: Most UI transitions
-   ease-out: Entering elements
-   ease-in: Exiting elements

### Reduced Motion

-   Respect prefers-reduced-motion
-   Replace animations with instant state changes
-   Maintain functionality without animation

---

## Component Inventory

### Updated Components

1. **LandingPage.tsx**

    - Professional indigo/blue gradient scheme
    - Refined feature cards with subtle borders
    - Better spacing and typography hierarchy

2. **WeeklyTimeline.tsx**

    - Slate/blue background
    - Refined navigation buttons
    - Professional week badge

3. **MagicBar.tsx**

    - Indigo gradient scheme
    - Subtle shadows
    - Better placeholder text styling

4. **app/layout.tsx**

    - Inter font implementation
    - Display: swap for performance

5. **app/globals.css**
    - Updated font-sans to use Inter

---

## Design Rationale

### Why This Color Scheme?

-   **Indigo/Blue**: Professional, trustworthy, widely used in productivity tools
-   **Slate**: Neutral, modern, excellent contrast ratios
-   **Eliminated Pink**: Too playful for professional context
-   **Eliminated Purple (primary)**: Replaced with indigo for sophistication

### Why Inter Font?

-   Used by industry leaders (Linear, Vercel, GitHub)
-   Optimized for UI with excellent screen rendering
-   Better readability than geometric sans-serifs
-   Professional without being boring

### Why Subtle Interactions?

-   Professional tools prioritize function over flash
-   Subtle animations don't distract from work
-   Better performance and accessibility
-   Timeless aesthetic that ages well

---

## Implementation Checklist

-   [x] Update font to Inter
-   [x] Replace purple/pink gradients with indigo/slate
-   [x] Refine button styles and shadows
-   [x] Update card designs with subtle borders
-   [x] Improve hover states and transitions
-   [x] Update background gradients
-   [x] Standardize border radius
-   [x] Enhance spacing consistency
-   [x] Update Magic Bar styling
-   [x] Refine calendar dashboard colors

---

## Future Considerations

1. **Component Library**: Consider extracting reusable button/card variants
2. **Animation Library**: Implement Framer Motion for complex transitions
3. **Theme Tokens**: Move to CSS custom properties for easier theming
4. **Design Tokens**: Create JSON design token file for cross-platform use
5. **Accessibility Audit**: Run automated and manual accessibility tests

---

Built with attention to detail and user experience in mind.
