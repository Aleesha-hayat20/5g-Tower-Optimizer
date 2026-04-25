---
name: High-Energy Velocity System
colors:
  surface: '#fff9ef'
  surface-dim: '#e1d9c7'
  surface-bright: '#fff9ef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf3e0'
  surface-container: '#f6edda'
  surface-container-high: '#f0e7d5'
  surface-container-highest: '#eae2cf'
  on-surface: '#1f1b10'
  on-surface-variant: '#4d4732'
  inverse-surface: '#343024'
  inverse-on-surface: '#f9f0dd'
  outline: '#7e775f'
  outline-variant: '#d0c6ab'
  surface-tint: '#705d00'
  primary: '#705d00'
  on-primary: '#ffffff'
  primary-container: '#ffd700'
  on-primary-container: '#705e00'
  inverse-primary: '#e9c400'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#005ac2'
  on-tertiary: '#ffffff'
  tertiary-container: '#cbdaff'
  on-tertiary-container: '#005bc4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe16d'
  primary-fixed-dim: '#e9c400'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#544600'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#fff9ef'
  on-background: '#1f1b10'
  surface-variant: '#eae2cf'
typography:
  display-2xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

This design system is engineered for momentum, capturing the fast-paced essence of modern logistics and service-on-demand platforms. It targets a tech-forward demographic that values efficiency, speed, and a "premium-utilitarian" aesthetic. The interface must feel alive and responsive, moving away from static corporate layouts toward a more cinematic, app-like experience.

The visual style is a hybrid of **High-Contrast Bold** and **Subtle Glassmorphism**. We utilize massive, aggressive typography to communicate urgency and clarity, while soft, translucent layers provide the "premium" finish expected of modern SaaS. The goal is to evoke a sense of reliability paired with extreme agility—making the user feel like they are in the cockpit of a high-performance machine.

## Colors

The palette is built on a foundation of extreme contrast. 

- **Primary (Vibrant Yellow):** Used strategically for "High-Energy" touchpoints—primary actions, active states, and brand highlights. It should never be used for body text.
- **Secondary (Deep Charcoal):** The anchor of the system. Used for text, heavy iconography, and dark-mode-style components that need to stand out against the light base.
- **Accents:** Electric Blue is reserved for secondary informational cues and links, while Success Green handles positive feedback loops and "go" signals.
- **Base:** An off-white #F9FAFB background ensures the vibrant yellow doesn't cause eye strain while maintaining a clean, spacious environment.

## Typography

We use **Plus Jakarta Sans** for its friendly yet geometric precision. The hierarchy is intentionally dramatic. 

- **Display & Headlines:** Use ExtraBold (800) or Bold (700) with negative letter-spacing to create a "tight," impactful look. This mimics the visual language of high-speed transit and sports branding.
- **Body Text:** Set with generous line height for readability, using Medium (500) for emphasis within paragraphs to maintain the high-energy feel.
- **Labels:** Small labels use a slight tracking increase and uppercase transform when paired with the primary yellow background to ensure maximum legibility against the bright hue.

## Layout & Spacing

The system follows a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

We utilize a strict **4pt grid system** to maintain rhythmic consistency. Spacing between major sections should be aggressive (xl/2xl) to allow the bold typography and high-saturation elements room to breathe. Cards and content blocks should use 'lg' (24px) padding to accommodate the large corner radii without content feeling cramped.

## Elevation & Depth

Depth is achieved through **Subtle Glassmorphism** and **Layered Shadows**.

- **Shadows:** Avoid pure black. Use #111827 with low opacity (8-12%) and a high blur radius (30px+) for a "floating" effect.
- **Glassmorphism:** Navigation bars and floating action buttons (FABs) use a background blur (12px-20px) with a semi-transparent white fill (opacity 70-80%) and a 1px solid white border (opacity 20%) to simulate a frosted glass pane.
- **Tonal Layers:** Use the Primary Yellow as a highlight on the "top-most" layer only (e.g., a selected card's border or a primary button).

## Shapes

The shape language is defined by a **Rounded-2xl** standard.

- **Primary Cards & Modals:** Use a 24px corner radius to feel approachable and modern.
- **Buttons & Inputs:** Use a 16px corner radius. This slight differentiation helps buttons feel more distinct from the containers they sit within.
- **Icons:** Should follow a rounded-cap style, avoiding sharp 90-degree angles to match the container aesthetic.

## Components

- **Buttons:** Primary buttons use the #FFD700 background with #111827 text for maximum contrast. On hover, apply a subtle scale-up (1.02x) rather than a color change to maintain energy.
- **Cards:** White background with a soft, layered shadow and a 1px #E5E7EB border. For "Active" states, use a 2px #FFD700 border.
- **Input Fields:** Large, 16px rounded corners with #F3F4F6 fills. On focus, the border shifts to #111827 with a soft glow.
- **Chips/Badges:** Use "Pill-shaped" (32px radius) with electric blue or success green backgrounds at 10% opacity, featuring high-saturation text of the same color.
- **Floating Action Buttons (FAB):** Circular or large-rounded shapes, always using the Primary Yellow #FFD700 to signify the most important action on the screen.
- **Progress Indicators:** Use thick, 8px rounded bars. The background track should be #E5E7EB, with the active progress in Primary Yellow or Success Green.