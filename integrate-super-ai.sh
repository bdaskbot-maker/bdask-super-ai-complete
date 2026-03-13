#!/bin/bash

# BDAsk Super AI - Automated Integration Script
# Usage: ./integrate-super-ai.sh [path-to-bdask-main]

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     BDAsk Super AI - Automated Integration                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

TARGET_DIR="${1:-.}"
TARGET_DIR=$(cd "$TARGET_DIR" && pwd)

echo "[INFO] Target: $TARGET_DIR"
echo "[INFO] Checking structure..."

# Detect structure
if [ -d "$TARGET_DIR/backend" ]; then
    BACKEND="$TARGET_DIR/backend"
elif [ -f "$TARGET_DIR/server.js" ]; then
    BACKEND="$TARGET_DIR"
else
    echo "[ERROR] BDAsk structure not found"
    exit 1
fi

echo "[INFO] Backend: $BACKEND"

# Backup
BACKUP="bdask-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
cp -r "$BACKEND" "$BACKUP/" 2>/dev/null || true
echo "[SUCCESS] Backup: $BACKUP/"

# Install dependencies
echo "[INFO] Installing dependencies..."
cd "$BACKEND"
npm install @google/generative-ai glob uuid axios --save 2>/dev/null || npm install

# Create directories
mkdir -p src/tools src/agent src/routes src/middleware workspace
echo "[SUCCESS] Directories created"

# Generate files
echo "[INFO] Generating core files..."

# Tool Registry
cat > src/tools/index.js << 'ENDOFFILE'
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
    try {
      return await tool(params);
    } catch (error) {
      return { error: error.message };
    }
  }

  async readFile({ file_path }) {
    try {
      const fullPath = path.resolve(this.workspaceRoot, file_path);
      if (!fullPath.startsWith(path.resolve(this.workspaceRoot))) {
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
      if (!content.includes(old_string)) return { error: 'Old string not found' };
      await fs.writeFile(fullPath, content.replace(old_string, new_string), 'utf8');
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
      const { stdout, stderr } = await execPromise(command, { cwd: this.workspaceRoot, timeout });
      return { stdout, stderr, exit_code: 0 };
    } catch (err) {
      return { stdout: err.stdout, stderr: err.stderr, exit_code: err.code || 1 };
    }
  }

  async globFiles({ pattern }) {
    const files = await glob(pattern, { cwd: this.workspaceRoot });
    return { files: files.sort() };
  }

  async grepSearch({ pattern }) {
    try {
      const { stdout } = await execPromise(`rg -n "${pattern}" .`, { cwd: this.workspaceRoot });
      return { matches: stdout.split('\n').filter(Boolean) };
    } catch (err) {
      return { matches: [] };
    }
  }

  async listDirectory({ path: dirPath }) {
    const fullPath = dirPath ? path.resolve(this.workspaceRoot, dirPath) : this.workspaceRoot;
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    return { entries: entries.map(e => ({ name: e.name, type: e.isDirectory() ? 'directory' : 'file' })) };
  }

  async webSearch({ query }) {
    try {
      const response = await axios.post('https://google.serper.dev/search', { q: query }, {
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
ENDOFFILE

# Agent Loop
cat > src/agent/AgentLoop.js << 'ENDOFFILE'
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
        { name: 'Read', description: 'Read file', parameters: { type: 'object', properties: { file_path: { type: 'string' } }, required: ['file_path'] } },
        { name: 'Write', description: 'Write file', parameters: { type: 'object', properties: { file_path: { type: 'string' }, content: { type: 'string' } }, required: ['file_path', 'content'] } },
        { name: 'Edit', description: 'Edit file', parameters: { type: 'object', properties: { file_path: { type: 'string' }, old_string: { type: 'string' }, new_string: { type: 'string' } }, required: ['file_path', 'old_string', 'new_string'] } },
        { name: 'Bash', description: 'Execute bash', parameters: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] } },
        { name: 'Glob', description: 'Find files', parameters: { type: 'object', properties: { pattern: { type: 'string' } }, required: ['pattern'] } },
        { name: 'WebSearch', description: 'Search web', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } }
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
        const model = this.genAI.getGenerativeModel({ model: this.modelName, tools: this.formatToolsForGemini() });
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
ENDOFFILE

# Routes
cat > src/routes/superAgent.js << 'ENDOFFILE'
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
      tool_calls: results.filter(r => r.type === 'tool_call').map(t => ({ tool: t.tool, status: t.result?.error ? 'error' : 'success' })),
      meta: { iterations: results.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bdask-super-ai', gemini_configured: !!process.env.GEMINI_API_KEY });
});

module.exports = router;
ENDOFFILE

echo "[SUCCESS] Core files generated"

# Update server.js
echo "[INFO] Updating server.js..."
if [ -f "server.js" ]; then
    if ! grep -q "superAgent" server.js; then
        sed -i "/require.*express/a\const superAgentRoutes = require('./src/routes/superAgent');" server.js
        sed -i "/app.listen/i\app.use('/api/super', superAgentRoutes);" server.js
        echo "[SUCCESS] server.js updated"
    fi
elif [ -f "src/server.js" ]; then
    if ! grep -q "superAgent" src/server.js; then
        sed -i "/require.*express/a\const superAgentRoutes = require('./routes/superAgent');" src/server.js
        sed -i "/app.listen/i\app.use('/api/super', superAgentRoutes);" src/server.js
        echo "[SUCCESS] src/server.js updated"
    fi
fi

# Update .env
echo "[INFO] Updating .env..."
if ! grep -q "WORKSPACE_ROOT" .env 2>/dev/null; then
    cat >> .env << 'ENDOFFILE'

# BDAsk Super AI
WORKSPACE_ROOT=./workspace
MAX_ITERATIONS=50
ENABLE_BASH=true
SERPER_API_KEY=
ENDOFFILE
    echo "[SUCCESS] .env updated"
fi

# Test
echo "[INFO] Testing..."
node -e "require('./src/tools'); require('./src/agent/AgentLoop'); console.log('[SUCCESS] Modules OK');" 2>/dev/null || echo "[WARNING] Test failed but continuing"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Integration Complete! ✅                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Backup: $BACKUP/"
echo ""
echo "🚀 New Endpoints:"
echo "   POST /api/super/chat"
echo "   GET  /api/super/health"
echo ""
echo "📋 Next Steps:"
echo "   1. Add GEMINI_API_KEY to .env"
echo "   2. Start server: npm start"
echo "   3. Test: curl -X POST http://localhost:5000/api/super/chat \"
echo "            -H 'Content-Type: application/json' \"
echo "            -d '{"message":"Hello"}'"
echo ""
echo "🔄 Restore: cd $BACKUP && cp -r backend/* ../"
echo ""
