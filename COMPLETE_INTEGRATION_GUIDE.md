# BDAsk Super AI - Complete Integration Guide

This guide walks you through integrating Claude Code capabilities into your existing BDAsk project step-by-step.

## Table of Contents
1. [Pre-Integration Checklist](#pre-integration-checklist)
2. [Step-by-Step Integration](#step-by-step-integration)
3. [Database Schema Updates](#database-schema-updates)
4. [Frontend Integration](#frontend-integration)
5. [Testing & Validation](#testing--validation)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Integration Checklist

### Current BDAsk Structure Assessment
```
bdask-main/
├── backend/
│   ├── server.js              # Main entry point
│   ├── routes/
│   │   ├── chat.js            # Existing chat routes
│   │   ├── cricket.js         # Cricket API
│   │   ├── news.js            # News API
│   │   └── ...
│   ├── models/
│   │   ├── Chat.js            # Chat history
│   │   └── User.js            # User model
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── app.js                 # Main app
│   └── components/
│       └── ChatComponent.js   # Existing chat UI
└── package.json
```

### Required API Keys
- [ ] Google Gemini API key (from [ai.google.dev](https://ai.google.dev))
- [ ] (Optional) Serper API key for web search ([serper.dev](https://serper.dev))

---

## Step-by-Step Integration

### Step 1: Backup Your Current Project

```bash
cd /path/to/bdask-main
git branch backup-pre-super-ai
git add .
git commit -m "Backup before Super AI integration"
```

### Step 2: Install New Dependencies

```bash
cd backend
npm install @google/generative-ai@latest glob@latest uuid@latest axios
```

### Step 3: Create Directory Structure

```bash
cd backend/src
mkdir -p tools agent prompts middleware
```

### Step 4: Copy Core Files

#### 4.1 Tool Registry (`backend/src/tools/index.js`)

```javascript
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const { glob } = require('glob');
const axios = require('axios');

const execPromise = util.promisify(exec);

class ToolRegistry {
  constructor(config = {}) {
    this.tools = new Map();
    this.workspaceRoot = config.workspaceRoot || process.cwd();
    this.registerCoreTools();
  }

  registerCoreTools() {
    this.register('Read', this.readFile.bind(this));
    this.register('Write', this.writeFile.bind(this));
    this.register('Edit', this.editFile.bind(this));
    this.register('Glob', this.globFiles.bind(this));
    this.register('Grep', this.grepSearch.bind(this));
    this.register('LS', this.listDirectory.bind(this));
    this.register('Bash', this.executeBash.bind(this));
    this.register('WebSearch', this.webSearch.bind(this));
    this.register('WebFetch', this.webFetch.bind(this));
  }

  register(name, handler) {
    this.tools.set(name, handler);
  }

  async execute(toolName, params) {
    const tool = this.tools.get(toolName);
    if (!tool) throw new Error(`Tool ${toolName} not found`);
    return await tool(params);
  }

  async readFile({ file_path }) {
    try {
      const fullPath = path.resolve(this.workspaceRoot, file_path);
      if (!fullPath.startsWith(this.workspaceRoot)) {
        return { error: 'Access denied' };
      }
      const content = await fs.readFile(fullPath, 'utf8');
      return { content, file_path: fullPath };
    } catch (err) {
      return { error: err.message };
    }
  }

  async writeFile({ file_path, content }) {
    try {
      const fullPath = path.resolve(this.workspaceRoot, file_path);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf8');
      return { success: true, file_path: fullPath };
    } catch (err) {
      return { error: err.message };
    }
  }

  async editFile({ file_path, old_string, new_string }) {
    try {
      const fullPath = path.resolve(this.workspaceRoot, file_path);
      const content = await fs.readFile(fullPath, 'utf8');
      if (!content.includes(old_string)) {
        return { error: 'Old string not found' };
      }
      const newContent = content.replace(old_string, new_string);
      await fs.writeFile(fullPath, newContent, 'utf8');
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  }

  async executeBash({ command, timeout = 60000 }) {
    const blocked = ['rm -rf /', 'mkfs', 'dd if=/dev/zero', ':(){ :|: & };:'];
    if (blocked.some(b => command.includes(b))) {
      return { error: 'Dangerous command blocked', blocked: true };
    }
    try {
      const { stdout, stderr } = await execPromise(command, { 
        cwd: this.workspaceRoot, timeout 
      });
      return { stdout, stderr, exit_code: 0 };
    } catch (err) {
      return { stdout: err.stdout, stderr: err.stderr, exit_code: err.code || 1 };
    }
  }

  async globFiles({ pattern }) {
    const files = await glob(pattern, { cwd: this.workspaceRoot });
    return { files: files.sort() };
  }

  async grepSearch({ pattern, path: searchPath }) {
    try {
      const { stdout } = await execPromise(
        `rg -n "${pattern}" ${searchPath || '.'}`,
        { cwd: this.workspaceRoot }
      );
      return { matches: stdout.split('\n').filter(Boolean) };
    } catch (err) {
      return { matches: [] };
    }
  }

  async listDirectory({ path: dirPath }) {
    const fullPath = dirPath ? path.resolve(this.workspaceRoot, dirPath) : this.workspaceRoot;
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    return {
      entries: entries.map(e => ({
        name: e.name,
        type: e.isDirectory() ? 'directory' : 'file'
      }))
    };
  }

  async webSearch({ query }) {
    try {
      const response = await axios.post('https://google.serper.dev/search', {
        q: query
      }, {
        headers: { 'X-API-KEY': process.env.SERPER_API_KEY }
      });
      return { results: response.data.organic || [] };
    } catch (err) {
      return { error: err.message };
    }
  }

  async webFetch({ url }) {
    try {
      const response = await axios.get(url, { timeout: 30000 });
      let content = response.data;
      if (typeof content === 'string' && content.includes('<')) {
        content = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      return { content: content.substring(0, 15000) };
    } catch (err) {
      return { error: err.message };
    }
  }
}

module.exports = ToolRegistry;
```

#### 4.2 Agent Loop (`backend/src/agent/AgentLoop.js`)

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ToolRegistry = require('../tools');

class AgentLoop {
  constructor(config = {}) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.modelName = config.model || 'gemini-2.0-flash-exp';
    this.workspaceRoot = config.workspaceRoot || process.cwd();
    this.maxIterations = config.maxIterations || 50;
    this.conversationHistory = [];
    this.tools = new ToolRegistry({ workspaceRoot: this.workspaceRoot });
  }

  formatToolsForGemini() {
    return {
      functionDeclarations: [
        {
          name: 'Read',
          description: 'Read a file',
          parameters: {
            type: 'object',
            properties: { file_path: { type: 'string' } },
            required: ['file_path']
          }
        },
        {
          name: 'Write',
          description: 'Write a file',
          parameters: {
            type: 'object',
            properties: { file_path: { type: 'string' }, content: { type: 'string' } },
            required: ['file_path', 'content']
          }
        },
        {
          name: 'Edit',
          description: 'Edit a file',
          parameters: {
            type: 'object',
            properties: { file_path: { type: 'string' }, old_string: { type: 'string' }, new_string: { type: 'string' } },
            required: ['file_path', 'old_string', 'new_string']
          }
        },
        {
          name: 'Bash',
          description: 'Execute bash command',
          parameters: {
            type: 'object',
            properties: { command: { type: 'string' } },
            required: ['command']
          }
        },
        {
          name: 'Glob',
          description: 'Find files',
          parameters: {
            type: 'object',
            properties: { pattern: { type: 'string' } },
            required: ['pattern']
          }
        },
        {
          name: 'WebSearch',
          description: 'Search web',
          parameters: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query']
          }
        }
      ]
    };
  }

  async run(userInput, systemPrompt) {
    this.conversationHistory = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood.' }] },
      { role: 'user', parts: [{ text: userInput }] }
    ];

    const results = [];
    let iterations = 0;

    while (iterations < this.maxIterations) {
      iterations++;
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          tools: this.formatToolsForGemini()
        });

        const result = await model.generateContent({ contents: this.conversationHistory });
        const response = result.response;
        const functionCalls = response.functionCalls();

        if (!functionCalls || functionCalls.length === 0) {
          results.push({ type: 'final', content: response.text() });
          break;
        }

        const call = functionCalls[0];
        const toolResult = await this.tools.execute(call.name, call.args);
        results.push({ type: 'tool_call', tool: call.name, result: toolResult });

        this.conversationHistory.push(
          { role: 'model', parts: [{ functionCall: call }] },
          { role: 'user', parts: [{ functionResponse: { name: call.name, response: toolResult } }] }
        );
      } catch (error) {
        results.push({ type: 'error', error: error.message });
        break;
      }
    }
    return results;
  }
}

module.exports = AgentLoop;
```

#### 4.3 Routes (`backend/src/routes/superAgent.js`)

```javascript
const express = require('express');
const router = express.Router();
const AgentLoop = require('../agent/AgentLoop');
const { v4: uuidv4 } = require('uuid');

const SYSTEM_PROMPT = `You are BDAsk Super AI - Bangladesh's AI assistant with coding capabilities.
Language: Bengali (primary), English, Banglish
Tone: Concise, direct, respectful
Use ONE tool at a time. Never expose secrets.`;

router.post('/chat', async (req, res) => {
  try {
    const { message, enable_tools = true } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message required' });

    const agent = new AgentLoop({ workspaceRoot: process.env.WORKSPACE_ROOT || process.cwd() });
    const results = await agent.run(message, SYSTEM_PROMPT);
    const final = results[results.length - 1];

    res.json({
      success: final.type !== 'error',
      response: final.content || final.error,
      conversation_id: uuidv4(),
      tool_calls: results.filter(r => r.type === 'tool_call').map(t => ({
        tool: t.tool,
        status: t.result?.error ? 'error' : 'success'
      })),
      meta: { iterations: results.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### Step 5: Update Main Server

Edit `backend/server.js`:

```javascript
// Add at the top
const superAgentRoutes = require('./src/routes/superAgent');

// Add after other routes
app.use('/api/super', superAgentRoutes);
```

### Step 6: Environment Variables

Add to `backend/.env`:
```env
WORKSPACE_ROOT=./workspace
SERPER_API_KEY=optional_for_web_search
MAX_ITERATIONS=50
ENABLE_BASH=true
```

Create workspace:
```bash
mkdir -p backend/workspace
```

---

## Database Schema Updates

Create `backend/models/SuperChat.js`:

```javascript
const mongoose = require('mongoose');

const superChatSchema = new mongoose.Schema({
  conversation_id: { type: String, index: true },
  user_id: String,
  messages: [{
    role: String,
    content: String,
    tool_calls: Array,
    timestamp: Date
  }],
  metadata: {
    iterations: Number,
    tools_used: [String]
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SuperChat', superChatSchema);
```

---

## Frontend Integration

Add mode toggle to your chat component:

```javascript
class UnifiedChat {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.mode = 'standard';
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="chat-header">
        <h3>BDAsk AI</h3>
        <label class="switch">
          <input type="checkbox" id="mode-switch">
          <span class="slider"></span>
        </label>
        <span id="mode-label">Standard</span>
      </div>
      <div id="messages"></div>
      <div class="input-area">
        <input type="text" id="message-input" placeholder="Type message...">
        <button id="send-btn">Send</button>
      </div>
    `;

    this.container.querySelector('#mode-switch').addEventListener('change', (e) => {
      this.mode = e.target.checked ? 'super' : 'standard';
      this.container.querySelector('#mode-label').textContent = 
        this.mode === 'super' ? '🚀 Super' : 'Standard';
    });

    this.container.querySelector('#send-btn').addEventListener('click', () => this.send());
  }

  async send() {
    const input = this.container.querySelector('#message-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    const endpoint = this.mode === 'super' ? '/api/super/chat' : '/api/chat';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, enable_tools: true })
    });

    const data = await res.json();
    this.addMessage(data.response, data.tool_calls);
  }

  addMessage(content, toolCalls) {
    const div = document.createElement('div');
    div.innerHTML = content;
    if (toolCalls) {
      div.innerHTML += `<div class="tools">${toolCalls.map(t => t.tool).join(', ')}</div>`;
    }
    this.container.querySelector('#messages').appendChild(div);
  }
}
```

---

## Testing & Validation

```bash
# Test API
curl -X POST http://localhost:5000/api/super/chat \
  -H "Content-Type: application/json" \
  -d '{ "message": "Say hello in Bengali" }'

# Test with tools
curl -X POST http://localhost:5000/api/super/chat \
  -H "Content-Type: application/json" \
  -d '{ "message": "List files", "enable_tools": true }'
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Tool not found" | Check `backend/src/tools/index.js` exists |
| "Access denied" | Set `WORKSPACE_ROOT` env variable |
| Gemini API error | Verify `GEMINI_API_KEY` is valid |
| CORS error | Update CORS origin in server.js |

---

**Integration Complete!** Your BDAsk now has Super AI capabilities.
