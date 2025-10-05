# Optomall.uz — Mobile Design Style Guide

This file documents the visual design, tokens and effects used across the Optomall UI (mobile-first, Expo/React Native-ready styling concepts). Use it as a single source of truth for styling, component appearance and recommended usage.

## Overview
- Platform: Mobile-first responsive (max width ~420–448px, uses max-w-md container in site layout)
- Visual style: Hi‑tech glassmorphism, soft matte surfaces, subtle shadows, minimalistic & futuristic
- Modes: Light and Dark using the `.dark` root class
- Fonts: Geometric sans type — Inter for body, Poppins for headings (imported from Google Fonts)

## Color tokens (CSS vars, used with `hsl(var(--...))` in Tailwind)
Keep using HSL CSS variables; Tailwind config expects HSL-format variables.

Light mode (defined on `:root`):
- --background: 30 20% 98% (page background — very soft neutral)
- --foreground: 222 20% 12% (primary text color)
- --card: 0 0% 100% (card surface)
- --muted: 210 30% 94% (muted surfaces)
- --primary: 210 90% 62% (mint/soft blue primary)
- --accent: 195 85% 68% (soft complementary accent)
- --border / --input / --ring — used for 1px borders, inputs and focus rings
- --metal / --glow — extras for metallic highlights and neon glow accents

Dark mode (defined under `.dark`):
- --background: 220 28% 6% (deep gray/black background)
- --foreground: 210 30% 96% (light text)
- --card: 220 18% 8% (card surface in dark)
- --primary / --accent — pastel highlights, more saturated for glow
- --ring and --glow — used to create soft glowing UI elements in dark mode

## Typography
- Base font-family: `Inter, Poppins, ui-sans-serif, system-ui` (Inter for normal text; use Poppins for headings for more personality)
- Sizes: mobile-friendly scale (base 14���16px body, 18–24px headings depending on hierarchy)
- Line-height: comfortable reading (20–28px for body)

## Components & Patterns
All components aim for simplified shapes, rounded corners and glass-like surfaces.

GlassCard (reusable):
- Base: `.glass-panel` utility
- CSS: `backdrop-blur-xl; background: rgba(white, 0.6) in light; rgba(white, 0.08) in dark; border: 1px solid rgba(white,0.35)`
- Rounded corners: `--radius` (0.75rem)
- Use for hero banners, product cards, list cells and floating UI

Neon / Matte surfaces:
- `.neon-card`: layered radial gradients for subtle colorful highlights, plus a faint metallic border
- `.matte-surface`: gentle linear gradient for flat surfaces

Buttons:
- Primary: `bg-primary` with `text-primary-foreground`, rounded-xl, subtle shadow, small scale press animation
- Secondary: translucent white/dark panels with 1px border
- Tap/hover effects: scale down slightly on press, shadow reduces; `:active { transform: translateY(1px) }`

Chips
- Compact rounded pills used for filters; use `.chip` utility
- Slight backdrop blur and border, subtle hover ring

Bottom navigation
- Floating glass container centered horizontally, rounded-2xl, shadow + slight glow when active

Cards & Images
- Product cards use glass panel + inset decorative gradient block for product artwork
- Images: use cropped, cover mode (object-fit: cover). Prefer `aspect-ratio` ~1.4 for featured project tiles
- Use responsive srcset for web to optimize performance; in mobile / RN use appropriately sized assets or progressive loading

## Shadows, Glow & Motion
- Soft shadows: `soft-shadow` utility -> `box-shadow: 0 10px 30px rgba(0,0,0,0.06)`
- Glow ring: `.glow-ring` -> `0 0 0 6px hsla(var(--glow), 0.15), 0 0 30px hsla(var(--glow), 0.25)` for active/focused elements
- Use `backdrop-blur-xl` to produce glass effect
- Animations: subtle fade/slide transitions; avoid heavy parallax or large motion on mobile

## Tailwind tokens & conventions
- Tailwind reads color variables from `tailwind.config.ts` pointing to `hsl(var(--...))`
- Avoid hardcoded hex colors — add token to `:root` and reference via Tailwind config when needed
- borderRadius uses `--radius` (lg/md/sm tokens in config)

## Accessibility
- Maintain minimum contrast for body text in both modes (test with tools)
- Ensure interactive controls have at least 44x44px touch target where appropriate
- Provide `aria-label` and semantic attributes for buttons and navigation items
- Provide `alt` text for images (or accessibilityLabel in RN)

## Images & Assets
- For web: use `srcset` with multiple widths and `loading="lazy"` for non-critical images
- For RN/Expo: use appropriately-downsampled assets and local caching (expo-asset, FastImage or similar)

## How to add or extend styles
1. Add CSS vars to `client/global.css` inside `:root` or `.dark` with HSL values
2. Extend `tailwind.config.ts` tokens only if needed (colors reference vars already)
3. Create component utilities in `client/global.css` under `@layer components {}`

## Examples (usage snippets)
Glass panel (Tailwind + utility class):
```html
<div class="glass-panel rounded-2xl p-4"> ... </div>
```
Featured tile image (web):
```html
<img loading="lazy" src="/assets/featured.jpg" srcset="..." style="aspect-ratio:1.42;object-fit:cover;width:100%;" />
```
Theme toggle (persisted): toggle `.dark` class on `document.documentElement` and store in `localStorage.theme`

## Files to inspect / update
- `client/global.css` — tokens, utilities, glass panel
- `tailwind.config.ts` — tokens mapping
- `client/components/GlassCard.tsx` — base container
- `client/components/Layout.tsx` — header, search and theme toggle
- `client/pages/Index.tsx` — examples of hero, featured and product tiles

## Notes / Best practices
- Keep image aspect and token formats consistent (HSL vars). Mixing formats (e.g. RGB var vs HSL usage) causes color mismatch
- Prefer Supabase or Builder CMS for image/content management; connect via MCP popover when you want in-app content editing

---
Generated: Summary of styles and effects used in the current project.
