---
name: Station Modern
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#003272'
  on-tertiary: '#ffffff'
  tertiary-container: '#00489e'
  on-tertiary-container: '#9cbbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  h1:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
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
  xl: 32px
  xxl: 48px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style
The brand personality is rooted in reliability, efficiency, and clarity. It evokes the organized precision of a modern transit hub, where information is accessible and services are professional. This design system adopts a **Corporate / Modern** style with a focus on high-contrast readability and utilitarian elegance. 

The aesthetic prioritizes trust through structured layouts while maintaining a contemporary feel via subtle depth and generous whitespace. The interface should feel like a premium digital concierge: prompt, dependable, and easy to navigate under the pressure of travel.

## Colors
The palette is dominated by **Railway Blue**, a deep, authoritative navy that anchors the brand in dependability. This is paired with **Alert Gold** for secondary actions and critical highlights, ensuring high visibility for call-to-action buttons. 

- **Primary:** Used for headers, primary buttons, and active navigation states.
- **Secondary:** Reserved for highlighting status changes, primary CTAs, and attention-grabbing accents.
- **System States:** High-saturation Green, Yellow, and Red are used exclusively for status indicators and real-time validation feedback.
- **Neutrals:** A range of Slate grays provides a sophisticated backdrop, ensuring the primary blue remains the focal point.

## Typography
This design system utilizes **Inter** for its exceptional legibility and systematic feel. The typography is designed for rapid scanning, essential for users in busy environments.

- **Headlines:** Feature tight letter-spacing and bold weights to command attention.
- **Body Text:** Optimized for readability with generous line heights.
- **Labels:** Used for micro-copy and status badges, often utilizing semi-bold or bold weights to differentiate from body content.
- **Numeric Data:** Should utilize tabular figures where possible to ensure alignment in pricing and ID displays.

## Layout & Spacing
The layout follows a **fluid grid** model with a base-8 rhythm to ensure consistency across mobile and desktop views. 

- **Margins:** Standard mobile views use a 20px safe area on the sides.
- **Whitespace:** Emphasize "Plenty of Space." Use `xxl` (48px) spacing between major sections to prevent visual clutter.
- **Alignment:** All form elements and cards must align to the vertical rhythm of the grid.
- **Density:** Maintain a "Comfortable" density setting, avoiding cramped lists or small touch targets.

## Elevation & Depth
Hierarchy is established through **Ambient Shadows** and **Glassmorphism**. 

- **Surfaces:** Use high-diffusion, low-opacity shadows (e.g., 8% opacity black with a 20px blur) to make cards "float" above the background.
- **Modals:** All overlay components must use a `backdrop-filter: blur(12px)` with a semi-transparent white tint (80% opacity) to maintain context while focusing user attention.
- **Interactive States:** On hover or tap, elements should slightly increase their shadow spread to simulate physical lifting.

## Shapes
The shape language is friendly yet structured. 

- **Cards and Containers:** Use `rounded-lg` (1rem) as the standard for secondary containers and `rounded-xl` (1.5rem) for primary cards and main content areas.
- **Interactive Elements:** Buttons and inputs follow the `rounded-lg` standard.
- **Status Badges:** These must be fully pill-shaped (rounded-full) to clearly distinguish them from actionable buttons or input fields.

## Components
Consistent component behavior ensures a seamless hiring experience.

- **Buttons:** Primary buttons use Railway Blue with white text. Secondary actions use the Alert Orange. Always include a 2px focused state ring for accessibility.
- **Status Badges:** Pill-shaped with a subtle background tint (10% opacity of the color) and high-contrast text for 'Available' (Green), 'In-Transit' (Yellow), and 'Busy' (Red).
- **Form Inputs:** Modern, border-less bottom line or subtle outline. On focus, the border shifts to Railway Blue. Real-time validation uses inline icons: a green check for valid data or a red warning for errors, accompanied by helper text.
- **Modals:** Floating, centered cards with significant `rounded-xl` corners and a heavy backdrop blur.
- **Lists:** Service provider lists should feature large profile avatars and clear, high-contrast labels for ratings and pricing.