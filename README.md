# 🚀 BDAsk Super AI

Bangladesh's most advanced AI assistant with Claude Code capabilities. Built on top of the BDAsk platform, this Super AI can execute code, manage files, search the web, and automate complex tasks - all while speaking Bengali!

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-blue)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## ✨ Features

### Core Capabilities (from Claude Code)
- **🔧 Tool Execution**: Read, Write, Edit files; Execute bash commands; Search with Grep/Glob
- **🌐 Web Integration**: Search Google, fetch webpage content
- **📋 Task Management**: Todo lists, sub-agents for complex workflows
- **🔄 Agent Loop**: Multi-turn reasoning with tool execution
- **🛡️ Security**: Sandboxed execution, dangerous command blocking

### BD-Specific Features
- **🗣️ Bengali First**: Primary language support with Banglish
- **🏏 Cricket Updates**: Live scores for Bangladesh matches
- **🕌 Prayer Times**: Automatic prayer time reminders
- **💰 BDT Currency**: Local currency formatting
- **📅 BD Timezone**: Asia/Dhaka (UTC+6)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (optional, for persistence)
- Google Gemini API key

### 1. Clone and Install

```bash
git clone https://github.com/bdaskbot-maker/bdask-super-ai.git
cd bdask-super-ai
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required variables:
```env
GEMINI_API_KEY=your_gemini_api_key
WORKSPACE_ROOT=/path/to/workspace
PORT=5000
```

### 3. Run

```bash
# Development
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

## 🐳 Docker Deployment

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

## 📡 API Endpoints

### Chat (Standard)
```bash
POST /api/agent/chat
Content-Type: application/json

{
  "message": "Create a React component for user login",
  "enable_tools": true,
  "workspace_root": "/path/to/project"
}
```

Response:
```json
{
  "success": true,
  "response": "I've created the login component at src/components/Login.jsx",
  "conversation_id": "uuid",
  "tool_calls": [
    { "tool": "Write", "summary": "Writing Login.jsx", "status": "success" }
  ],
  "meta": {
    "duration_ms": 4523,
    "iterations": 3,
    "tool_calls_count": 1
  }
}
```

### Chat (Streaming)
```bash
POST /api/agent/chat/stream
```

Returns Server-Sent Events with real-time tool execution status.

### Health Check
```bash
GET /health
```

## 🛠️ Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `Read` | Read file contents | `Read: {file_path: "src/app.js"}` |
| `Write` | Create new files | `Write: {file_path: "test.js", content: "..."}` |
| `Edit` | Modify existing files | `Edit: {file_path: "app.js", old_string: "...", new_string: "..."}` |
| `Glob` | Find files by pattern | `Glob: {pattern: "**/*.js"}` |
| `Grep` | Search in files | `Grep: {pattern: "function", path: "src"}` |
| `Bash` | Execute commands | `Bash: {command: "npm test"}` |
| `WebSearch` | Google search | `WebSearch: {query: "Node.js best practices"}` |
| `WebFetch` | Fetch URL content | `WebFetch: {url: "https://example.com"}` |
| `TodoWrite` | Track tasks | `TodoWrite: {todos: [{id: "1", content: "Fix bug", status: "in_progress"}]}` |

## 💻 Frontend Integration

```html
<!-- Include the component -->
<script src="components/BDAskSuperChat.js"></script>

<!-- Initialize -->
<div id="chat-container"></div>
<script>
  const chat = new BDAskSuperChat('chat-container', {
    apiUrl: 'http://localhost:5000/api/agent',
    enableTools: true,
    language: 'auto' // 'bn', 'en', or 'auto'
  });
</script>
```

## 🔒 Security

- **Sandboxed Execution**: All bash commands run in isolated Docker containers
- **Command Blocking**: Dangerous commands (rm -rf /, mkfs, etc.) are blocked
- **Path Restriction**: File operations restricted to workspace directory
- **Rate Limiting**: 10 requests/minute per IP for agent endpoints
- **Input Validation**: All inputs sanitized and validated

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint
```

## 📁 Project Structure

```
bdask-super-ai/
├── src/
│   ├── tools/           # Tool implementations
│   │   └── index.js
│   ├── agent/           # Agent loop logic
│   │   └── AgentLoop.js
│   ├── routes/          # API routes
│   │   └── agent.js
│   ├── models/          # MongoDB schemas
│   │   └── index.js
│   ├── prompts/         # System prompts
│   │   └── bdask-agent-prompt.txt
│   └── server.js        # Main entry
├── frontend/
│   └── src/
│       └── components/
│           └── BDAskSuperChat.js
├── docker/
├── tests/
├── package.json
├── docker-compose.yml
└── README.md
```

## 🌍 Bengali Examples

### Creating a File
**User:** "আমার প্রোজেক্টে একটি নতুন ফাইল তৈরি করুন"

**AI:** 
```
✓ Created src/utils/helpers.js
```

### Web Search
**User:** "ক্রিকেট স্কোর দেখাও"

**AI:** 
```
🔍 Searching: Bangladesh cricket live score
📊 Bangladesh: 234/5 (45.2 overs)
   Run rate: 5.17
   Last wicket: Shakib Al Hasan - 45 runs
```

### Code Help
**User:** "Fix the bug in my login function"

**AI:**
```
🔧 Reading auth.js
🔍 Found issue at line 42
✏️ Editing: Fixed null pointer exception
✓ Tests passing
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- **Claude Code** by Anthropic - System prompt and tool design
- **Google Gemini** - AI model
- **BDAsk Team** - Bengali localization and BD-specific features

---

**বিডিআস্ক সুপার এআই** - বাংলাদেশের নিজস্ব AI সহকারী 🇧🇩
