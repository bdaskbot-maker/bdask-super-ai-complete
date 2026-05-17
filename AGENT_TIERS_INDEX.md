# BDAsk AI Agent Tiers - Complete Index

## 🎯 Start Here

### Quick Navigation
- **Just want to start?** → Read `AGENTS_QUICK_START.md` (5 min)
- **Need full details?** → Read `AGENT_TIERS_GUIDE.md` (15 min)
- **Migrating from NVIDIA?** → Read `OPENAI_MIGRATION_COMPLETE.md` (10 min)
- **Check the code?** → See `app/api/agent/chat/route.ts`

---

## 📚 Documentation Structure

### Quick Start Documents
| Document | Purpose | Read Time |
|----------|---------|-----------|
| `AGENTS_QUICK_START.md` | Quick reference with examples | 5 min |
| `AGENT_TIERS_GUIDE.md` | Comprehensive guide for all tiers | 15 min |
| `OPENAI_MIGRATION_COMPLETE.md` | OpenAI API migration details | 10 min |

### Code Location
**Main file:** `app/api/agent/chat/route.ts`
- Lines 8-12: AI Agent system prompt
- Lines 14-20: Super Agent system prompt
- Lines 22-28: Dev Agent system prompt
- Lines 30-68: OpenAI models configuration
- Lines 70-155: POST endpoint (chat logic)
- Lines 179-211: GET endpoint (info endpoint)

---

## 🤖 The Three Agent Tiers

### 1️⃣ AI Agent (Tier 1)
**Primary Use:** General questions, code help, quick answers  
**Speed:** 1-2 seconds  
**Cost:** ~$0.01 per request

**System Prompt Location:** Lines 8-12  
**Request Parameter:** `"tier": "ai-agent"`

**Capabilities:**
- Natural language understanding
- File operations
- Web search
- Code execution
- Real-time chat

### 2️⃣ Super Agent (Tier 2)
**Primary Use:** Complex projects, planning, learning  
**Speed:** 2-5 seconds  
**Cost:** ~$0.03 per request

**System Prompt Location:** Lines 14-20  
**Request Parameter:** `"tier": "super-agent"`

**Capabilities:**
- Everything from AI Agent +
- Task planning
- 3-tier memory management
- Knowledge learning
- Advanced reasoning

### 3️⃣ Dev Agent (Tier 3)
**Primary Use:** Full-stack development automation  
**Speed:** 5-10 seconds  
**Cost:** ~$0.10 per request

**System Prompt Location:** Lines 22-28  
**Request Parameter:** `"tier": "dev-agent"`

**Capabilities:**
- Everything from Super Agent +
- Frontend development (React)
- Backend development (Express/FastAPI)
- Database design
- Testing automation
- Deployment configuration

---

## 🔧 Configuration

### Environment Variables
```env
# Required
OPENAI_API_KEY=sk-...

# Optional
OPENAI_DEFAULT_MODEL=gpt-4o
```

### Available Models
1. `gpt-4o` (Recommended) - Most capable
2. `gpt-4-turbo` - Faster, good balance
3. `gpt-3.5-turbo` - Budget option

### Model Definition
**Location:** Lines 30-68 in `app/api/agent/chat/route.ts`

---

## 📡 API Endpoints

### POST `/api/agent/chat`
Send a message to any agent tier

**Request:**
```json
{
  "message": "Your task here",
  "model": "gpt-4o",
  "tier": "ai-agent|super-agent|dev-agent",
  "conversation_id": "optional"
}
```

**Response:**
```json
{
  "success": true,
  "response": "AI response",
  "agent_tier": "ai-agent",
  "meta": { "duration_ms": 1234 }
}
```

### GET `/api/agent/chat`
Get agent information and available models

**Response:**
```json
{
  "status": "ok",
  "agents": {
    "ai-agent": { ... },
    "super-agent": { ... },
    "dev-agent": { ... }
  },
  "available_models": [ ... ]
}
```

---

## 📖 How to Use Each Agent

### AI Agent Example
```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is machine learning?",
    "tier": "ai-agent"
  }'
```

### Super Agent Example
```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a 3-month project plan for a SaaS startup",
    "tier": "super-agent"
  }'
```

### Dev Agent Example
```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Build a real-time chat application with React frontend and Node.js backend",
    "tier": "dev-agent"
  }'
```

---

## 📊 Decision Guide

Choose your agent based on task complexity:

```
Task Complexity
       ▲
       │                    Dev Agent (🚀)
       │                   /
       │                 /
       │    Super Agent (🧠)
       │              /
       │            /
       │  AI Agent (🤖)
       │
       └─────────────────────────────────▶
         Low          Medium         High
```

**Simple tasks?** → Use AI Agent (faster, cheaper)  
**Complex planning?** → Use Super Agent (features)  
**Build full app?** → Use Dev Agent (complete)

---

## 🚀 Deployment Checklist

Before deploying to Vercel:

- [ ] ✅ OpenAI API key obtained
- [ ] ✅ `OPENAI_API_KEY` added to Vercel environment
- [ ] ✅ `.env.example` updated
- [ ] ✅ `app/api/agent/chat/route.ts` has three prompts
- [ ] ✅ Models configured (lines 30-68)
- [ ] ✅ Endpoints working locally
- [ ] ✅ Documentation reviewed

**Status: ✅ Ready for deployment**

---

## 🔍 Code Review Checklist

### System Prompts
- [ ] AI Agent prompt: Lines 8-12 ✅
- [ ] Super Agent prompt: Lines 14-20 ✅
- [ ] Dev Agent prompt: Lines 22-28 ✅

### Models Configuration  
- [ ] OpenAI models object: Lines 30-68 ✅
- [ ] All 3 models defined: gpt-4o, gpt-4-turbo, gpt-3.5-turbo ✅
- [ ] Type exports: ModelKey and AgentTier ✅

### API Logic
- [ ] POST handler: Lines 70-155 ✅
- [ ] Tier selection logic: Line 118-124 ✅
- [ ] OpenAI API call: Line 135-148 ✅
- [ ] Response formatting: Line 160-170 ✅

### Error Handling
- [ ] Input validation: Lines 85-100 ✅
- [ ] API key check: Lines 105-111 ✅
- [ ] Error responses: Lines 152-157 ✅

---

## 📞 Support & Resources

### If You Have Questions

1. **About AI Agent?** → See `AGENT_TIERS_GUIDE.md` (Section: Tier 1)
2. **About Super Agent?** → See `AGENT_TIERS_GUIDE.md` (Section: Tier 2)
3. **About Dev Agent?** → See `AGENT_TIERS_GUIDE.md` (Section: Tier 3)
4. **Quick examples?** → See `AGENTS_QUICK_START.md`
5. **API details?** → See `OPENAI_MIGRATION_COMPLETE.md`

### Key Files to Reference

- **API Route:** `app/api/agent/chat/route.ts`
- **Configuration:** `.env.example`
- **Docs:** This directory (`.md` files)

---

## ✨ Summary

**BDAsk AI now has three distinct agent tiers:**

1. **AI Agent** (🤖) - Foundation layer
2. **Super Agent** (🧠) - Enterprise layer
3. **Dev Agent** (🚀) - Development layer

Each has:
- ✅ Clear system prompt
- ✅ Defined capabilities
- ✅ Distinct use cases
- ✅ Separate tier parameter
- ✅ Complete documentation

**All using OpenAI API with clear pricing and performance characteristics.**

---

## 🎯 Next Steps

1. **Read:** Choose a documentation file above
2. **Setup:** Add OPENAI_API_KEY to environment
3. **Test:** Try one of the curl examples
4. **Choose:** Pick the right agent for your task
5. **Deploy:** Push to Vercel when ready

**Happy coding! 🚀**
