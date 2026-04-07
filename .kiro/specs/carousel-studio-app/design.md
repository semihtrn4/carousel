# Design Document — Carousel Studio App Completion

## Overview

Carousel Studio is a React Native / Expo SDK 54 app for creating seamless multi-slide Instagram carousels. The app's screens (tabs, editor, preview, export) are fully implemented. This design covers the five missing foundational files that every screen depends on:

1. `constants/colors.ts` — dark-theme color palette
2. `constants/templates.ts` — TEMPLATES (10), STICKERS (26), FONTS (12) static data
3. `types/project.ts` — Project interface
4. `app/_layout.tsx` — root layout with providers + Stack navigator
5. `package.json` — all dependencies for Expo SDK 54

These files have no runtime logic of their own — they are pure data/configuration. The design therefore focuses on exact data structures, type contracts, and wiring rather than algorithmic behavior.

---

## Architecture

The five files sit at the foundation of the dependency graph. Every screen imports from them; they import from nothing (except `app/_layout.tsx` which imports from `constants/colors` and three third-party providers).

```
package.json
    └── installs all node_modules

app/_layout.tsx
    ├── GestureHandlerRootView  (react-native-gesture-handler)
    ├── SafeAreaProvider        (react-native-safe-area-context)
    ├── QueryClientProvider     (@tanstack/react-query)
    └── Stack navigator         (expo-router)
            └── (tabs), editor, preview, export screens
                    ├── Colors  (@/constants/colors)
                    ├── TEMPLATES / STICKERS / FONTS  (@/constants/templates)
                    └── Project  (@/types/project)
```

No new screens, hooks, or services are introduced. The design is additive-only.

---

## Components and Interfaces

### 1. `constants/colors.ts`

Single named export `Colors` with a `dark` sub-object. All values are string hex literals.

```ts
export const Colors = {
  dark: {
    background:      '#0D0D0D',
    accent:          '#F5F5F0',
    surface:         '#1A1A1A',
    surfaceElevated: '#242424',
    border:          '#2A2A2A',
    text:            '#FFFFFF',
    textSecondary:   '#A0A0A0',
    textMuted:       '#606060',
    error:           '#FF4444',
  },
} as const;
```

The `as const` assertion makes every value a string literal type, enabling TypeScript to catch typos at call sites.

---

### 2. `constants/templates.ts`

Three named exports: `TEMPLATES`, `STICKERS`, `FONTS`, plus the `Template` type.

#### Template type

```ts
export type Template = {
  id: string;
  name: string;
  category: 'minimal' | 'editorial' | 'scrapbook' | 'bold' | 'aesthetic';
  slides: number;
  ratio: 'square' | 'portrait' | 'story' | 'landscape';
  elements: Array<{ color: string }>;
};
```

The `category` and `ratio` fields use string literal unions so the TypeScript compiler enforces valid values.

#### TEMPLATES — 10 entries, 2 per category

| id | name | category | slides | ratio | elements[0].color |
|----|------|----------|--------|-------|-------------------|
| `minimal-clean` | Clean Lines | minimal | 3 | portrait | `#F5F5F0` |
| `minimal-mono` | Monochrome | minimal | 5 | portrait | `#E8E8E8` |
| `editorial-mag` | Magazine | editorial | 4 | portrait | `#1C1C1E` |
| `editorial-type` | Typography | editorial | 3 | square | `#2C2C2E` |
| `scrapbook-pastel` | Pastel Collage | scrapbook | 6 | portrait | `#FFD6E0` |
| `scrapbook-vintage` | Vintage Cut | scrapbook | 4 | portrait | `#F4E4C1` |
| `bold-neon` | Neon Pop | bold | 3 | portrait | `#FF006E` |
| `bold-contrast` | High Contrast | bold | 5 | square | `#000000` |
| `aesthetic-soft` | Soft Aesthetic | aesthetic | 4 | portrait | `#E8D5C4` |
| `aesthetic-dark` | Dark Aesthetic | aesthetic | 3 | story | `#1A0A2E` |

#### STICKERS — 26 entries

Each sticker has a sequential id (`sticker-01` … `sticker-26`) and an emoji. The 26 emojis cover common Instagram decoration categories: hearts, stars, nature, food, gestures, symbols.

```
✨ 🌟 💫 ⭐ 🌙 ☀️ 🌈 🦋 🌸 🌺
🍀 🌿 🎀 🎉 🎊 💎 🔥 ❤️ 🧡 💛
💚 💙 💜 🖤 🤍 🌊
```

#### FONTS — 12 entries

Each font has an `id`, a display `name`, and a CSS `family` string. The family strings use web-safe or Google Fonts stacks that Fabric.js can load in the WebView.

| id | name | family |
|----|------|--------|
| `font-arial` | Arial | `Arial, sans-serif` |
| `font-georgia` | Georgia | `Georgia, serif` |
| `font-courier` | Courier | `'Courier New', monospace` |
| `font-impact` | Impact | `Impact, fantasy` |
| `font-palatino` | Palatino | `Palatino, serif` |
| `font-trebuchet` | Trebuchet | `'Trebuchet MS', sans-serif` |
| `font-verdana` | Verdana | `Verdana, sans-serif` |
| `font-garamond` | Garamond | `Garamond, serif` |
| `font-futura` | Futura | `Futura, 'Century Gothic', sans-serif` |
| `font-didot` | Didot | `Didot, 'Bodoni MT', serif` |
| `font-optima` | Optima | `Optima, Candara, sans-serif` |
| `font-baskerville` | Baskerville | `Baskerville, 'Times New Roman', serif` |

---

### 3. `types/project.ts`

Single named export `Project` as a TypeScript interface.

```ts
export interface Project {
  id: string;
  name: string;
  slides: number;
  ratio: 'square' | 'portrait' | 'story' | 'landscape';
  updatedAt: number;   // Unix ms
  createdAt: number;   // Unix ms
  thumbnail?: string;  // optional URI
  canvasData?: string; // optional Fabric.js JSON
}
```

`thumbnail` and `canvasData` are optional (`?`) rather than `string | undefined` union — both are equivalent at runtime but the optional syntax is idiomatic TypeScript and matches how the existing screens use the type (they check `project.thumbnail` with a truthy guard).

---

### 4. `app/_layout.tsx`

Root layout file recognized by expo-router. Provider nesting order (outermost → innermost):

```
GestureHandlerRootView  { flex: 1 }
  SafeAreaProvider
    QueryClientProvider  queryClient={queryClient}
      Stack
        Screen name="(tabs)"   headerShown: false
        Screen name="editor"   headerShown: false
        Screen name="preview"  headerShown: false
        Screen name="export"   headerShown: false
```

The `QueryClient` instance is created once at module scope (outside the component) to avoid re-creation on re-renders.

Stack `screenOptions`:
```ts
{
  headerShown: false,
  contentStyle: { backgroundColor: Colors.dark.background },
}
```

The `contentStyle` background prevents the white flash that appears between navigation transitions on iOS.

---

### 5. `package.json`

Key fields:

| Field | Value |
|-------|-------|
| `name` | `carousel-studio` |
| `version` | `1.0.0` |
| `main` | `expo-router/entry` |
| `expo.scheme` | `carousel-studio` |
| `expo.web.bundler` | `metro` |

#### Runtime dependencies (exact versions for Expo SDK 54 compatibility)

| Package | Version |
|---------|---------|
| `expo` | `~54.0.0` |
| `react` | `18.3.1` |
| `react-native` | `0.76.5` |
| `expo-router` | `~4.0.0` |
| `react-native-webview` | `13.12.5` |
| `expo-image-picker` | `~16.0.0` |
| `expo-image-manipulator` | `~13.0.0` |
| `expo-media-library` | `~17.0.0` |
| `react-native-gesture-handler` | `~2.20.0` |
| `react-native-reanimated` | `~3.16.0` |
| `react-native-safe-area-context` | `4.12.0` |
| `@tanstack/react-query` | `^5.0.0` |
| `@react-native-async-storage/async-storage` | `1.23.1` |
| `lucide-react-native` | `^0.475.0` |
| `react-native-svg` | `15.8.0` |

> `react-native-svg` is required by `lucide-react-native` as a peer dependency.

#### Dev dependencies

| Package | Version |
|---------|---------|
| `typescript` | `~5.3.0` |
| `@types/react` | `~18.3.0` |

#### Scripts

```json
{
  "start":   "expo start",
  "android": "expo run:android",
  "ios":     "expo run:ios"
}
```

---

## Data Models

### Color token model

```
Colors.dark : {
  background:      string  // page/screen background
  accent:          string  // primary CTA, active states
  surface:         string  // card/panel background
  surfaceElevated: string  // elevated card, modal background
  border:          string  // dividers, card borders
  text:            string  // primary text
  textSecondary:   string  // secondary/supporting text
  textMuted:       string  // placeholder, disabled text
  error:           string  // destructive actions, error states
}
```

### Template element model

```
TemplateElement : {
  color: string  // CSS color string used as slide background
}
```

Elements are intentionally minimal — the canvas editor (Fabric.js) handles full element rendering. The `color` field is the only data the native UI needs for template preview cards.

### Sticker model

```
Sticker : {
  id:    string  // unique identifier e.g. "sticker-01"
  emoji: string  // single emoji character
}
```

### Font model

```
Font : {
  id:     string  // unique identifier e.g. "font-arial"
  name:   string  // display name shown in the font picker UI
  family: string  // CSS font-family value injected into WebView
}
```

### Project model

```
Project : {
  id:          string            // UUID or timestamp-based unique id
  name:        string            // user-visible project name
  slides:      number            // slide count (2–10)
  ratio:       RatioUnion        // 'square'|'portrait'|'story'|'landscape'
  updatedAt:   number            // Date.now() on last save
  createdAt:   number            // Date.now() on creation
  thumbnail?:  string            // data URI or file URI of preview image
  canvasData?: string            // JSON.stringify of Fabric.js canvas state
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The prework analysis identified that most acceptance criteria in this feature are SMOKE or EXAMPLE checks on static configuration (exact hex values, exact counts, TypeScript types, package.json fields). These are best verified by example-based unit tests and TypeScript compilation.

However, three structural invariants over the static data arrays are universal properties that hold for every element and benefit from exhaustive iteration:

### Property 1: Every template has all required fields with correct types

*For any* template in the TEMPLATES array, it SHALL have an `id` (string), `name` (string), `category` (string), `slides` (positive number), `ratio` (one of the four valid ratio strings), and an `elements` array.

**Validates: Requirements 2.2**

### Property 2: Template elements always carry a color

*For any* template in TEMPLATES whose `elements` array is non-empty, every element in that array SHALL have a `color` field that is a non-empty string.

**Validates: Requirements 2.4**

### Property 3: Sticker and Font arrays have unique ids and complete fields

*For any* item in the STICKERS array, it SHALL have a unique `id` string and a non-empty `emoji` string. *For any* item in the FONTS array, it SHALL have a unique `id` string, a non-empty `name` string, and a non-empty `family` string.

**Validates: Requirements 2.5, 2.6**

---

**Property Reflection:** Properties 1 and 2 are complementary — Property 1 checks the template's own fields while Property 2 checks the nested elements. They cannot be merged without losing clarity. Property 3 combines the sticker and font uniqueness checks since they follow the same pattern and the combined property is more concise.

---

## Error Handling

These five files contain no runtime logic that can throw. Error scenarios are limited to:

- **Missing module at import time** — resolved by ensuring all files exist at the correct paths with correct default/named exports. TypeScript compilation catches this before runtime.
- **AsyncStorage parse errors** (in screens that use `Project`) — handled in the existing screen code with try/catch; the `Project` type itself cannot cause errors.
- **WebView font loading** — if a CSS font-family string in FONTS references a font not available in the WebView, Fabric.js falls back to the browser default. This is acceptable behavior; no error handling is needed in the constants file.
- **Missing `react-native-svg` peer** — if `lucide-react-native` is installed without `react-native-svg`, the app will crash on icon render. The `package.json` must declare `react-native-svg` explicitly.

---

## Testing Strategy

### Unit / Example-based tests

These cover the SMOKE and EXAMPLE criteria from the prework:

- Assert `Colors.dark` has all 9 keys with exact hex values (one parameterized test covering requirements 1.1–1.10)
- Assert `TEMPLATES.length === 10` (requirement 2.1)
- Assert the set of unique categories in TEMPLATES contains all 5 required categories (requirement 2.3)
- Assert `STICKERS.length === 26` and `FONTS.length === 12` (requirements 2.5, 2.6)
- Assert `package.json` has `main: "expo-router/entry"`, correct scripts, and expo config block (requirement 5.15–5.17)

### Property-based tests

PBT applies to the structural invariants over the static arrays. Since the arrays are small and static, a property test here iterates over every element (exhaustive rather than random), which is equivalent to a property test with a generator bounded to the array contents.

Recommended library: **jest** with a simple `forEach` loop (the arrays are finite and known, so a PBT library like `fast-check` adds no value over exhaustive iteration — the "property" is verified by checking every element).

Each property test should be tagged:
- `// Feature: carousel-studio-app, Property 1: every template has required fields`
- `// Feature: carousel-studio-app, Property 2: template elements carry a color`
- `// Feature: carousel-studio-app, Property 3: sticker/font ids are unique and fields complete`

### TypeScript compilation as smoke test

Running `tsc --noEmit` with the project's `tsconfig.json` verifies:
- All path aliases resolve (`@/constants/colors`, `@/constants/templates`, `@/types/project`)
- The `Template` type is correctly exported and importable
- The `Project` interface fields match how screens use them
- The root layout is a valid React component default export

### Integration

No integration tests are needed for these five files. The end-to-end integration test is simply: `expo start` launches without a red error screen.
