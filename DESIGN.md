# Design System

Portable design guide for Next.js + React + Tailwind projects.

---

## Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui — use shadcn components whenever possible
- **Icons:** `@hugeicons/core-free-icons`
- **Theme switching:** `next-themes` (light / dark / system)

---

## Typography

- **Font:** [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts, latin subset)
- Load via `next/font/google`, expose as `--font-sans` CSS variable
- Apply on `<body>` with `font-sans antialiased`

```ts
// app/layout.tsx
import { Outfit } from "next/font/google";
const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });
```

---

## Color System

### Semantic tokens (CSS variables, OKLCH)

Define in `globals.css` inside `@layer base` / `:root` + `.dark`:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... invert equivalents */
}
```

### Chart colors (HSL)

```css
--chart-1: 217 91% 60%;
--chart-2: 142 71% 45%;
--chart-3: 27 87% 67%;
--chart-4: 330 81% 60%;
--chart-5: 262 83% 58%;
```

### Entity/accent colors (hex catalog)

For user-selectable colors (clubs, tags, categories):

```ts
const COLOR_PALETTE = {
  BLUE:   "#3B82F6",
  RED:    "#EF4444",
  GREEN:  "#22C55E",
  YELLOW: "#EAB308",
  PURPLE: "#A855F7",
  PINK:   "#EC4899",
  ORANGE: "#F97316",
  TEAL:   "#14B8A6",
  INDIGO: "#6366F1",
  BLACK:  "#000000",
  WHITE:  "#FFFFFF",
  // extend as needed
};
```

---

## Border Radius Scale

Base: `--radius: 0.625rem` (10px). Tailwind v4 custom scale:

```css
@theme inline {
  --radius-sm:  calc(var(--radius) - 4px);   /* 6px  */
  --radius-md:  calc(var(--radius) - 2px);   /* 8px  */
  --radius-lg:  var(--radius);               /* 10px */
  --radius-xl:  calc(var(--radius) + 4px);   /* 14px */
  --radius-2xl: calc(var(--radius) + 8px);   /* 18px */
  --radius-3xl: calc(var(--radius) + 12px);  /* 22px */
  --radius-4xl: calc(var(--radius) + 16px);  /* 26px */
}
```

Usage: `rounded-lg`, `rounded-xl`, `rounded-2xl`. Prefer `rounded-xl` for cards, `rounded-full` for badges/pills.

---

## Spacing Conventions

| Element        | Padding/Gap               |
|----------------|---------------------------|
| Page layout    | `p-4`, `gap-4`            |
| Card body      | `px-4 py-4`, `gap-4`      |
| Badge / pill   | `px-2.5 py-0.5`           |
| Color picker   | `p-3`, `gap-2`            |
| Button (sm)    | `px-2`, `gap-1`           |
| Button (default)| `px-2.5`, `gap-1.5`      |

---

## Layout

### App shell

```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <main className="flex flex-col gap-4 p-4">
      {children}
    </main>
  </SidebarInset>
</SidebarProvider>
```

### Cards

Use shadcn `Card` with slot composition:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
    <CardAction>{/* top-right action */}</CardAction>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

Card border: `ring-1 ring-border` (not `border` class). Radius: `rounded-xl`.

---

## Components

### Buttons

Use shadcn `Button`. Variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`.

```tsx
<Button variant="default" size="sm">Label</Button>
<Button variant="outline" size="icon"><Icon /></Button>
```

### Badges / Status

Pill shape: `rounded-full border px-2.5 py-0.5 text-xs` + semantic color (emerald = active, amber = pending, indigo = info, slate = inactive, destructive = error).

```tsx
<span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
  <Icon size={12} /> Active
</span>
```

### Tables

Use shadcn `Table`. Add search via shadcn `Input` (wrapped in `InputGroup`), filter via `Select`. Keep row actions in a `DropdownMenu`.

### Color Picker

Dot grid of 8px circles, `ring-2 ring-white ring-offset-2` on selected.

```tsx
<div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/40">
  {colors.map(color => (
    <button
      key={color}
      style={{ backgroundColor: color }}
      className={cn(
        "h-5 w-5 rounded-full transition-all",
        selected === color && "ring-2 ring-white ring-offset-2"
      )}
    />
  ))}
</div>
```

---

## Animations

### Float motion (decorative elements)

```css
@keyframes club-float-motion {
  0%   { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
  20%  { transform: translate3d(6px, -8px, 0) rotate(2deg) scale(1.02); }
  40%  { transform: translate3d(-4px, -14px, 0) rotate(-1deg) scale(0.98); }
  60%  { transform: translate3d(8px, -8px, 0) rotate(3deg) scale(1.03); }
  80%  { transform: translate3d(-2px, -4px, 0) rotate(-2deg) scale(0.99); }
  100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
}
```

### Icon swap (button state transitions)

```css
@keyframes icon-slide-in {
  from { transform: translate3d(0, 20px, 0) scale(0.75); opacity: 0; }
  to   { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
}
@keyframes icon-slide-out {
  from { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
  to   { transform: translate3d(0, -20px, 0) scale(0.75); opacity: 0; }
}
```

Duration: `560ms`, easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring-like).

---

## Icons

Use `@hugeicons/core-free-icons`. Import individual icons, pass to a wrapper:

```tsx
import { HugeiconsIcon } from "@hugeicons/core-free-icons";
import { Home01Icon } from "@hugeicons/core-free-icons";

<HugeiconsIcon icon={Home01Icon} size={20} />
```

---

## Dark Mode

Use `next-themes` with `ThemeProvider`. Toggle between `light`, `dark`, `system`. All colors resolve via CSS variables — no manual dark: classes needed on semantic tokens.

```tsx
// app/layout.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

---

## globals.css Setup (Tailwind v4)

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-outfit);
  --radius: 0.625rem;
  --radius-sm:  calc(var(--radius) - 4px);
  --radius-md:  calc(var(--radius) - 2px);
  --radius-lg:  var(--radius);
  --radius-xl:  calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  --color-background:  var(--background);
  --color-foreground:  var(--foreground);
  --color-primary:     var(--primary);
  /* ... map all semantic tokens */
}
```
