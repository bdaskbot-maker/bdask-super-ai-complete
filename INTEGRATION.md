# BDAsk Super AI Integration Guide

This guide shows how to integrate the Super AI capabilities into your existing BDAsk project.

## Option 1: Merge into Existing BDAsk (Recommended)

### Step 1: Copy Files

```bash
# From bdask-super-ai to your bdask-main project
cp -r bdask-super-ai/src/tools bdask-main/backend/src/
cp -r bdask-super-ai/src/agent bdask-main/backend/src/
cp bdask-super-ai/src/routes/agent.js bdask-main/backend/src/routes/
cp -r bdask-super-ai/src/prompts bdask-main/backend/src/
```

### Step 2: Update package.json

Add these dependencies to your existing `bdask-main/backend/package.json`:

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "glob": "^11.0.0",
    "uuid": "^11.0.3"
  }
}
```

Then run:
```bash
cd bdask-main/backend
npm install
```

### Step 3: Update Server.js

Add to your existing `backend/server.js`:

```javascript
// At the top
const agentRoutes = require('./src/routes/agent');

// After other routes
app.use('/api/super', agentRoutes);

// Or mount at root for direct access
app.use('/api/agent', agentRoutes);
```

### Step 4: Environment Variables

Add to your existing `.env`:

```env
# Super AI Configuration
GEMINI_MODEL=gemini-2.0-flash-exp
WORKSPACE_ROOT=./workspace
MAX_ITERATIONS=50
ENABLE_BASH=true

# Optional: For web search
SERPER_API_KEY=your_key_here
```

### Step 5: Frontend Integration

Copy the frontend component:

```bash
cp bdask-super-ai/frontend/src/components/BDAskSuperChat.js bdask-main/frontend/src/components/
```

Add to your main HTML/JS:

```html
<!-- In your chat interface -->
<div id="super-chat-container"></div>

<script type="module">
  import BDAskSuperChat from './components/BDAskSuperChat.js';

  // Initialize Super AI chat alongside existing chat
  const superChat = new BDAskSuperChat('super-chat-container', {
    apiUrl: '/api/agent',
    enableTools: true
  });
</script>
```

### Step 6: Toggle Between Modes

Add a mode switcher in your UI:

```javascript
// In your main chat component
class BDAskChat {
  constructor() {
    this.mode = 'standard'; // 'standard' or 'super'
  }

  toggleMode() {
    this.mode = this.mode === 'standard' ? 'super' : 'standard';

    if (this.mode === 'super') {
      document.getElementById('standard-chat').style.display = 'none';
      document.getElementById('super-chat').style.display = 'block';
    } else {
      document.getElementById('standard-chat').style.display = 'block';
      document.getElementById('super-chat').style.display = 'none';
    }
  }
}
```

## Option 2: Run as Separate Service

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   BDAsk Main    │────▶│  BDAsk Super AI  │────▶│   Gemini API    │
│   (Existing)    │◄────│   (New Service)  │◄────│                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  MongoDB, APIs  │
│  (Existing)     │
└─────────────────┘
```

### Docker Compose Setup

Update your existing `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Your existing BDAsk services
  bdask-backend:
    build: ./backend
    ports:
      - "5000:5000"
    # ... existing config

  bdask-frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    # ... existing config

  # New Super AI service
  bdask-super:
    build: ./bdask-super-ai
    ports:
      - "5001:5000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - WORKSPACE_ROOT=/workspace
      - MONGODB_URI=mongodb://mongo:27017/bdask
    volumes:
      - ./workspace:/workspace
    networks:
      - bdask-network

  mongo:
    image: mongo:7
    # ... existing config

networks:
  bdask-network:
    driver: bridge
```

### Proxy from Main Backend

Add to your existing BDAsk backend:

```javascript
// routes/proxy.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const SUPER_AI_URL = process.env.SUPER_AI_URL || 'http://localhost:5001';

router.post('/chat', async (req, res) => {
  try {
    const response = await axios.post(`${SUPER_AI_URL}/api/agent/chat`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Super AI service unavailable' });
  }
});

module.exports = router;
```

Then in server.js:
```javascript
app.use('/api/super', require('./routes/proxy'));
```

## Feature Integration Matrix

| BDAsk Feature | Super AI Integration |
|--------------|---------------------|
| Bengali Chat | ✅ Native support |
| Voice Input | ✅ Works with Super AI |
| Cricket Scores | ✅ Tool: WebSearch |
| News Feed | ✅ Tool: WebFetch |
| Prayer Times | ✅ Tool: WebFetch |
| Weather | ✅ Tool: WebFetch |
| Translation | ✅ Gemini native |
| Chat History | ✅ MongoDB shared |
| Dark Mode | ✅ CSS variables |
| Mobile Responsive | ✅ Same component |

## Migration Checklist

### Backend
- [ ] Copy tool registry files
- [ ] Copy agent loop
- [ ] Copy routes
- [ ] Install new dependencies
- [ ] Update environment variables
- [ ] Test file operations
- [ ] Test bash execution
- [ ] Test web search
- [ ] Add security middleware

### Frontend
- [ ] Copy SuperChat component
- [ ] Add mode toggle UI
- [ ] Update styling to match BDAsk theme
- [ ] Add Bengali font support
- [ ] Test responsive design
- [ ] Add tool status indicators

### Database
- [ ] Create conversation collection
- [ ] Create todo collection
- [ ] Create agent log collection
- [ ] Update existing chat schema

### Security
- [ ] Configure workspace directory
- [ ] Set up bash command whitelist
- [ ] Add rate limiting
- [ ] Enable request logging
- [ ] Test dangerous command blocking

### Testing
- [ ] Unit tests for tools
- [ ] Integration tests for agent loop
- [ ] End-to-end chat tests
- [ ] Security penetration tests
- [ ] Load testing

## Common Issues

### Issue: "Tool not found"
**Solution:** Ensure all tool files are imported in `src/tools/index.js`

### Issue: "File access denied"
**Solution:** Check `WORKSPACE_ROOT` environment variable is set correctly

### Issue: "Gemini API error"
**Solution:** Verify `GEMINI_API_KEY` is valid and has quota available

### Issue: "Bash commands not working"
**Solution:** Set `ENABLE_BASH=true` in environment (use with caution)

### Issue: "Frontend not connecting"
**Solution:** Check CORS settings in backend, ensure `FRONTEND_URL` matches

## Performance Optimization

### 1. Enable Caching

```javascript
// Add to agent loop
const NodeCache = require('node-cache');
const toolCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

async execute(toolName, params) {
  const cacheKey = `${toolName}_${JSON.stringify(params)}`;
  const cached = toolCache.get(cacheKey);
  if (cached) return cached;

  const result = await this.tools.execute(toolName, params);
  toolCache.set(cacheKey, result);
  return result;
}
```

### 2. Connection Pooling

```javascript
// MongoDB connection pooling
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000
});
```

### 3. Streaming Responses

Use the `/api/agent/chat/stream` endpoint for real-time updates instead of waiting for full completion.

## Next Steps

1. **Deploy to staging** environment first
2. **Beta test** with limited users
3. **Monitor** tool usage and performance
4. **Iterate** based on user feedback
5. **Gradual rollout** to all users

## Support

For issues or questions:
- GitHub Issues: https://github.com/bdaskbot-maker/bdask-main/issues
- Email: support@bdask.com
- Discord: [BDAsk Community]
