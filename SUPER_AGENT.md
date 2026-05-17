# Super Agent - Advanced AI Agent Framework

## Overview

**Super Agent** is an enterprise-grade AI agent system built on the BDAsk platform. It represents the next evolution of autonomous AI capabilities with advanced planning, memory management, knowledge learning, and intelligent tool execution.

## Architecture

### Core Components

#### 1. **AgentLoop** (Enhanced Base Class)
The foundation of the Super Agent system with event-driven architecture:
- Conversation history management
- Tool execution registry
- Event emission for real-time updates
- Multi-turn dialogue support

#### 2. **SuperAgent** (Extended Class)
Advanced enterprise features built on AgentLoop:
- Task planning and breakdown
- Multi-modal memory systems
- Dynamic knowledge base
- Performance metrics tracking
- Execution logging and audit trails
- State persistence and restoration

#### 3. **Planning Module**
Intelligent task decomposition:
- Parses user input into actionable steps
- Creates structured task plans with numbered steps
- Tracks plan completion across iterations
- Emits planning events for UI/logging

#### 4. **Memory Module**
Multi-tiered context retention:
- **Short-term Memory**: Last 100 items, task-specific context
- **Long-term Memory**: Persistent execution records and learnings
- **Learning Module**: Captures insights and patterns for future tasks
- Automatic memory serialization and restoration

#### 5. **Knowledge Module**
Dynamic knowledge base system:
- Stores facts, patterns, and learned information
- Tracks confidence levels for knowledge items
- Enables context-aware decision making
- Supports knowledge retrieval and reasoning

#### 6. **Tool Registry**
Unified tool execution system:
- File operations (Read, Write, Edit, Delete, Move)
- Web operations (Search, Fetch, Navigate)
- System operations (Bash, Shell commands)
- Custom tool integration
- Result caching and optimization

## API Endpoints

### Standard Endpoints

#### `POST /api/agent/chat`
Traditional chat interface with basic agent capabilities.

**Request:**
```json
{
  "message": "Your task here",
  "conversation_id": "optional-conv-id",
  "enable_tools": true,
  "workspace_root": "/path/to/workspace",
  "max_iterations": 50
}
```

**Response:**
```json
{
  "success": true,
  "response": "Task completion message",
  "conversation_id": "conv-id",
  "meta": {
    "duration_ms": 1234,
    "iterations": 5,
    "tool_calls_count": 3,
    "model": "gemini-1.5-flash"
  },
  "tool_calls": [...]
}
```

### Super Agent Endpoints

#### `POST /api/agent/chat/super`
Advanced Super Agent interface with planning, memory, and knowledge modules.

**Request:**
```json
{
  "message": "Complex task requiring planning",
  "enable_planning": true,
  "enable_memory": true,
  "enable_knowledge": true,
  "enable_tools": true,
  "max_iterations": 50
}
```

**Response:**
```json
{
  "success": true,
  "response": "Task completion message",
  "agent_info": {
    "name": "Super Agent",
    "version": "2.0.0-super-agent",
    "capabilities": {
      "planning": true,
      "memory": true,
      "knowledge": true,
      "tools": true
    }
  },
  "task_plan": {
    "id": "plan_123456",
    "steps": [
      {"number": 1, "description": "First step", "status": "completed"},
      {"number": 2, "description": "Second step", "status": "pending"}
    ],
    "status": "active"
  },
  "meta": {
    "duration_ms": 2500,
    "iterations": 8,
    "tool_calls_count": 5,
    "memory_usage": {
      "shortTerm": 12,
      "longTerm": 45,
      "learnings": 8
    }
  },
  "tool_calls": [...]
}
```

#### `GET /api/agent/info`
Retrieve Super Agent capabilities and configuration.

**Response:**
```json
{
  "status": "ok",
  "agent": {
    "name": "Super Agent",
    "version": "2.0.0-super-agent",
    "capabilities": {
      "planning": true,
      "memory": true,
      "knowledge": true,
      "tools": true
    }
  },
  "capabilities": {
    "planning": "Advanced task breakdown and step-by-step execution",
    "memory": "Short-term and long-term memory modules",
    "knowledge": "Dynamic knowledge base for learned information",
    "tools": "Extended tool registry for operations",
    "streaming": "Real-time event streaming",
    "bengali": "Native Bengali language support"
  }
}
```

#### `GET /api/agent/health`
System health check.

**Response:**
```json
{
  "status": "ok",
  "service": "bdask-super-agent",
  "version": "2.0.0-super-agent",
  "agent_type": "Super Agent",
  "gemini_configured": true
}
```

## Usage Examples

### Basic Task Execution

```javascript
const SuperAgent = require('./src/agent/SuperAgent');

const agent = new SuperAgent({
  agentName: 'Super Agent',
  enablePlanning: true,
  enableMemory: true,
  enableKnowledge: true
});

const task = "Find all JavaScript files in the project, analyze them for code quality issues, and create a summary report.";
const results = await agent.executeTask(task, systemPrompt);
```

### Complex Task with Multi-Pass Analysis

```javascript
const results = await agent.executeComplexTask(
  "Refactor the authentication system to use OAuth 2.0",
  systemPrompt,
  {
    enableDeepAnalysis: true,
    enableMultiPass: true,
    maxPasses: 2
  }
);
```

### Retrieving Agent Status

```javascript
const status = agent.getStatusReport();
console.log(status);
// Returns comprehensive report with memory, performance, health metrics
```

### State Persistence

```javascript
// Export current state
const state = agent.exportState();

// Save to database or file
saveStateToDatabase(state);

// Create new agent and import state
const newAgent = new SuperAgent();
newAgent.importState(state);
```

## Event System

The Super Agent emits events throughout execution for real-time monitoring:

```javascript
agent.on('planning', (plan) => {
  console.log('Task plan created:', plan);
});

agent.on('tool_call', (data) => {
  console.log(`Executing tool: ${data.tool}`);
});

agent.on('memory_update', (data) => {
  console.log(`Memory updated: ${data.type}`);
});

agent.on('knowledge_update', (data) => {
  console.log(`Knowledge base updated: ${data.count} items`);
});

agent.on('execution_complete', (data) => {
  console.log(`Execution complete in ${data.duration}ms`);
});

agent.on('error', (error) => {
  console.error('Agent error:', error.message);
});
```

## Memory System

### Short-term Memory
Automatically stores task context and intermediate results. Limited to 100 most recent items.

### Long-term Memory
Persistent storage of execution records, learnings, and important context. Survives agent restarts.

### Learning Module
Captures insights and patterns:
- Execution patterns
- Common error types
- Optimization opportunities
- User preferences

## Knowledge Base

The knowledge module learns and improves over time:

```javascript
// Add knowledge
agent.addKnowledge({
  fact: "User prefers concise responses",
  context: "user_preferences"
});

// Retrieve knowledge
const knowledge = agent.getMemory('learning');
```

## Performance Metrics

The Super Agent tracks comprehensive metrics:

```javascript
const metrics = agent.getPerformanceMetrics();
// Returns:
// - Total execution time
// - Average tool execution time
// - Success rate
// - Execution history (last 10)
```

## Advanced Features

### Task Context Analysis
Automatically extracts objectives and constraints from user input for better understanding.

### Error Recovery
Intelligent error handling with automatic recovery strategies:
- Retries with modified parameters
- Alternative tool selection
- Graceful degradation
- Detailed error logging

### Real-time Streaming
Events emitted for:
- Task plan creation
- Tool execution start/complete
- Memory updates
- Knowledge additions
- Execution completion
- Error conditions

## Bengali Language Support

Full support for Bengali (বাংলা) language:
- Input processing in Bengali
- Bengali language detection
- Bengali error messages
- Bengali documentation

## Security Features

- Workspace isolation (configurable workspace root)
- Tool execution sandboxing
- Input validation and sanitization
- Error message filtering in production
- Audit trail via execution logging

## Configuration Options

```javascript
const config = {
  agentName: 'Super Agent',           // Agent name
  enablePlanning: true,               // Enable task planning
  enableMemory: true,                 // Enable memory system
  enableKnowledge: true,              // Enable knowledge base
  enableTools: true,                  // Enable tool execution
  workspaceRoot: '/path/to/workspace',// Workspace directory
  maxIterations: 50,                  // Max iterations per task
  model: 'gemini-1.5-flash'          // AI model to use
};

const agent = new SuperAgent(config);
```

## Best Practices

1. **Clear Task Definition**: Provide specific, well-defined tasks
2. **Enable Relevant Modules**: Only enable needed modules for performance
3. **Monitor Events**: Listen to agent events for better visibility
4. **Save State**: Periodically export and save agent state
5. **Review Logs**: Check execution logs for optimization opportunities
6. **Batch Operations**: Group related operations for efficiency

## Troubleshooting

### Agent Takes Too Long
- Reduce `maxIterations`
- Break task into smaller parts
- Check tool registry for performance issues

### High Memory Usage
- Export and clear long-term memory periodically
- Limit knowledge base size
- Review memory growth patterns

### Tool Execution Failures
- Check workspace permissions
- Verify tool parameters
- Review error logs

## Contributing

To extend the Super Agent system:

1. Create new tool handlers in ToolRegistry
2. Extend planning logic in parseTaskSteps()
3. Add memory types in addToMemory()
4. Emit new events for UI integration

## License

Part of the BDAsk Super AI project. All rights reserved.

## Support

For issues, feature requests, or questions:
- Check the debug logs
- Review the execution audit trail
- Check the status report for health issues
