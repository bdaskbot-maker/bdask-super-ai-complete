# BDAsk AI Agent Tiers Guide

## Overview

BDAsk Super AI implements a three-tier agent architecture using OpenAI models. Each tier serves a specific purpose and capability level.

---

## 🤖 Tier 1: AI Agent

### Purpose
Foundational conversational AI assistant for general-purpose tasks.

### Capabilities
- **Natural Language Understanding**: Bengali & English
- **File Operations**: Read, write, search files
- **Web Search**: Information retrieval
- **Code Execution**: Run and debug code
- **Real-time Chat**: Streaming responses

### Default Model
- `gpt-4o` (recommended)
- `gpt-4-turbo` (faster)
- `gpt-3.5-turbo` (budget)

### API Request
```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, who are you?",
    "model": "gpt-4o",
    "tier": "ai-agent"
  }'
```

### Response Format
```json
{
  "success": true,
  "response": "I am AI Agent, BDAsk's foundational AI assistant...",
  "conversation_id": "conv_1234567890",
  "agent_tier": "ai-agent",
  "meta": {
    "duration_ms": 1234,
    "model": "GPT-4 Omni",
    "provider": "OpenAI"
  }
}
```

### Use Cases
- Customer support chatbot
- FAQ answering
- Code review assistance
- Documentation queries
- General knowledge questions

---

## 🧠 Tier 2: Super Agent

### Purpose
Enterprise-grade autonomous agent with advanced planning and memory.

### Advanced Capabilities
- **Task Planning**: Automated step-by-step breakdown
- **Memory Management**: 
  - Short-term: Session context
  - Long-term: Persistent storage
  - Learning: Extracted insights
- **Knowledge Base**: Dynamic knowledge accumulation
- **Complex Reasoning**: Multi-step problem solving
- **Event Streaming**: Real-time progress updates

### Key Features
- Persistent context across conversations
- Learns from previous interactions
- Creates task execution plans
- Handles complex multi-step requests
- Provides detailed analytics

### API Request
```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a project plan for building a web app",
    "model": "gpt-4o",
    "tier": "super-agent"
  }'
```

### Response Format
```json
{
  "success": true,
  "response": "I will create a comprehensive project plan...",
  "conversation_id": "conv_1234567890",
  "agent_tier": "super-agent",
  "meta": {
    "duration_ms": 2345,
    "model": "GPT-4 Omni",
    "memory_state": {
      "short_term": 5,
      "long_term": 12,
      "learnings": 3
    },
    "task_plan": {
      "steps": 7,
      "status": "active"
    }
  }
}
```

### Use Cases
- Project management
- Complex problem solving
- Knowledge worker automation
- Research coordination
- Strategic planning
- Continuous learning systems

---

## 🚀 Tier 3: Dev Agent (E1)

### Purpose
Full-stack development automation specialist for building complete applications.

### Development Capabilities
- **Frontend Development**: React components with mock data
- **Backend Development**: Express.js/FastAPI endpoints
- **Database Design**: Schema creation and relationships
- **Testing Framework**: Automated test generation
- **API Integration**: Contract-driven development
- **Deployment**: Production-ready configuration
- **Documentation**: Auto-generated specs

### Workflow
1. **Requirements Analysis**: Understanding project needs
2. **Frontend Prototype**: Mock-driven UI development
3. **API Contract**: Define interfaces and data models
4. **Backend Implementation**: Build actual APIs
5. **Integration**: Connect frontend and backend
6. **Testing**: Automated test suite
7. **Deployment**: Production deployment config

### API Request
```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Build a todo app with React and Express",
    "model": "gpt-4o",
    "tier": "dev-agent"
  }'
```

### Response Format
```json
{
  "success": true,
  "response": "I will build a complete todo application...",
  "conversation_id": "conv_1234567890",
  "agent_tier": "dev-agent",
  "development": {
    "frontend": {
      "framework": "React",
      "components": 8,
      "pages": 2
    },
    "backend": {
      "framework": "Express.js",
      "endpoints": 12,
      "database": "MongoDB"
    },
    "testing": {
      "unit_tests": true,
      "integration_tests": true,
      "e2e_tests": true
    },
    "deployment": {
      "provider": "Vercel",
      "config": "production-ready"
    }
  },
  "meta": {
    "duration_ms": 5000,
    "model": "GPT-4 Omni"
  }
}
```

### Use Cases
- Full-stack web application development
- Microservice creation
- API development
- DevOps automation
- Rapid prototyping
- Legacy code modernization
- Full project scaffolding

---

## 📊 Agent Comparison Matrix

| Feature | AI Agent | Super Agent | Dev Agent |
|---------|----------|-------------|-----------|
| Conversation | ✅ | ✅ | ✅ |
| File Operations | ✅ | ✅ | ✅ |
| Web Search | ✅ | ✅ | ✅ |
| Task Planning | ❌ | ✅ | ✅ |
| Memory Management | ❌ | ✅ | ✅ |
| Knowledge Learning | ❌ | ✅ | ✅ |
| Frontend Dev | ❌ | ❌ | ✅ |
| Backend Dev | ❌ | ❌ | ✅ |
| Testing | ❌ | ❌ | ✅ |
| Deployment | ❌ | ❌ | ✅ |

---

## 🔄 Switching Between Agents

Simply change the `tier` parameter in your API request:

```bash
# AI Agent
"tier": "ai-agent"

# Super Agent
"tier": "super-agent"

# Dev Agent
"tier": "dev-agent"
```

---

## 📈 Performance Characteristics

| Metric | AI Agent | Super Agent | Dev Agent |
|--------|----------|-------------|-----------|
| Avg Response Time | 1-2s | 2-5s | 5-10s |
| Token Usage | ~500 | ~1500 | ~3000 |
| Memory Overhead | Minimal | Medium | High |
| Recommended QPS | 60 | 30 | 10 |
| Cost Per Request | $0.01 | $0.03 | $0.10 |

---

## 🛠️ Configuration

### Environment Variables
```env
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-4o
```

### Default Models
- AI Agent: `gpt-4o`
- Super Agent: `gpt-4o`
- Dev Agent: `gpt-4o`

---

## 🔐 Security & Limits

- Max message length: 10,000 characters
- Rate limiting: Per-tier customized
- Timeout: 30 seconds per request
- Memory retention: 100 items (short-term)

---

## 📝 Examples

### AI Agent: Quick Answer
```json
{
  "message": "What is 2+2?",
  "tier": "ai-agent"
}
```

### Super Agent: Complex Task
```json
{
  "message": "Create a project plan for a e-commerce website with user authentication",
  "tier": "super-agent"
}
```

### Dev Agent: Build Application
```json
{
  "message": "Build a movie recommendation system with React frontend and Python Flask backend",
  "tier": "dev-agent"
}
```

---

## 🚀 Getting Started

1. **Set Environment Variable**: Add your OpenAI API key
2. **Choose Your Tier**: Select appropriate agent for your task
3. **Make Request**: Call the API endpoint
4. **Process Response**: Handle the structured output

---

## 📞 Support

- For issues: Check debug logs
- For questions: Review API documentation
- For limits: Adjust model or add more resources
