# Pollinations API Playground

A ChatGPT-style web application for the [Pollinations API](https://gen.pollinations.ai) — generate text, images, video, audio, realtime voice, 3D models, and embeddings with a single API.

## Features

- **Chat** — Streaming chat completions with model selector, system prompts, and conversation history
- **Image** — URL-based image generation with img2img support
- **Video** — Video generation with duration, aspect ratio, and audio options
- **Audio** — Text-to-speech, music generation, and transcription
- **3D** — GLB model generation from reference images (Trellis)
- **Realtime Voice** — WebSocket voice sessions with live transcript
- **Embeddings** — OpenAI-compatible vector embeddings

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Vue 3](https://vuejs.org/) | Frontend framework |
| [Vite](https://vite.dev/) | Build tool and dev server |
| [Pinia](https://pinia.vuejs.org/) | State management |
| [Vue Router](https://router.vuejs.org/) | Client-side routing |
| [OpenAI SDK](https://github.com/openai/openai-node) | Chat/embeddings (Pollinations is OpenAI-compatible) |
| [pnpm](https://pnpm.io/) | Package manager |

## Project Structure

```
pollinations/
├── src/
│   ├── App.vue              # Root component
│   ├── main.js              # Entry point
│   ├── style.css            # Global styles (dark/light theme)
│   ├── components/
│   │   ├── SideBar.vue      # Navigation sidebar
│   │   └── TopBar.vue       # Top bar
│   ├── composables/         # Vue composables per feature
│   ├── views/               # Page views (8 routes)
│   ├── stores/              # Pinia stores (settings, conversations)
│   ├── services/
│   │   └── pollinations.js  # API service layer (openai SDK + fetch)
│   └── utils/               # Pure utility functions (TDD tested)
├── tests/                   # Unit tests (Vitest)
├── functions/
│   └── proxy.js             # Netlify serverless proxy
├── docs/                    # API documentation
├── demos/                   # Design reference (ModaChat)
├── index.html
├── vite.config.js
├── netlify.toml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- pnpm

### Installation

```bash
git clone https://github.com/pollinations/pollinations.git
cd pollinations
pnpm install
```

### Development

```bash
pnpm dev        # Start dev server
pnpm build      # Build for production
pnpm preview    # Preview production build
pnpm test       # Run unit tests
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
# Client-side API key (exposed to browser via VITE_ prefix)
VITE_POLLINATIONS_API_KEY=
VITE_OPENAI_BASE_URL=https://gen.pollinations.ai/v1

# Server-side secret key (for Netlify proxy)
POLLINATIONS_API=
```

## Deployment

### Netlify (recommended)

Connect your repository. The app auto-detects Vite + serverless functions via `netlify.toml`.

### Other hosting

```bash
pnpm build
# Serve the `dist/` folder with any static file server
```

## Testing

59 unit tests across 9 test files covering all utility functions:

```bash
pnpm test
```

## API Quick Examples

### Text Generation

```python
from openai import OpenAI
client = OpenAI(base_url="https://gen.pollinations.ai/v1", api_key="YOUR_KEY")
response = client.chat.completions.create(
    model="openai",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Image Generation

```
https://gen.pollinations.ai/image/a%20cat%20in%20space?model=flux
```

### Audio Generation

```bash
curl "https://gen.pollinations.ai/audio/Hello%20world?voice=nova" -o speech.mp3
```

## Links

- [API Documentation](https://gen.pollinations.ai/docs)
- [Pollinations Dashboard](https://enter.pollinations.ai)
- [GitHub Issues](https://github.com/pollinations/pollinations/issues)
- [Discord Community](https://discord.gg/pollinations-ai-885844321461485618)

## License

MIT

