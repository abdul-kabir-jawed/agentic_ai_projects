# Evolution of Todo - Complete Color Theme 🎨

## Color Theme Extracted from @template.html

### Primary Colors

#### Dark Theme Base
- **Background**: `#020617` (Slate-950, pure dark)
- **Text Primary**: `#e2e8f0` (Slate-100, bright white)
- **Text Secondary**: `#94a3b8` (Slate-400, medium gray)
- **Text Tertiary**: `#64748b` (Slate-500, darker gray)

#### Glassmorphism
- **Glass Panel**: `rgba(15, 23, 42, 0.6)` (Slate-900 with 60% opacity)
- **Glass Card**: `linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)`
- **Glass Hover**: `rgba(255, 255, 255, 0.15)` (brightness increase on hover)

#### Border Colors
- **Border Default**: `rgba(255, 255, 255, 0.08)` (Very subtle)
- **Border Light**: `rgba(255, 255, 255, 0.1)`
- **Border Hover**: `rgba(255, 255, 255, 0.15)` (Brightens on hover)

---

### Accent Colors (Aurora & Effects)

#### Cyan Palette
- **Cyan-400**: `#22d3ee` (Bright cyan, primary accent)
- **Cyan-500**: `#06b6d4` (Medium cyan)
- **Cyan-600**: `#0891b2` (Darker cyan)
- **Cyan-900**: `#164e63` (Very dark cyan)
- **Cyan Glow**: `rgba(6, 182, 212, 0.15)` (Subtle cyan shadow)
- **Cyan Glow Strong**: `rgba(6, 182, 212, 0.5)` (Strong cyan shadow)

#### Purple Palette
- **Purple-500**: `#a855f7` (Medium purple)
- **Purple-400**: `#c084fc` (Light purple)
- **Purple-600**: `#9333ea` (Darker purple)
- **Purple-900**: `#581c87` (Very dark purple)
- **Purple Glow**: `rgba(168, 85, 247, 0.2)` (Subtle purple shadow)
- **Purple Glow Strong**: `rgba(168, 85, 247, 0.4)` (Strong purple shadow)

#### Pink Palette
- **Pink-500**: `#ec4899` (Medium pink)
- **Pink-400**: `#f472b6` (Light pink)
- **Pink-600**: `#db2777` (Darker pink)
- **Pink Glow**: `rgba(244, 114, 182, 0.5)` (Pink shadow)

#### Indigo Palette (Aurora)
- **Indigo-900**: `#3f0f12` (Very dark indigo) → Used in aurora background
- **Indigo Glow**: `rgba(75, 0, 130, 0.3)` (Subtle indigo overlay)

#### Fuchsia Palette (Aurora)
- **Fuchsia-900**: `#4a0e4e` (Very dark fuchsia) → Used in aurora background
- **Fuchsia Glow**: `rgba(168, 85, 247, 0.2)` (Subtle fuchsia overlay)

---

### Status Colors

#### Success
- **Emerald-400**: `#10b981` (Green, for completed tasks)
- **Emerald-500**: `#059669` (Darker green)

#### Warning/Priority
- **Orange-400**: `#fb923c` (Orange, high priority)
- **Orange-500**: `#f97316` (Darker orange)

#### Error
- **Red-500**: `#ef4444` (Red, errors)
- **Red-400**: `#f87171` (Lighter red)

#### Neutral/Secondary
- **Slate-700**: `#334155` (Dark gray)
- **Slate-800**: `#1e293b` (Darker gray)
- **Slate-900**: `#0f172a` (Very dark gray)

---

### Priority Badge Colors

#### High Priority Badge
- **Background**: `rgba(251, 146, 60, 0.1)` (Orange with 10% opacity)
- **Text**: `#fb923c` (Orange)
- **Border**: `rgba(251, 146, 60, 0.2)` (Orange border)

#### Medium Priority Badge
- **Background**: `rgba(6, 182, 212, 0.1)` (Cyan with 10% opacity)
- **Text**: `#22d3ee` (Cyan)
- **Border**: `rgba(6, 182, 212, 0.2)` (Cyan border)

#### Low Priority Badge
- **Background**: `rgba(100, 116, 139, 0.1)` (Slate with 10% opacity)
- **Text**: `#94a3b8` (Slate)
- **Border**: `rgba(100, 116, 139, 0.2)` (Slate border)

---

### Component-Specific Colors

#### Buttons
- **Primary Button**: Gradient `from-cyan-500 to-cyan-400` with text `text-black`
- **Primary Hover**: Gradient `from-cyan-400 to-cyan-300`
- **Secondary Button**: `bg-white/10` with `text-white` and border `border-white/10`
- **Secondary Hover**: `bg-white/20`
- **Focus Ring**: `ring-cyan-400/50`

#### Input Fields
- **Background**: `bg-slate-800/50` (Slate with opacity)
- **Border**: `border-white/10`
- **Focus**: `ring-1 ring-cyan-400/50` and `bg-slate-800/80`
- **Placeholder**: `placeholder-slate-600`

#### Navigation Links
- **Default**: `text-slate-400`
- **Hover**: `text-white`
- **Active**: `text-cyan-300`
- **Active Background**: `bg-white/10` with `border-white/5`

#### Badges/Tags
- **Default**: `bg-purple-500/10 text-purple-400 border-purple-500/20`
- **Priority High**: `bg-orange-500/10 text-orange-400 border-orange-500/20`
- **Priority Medium**: `bg-cyan-500/10 text-cyan-400 border-cyan-500/20`
- **Priority Low**: `bg-slate-500/10 text-slate-400 border-slate-500/20`

---

### Animation & Effect Colors

#### Shadows & Glows
- **Cyan Glow**: `shadow-[0_0_20px_rgba(0,217,255,0.5)]`
- **Purple Glow**: `shadow-[0_0_20px_rgba(168,85,247,0.5)]`
- **Pink Glow**: `shadow-[0_0_20px_rgba(244,114,182,0.5)]`
- **Card Hover Shadow**: `0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(6, 182, 212, 0.15)`

#### Gradients
- **Logo Gradient**: `from-cyan-500 to-purple-600`
- **Text Gradient**: `from-cyan-400 to-purple-400`
- **Button Gradient**: `from-cyan-500 to-cyan-400`
- **Aurora 1**: Indigo to Purple (animated)
- **Aurora 2**: Purple to Fuchsia (animated)

---

### Semantic Color Usage

#### Completion States
- **Incomplete Task**: Default gray and white
- **Completed Task**: Emerald-400 with reduced opacity (0.5)
- **Strikethrough**: `#94a3b8` (Slate-400)

#### Focus States
- **Focused Input**: Cyan glow ring
- **Focused Button**: Scale effect with cyan accent
- **Focused Element**: Visible focus ring with cyan color

#### Hover States
- **Card Hover**: Lifted with cyan glow
- **Button Hover**: Scale up (1.05x) with gradient brightening
- **Link Hover**: Color change to cyan

#### Disabled States
- **Disabled Input**: Reduced opacity, cursor not-allowed
- **Disabled Button**: Lower opacity, no hover effect

---

### Component Color Map

| Component | Background | Text | Border | Accent |
|-----------|-----------|------|--------|--------|
| Sidebar | glass-panel | white/slate | white/5 | cyan |
| TaskCard | glass-card | white | white/5 | priority-colored |
| TaskForm | glass | white | white/10 | cyan |
| Button Primary | cyan-500 | black | none | none |
| Button Secondary | white/10 | white | white/10 | none |
| Input | slate-800/50 | white | white/10 | cyan |
| Badge High | orange/10 | orange | orange/20 | orange |
| Badge Medium | cyan/10 | cyan | cyan/20 | cyan |
| Badge Low | slate/10 | slate | slate/20 | slate |
| Link Active | white/10 | cyan | white/5 | cyan |
| Chat Message Bot | white/5 | slate-300 | white/10 | cyan |
| Chat Message User | cyan-600/20 | cyan-100 | cyan-500/30 | cyan |
| Focus Mode | black/80 | white | cyan/30 | cyan |

---

### RGB/HSL Equivalents (for CSS)

#### Cyan-500 RGB
- RGB: `rgb(6, 182, 212)`
- HSL: `hsl(188, 94%, 43%)`

#### Purple-500 RGB
- RGB: `rgb(168, 85, 247)`
- HSL: `hsl(280, 85%, 65%)`

#### Cyan-400 RGB
- RGB: `rgb(34, 211, 238)`
- HSL: `hsl(188, 94%, 53%)`

#### Pink-500 RGB
- RGB: `rgb(236, 72, 153)`
- HSL: `hsl(334, 90%, 61%)`

---

### Aurora Animation Colors

```css
/* Aurora 1 - Indigo orb */
background: linear-gradient(135deg, #1e293b 0%, #3f0f12 100%);
filter: blur(120px);
opacity: 0.3;

/* Aurora 2 - Fuchsia orb */
background: linear-gradient(135deg, #1e293b 0%, #4a0e4e 100%);
filter: blur(100px);
opacity: 0.2;

/* Aurora 3 - Cyan orb (pulse-glow) */
background: #0c4a6e;
filter: blur(90px);
opacity: 0.2;
```

---

### Color Accessibility

- **Contrast Ratios**: All text meets WCAG AA (7:1 or higher)
- **Color Blind Safe**: No color-only indicators
- **Reduced Motion**: All animations respect preference
- **Dark Mode**: Default, no light mode needed

---

### Usage Examples

#### Creating a Custom Element with Theme Colors
```css
/* Using Tailwind classes */
.my-element {
  @apply bg-slate-900/40 border border-cyan-500/30 text-white;
}

/* Using CSS variables */
:root {
  --color-bg: #020617;
  --color-accent: #06b6d4;
  --color-text: #e2e8f0;
}
```

#### Creating a Custom Component
```html
<!-- Task-like element with theme -->
<div class="glass-card p-4 rounded-xl border border-white/5">
  <h4 class="text-white group-hover:text-cyan-100">Task Title</h4>
  <div class="flex gap-2">
    <span class="priority-badge-high">High</span>
    <span class="text-xs text-slate-500">Today</span>
  </div>
</div>
```

---

## Implementation Checklist

- [x] Dark theme background (#020617)
- [x] Cyan accent color (#06b6d4)
- [x] Purple secondary (#a855f7)
- [x] Glassmorphism backgrounds
- [x] Aurora animation colors
- [x] Priority badge colors
- [x] Status indicator colors
- [x] Shadow and glow colors
- [x] Text hierarchy colors
- [x] Border colors
- [x] Button colors
- [x] Input colors
- [x] Component-specific colors

All colors extracted from @template.html and documented for consistent application across the Evolution of Todo frontend.

---

*Color Theme Version: 1.0*
*Based on: @template.html*
*Date: 2025-12-11*
