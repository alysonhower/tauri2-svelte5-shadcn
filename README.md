# Tauri 2 Svelte 5 Shadcn

Simple boilerplate for Tauri 2 with Svelte 5 (and shadcn-svelte).

## What's included

- **Desktop shell:** Tauri 2 with a Rust backend in [`src-tauri`](src-tauri/).
- **Frontend:** Svelte 5 with Runes, TypeScript, Vite and Tailwind CSS 4. The app starts in [`src/App.svelte`](src/App.svelte).
- **UI examples:** shadcn-svelte Button, Card and Input components in [`src/lib/components/ui`](src/lib/components/ui/), plus Lucide icons. [`HelloWorld.svelte`](src/lib/components/HelloWorld.svelte) demonstrates the components together.
- **Frontend/backend integration:** [`GlobalState`](src/lib/commands.svelte.ts) demonstrates reactive state and Tauri `invoke` calls. The Rust [`read` and `write` commands](src-tauri/src/commands/default.rs) read and write UTF-8 text files.
- **Development tools:** Svelte/TypeScript checks, ESLint and Prettier; Vitest with Testing Library, jsdom and mocked Tauri IPC; and Rust unit tests. See the [test guide](src/tests/README.md). GitHub Actions includes [build checks](.github/workflows/test-build.yml) and a [release workflow](.github/workflows/release.yml).

This is a starting template with a small example app. Replace the example UI, state and commands with your application's own functionality.

## Requirements

In order to run this boilerplate, you need to install Node (via nvm) and Rust. If you are on Windows I also recommend installing MSVC before the other dependencies (make sure to check the "Desktop development with C++" workload).

Some useful links:

- https://github.com/coreybutler/nvm-windows/releases (Windows: pick the nvm installer)
- https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating (Linux: run `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`)
- https://www.rust-lang.org/tools/install
- https://visualstudio.microsoft.com/vs/community/

## Setup

1. Click the "Use this template" button on GitHub.
2. Clone your newly created repository:
   ```
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   cd YOUR_REPOSITORY_NAME
   ```
3. Install dependencies:
   ```
   npm i
   ```

This template uses npm as its package manager. Keep `package-lock.json` committed and use `npm ci` for reproducible installs in automation.

## Useful commands

### Start dev server

```
npm run tauri dev
```

### Build executable

```
npm run tauri build
```

### Run checks and tests

```sh
npm run check       # Svelte and TypeScript checks
npm run lint        # Prettier and ESLint
npm run test:unit   # Frontend tests with mocked Tauri IPC
npm run test:rust   # Rust tests; requires the Rust/Tauri build prerequisites
npm test            # All of the above
```

### Add shadcn-svelte component

```
npx shadcn-svelte@next add <component>
```

Replace `<component>` with the name of the component you want to add (e.g., button, card, dialog). You can find the full list of available components at https://next.shadcn-svelte.com/docs/components.

## Other links

### Svelte 5

https://svelte.dev/docs

### Tauri 2

https://tauri.app/start/

### shadcn-svelte

https://next.shadcn-svelte.com/

## Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/). Incompatible changes to the template's documented APIs or integration patterns require a major release, backward-compatible capabilities use a minor release, and backward-compatible fixes use a patch release.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
