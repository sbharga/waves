# Repository Guidelines

## Project Structure & Module Organization

Wave is a client-side React and TypeScript wallpaper generator built with Vite and Tailwind CSS.

- `src/App.tsx` contains the editor layout and interaction state.
- `src/components/` contains reusable React UI, currently the canvas preview.
- `src/renderer.ts` owns deterministic sinusoidal wave geometry and canvas drawing.
- `src/state.ts`, `src/types.ts`, and `src/constants.ts` define shared state, URL serialization, presets, and palettes.
- `src/exporters.ts` handles PNG and browser-native MP4 downloads.
- Tests live beside their modules as `src/*.test.ts`; shared setup is in `src/test/`.
- Static assets belong in `public/`. Generated output in `dist/` should not be edited.

Keep rendering logic independent of React so preview and exports remain visually identical.

## Build, Test, and Development Commands

- `npm install` installs locked dependencies from `package-lock.json`.
- `npm run dev` starts the Vite development server with hot reload.
- `npm test` runs the Vitest suite once.
- `npm run test:watch` reruns tests while files change.
- `npm run build` type-checks with TypeScript and creates a production build in `dist/`.
- `npm run preview` serves the production build locally for final verification.

Run tests and the production build before submitting changes.

## Coding Style & Naming Conventions

Use TypeScript with strict types, two-space indentation, single quotes, and no semicolons, matching the existing source. Name React components and interfaces in `PascalCase`, functions and variables in `camelCase`, and CSS classes in kebab-case. Prefer small pure functions for geometry, validation, and serialization. Avoid duplicating wallpaper calculations in UI components.

No standalone formatter or linter is configured. Preserve the established style and rely on `npm run build` for type safety.

## Testing Guidelines

Vitest is the test runner, with jsdom and Testing Library available for UI tests. Name tests `*.test.ts` or `*.test.tsx` beside the code under test. Cover deterministic rendering, seamless animation endpoints, validation boundaries, URL round trips, and user-visible control behavior. Bug fixes should include a regression test when practical.

## Commit & Pull Request Guidelines

This workspace has no accessible Git history, so use concise imperative commit subjects such as `Fix still-mode animation cleanup`. Keep commits focused. Pull requests should summarize behavior changes, list verification commands, link relevant issues, and include screenshots or short recordings for visual or motion changes. Call out browser limitations when modifying MP4 export behavior.
