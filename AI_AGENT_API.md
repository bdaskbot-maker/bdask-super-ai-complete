# AI Agent API Documentation

## Overview
The AI Agent is the foundational tier of the BDAsk Super AI system. It provides basic conversational intelligence with tool execution capabilities.

---

## Endpoints

### 1. Chat with Tool Execution
**POST** `/api/agent/chat`

Send a message to the AI Agent for processing with tool execution.

#### Request Body
```json
{
  "message": "Help me analyze this data",
  "conversation_id": "conv_123456",
  "enable_tools": true,
  "workspace_root": "/workspace",
  "max_iterations": 50
}
```

#### Response
```json
{
  "success": true,
  "response": "I've analyzed your data...",
  "conversation_id": "conv_123456",
  "meta": {
    "duration_ms": 2450,
    "iterations": 3,
    "tool_calls_count": 2,
    "model": "gemini-1.5-flash"
  },
  "tool_calls": [
    {
      "tool": "file_read",
      "args": ["path"],
      "status": "success",
      "summary": "Read data from file"
    }
  ],
  "error": null
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | User query in Bengali or English |
| conversation_id | string | No | Unique conversation identifier |
| enable_tools | boolean | No | Enable tool execution (default: true) |
| workspace_root | string | No | Workspace directory for operations |
| max_iterations | number | No | Maximum iterations (default: 50) |

#### Tools Available
- **file_read**: Read file contents
- **file_write**: Write/create files
- **file_search**: Search files with patterns
- **web_search**: Search the web
- **code_execute**: Execute code snippets
- **terminal**: Execute terminal commands

---

### 2. Health Check
**GET** `/api/agent/health`

Check the health status of the AI Agent service.

#### Response
```json
{
  "status": "ok",
  "service": "bdask-super-agent",
  "version": "2.0.0-super-agent",
  "agent_type": "AI Agent",
  "gemini_configured": true,
  "uptime_seconds": 3600
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Tool execution timeout",
  "conversation_id": "conv_123456",
  "code": "TIMEOUT_ERROR"
}
```

### Common Error Codes
| Code | Description | HTTP Status |
|------|-------------|------------|
| INVALID_REQUEST | Missing required parameters | 400 |
| TOOL_EXECUTION_ERROR | Tool execution failed | 500 |
| TIMEOUT_ERROR | Request exceeded timeout | 408 |
| INVALID_WORKSPACE | Workspace path invalid | 400 |
| API_ERROR | LLM API error | 503 |

---

## Usage Examples

### Example 1: Simple Question
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the capital of Bangladesh?",
    "conversation_id": "demo_1"
  }'
```

### Example 2: File Analysis
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analyze the data in /workspace/data.csv",
    "conversation_id": "demo_2",
    "enable_tools": true,
    "workspace_root": "/workspace"
  }'
```

### Example 3: Code Execution
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Write a Python script to calculate fibonacci",
    "conversation_id": "demo_3",
    "enable_tools": true
  }'
```

---

## Rate Limiting

- **Rate Limit**: 60 requests per minute per conversation ID
- **Timeout**: 120 seconds per request
- **Tool Timeout**: 30 seconds per tool execution

---

## Language Support

- **Bengali** (বাংলা): Full support for queries in Bengali
- **English**: Full support for queries in English
- **Mixed**: Supports mixing Bengali and English in queries

---

## Best Practices

1. **Use Conversation IDs**: Always include a conversation_id for continuity
2. **Set Appropriate Timeout**: Increase max_iterations for complex tasks
3. **Error Handling**: Always check the `success` field in response
4. **Tool Usage**: Enable tools only when needed for performance
5. **Workspace Security**: Always specify a safe workspace_root

---

## Limitations

- Max 50 iterations per request
- Tools have individual execution timeouts
- Cannot access system directories outside workspace
- Conversation history limited to current session

---

## Future Enhancements

- Streaming responses
- Batch requests
- Custom tool registration
- Advanced authentication
