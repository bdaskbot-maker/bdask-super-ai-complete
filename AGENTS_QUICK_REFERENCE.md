# BDAsk Super AI - Agents Quick Reference Guide

## 🎯 Quick Navigation

### **Need to choose an agent?**
- **Simple question?** → **AI Agent** (basic chat)
- **Complex task?** → **Super Agent** (planning + memory)
- **Building an app?** → **Dev Agent/E1** (full-stack development)

---

## 🤖 AI Agent - The Basics

**Best For**: Quick answers, file operations, web searches

### Quick API Call
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the capital of Bangladesh?",
    "conversation_id": "conv_1"
  }'
```

### Available Tools
- `file_read` - Read files
- `file_write` - Write/create files
- `web_search` - Search the web
- `code_execute` - Run code

### Key Limits
- 60 requests/min
- 120 second timeout
- Max 50 iterations

---

## 🚀 Super Agent - The Powerhouse

**Best For**: Complex projects, multi-step tasks, learning-based automation

### Quick API Call
```bash
curl -X POST http://localhost:5000/api/agent/chat/super \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Build a task management system",
    "enable_planning": true,
    "enable_memory": true,
    "enable_knowledge": true,
    "conversation_id": "super_1"
  }'
```

### Key Features
- **Planning**: Automatic task breakdown
- **Memory**: Short-term + long-term + learning
- **Knowledge**: Dynamic knowledge accumulation
- **Events**: Real-time progress updates

### Memory Types
| Type | Size | Use Case |
|------|------|----------|
| Short-term | 100 items | Current conversation |
| Long-term | 1000 items | Cross-session history |
| Learning | Variable | Extracted insights |

### Key Limits
- 30 requests/min
- 180 second timeout
- 1000 items per memory tier

---

## 🎯 Dev Agent (E1) - The Developer

**Best For**: Building complete applications from scratch

### Development Workflow
```
1. Analyze → 2. Frontend → 3. Contract → 4. Backend → 5. Integration → 6. Testing → 7. Deploy
```

### Quick Start
```bash
# Step 1: Analyze requirements
curl -X POST http://localhost:5000/api/dev/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": "Customer management app with payments",
    "conversation_id": "dev_1"
  }'

# Step 2: Generate frontend
curl -X POST http://localhost:5000/api/dev/frontend/generate \
  -d '{"requirements": "List, add, edit customers", "conversation_id": "dev_1"}'

# Step 3: Generate backend contracts
curl -X POST http://localhost:5000/api/dev/contracts/generate \
  -d '{"requirements": "CRUD operations", "conversation_id": "dev_1"}'

# Check progress
curl http://localhost:5000/api/dev/status
```

### What Gets Generated
- ✅ React components with mock data
- ✅ API contract specifications
- ✅ Backend models and endpoints
- ✅ Integration instructions
- ✅ Test plans
- ✅ Deployment configuration

### Key Limits
- 20 requests/min
- 300 second timeout
- 2000 items per memory tier

---

## 📊 Agent Comparison Cheat Sheet

```
┌─────────────────────┬──────────┬─────────────┬────────────┐
│ Feature             │ AI Agent │ Super Agent │ Dev Agent  │
├─────────────────────┼──────────┼─────────────┼────────────┤
│ Chat & Tools        │ ✅       │ ✅          │ ✅         │
│ Task Planning       │ ❌       │ ✅          │ ✅         │
│ Memory System       │ ❌       │ ✅          │ ✅         │
│ Knowledge Base      │ ❌       │ ✅          │ ✅         │
│ Frontend Gen        │ ❌       │ ❌          │ ✅         │
│ Backend Gen         │ ❌       │ ❌          │ ✅         │
│ Testing             │ ❌       │ ❌          │ ✅         │
│ Deployment          │ ❌       │ ❌          │ ✅         │
│ Rate Limit          │ 60/min   │ 30/min      │ 20/min     │
└─────────────────────┴──────────┴─────────────┴────────────┘
```

---

## 🔑 Essential Endpoints

### AI Agent
```
POST   /api/agent/chat              - Chat with tools
GET    /api/agent/health            - Health check
```

### Super Agent (All of above plus)
```
POST   /api/agent/chat/super        - Chat with planning/memory
GET    /api/agent/info              - Agent capabilities
```

### Dev Agent (All of above plus)
```
POST   /api/dev/analyze             - Analyze requirements
POST   /api/dev/frontend/generate   - Generate frontend
POST   /api/dev/contracts/generate  - Generate contracts
POST   /api/dev/backend/generate    - Generate backend
POST   /api/dev/integration/plan    - Integration plan
POST   /api/dev/testing/plan        - Testing plan
POST   /api/dev/deployment/config   - Deploy config
GET    /api/dev/status              - Development status
GET    /api/dev/report              - Progress report
```

---

## 💡 Common Use Cases

### Use Case 1: Quick Answer
```
Query: "What's the weather in Dhaka?"
Agent: AI Agent
Response Time: <2s
```

### Use Case 2: Data Analysis
```
Query: "Analyze my sales data and identify trends"
Agent: Super Agent
Time: ~5-10s
Includes: Planning, memory of analysis, knowledge stored
```

### Use Case 3: Build Todo App
```
Query: "Create a todo app with user authentication"
Agent: Dev Agent/E1
Time: ~30-60s for generation
Output: Frontend, backend, tests, deployment config
```

---

## 🎓 Request Response Pattern

### All Agents Return
```json
{
  "success": true/false,
  "response": "...",
  "conversation_id": "...",
  "meta": {
    "duration_ms": 2450,
    "iterations": 3,
    "model": "gemini-1.5-flash"
  }
}
```

### Super Agent Adds
```json
{
  "agent_info": { ... },
  "task_plan": { ... },
  "meta": {
    "memory_usage": {
      "shortTerm": 23,
      "longTerm": 8
    }
  }
}
```

### Dev Agent Adds
```json
{
  "analysis": { ... },
  "components": { ... },
  "contracts": { ... },
  "backend": { ... }
}
```

---

## ⚡ Performance Tips

### For AI Agent
- Keep messages concise
- Use workspace_root for file operations
- Enable tools only when needed

### For Super Agent
- Describe full context in first message
- Let it plan before executing
- Review memory for insights

### For Dev Agent
- Start with clear requirements
- Be specific about features
- Provide API keys upfront (if needed)

---

## 🔐 Security Best Practices

1. **Always use workspace_root**
   ```json
   {"workspace_root": "/safe/path"}
   ```

2. **Set appropriate timeouts**
   ```json
   {"max_iterations": 50}
   ```

3. **Manage API keys**
   ```bash
   export GEMINI_API_KEY="your_key"
   ```

4. **Use conversation IDs**
   ```json
   {"conversation_id": "unique_id"}
   ```

---

## 🐛 Troubleshooting

### Agent not responding?
```bash
# Check health
curl http://localhost:5000/api/agent/health

# Check logs
tail -f /path/to/logs
```

### Memory full?
- Super Agent auto-cleans short-term (100 item limit)
- Archive old long-term memory periodically

### Slow responses?
- Reduce max_iterations
- Check network connectivity
- Verify API keys are valid

---

## 📚 Full Documentation

- **Architecture**: `AI_AGENTS_ARCHITECTURE.md`
- **AI Agent API**: `AI_AGENT_API.md`
- **Super Agent API**: `SUPER_AGENT_API.md`
- **Dev Agent API**: `DEV_AGENT_API.md`
- **Implementation**: `AGENTS_IMPLEMENTATION_SUMMARY.md`

---

## 🎯 Decision Tree

```
User wants...
├─ Quick answer?
│  └─→ AI Agent
├─ Multi-step task?
│  └─→ Super Agent
├─ Build app?
│  └─→ Dev Agent/E1
└─ Something else?
   └─→ Check documentation
```

---

## ✨ Remember

- **AI Agent**: Fast & simple ⚡
- **Super Agent**: Smart & capable 🧠
- **Dev Agent**: Complete solution 🚀

Choose the right tier, and let the agent do the work! 🎉

---

**Last Updated**: July 2025
**Version**: 1.0
**Status**: Production Ready ✅
