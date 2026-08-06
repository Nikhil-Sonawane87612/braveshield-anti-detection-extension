# Design Engine

A god-level UI/UX design skill that handles any design request and produces work that looks human-crafted, never AI-generated. Synthesized from 18+ professional design skills, real-world extension teardowns (1Password, Bitwarden, Grammarly, uBlock Origin), and 2025-2026 design system analysis.

---

## THE ONE LAW THAT MATTERS MOST

**The "One Choice Per Axis" Coherence Law:**

The biggest reason a UI reads as "AI-generated" is not ugly parts — it is *mixed* parts. Every axis below must use ONE value system-wide. A mix is a real issue, not a nitpick.

| Axis | Rule |
|------|------|
| Radius | One personality: sharp (0-4px) OR soft (8-12px) OR pill. No mixing. |
| Accent color | One interactive accent + semantic red/green. No competing hues. |
| Shadow language | Same light direction, same scale/tint. Not some black + some tinted. |
| Icon family | One set, same stroke weight, same size. Not mixed families. |
| Control height | Buttons, inputs, selects share one height (36px or 40px). |
| Spacing grid | All values multiples of 4px. No arbitrary numbers. |
| Font weights | Max 2 weights across entire UI. Not 3+ competing. |

---

## PART 1: THE ANTI-AI CHECKLIST

These are the telltale signs of AI-generated UI. If ANY are present, the design fails:

### Visual Tells
- [ ] Emoji used as UI icons (inject uncontrolled hues)
- [ ] Multiple radius personalities (sharp cards + pill buttons)
- [ ] Two+ competing accent colors (not one accent + semantic)
- [ ] Decorative color usage (stars, dots, avatars in different hues)
- [ ] Gradient backgrounds on large surfaces
- [ ] Glow effects or neon shadows
- [ ] Heavy default shadows (shadow-md, shadow-lg, shadow-xl)
- [ ] Mixed icon families / fill modes / stroke weights
- [ ] Primary colored backgrounds for sections (bright blue hero)

### Typography Tells
- [ ] More than 2 font weights
- [ ] Font sizes below 13px
- [ ] Inconsistent font families within one view
- [ ] Generic placeholder content ("John Doe", "Acme Corp", "Lorem")
- [ ] AI copywriting cliches ("Elevate", "Seamless", "Unleash", "Next-Gen")
- [ ] No letter-spacing on headings

### Layout Tells
- [ ] Mixed control heights (different button sizes)
- [ ] Inconsistent spacing (some 12px, some 15px, some 20px)
- [ ] No outer padding (content touching popup edges)
- [ ] Competing CTAs of equal visual weight
- [ ] Multi-level navigation in a popup
- [ ] Required scroll on default view

### Interaction Tells
- [ ] No cursor-pointer on clickable elements
- [ ] No hover feedback
- [ ] Instant state changes (no transitions)
- [ ] No focus-visible states
- [ ] Transition: all (instead of specific properties)

---

## PART 2: EXTENSION-SPECIFIC CONSTRAINTS

### Popup Dimensions
| Property | Value | Notes |
|----------|-------|-------|
| Width | 360-400px | Sweet spot used by 1Password, Grammarly |
| Height | 400-520px | Max 600px (browser enforced) |
| Outer padding | 16px | Non-negotiable. Nothing touches the frame. |
| Min body width | Set explicitly | Never use width: 100% on body |

### Technical Constraints (MV3)
- No persistent JS runtime — every open is fresh
- No inline scripts — CSP 'self' only
- No localStorage — use chrome.storage.local
- No window.resizeTo() — CSS only
- Content scripts: use Shadow DOM for style isolation

### The 3-Zone Popup Layout
`
TOP:     Orientation (logo, name, status)
MIDDLE:  Core action (the thing you opened popup to do)
BOTTOM:  Secondary (settings link, version)
`

### Navigation Limits
| Setting Count | Surface |
|---------------|---------|
| 1-3 quick toggles | Popup only |
| 4+ settings | Full options page |
| Mix of quick + deep | Popup for top 2-3, link to options |

---

## PART 3: COLOR SYSTEM

### Dark Mode (Preferred for Extensions)

#### Surface Stack (Depth Without Borders)
| Level | Color | Usage |
|-------|-------|-------|
| Base | #121212 | Page background (NOT #000000) |
| Surface | #1E1E1E | Cards, elevated elements |
| Surface variant | #2C2C2C | Secondary surfaces |
| Border | rgba(255,255,255,0.08) | Dividers, card edges |
| On-surface | #E0E0E0 | Primary text |
| Muted | #9E9E9E | Secondary text |
| Disabled | #616161 | Inactive elements |

#### Why #121212 Not #000000
Pure black causes "halation" on OLED — high-contrast edges bloom. Material Design has used #121212 since 2019. Reserve true black for small UI elements only.

#### Accent Color Rules
- ONE accent color for interactive elements only
- Desaturate slightly in dark mode (full saturation is harsh)
- Semantic colors: success (#4CAF50), warning (#FF9800), error (#F44336), info (#2196F3)
- Status color = severity, not decoration. Normal state is neutral grey.

#### Text Hierarchy (Opacity, Not Color)
| Level | Color | Opacity |
|-------|-------|---------|
| Primary | #E0E0E0 | 100% |
| Secondary | #E0E0E0 | 70% |
| Disabled | #E0E0E0 | 40% |

### Light Mode

| Level | Color |
|-------|-------|
| Base | #FFFFFF or #F9F9F8 |
| Surface | #FFFFFF |
| Border | #E8E8E8 or rgba(0,0,0,0.06) |
| Primary text | #111111 (never #000000) |
| Secondary text | #6B7280 |
| Disabled | #9CA3AF |

### Accent Colors (Desaturated Pastels Only)
| Accent | Background | Text |
|--------|-----------|------|
| Info | #E1F3FE | #1F6C9F |
| Success | #EDF3EC | #346538 |
| Warning | #FBF3DB | #956400 |
| Error | #FDEBEC | #9F2F2D |

---

## PART 4: TYPOGRAPHY

### Font Selection
- **Popup/Extension UI:** system-ui, -apple-system, 'Segoe UI', sans-serif — matches browser native
- **Editorial/Marketing:** Custom brand fonts (SF Pro Display, Geist Sans)
- **Monospace/Data:** Geist Mono, 'SF Mono', 'JetBrains Mono', monospace
- **BANNED for minimalist/editorial:** Inter, Roboto, Open Sans (they scream "default")

### The Three-Size Hierarchy
| Role | Size | Weight | Letter Spacing | Usage |
|------|------|--------|----------------|-------|
| Primary | 14-16px | 600 | -0.01em | What user sees first |
| Body | 13-14px | 400 | normal | Secondary info, hints |
| UI Chrome | 11-12px | 500-600 | +0.05em uppercase | Section labels, captions |

### Rules
- Never go below 13px (Chrome renders inconsistently)
- Max 2 font weights (400 + 600 or 400 + 700)
- Negative letter-spacing on headings: -0.01em to -0.02em
- Section labels: 11px, uppercase, letter-spacing: 0.05em
- Body line-height: 1.5-1.6
- Headings: text-balance, no line-height: 1.5
- Numbers/data: font-variant-numeric: tabular-nums
- Ellipsis: Use ... not three periods

---

## PART 5: SPACING SYSTEM

### The 4px Grid
All spacing values must be multiples of 4px:
`
4px   — Between closely related sub-elements
8px   — Between related elements (label + input, icon + text)
12px  — Between items in a list
16px  — Outer padding from edge to content (NON-NEGOTIABLE)
20px  — Between unrelated groups
24px  — Major section breaks
32px  — Page-level spacing
`

### The Golden Rule
**16px outer padding.** Nothing touches the frame. This single rule separates premium from amateur.

### Extension-Specific Spacing
| Element | Spacing |
|---------|---------|
| Outer padding | 16-20px |
| Between unrelated groups | 16-24px |
| Between related elements | 6-10px |
| List item height | 40-48px |
| Button padding | 8px vertical, 16px horizontal |
| Card padding | 16-24px |
| Section gap (options page) | 24-32px |

### Density Calibration
| Quality | Reads As |
|---------|----------|
| Tight (elements close to edges) | Cheap, rushed |
| Comfortable (each element has territory) | Considered, intentional |

---

## PART 6: COMPONENT PATTERNS

### Cards
`
border: 1px solid rgba(255,255,255,0.08)  /* dark */
border: 1px solid #E8E8E8                  /* light */
border-radius: 8px (max 12px)
padding: 16px
No box-shadow (borders do the work)
`

### Buttons
`
Primary:   bg #E5E5E5, text #111, border-radius 6px, padding 8px 16px
Secondary: bg transparent, border 1px solid rgba(255,255,255,0.08), text #9E9E9E
Hover:     bg shifts to #D4D4D4 (primary) or #2C2C2C (secondary)
Active:    scale(0.98) acceptable
Disabled:  opacity 0.5, cursor not-allowed
`

### Toggle Switches
`
Width: 36px, Height: 20px
Off:     bg #333, thumb #777
On:      bg #E5E5E5, thumb #111
Transition: background-color 150ms ease, transform 150ms ease
Use role="switch" not role="checkbox"
`

### Inputs
`
Height: 36-40px
Padding: 8px 12px
Border: 1px solid rgba(255,255,255,0.08)
Border-radius: 6px
Focus: outline: 2px solid #E5E5E5, outline-offset: 1px (NEVER outline: none)
`

### Section Labels
`
Font-size: 11px
Font-weight: 600
Text-transform: uppercase
Letter-spacing: 0.05em
Color: #9E9E9E (dark) or #6B7280 (light)
`

---

## PART 7: INTERACTION DESIGN

### Transitions
| Type | Duration | Easing |
|------|----------|--------|
| Hover/color | 150ms | ease |
| Toggle switch | 150ms | ease |
| Focus ring | 100ms | ease |
| Page transition | 200ms | ease |
| Max allowed | 300ms | — |

### Rules
- NEVER use transition: all — list specific properties
- Animate only transform and opacity (never width, height, top, left)
- Hover feedback on ALL clickable elements (cursor: pointer)
- Focus-visible ring on ALL interactive elements
- Button press: scale(0.98) is acceptable

### Button States (Every Button Must Have All)
1. Default — resting state
2. Hover — visual feedback (color shift)
3. Active/Pressed — scale(0.98) or darken
4. Loading — spinner or text change
5. Success — brief confirmation
6. Disabled — opacity 0.5

---

## PART 8: DARK MODE IMPLEMENTATION

### Architecture
1. CSS custom properties for ALL colors — no hardcoded values
2. color-scheme: dark on root element (fixes scrollbar, inputs)
3. System detection: prefers-color-scheme media query
4. User preference: chrome.storage.sync (cross-device)
5. Three-way toggle: System / Light / Dark

### Surface Hierarchy (Depth Without Shadows)
`
Level 0: #121212 — Base background
Level 1: #1E1E1E — Cards, panels
Level 2: #2C2C2C — Elevated surfaces
Level 3: #383838 — Modals, dropdowns
`

### Border Strategy
Use barely-visible borders for separation:
`
border: 1px solid rgba(255,255,255,0.08)
`
This does the work that shadows do in light mode.

### Color Adjustments
- Desaturate primary accent in dark mode
- Use opacity for text hierarchy (not different colors)
- Reserve true black (#000000) for small elements only
- Test on OLED screens — halation is real

---

## PART 9: ACCESSIBILITY

### Critical Rules
| Rule | Value |
|------|-------|
| Color contrast (normal text) | 4.5:1 minimum |
| Color contrast (large text) | 3:1 minimum |
| Touch target | 36x36px min (44x44px ideal) |
| Focus ring | 2px solid, visible on all interactive |
| Keyboard navigation | All elements reachable |
| Semantic HTML | button for actions, a for navigation |
| Alt text | Required on all images |
| aria-label | Required on icon-only buttons |
| prefers-reduced-motion | Must be respected |

### Reduced Motion CSS
`css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`

---

## PART 10: ICON SYSTEM

### Rules
- ONE icon set throughout (Lucide, Heroicons, or custom SVG)
- All icons: same stroke weight (2px), same size (16px or 20px)
- Icon color matches text color by default
- Colored only for semantic meaning (success green, error red)
- Icon-only buttons MUST have aria-label
- Use SVG, never emoji, never icon fonts
- Consistent viewBox: 0 0 24 24

---

## PART 11: LAYOUT PATTERNS

### Popup (360-400px)
`
+------------------------------------------+
| TOP: Brand + Status                      |
+------------------------------------------+
| STATS: 3-column grid (if needed)         |
+------------------------------------------+
| PRIMARY: Main action / toggle            |
+------------------------------------------+
| SECTIONS: Organized toggle rows          |
+------------------------------------------+
| BOTTOM: Navigation link + version        |
+------------------------------------------+
`

### Options Page (Full Width)
`
+------------------------------------------+
| HEADER: Brand + Title                    |
+------------------------------------------+
| TABS: 3-5 tab navigation                |
+------------------------------------------+
| CONTENT: 2-column card grid             |
|   Card: Section title + toggle rows     |
|   Card: Section title + toggle rows     |
+------------------------------------------+
| ACTIONS: Save button + feedback          |
+------------------------------------------+
`

### Making Small Popups Feel Spacious
1. 16px outer padding (non-negotiable)
2. One primary action per view
3. Progressive disclosure (hide complexity)
4. Three-size typography hierarchy
5. Border-subtle separators (not heavy backgrounds)
6. Breathing room around the primary CTA
7. Muted colors for secondary content

---

## PART 12: PERFORMANCE

### Popup Performance Rules
- First paint under 100ms
- Show skeleton state immediately in HTML
- Hydrate from chrome.storage on DOMContentLoaded
- Lazy-load heavy content
- CSS under 50KB uncompressed
- No render-blocking resources
- Bundle with Vite for smallest output

### Anti-Patterns
- Blank screen while loading (use skeleton)
- Spinner-only (show structure + spinner)
- Loading everything upfront (lazy-load)
- External font loading (bundle locally)

---

## PART 13: CONTENT & COPY

### Writing Rules
- Active voice: "Block this site" not "This site will be blocked"
- Specific labels: "Save API Key" not "Continue"
- Numerals for counts: "8 deployments" not "eight"
- Sentence case for labels and links
- No AI cliches: Elevate, Seamless, Unleash, Next-Gen, Game-changer
- No generic placeholders: Use realistic demo data
- Error messages include fix/next step
- Button labels describe action: "Whitelist Site" not "Whitelist"

### Empty States
NEVER show: "No items found"
Instead show:
- Contextual message
- Opportunity: "No sites bypassed yet. Visit a site to start."
- Primary CTA

---

## PART 14: PRE-DELIVERY CHECKLIST

### Visual
- [ ] One radius personality system-wide
- [ ] One accent color system-wide
- [ ] One shadow language system-wide
- [ ] One icon family, same stroke weight
- [ ] No emojis as icons
- [ ] No gradients on surfaces
- [ ] No glow effects
- [ ] No decorative color usage

### Typography
- [ ] system-ui or one clean font
- [ ] Max 2 font weights
- [ ] 3 distinct sizes with clear hierarchy
- [ ] Letter-spacing on headings (-0.01em)
- [ ] Section labels 11px uppercase +0.05em
- [ ] Nothing below 13px
- [ ] tabular-nums on data

### Spacing
- [ ] 16px outer padding
- [ ] All values multiples of 4px
- [ ] Consistent gaps between same-type elements
- [ ] 40-48px list item height
- [ ] Comfortable density (not cramped)

### Interaction
- [ ] cursor: pointer on ALL clickable elements
- [ ] Hover feedback on ALL interactive elements
- [ ] Focus-visible ring on ALL form controls
- [ ] 150ms transitions (specific properties)
- [ ] No transition: all
- [ ] Button has all 6 states

### Dark Mode
- [ ] #121212 base (not #000000)
- [ ] Surface hierarchy via luminance
- [ ] Desaturated accent
- [ ] Borders at rgba(255,255,255,0.08)
- [ ] color-scheme: dark on root
- [ ] Tested on OLED

### Accessibility
- [ ] 4.5:1 contrast on text
- [ ] 36px+ touch targets
- [ ] Semantic HTML (button, a, nav)
- [ ] aria-label on icon buttons
- [ ] prefers-reduced-motion respected
- [ ] No hover-only interactions

### Content
- [ ] Active voice
- [ ] Specific button labels
- [ ] No AI cliches
- [ ] Error messages with recovery
- [ ] Meaningful empty states

---

## PART 15: DESIGN SYSTEM TOKENS

### CSS Custom Properties Template
`css
:root {
  /* Surface */
  --bg-base: #121212;
  --bg-surface: #1E1E1E;
  --bg-elevated: #2C2C2C;
  --bg-hover: #333333;
  
  /* Border */
  --border: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.15);
  
  /* Text */
  --text-primary: #E0E0E0;
  --text-secondary: rgba(224,224,224,0.7);
  --text-disabled: rgba(224,224,224,0.4);
  
  /* Accent */
  --accent: #E5E5E5;
  --accent-hover: #D4D4D4;
  
  /* Semantic */
  --success: #4CAF50;
  --warning: #FF9800;
  --error: #F44336;
  --info: #2196F3;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  
  /* Typography */
  --font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', monospace;
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 13px;
  --text-lg: 14px;
  --text-xl: 16px;
  
  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --ease: ease;
}
`

---

## USAGE

This skill triggers on:
- Designing or redesigning any UI (popup, options page, full web app)
- Creating CSS/HTML for browser extensions
- Building dark mode interfaces
- Setting up a design system or token architecture
- Reviewing UI for "vibe-coded" tells
- Building accessible interfaces
- Creating component libraries

The skill produces designs that look like they were built by a product team that ships, not by someone who finished a tutorial.
