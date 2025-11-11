# SmolPC Code Helper - Svelte 5 Edition

**AI-powered coding assistant for secondary school students (ages 11-18)**

This is a complete migration of SmolPC Code Helper from vanilla JavaScript to **Svelte 5** with **Tauri 2**, featuring modern architecture, type safety, and professional UI components.

---

## 🎉 What's New in v2.0

### Architecture Transformation
- **Svelte 5 with Runes** - Modern reactive state management (`$state`, `$derived`, `$effect`)
- **TypeScript** - Full type safety across frontend and backend
- **Component-Based** - Clean, maintainable architecture replacing 761-line monolithic JS file
- **shadcn-svelte** - Professional, accessible UI components
- **Tailwind CSS 4** - Modern utility-first styling with CodeHelper branding

### Core Features (Preserved from v1)
- ✅ Real-time streaming chat responses
- ✅ Multiple LLM models (Qwen 2.5 Coder, DeepSeek Coder)
- ✅ Conversation context toggle
- ✅ Chat history with localStorage persistence
- ✅ Student-friendly system prompt
- ✅ Ollama connection status
- ✅ 100% offline operation

---

## 🏗️ Project Structure

```
/
├── src/                          # Frontend (Svelte 5 + TypeScript)
│   ├── lib/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatList.svelte          # Sidebar with chat history
│   │   │   │   ├── MessageList.svelte       # Message display with streaming
│   │   │   │   ├── MessageInput.svelte      # Input area + send button
│   │   │   │   ├── ModelSelector.svelte     # Model dropdown
│   │   │   │   └── StatusIndicator.svelte   # Ollama connection status
│   │   │   └── ui/                          # shadcn-svelte components
│   │   ├── stores/
│   │   │   └── chat.svelte.ts               # Global state with Svelte 5 runes
│   │   ├── types.ts                         # TypeScript type definitions
│   │   └── utils.ts                         # Utility functions
│   ├── App.svelte                           # Root component
│   ├── main.ts                              # Entry point
│   └── app.css                              # Global styles (Tailwind + custom colors)
│
├── src-tauri/                    # Backend (Rust)
│   ├── src/
│   │   └── lib.rs                           # Ollama integration, streaming, commands
│   ├── Cargo.toml                           # Rust dependencies
│   └── tauri.conf.json                      # Tauri configuration
│
├── package.json                  # Node dependencies
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (for Tauri CLI and Vite)
- **Rust 1.77.2+** (for backend compilation)
- **Ollama** installed and running on `http://localhost:11434`
- Downloaded model: `ollama pull qwen2.5-coder:7b` or `ollama pull deepseek-coder:6.7b`

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Build frontend
npm run check        # TypeScript + Svelte type checking
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run tauri dev    # Run Tauri dev mode (recommended)
npm run tauri build  # Build production app
```

---

## 🧩 Architecture Deep Dive

### Svelte 5 Runes in Action

The new state management uses Svelte 5's runes for reactive, type-safe state:

```typescript
// src/lib/stores/chat.svelte.ts
class ChatState {
  chats = $state<Chat[]>([]);                    // Reactive array
  activeChat = $state<Chat | null>(null);        // Reactive state
  isGenerating = $state<boolean>(false);

  // Auto-computed from state
  messageCount = $derived(this.activeChat?.messages.length ?? 0);

  // Auto-run when dependencies change
  $effect(() => {
    if (this.chats.length > 0) {
      this.saveToStorage();  // Auto-save on changes
    }
  });
}
```

### Component Hierarchy

```
App.svelte (Root)
├── ChatList.svelte (Sidebar)
│   ├── Button (shadcn-svelte)
│   └── Trash2 (lucide icons)
├── MessageList.svelte (Main Content)
│   └── Loader2 (lucide icons)
├── MessageInput.svelte (Input Area)
│   ├── Button (shadcn-svelte)
│   └── Send (lucide icons)
├── ModelSelector.svelte (Header)
│   └── Button (shadcn-svelte)
└── StatusIndicator.svelte (Header)
    └── Button (shadcn-svelte)
```

### Rust Backend

**Key Commands:**
- `check_ollama()` - Verify Ollama server is running
- `generate_code_stream(prompt, model, context)` - Stream AI responses via Tauri events
- `save_code(code, filename)` - Native file save dialog

**Event Flow:**
```
Frontend (invoke) → Rust Command → Ollama API → Stream Chunks
                                                     ↓
                                            Tauri Events (gen_chunk)
                                                     ↓
                                            Frontend (listen) → Update UI
```

---

## 🎨 Customization

### Colors (CodeHelper Branding)

Colors are defined in `src/app.css` using Tailwind CSS 4 and oklch color space:

```css
:root {
  --primary: oklch(0.58 0.15 270);    /* CodeHelper Blue #667eea */
  --secondary: oklch(0.45 0.12 290);  /* CodeHelper Purple #764ba2 */
}
```

### Adding UI Components

This project uses shadcn-svelte (Next version). Add new components:

```bash
npx shadcn-svelte@next add dialog
npx shadcn-svelte@next add dropdown-menu
npx shadcn-svelte@next add toast
```

Components are copied to `src/lib/components/ui/` and fully customizable.

### Adding New Tauri Commands

1. **Define in Rust** (`src-tauri/src/lib.rs`):
```rust
#[tauri::command]
async fn my_command(param: String) -> Result<String, CodeHelperError> {
    Ok(format!("Received: {}", param))
}
```

2. **Register** in `lib.rs`:
```rust
.invoke_handler(tauri::generate_handler![
    check_ollama,
    generate_code_stream,
    my_command  // Add here
])
```

3. **Call from Frontend**:
```typescript
import { invoke } from '@tauri-apps/api/core';
const result = await invoke<string>('my_command', { param: 'test' });
```

---

## 📊 Migration Comparison

| Aspect | v1.0 (Vanilla JS) | v2.0 (Svelte 5) |
|--------|-------------------|-----------------|
| Frontend | 761-line main.js | 6 focused components |
| State Management | Manual + DOM manipulation | Svelte 5 runes + stores |
| Type Safety | None | Full TypeScript |
| UI Components | Custom HTML/CSS | shadcn-svelte + Tailwind |
| Bundle Size | ~150KB | ~180KB (with types) |
| Maintainability | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Developer Experience | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Scalability | Limited | Excellent |

---

## 🔧 Troubleshooting

### Ollama Not Connecting
- Ensure Ollama is running: `ollama serve`
- Check port 11434 is accessible: `curl http://localhost:11434/api/tags`
- Verify model is downloaded: `ollama list`

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Rust build cache
cd src-tauri
cargo clean
cd ..

# Rebuild
npm run tauri build
```

### Type Errors
```bash
# Run type checking
npm run check

# If Svelte language server issues:
npx svelte-check --tsconfig ./tsconfig.app.json
```

---

## 🎯 Roadmap

### Planned Features
- [ ] Dark mode toggle
- [ ] Export chat history (Markdown/PDF)
- [ ] Code syntax highlighting (Shiki)
- [ ] Voice input support
- [ ] Multi-tab chat interface
- [ ] Custom system prompts
- [ ] Chat search functionality

### Technical Improvements
- [ ] E2E tests with Playwright
- [ ] Unit tests for components
- [ ] Performance monitoring
- [ ] Code splitting for faster loads

---

## 📚 Key Technologies

- **[Tauri 2.0](https://tauri.app/)** - Lightweight desktop framework
- **[Svelte 5](https://svelte.dev/)** - Modern reactive UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vite.dev/)** - Fast build tool
- **[shadcn-svelte](https://next.shadcn-svelte.com/)** - Copy-paste component library
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Ollama](https://ollama.com/)** - Local LLM runtime
- **[Rust](https://www.rust-lang.org/)** - High-performance backend language

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Original CodeHelper concept and implementation by SmolPC Team
- Migration to Svelte 5 architecture completed with Claude Code
- shadcn-svelte components by huntabyte and community
- Ollama for making local LLMs accessible

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/SmolPC-2-0/smolpc-codehelper/issues)
- **Discussions:** [GitHub Discussions](https://github.com/SmolPC-2-0/smolpc-codehelper/discussions)

---

**Made with ❤️ for students learning to code**
