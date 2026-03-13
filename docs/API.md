# BDAsk Super AI API Documentation

## Base URL
```
http://localhost:5000/api/agent
```

## Authentication
Currently, no authentication is required for local development. For production, implement API key or JWT token authentication.

## Endpoints

### 1. Standard Chat
Execute a chat request with optional tool execution.

**Endpoint:** `POST /chat`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Create a React component for user login",
  "conversation_id": "optional-existing-conversation-id",
  "enable_tools": true,
  "workspace_root": "/path/to/workspace",
  "max_iterations": 50
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | User's message |
| conversation_id | string | No | Existing conversation ID for context |
| enable_tools | boolean | No | Enable tool execution (default: true) |
| workspace_root | string | No | Root directory for file operations |
| max_iterations | number | No | Max agent iterations (default: 50) |

**Response:**
```json
{
  "success": true,
  "response": "I've created the login component...",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "meta": {
    "duration_ms": 4523,
    "iterations": 3,
    "tool_calls_count": 2,
    "model": "gemini-2.0-flash-exp"
  },
  "tool_calls": [
    {
      "tool": "Glob",
      "args": ["pattern"],
      "status": "success",
      "summary": "Finding files: **/*.jsx"
    },
    {
      "tool": "Write",
      "args": ["file_path", "content"],
      "status": "success",
      "summary": "Writing Login.jsx"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Message is required and must be a string"
}
```

---

### 2. Streaming Chat
Execute a chat request with real-time streaming of tool execution status.

**Endpoint:** `POST /chat/stream`

**Headers:**
```
Content-Type: application/json
Accept: text/event-stream
```

**Request Body:** Same as standard chat

**Response:** Server-Sent Events (SSE)

```
data: {"type":"metadata","conversation_id":"...","timestamp":"..."}

data: {"type":"tool_start","tool":"Bash","summary":"Running: npm test"}

data: {"type":"tool_complete","tool":"Bash","status":"success"}

data: {"type":"complete","response":"Tests passed!","iterations":3,"tool_calls":1}

data: [DONE]
```

**Event Types:**
| Type | Description |
|------|-------------|
| metadata | Initial conversation metadata |
| tool_start | Tool execution started |
| tool_complete | Tool execution completed |
| complete | Final response |
| error | Error occurred |

---

### 3. Get Conversation History
Retrieve conversation history by ID.

**Endpoint:** `GET /chat/:conversation_id/history`

**Response:**
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "history": [
    {
      "role": "user",
      "content": "Create a login component",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "role": "model",
      "content": "I'll create that for you...",
      "tool_calls": [...],
      "timestamp": "2024-01-15T10:30:05Z"
    }
  ],
  "total_messages": 2
}
```

---

### 4. Health Check
Check API status and configuration.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "service": "bdask-super-agent",
  "version": "1.0.0",
  "gemini_configured": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Tool Reference

### Read
Read file contents with optional line range.

```json
{
  "tool": "Read",
  "args": {
    "file_path": "src/app.js",
    "offset": 0,
    "limit": 50
  }
}
```

### Write
Create or overwrite a file.

```json
{
  "tool": "Write",
  "args": {
    "file_path": "src/newfile.js",
    "content": "console.log('Hello BDAsk');"
  }
}
```

### Edit
Replace text in a file.

```json
{
  "tool": "Edit",
  "args": {
    "file_path": "src/app.js",
    "old_string": "const x = 1;",
    "new_string": "const x = 2;",
    "replace_all": false
  }
}
```

### Bash
Execute shell commands.

```json
{
  "tool": "Bash",
  "args": {
    "command": "npm test",
    "timeout": 60000,
    "description": "Run test suite"
  }
}
```

### WebSearch
Search the web using Google.

```json
{
  "tool": "WebSearch",
  "args": {
    "query": "Node.js best practices 2024"
  }
}
```

### WebFetch
Fetch content from a URL.

```json
{
  "tool": "WebFetch",
  "args": {
    "url": "https://example.com/docs",
    "prompt": "Extract API endpoints"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Gemini API error |

---

## Rate Limits

- Standard endpoints: 100 requests per 15 minutes
- Agent endpoints: 10 requests per minute
- Streaming endpoints: 5 concurrent connections per IP

---

## Examples

### cURL Examples

**Simple chat:**
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Say hello in Bengali",
    "enable_tools": false
  }'
```

**With tool execution:**
```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "List files in the project",
    "enable_tools": true,
    "workspace_root": "/home/user/myproject"
  }'
```

**Streaming:**
```bash
curl -X POST http://localhost:5000/api/agent/chat/stream \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "Create a todo app",
    "enable_tools": true
  }'
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

async function chatWithBDAsk(message) {
  try {
    const response = await axios.post('http://localhost:5000/api/agent/chat', {
      message,
      enable_tools: true,
      workspace_root: process.cwd()
    });

    console.log('Response:', response.data.response);
    console.log('Tools used:', response.data.tool_calls);

    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data?.error || error.message);
  }
}

// Usage
chatWithBDAsk('Create a React component');
```

### Python Example

```python
import requests

def chat_with_bdask(message):
    response = requests.post(
        'http://localhost:5000/api/agent/chat',
        json={
            'message': message,
            'enable_tools': True
        }
    )

    data = response.json()
    if data['success']:
        print(f"Response: {data['response']}")
        print(f"Tools used: {len(data['tool_calls'])}")
    else:
        print(f"Error: {data['error']}")

    return data

# Usage
chat_with_bdask('ক্রিকেট স্কোর দেখাও')
```

---

## WebSocket (Future)

WebSocket support for bidirectional real-time communication is planned for v2.0.

---

## Support

For API support:
- GitHub Issues: https://github.com/bdaskbot-maker/bdask-super-ai/issues
- Email: api-support@bdask.com
