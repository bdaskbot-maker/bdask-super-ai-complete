# Super Agent API Documentation

## Overview
Super Agent extends the AI Agent with advanced planning, memory management, and knowledge base capabilities for enterprise-grade task execution.

---

## Endpoints

### 1. Chat with Planning & Memory
**POST** `/api/agent/chat/super`

Send a message to the Super Agent with task planning, memory management, and knowledge accumulation.

#### Request Body
```json
{
  "message": "Build a customer database with user authentication",
  "conversation_id": "conv_super_123",
  "enable_tools": true,
  "enable_planning": true,
  "enable_memory": true,
  "enable_knowledge": true,
  "workspace_root": "/workspace",
  "max_iterations": 50
}
```

#### Response
```json
{
  "success": true,
  "response": "I'll help you build a customer database...",
  "conversation_id": "conv_super_123",
  "agent_info": {
    "name": "Super Agent",
    "version": "2.0.0-super-agent",
    "capabilities": {
      "planning": true,
      "memory": true,
      "knowledge": true,
      "tools": true
    },
    "stats": {
      "iterations": 5,
      "memorySize": {
        "shortTerm": 23,
        "longTerm": 8,
        "learnings": 3
      },
      "knowledgeSize": 12
    }
  },
  "task_plan": {
    "id": "plan_12345",
    "createdAt": "2025-07-15T10:30:00Z",
    "steps": [
      {
        "number": 1,
        "description": "Design database schema",
        "status": "completed"
      },
      {
        "number": 2,
        "description": "Implement user authentication",
        "status": "in_progress"
      }
    ],
    "status": "active",
    "completedSteps": 1
  },
  "meta": {
    "duration_ms": 3240,
    "iterations": 5,
    "tool_calls_count": 3,
    "model": "gemini-1.5-flash",
    "memory_usage": {
      "shortTerm": 23,
      "longTerm": 8,
      "learnings": 3
    }
  },
  "tool_calls": [
    {
      "tool": "file_write",
      "args": ["path", "content"],
      "status": "success",
      "summary": "Created database schema file"
    }
  ]
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | Complex task description |
| conversation_id | string | No | Unique conversation identifier |
| enable_tools | boolean | No | Enable tool execution (default: true) |
| enable_planning | boolean | No | Enable task planning (default: true) |
| enable_memory | boolean | No | Enable memory modules (default: true) |
| enable_knowledge | boolean | No | Enable knowledge accumulation (default: true) |
| workspace_root | string | No | Workspace directory for operations |
| max_iterations | number | No | Maximum iterations (default: 50) |

---

### 2. Get Agent Information
**GET** `/api/agent/info`

Get comprehensive information about the Super Agent capabilities and current status.

#### Response
```json
{
  "status": "ok",
  "agent": {
    "name": "Super Agent",
    "version": "2.0.0-super-agent",
    "conversationId": "conv_123",
    "capabilities": {
      "planning": true,
      "memory": true,
      "knowledge": true,
      "tools": true
    },
    "stats": {
      "iterations": 0,
      "memorySize": {
        "shortTerm": 0,
        "longTerm": 0,
        "learnings": 0
      },
      "knowledgeSize": 0
    }
  },
  "service": "bdask-super-agent-v2",
  "version": "2.0.0-super-agent",
  "gemini_configured": true,
  "capabilities": {
    "planning": "Advanced task breakdown and step-by-step execution",
    "memory": "Short-term and long-term memory modules for context retention",
    "knowledge": "Dynamic knowledge base for learned information",
    "tools": "Extended tool registry for file, web, and system operations",
    "streaming": "Real-time event streaming for task progress",
    "bengali": "Native Bengali language support"
  }
}
```

---

### 3. Health Check
**GET** `/api/agent/health`

Check the health status of the Super Agent service.

#### Response
```json
{
  "status": "ok",
  "service": "bdask-super-agent",
  "version": "2.0.0-super-agent",
  "agent_type": "Super Agent",
  "gemini_configured": true
}
```

---

## Memory Management

### Memory Structure
```json
{
  "shortTerm": [
    {
      "timestamp": "2025-07-15T10:30:00Z",
      "data": { "type": "execution", "duration": 2450 },
      "type": "shortTerm",
      "id": "mem_1234567890_abc123"
    }
  ],
  "longTerm": [
    {
      "timestamp": "2025-07-15T10:25:00Z",
      "data": { "type": "learning", "insight": "..." },
      "type": "longTerm",
      "id": "mem_1234567890_def456"
    }
  ],
  "learnings": [
    {
      "timestamp": "2025-07-15T10:20:00Z",
      "data": { "pattern": "...", "confidence": 0.85 },
      "type": "learning",
      "id": "mem_1234567890_ghi789"
    }
  ]
}
```

### Memory Types

**Short-Term Memory**
- Session-based, resets after conversation
- Stores immediate context and recent actions
- Maximum 100 items per session
- Useful for maintaining context within a task

**Long-Term Memory**
- Persists across conversations
- Stores execution history and key decisions
- Useful for pattern recognition

**Learning Memory**
- Extracted insights and patterns
- Confidence scores for learned patterns
- Useful for continuous improvement

---

## Task Planning

### Task Plan Structure
```json
{
  "id": "plan_1234567890",
  "createdAt": "2025-07-15T10:30:00Z",
  "steps": [
    {
      "number": 1,
      "description": "Analyze requirements",
      "status": "completed"
    },
    {
      "number": 2,
      "description": "Design solution",
      "status": "in_progress"
    },
    {
      "number": 3,
      "description": "Implement solution",
      "status": "pending"
    }
  ],
  "status": "active",
  "completedSteps": 1
}
```

---

## Knowledge Base

### Knowledge Entry
```json
{
  "id": "know_1234567890",
  "content": "Authentication requires JWT tokens...",
  "addedAt": "2025-07-15T10:30:00Z",
  "confidence": 0.8
}
```

---

## Event Streaming

Super Agent emits real-time events during execution:

```javascript
// Event: Planning
{
  "type": "planning",
  "id": "plan_123",
  "steps": [...]
}

// Event: Memory Update
{
  "type": "memory_update",
  "type": "shortTerm",
  "size": 15
}

// Event: Knowledge Update
{
  "type": "knowledge_update",
  "count": 5
}

// Event: Tool Execution
{
  "type": "tool_call",
  "tool": "file_write",
  "status": "started"
}
```

---

## Usage Examples

### Example 1: Task Planning
```bash
curl -X POST http://localhost:5000/api/agent/chat/super \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Build a TODO app with user authentication and database",
    "conversation_id": "demo_super_1",
    "enable_planning": true,
    "enable_memory": true,
    "enable_knowledge": true
  }'
```

### Example 2: Complex Project
```bash
curl -X POST http://localhost:5000/api/agent/chat/super \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a real-time chat application with user management",
    "conversation_id": "demo_super_2",
    "enable_tools": true,
    "max_iterations": 75
  }'
```

---

## Advanced Features

### Task Planning Benefits
- Automatic breakdown of complex tasks
- Step-by-step execution with progress tracking
- Completion status for each step
- Adaptive planning based on results

### Memory System Benefits
- Context retention across iterations
- Pattern recognition from execution history
- Confidence scoring for learned patterns
- Reduced redundant operations

### Knowledge Accumulation
- Learn from every execution
- Reuse solutions for similar problems
- Build domain expertise over time
- Improve decision-making

---

## Rate Limiting

- **Rate Limit**: 30 requests per minute per conversation ID (stricter than AI Agent due to advanced features)
- **Timeout**: 180 seconds per request (longer for complex tasks)
- **Tool Timeout**: 30 seconds per tool execution
- **Memory Limit**: 1000 items per memory tier

---

## Best Practices

1. **Enable All Features**: Use planning, memory, and knowledge for best results
2. **Descriptive Messages**: Provide detailed task descriptions for better planning
3. **Monitor Progress**: Use event streaming to track real-time progress
4. **Review Learnings**: Periodically review learned patterns
5. **Manage Memory**: Archive old short-term memory periodically

---

## Limitations

- Planning works best with 2-5 major steps
- Memory limited to 1000 items per tier
- Knowledge base limited to 500 entries
- Cannot automatically learn from failures without explicit instruction

---

## Future Enhancements

- Semantic memory with vector embeddings
- Distributed task execution
- Advanced reasoning with multi-step validation
- Persistent knowledge graphs
