# Tauri 2 Svelte 5 Shadcn

Simple boilerplate for Tauri 2 with Svelte 5 (and shadcn-svelte).

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
