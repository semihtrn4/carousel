# Requirements Document

## Introduction

Carousel Studio is a React Native / Expo app that lets users create seamless multi-slide Instagram carousels. The app is largely built — all tab screens, the canvas editor (WebView + Fabric.js), the swipeable preview, and the export screen exist. What remains is the foundational scaffolding that every screen depends on: the design-system constants, the data-model types, the static content arrays (templates, stickers, fonts), the root navigation layout, and the package manifest.

This document captures the requirements for completing those five missing pieces so the app compiles, runs, and behaves correctly end-to-end.

---

## Glossary

- **App**: The Carousel Studio React Native / Expo application.
- **Root_Layout**: The `app/_layout.tsx` file that wraps the entire app with providers and the expo-router Stack navigator.
- **Colors_Module**: The `constants/colors.ts` file that exports the `Colors.dark` theme object.
- **Templates_Module**: The `constants/templates.ts` file that exports `TEMPLATES`, `STICKERS`, and `FONTS` arrays.
- **Project_Type**: The TypeScript type defined in `types/project.ts` that describes a saved carousel project.
- **Package_Manifest**: The `package.json` file listing all runtime and dev dependencies.
- **Editor**: The `app/editor.tsx` canvas screen powered by WebView and Fabric.js.
- **Preview**: The `app/preview.tsx` swipeable slide-preview screen.
- **Export_Screen**: The `app/export.tsx` screen that crops and saves slides to the device gallery.
- **QueryClient**: The TanStack Query client instance used for async data fetching and caching.
- **GestureHandlerRootView**: The root view required by react-native-gesture-handler.
- **SafeAreaProvider**: The provider required by react-native-safe-area-context.
- **Template**: An object describing a pre-built carousel starting point (id, name, category, slides, ratio, elements).
- **Sticker**: An object pairing an id with an emoji character for use on the canvas.
- **Font**: An object pairing an id and display name with a CSS font-family string for use in the WebView canvas.
- **Project**: A persisted user-created carousel with metadata and optional canvas state.
- **Ratio**: One of `square` | `portrait` | `story` | `landscape`, describing the aspect ratio of a carousel.

---

## Requirements

### Requirement 1: Colors Design-System Module

**User Story:** As a developer, I want a single source of truth for the dark-theme color palette, so that every screen references consistent values without hardcoding hex strings.

#### Acceptance Criteria

1. THE Colors_Module SHALL export a `Colors` object with a `dark` key.
2. THE Colors_Module SHALL define `Colors.dark.background` as `#0D0D0D`.
3. THE Colors_Module SHALL define `Colors.dark.accent` as `#F5F5F0`.
4. THE Colors_Module SHALL define `Colors.dark.surface` as `#1A1A1A`.
5. THE Colors_Module SHALL define `Colors.dark.surfaceElevated` as `#242424`.
6. THE Colors_Module SHALL define `Colors.dark.border` as `#2A2A2A`.
7. THE Colors_Module SHALL define `Colors.dark.text` as `#FFFFFF`.
8. THE Colors_Module SHALL define `Colors.dark.textSecondary` as `#A0A0A0`.
9. THE Colors_Module SHALL define `Colors.dark.textMuted` as `#606060`.
10. THE Colors_Module SHALL define `Colors.dark.error` as `#FF4444`.
11. THE Colors_Module SHALL be importable via the path alias `@/constants/colors` without TypeScript errors.

---

### Requirement 2: Templates, Stickers, and Fonts Module

**User Story:** As a user, I want to choose from a variety of pre-built templates, decorative stickers, and font options when creating a carousel, so that I can produce polished designs quickly.

#### Acceptance Criteria

1. THE Templates_Module SHALL export a `TEMPLATES` array containing exactly 10 Template objects.
2. WHEN a Template object is defined, THE Templates_Module SHALL include the fields `id` (string), `name` (string), `category` (string), `slides` (number), `ratio` (Ratio), and `elements` (array).
3. THE Templates_Module SHALL cover at least the categories `minimal`, `editorial`, `scrapbook`, `bold`, and `aesthetic` across the 10 templates, so that the Templates screen category filter returns at least one result per category.
4. WHEN a Template's `elements` array is non-empty, each element SHALL include a `color` string so that the template preview card renders a background color.
5. THE Templates_Module SHALL export a `STICKERS` array containing exactly 26 Sticker objects, each with a unique `id` and an `emoji` string.
6. THE Templates_Module SHALL export a `FONTS` array containing exactly 12 Font objects, each with a unique `id`, a `name` string, and a `family` string compatible with CSS `font-family`.
7. THE Templates_Module SHALL export a `Template` TypeScript type so that `templates.tsx` can import it as `import { TEMPLATES, type Template } from '@/constants/templates'`.
8. THE Templates_Module SHALL be importable via the path alias `@/constants/templates` without TypeScript errors.

---

### Requirement 3: Project TypeScript Type

**User Story:** As a developer, I want a shared TypeScript type for carousel projects, so that AsyncStorage reads/writes and UI components are type-safe across all screens.

#### Acceptance Criteria

1. THE Project_Type SHALL define a `Project` interface with the field `id` as `string`.
2. THE Project_Type SHALL define `name` as `string`.
3. THE Project_Type SHALL define `slides` as `number`.
4. THE Project_Type SHALL define `ratio` as the union `'square' | 'portrait' | 'story' | 'landscape'`.
5. THE Project_Type SHALL define `updatedAt` as `number` (Unix timestamp in milliseconds).
6. THE Project_Type SHALL define `createdAt` as `number` (Unix timestamp in milliseconds).
7. THE Project_Type SHALL define `thumbnail` as `string | undefined` (optional URI).
8. THE Project_Type SHALL define `canvasData` as `string | undefined` (optional serialised Fabric.js JSON).
9. THE Project_Type SHALL be importable via the path alias `@/types/project` without TypeScript errors.

---

### Requirement 4: Root Navigation Layout

**User Story:** As a user, I want the app to launch correctly with all required providers and navigation structure in place, so that every screen renders without crashes.

#### Acceptance Criteria

1. THE Root_Layout SHALL wrap the entire component tree in `GestureHandlerRootView` with `flex: 1` style.
2. THE Root_Layout SHALL wrap the component tree in `SafeAreaProvider`.
3. THE Root_Layout SHALL wrap the component tree in a `QueryClientProvider` with a `QueryClient` instance.
4. THE Root_Layout SHALL render an expo-router `Stack` navigator as the innermost navigation element.
5. WHEN the Stack is configured, THE Root_Layout SHALL set `headerShown: false` as the default screen option so that individual screens control their own headers.
6. THE Root_Layout SHALL define a named screen for `(tabs)` with `headerShown: false`.
7. THE Root_Layout SHALL define a named screen for `editor` with `headerShown: false`.
8. THE Root_Layout SHALL define a named screen for `preview` with `headerShown: false`.
9. THE Root_Layout SHALL define a named screen for `export` with `headerShown: false`.
10. THE Root_Layout SHALL apply `Colors.dark.background` as the Stack's `contentStyle` background color so that no white flash appears during navigation transitions.
11. THE Root_Layout SHALL be a valid default export from `app/_layout.tsx` so that expo-router recognises it as the root layout.

---

### Requirement 5: Package Manifest

**User Story:** As a developer, I want a complete `package.json` so that running `npm install` installs every dependency the app needs and the project builds without missing-module errors.

#### Acceptance Criteria

1. THE Package_Manifest SHALL declare `expo` at SDK 54 (`~54.0.0`) as a dependency.
2. THE Package_Manifest SHALL declare `react` and `react-native` at versions compatible with Expo SDK 54.
3. THE Package_Manifest SHALL declare `expo-router` as a dependency.
4. THE Package_Manifest SHALL declare `react-native-webview` as a dependency.
5. THE Package_Manifest SHALL declare `expo-image-picker` as a dependency.
6. THE Package_Manifest SHALL declare `expo-image-manipulator` as a dependency.
7. THE Package_Manifest SHALL declare `expo-media-library` as a dependency.
8. THE Package_Manifest SHALL declare `react-native-gesture-handler` as a dependency.
9. THE Package_Manifest SHALL declare `react-native-reanimated` as a dependency.
10. THE Package_Manifest SHALL declare `react-native-safe-area-context` as a dependency.
11. THE Package_Manifest SHALL declare `@tanstack/react-query` as a dependency.
12. THE Package_Manifest SHALL declare `@react-native-async-storage/async-storage` as a dependency.
13. THE Package_Manifest SHALL declare `lucide-react-native` as a dependency.
14. THE Package_Manifest SHALL declare `typescript` and `@types/react` as dev dependencies.
15. THE Package_Manifest SHALL include a `main` field pointing to `expo-router/entry`.
16. THE Package_Manifest SHALL include an `expo` configuration block with `scheme` set to `carousel-studio` and `web.bundler` set to `metro`.
17. THE Package_Manifest SHALL include standard scripts: `start` (`expo start`), `android` (`expo run:android`), `ios` (`expo run:ios`).
