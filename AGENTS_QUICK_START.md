# BDAsk AI Agents - Quick Start Guide

## Three Agent Tiers Explained

### 🤖 Tier 1: AI Agent
**For:** Quick answers, code help, file operations  
**Response Time:** 1-2 seconds  
**Cost:** ~$0.01 per request

```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Help me fix this code", "tier": "ai-agent"}'
```

### 🧠 Tier 2: Super Agent
**For:** Complex projects, planning, learning  
**Response Time:** 2-5 seconds  
**Cost:** ~$0.03 per request  
**Extra Features:** Memory, planning, knowledge base

```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a project plan for my startup", "tier": "super-agent"}'
```

### 🚀 Tier 3: Dev Agent
**For:** Building full applications  
**Response Time:** 5-10 seconds  
**Cost:** ~$0.10 per request  
**Extra Features:** Frontend + backend development, testing, deployment

```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Build a Todo app with React", "tier": "dev-agent"}'
```

---

## Quick Decision Tree

```
What do you need?
│
├─→ Simple answer/help? → AI Agent ✅
├─→ Plan a complex project? → Super Agent ✅
└─→ Build a full app? → Dev Agent ✅
```

---

## Sample Requests

### AI Agent Request
```json
{
  "message": "Convert this JavaScript to TypeScript: const x = 5;",
  "model": "gpt-4o",
  "tier": "ai-agent"
}
```

### Super Agent Request
```json
{
  "message": "Plan a system for managing a small business: inventory, sales, reporting",
  "model": "gpt-4o",
  "tier": "super-agent"
}
```

### Dev Agent Request
```json
{
  "message": "Build a weather app: React frontend with OpenWeather API, Express backend, MongoDB for saved locations",
  "model": "gpt-4o",
  "tier": "dev-agent"
}
```

---

## Getting the API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

---

## Testing in Terminal

### Get Agent Info
```bash
curl http://localhost:3000/api/agent/chat
```

### Simple AI Agent Request
```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! What are the three agent tiers?",
    "tier": "ai-agent"
  }'
```

### With Custom Model
```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain quantum computing",
    "model": "gpt-4o",
    "tier": "ai-agent"
  }'
```

---

## What Each Agent Does

| Task | AI Agent | Super Agent | Dev Agent |
|------|----------|-------------|-----------|
| Answer questions | ✅ | ✅ | ✅ |
| Debug code | ✅ | ✅ | ✅ |
| Create project plans | ❌ | ✅ | ✅ |
| Build full app | ❌ | ❌ | ✅ |
| Generate tests | ❌ | ❌ | ✅ |
| Deploy applications | ❌ | ❌ | ✅ |

---

## Pro Tips

1. **Start with AI Agent** for simple tasks (faster, cheaper)
2. **Use Super Agent** when you need planning or multi-step reasoning
3. **Use Dev Agent** to build complete applications
4. **Always set the tier** in your request - defaults to ai-agent
5. **Check response times** - Dev Agent might take 5-10 seconds

---

## Where to Find More Info

- **Full Guide:** See `AGENT_TIERS_GUIDE.md`
- **API Details:** Check `app/api/agent/chat/route.ts`
- **Examples:** Look at provided curl commands
- **Troubleshooting:** Check debug logs in terminal

---

## Common Responses

### Success Response (AI Agent)
```json
{
  "success": true,
  "response": "I am AI Agent...",
  "agent_tier": "ai-agent",
  "meta": {
    "duration_ms": 1234,
    "model": "GPT-4 Omni"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "OPENAI_API_KEY not configured"
}
```

---

## Next Steps

1. ✅ Set up OpenAI API key
2. ✅ Test with a simple AI Agent request
3. ✅ Try Super Agent for planning
4. ✅ Use Dev Agent to build something!
