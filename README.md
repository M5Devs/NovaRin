# NovaRin - Lightweight, Modular BYOK AI Web Interface

NovaRin is a high-performance, minimalist, and modular web chat client for LLMs built under the **AGPLv3** license. It follows a strictly client-side **BYOK (Bring Your Own Key)** architecture where all API keys and conversation histories are stored locally on the client (IndexedDB / LocalStorage) without bloated server or proxy dependencies.

---

## ✨ Key Features
- 🔑 **Bring Your Own Key (BYOK):** Direct client-side streaming requests to OpenAI, Google Gemini, OpenRouter, Groq, Ollama, LM Studio, or any custom OpenAI-compatible endpoint.
- ⚡ **Local Persistence:** Chat sessions and message streams persist offline across browser reloads using IndexedDB (`Dexie.js`) and LocalStorage.
- 🎨 **Minimalist Dark Theme:** Sleek, responsive cyber-clean dark interface powered by Tailwind CSS.
- 🧩 **Modular Plugin System:** Extensible plugin interface with `onBeforeMessageSend`, `onMessageReceived`, and UI hooks without core engine coupling. Includes a built-in "Word Counter" sample plugin.
- 📝 **Markdown & Code Highlighting:** High-performance markdown rendering with `react-markdown`, `remark-gfm`, syntax highlighting, and a one-click "Copy Code" button.
- 🛑 **Streaming & Control:** Real-time AI response streaming powered by Vercel AI SDK (`@ai-sdk/react`, `@ai-sdk/openai`, `@ai-sdk/google`) with stream abort/stop functionality.

---

## 🚀 Tech Stack
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide React Icons
- **AI Core:** Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`)
- **Persistence:** Dexie.js (IndexedDB) & LocalStorage
- **Markdown:** `react-markdown`, `remark-gfm`, `react-syntax-highlighter`

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/novarin/novarin.git
   cd novarin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development:**
   Run `npm run` `dev` in your terminal.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## ⚙️ How to Use
1. Launch NovaRin in your browser (`http://localhost:5173`).
2. Click **Configure API Keys** or open **Settings** from the sidebar.
3. Enter your **OpenAI API Key**, **Google Gemini API Key**, or set a **Custom Base URL** (e.g. `https://api.groq.com/openai/v1`).
4. Select your preferred model (or type a custom model ID) and start chatting!

---

## 📄 License
Licensed under the [GNU Affero General Public License v3.0 (AGPLv3)](./LICENSE).
