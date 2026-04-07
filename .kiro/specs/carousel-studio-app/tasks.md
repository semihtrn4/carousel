# Implementation Plan: Carousel Studio App Completion

## Overview

Implement the five foundational files that every existing screen depends on, plus configure TypeScript path aliases and verify the app compiles. All files are pure data/configuration — no runtime logic is introduced.

## Tasks

- [x] 1. Create `constants/colors.ts`
  - Export the `Colors` object with a `dark` sub-object containing all 9 hex color tokens, using `as const`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11_

  - [ ]* 1.1 Write unit tests for Colors module
    - Assert `Colors.dark` has all 9 keys with exact hex values
    - _Requirements: 1.1–1.10_

- [x] 2. Create `types/project.ts`
  - Export the `Project` interface with all 8 fields (`id`, `name`, `slides`, `ratio`, `updatedAt`, `createdAt`, `thumbnail?`, `canvasData?`)
  - Use the `'square' | 'portrait' | 'story' | 'landscape'` union for `ratio`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 3. Create `constants/templates.ts`
  - [x] 3.1 Define and export the `Template` type with fields `id`, `name`, `category`, `slides`, `ratio`, `elements`
    - Use string literal unions for `category` and `ratio`
    - _Requirements: 2.2, 2.7_

  - [x] 3.2 Implement and export the `TEMPLATES` array with exactly 10 entries (2 per category: minimal, editorial, scrapbook, bold, aesthetic)
    - Each entry must include a non-empty `elements` array with at least one object containing a `color` string
    - Use the exact ids, names, categories, slides, ratios, and colors from the design document
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.3 Write property test for template structure (Property 1)
    - **Property 1: Every template has all required fields with correct types**
    - **Validates: Requirements 2.2**

  - [ ]* 3.4 Write property test for template element colors (Property 2)
    - **Property 2: Template elements always carry a color**
    - **Validates: Requirements 2.4**

  - [x] 3.5 Implement and export the `STICKERS` array with exactly 26 entries (`sticker-01` … `sticker-26`), each with a unique `id` and an `emoji` string
    - Use the 26 emojis listed in the design document
    - _Requirements: 2.5_

  - [x] 3.6 Implement and export the `FONTS` array with exactly 12 entries, each with a unique `id`, a `name`, and a CSS `family` string
    - Use the exact ids, names, and family strings from the design document
    - _Requirements: 2.6_

  - [ ]* 3.7 Write property test for sticker and font uniqueness (Property 3)
    - **Property 3: Sticker and Font arrays have unique ids and complete fields**
    - **Validates: Requirements 2.5, 2.6**

  - [ ]* 3.8 Write unit tests for array lengths and category coverage
    - Assert `TEMPLATES.length === 10`, `STICKERS.length === 26`, `FONTS.length === 12`
    - Assert all 5 required categories appear in TEMPLATES
    - _Requirements: 2.1, 2.3, 2.5, 2.6_

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create `app/_layout.tsx`
  - Create a `QueryClient` instance at module scope (outside the component)
  - Wrap the tree in `GestureHandlerRootView` (flex: 1) → `SafeAreaProvider` → `QueryClientProvider` → `Stack`
  - Set Stack `screenOptions` to `{ headerShown: false, contentStyle: { backgroundColor: Colors.dark.background } }`
  - Define named `Screen` entries for `(tabs)`, `editor`, `preview`, and `export`, all with `headerShown: false`
  - Export the component as the default export
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_

- [x] 6. Create `package.json`
  - Set `name`, `version`, `main: "expo-router/entry"`, and `expo` config block (`scheme: "carousel-studio"`, `web.bundler: "metro"`)
  - Add all runtime dependencies at the exact versions specified in the design document (including `react-native-svg`)
  - Add dev dependencies: `typescript ~5.3.0`, `@types/react ~18.3.0`
  - Add scripts: `start`, `android`, `ios`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 5.13, 5.14, 5.15, 5.16, 5.17_

- [x] 7. Configure `tsconfig.json` with path aliases
  - Add `baseUrl: "."` and `paths` entries for `@/constants/*` and `@/types/*` so all path-alias imports resolve without TypeScript errors
  - _Requirements: 1.11, 2.8, 3.9_

- [ ] 8. Install dependencies and verify compilation
  - [x] 8.1 Run `npm install` to install all declared dependencies
  - [x] 8.2 Run `npx tsc --noEmit` to verify the project compiles without errors
    - Confirms path aliases resolve, all types are consistent, and the root layout is a valid default export
    - _Requirements: 1.11, 2.8, 3.9, 4.11_

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests iterate exhaustively over the static arrays (no random generation needed)
- `react-native-svg` must be included in `package.json` as a peer of `lucide-react-native`
- The `QueryClient` instance must be created outside the component to avoid re-creation on re-renders
