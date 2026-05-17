const express = require('express');
const router = express.Router();
const AgentLoop = require('../agent/AgentLoop');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Cache for system prompt
let SYSTEM_PROMPT = null;

// Default system prompt fallback
const DEFAULT_SYSTEM_PROMPT = `You are Super Agent, Bangladesh's most advanced AI assistant with enterprise-grade capabilities.

## Core Identity
You are an autonomous AI agent designed for complex task execution with advanced planning, memory, and knowledge management. You operate with the following principles:

## Capabilities
1. **Task Planning**: Break down complex requests into actionable steps
2. **Memory Management**: Maintain both short-term and long-term task context
3. **Knowledge Learning**: Build and leverage dynamic knowledge bases
4. **Tool Execution**: Execute file operations, web searches, code execution, and system commands
5. **Event Streaming**: Provide real-time progress updates for long-running tasks
6. **Multilingual Support**: Bengali (বাংলা) and English proficiency

## Operating Mode
- Analyze user requests systematically
- Create task plans with numbered steps
- Execute tools efficiently, one at a time
- Remember execution context across iterations
- Store learnings for future reference
- Provide clear status updates throughout execution

## Core Values
- Accuracy and reliability in task execution
- Respect for user goals and constraints
- Transparency about capabilities and limitations
- Continuous improvement through learning
- Efficient resource utilization

Be helpful, thorough, and precise. Use your advanced capabilities to deliver exceptional results for complex tasks.`;

function getSystemPrompt() {
  if (!SYSTEM_PROMPT) {
    try {
      const promptPath = path.join(__dirname, '../prompts/bdask-agent-prompt.txt');
      if (fs.existsSync(promptPath)) {
        SYSTEM_PROMPT = fs.readFileSync(promptPath, 'utf8');
      } else {
        console.warn('System prompt file not found, using default prompt');
        SYSTEM_PROMPT = DEFAULT_SYSTEM_PROMPT;
      }
    } catch (error) {
      console.error('Error loading system prompt:', error.message);
      SYSTEM_PROMPT = DEFAULT_SYSTEM_PROMPT;
    }
  }
  return SYSTEM_PROMPT;
}

// Middleware to validate requests
const validateAgentRequest = (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Message is required and must be a string'
    });
  }

  if (message.length > 10000) {
    return res.status(400).json({
      success: false,
      error: 'Message too long (max 10000 characters)'
    });
  }

  next();
};

// Standard chat endpoint
router.post('/chat', validateAgentRequest, async (req, res) => {
  try {
    const { 
      message, 
      conversation_id, 
      enable_tools = true,
      workspace_root,
      max_iterations = 50
    } = req.body;

    const convId = conversation_id || uuidv4();

    const agent = new AgentLoop({
      conversationId: convId,
      enableTools: enable_tools,
      workspaceRoot: workspace_root || process.env.WORKSPACE_ROOT || process.cwd(),
      maxIterations: max_iterations,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
    });

    const startTime = Date.now();
    const results = await agent.run(message, getSystemPrompt());
    const duration = Date.now() - startTime;

    // Format response
    const finalResult = results[results.length - 1];
    const toolCalls = results.filter(r => r.type === 'tool_call');

    // Check if response needs Bengali translation
    const isBengaliQuery = /[\u0980-\u09FF]/.test(message);
    let responseText = finalResult.content || '';

    // Simple Bengali response for errors if query was in Bengali
    if (finalResult.type === 'error' && isBengaliQuery) {
      responseText = 'দুঃখিত, একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।';
    }

    res.json({
      success: finalResult.type !== 'error',
      response: responseText,
      conversation_id: convId,
      meta: {
        duration_ms: duration,
        iterations: results.length,
        tool_calls_count: toolCalls.length,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
      },
      tool_calls: toolCalls.map(t => ({
        tool: t.tool,
        args: Object.keys(t.args),
        status: t.result?.error ? 'error' : 'success',
        summary: summarizeToolCall(t.tool, t.args)
      })),
      debug: process.env.NODE_ENV === 'development' ? { results } : undefined
    });

  } catch (error) {
    console.error('[Agent API Error]', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Streaming endpoint
router.post('/chat/stream', validateAgentRequest, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const { 
    message, 
    conversation_id, 
    enable_tools = true,
    workspace_root 
  } = req.body;

  const convId = conversation_id || uuidv4();

  try {
    const agent = new AgentLoop({
      conversationId: convId,
      enableTools: enable_tools,
      workspaceRoot: workspace_root || process.env.WORKSPACE_ROOT || process.cwd()
    });

    // Send initial metadata
    res.write(`data: ${JSON.stringify({
      type: 'metadata',
      conversation_id: convId,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Set up event listeners for streaming
    agent.on('tool_call', (data) => {
      res.write(`data: ${JSON.stringify({
        type: 'tool_start',
        tool: data.tool,
        summary: summarizeToolCall(data.tool, data.args)
      })}\n\n`);
    });

    agent.on('tool_result', (data) => {
      res.write(`data: ${JSON.stringify({
        type: 'tool_complete',
        tool: data.tool,
        status: data.result?.error ? 'error' : 'success'
      })}\n\n`);
    });

    // Run agent
    const results = await agent.run(message, getSystemPrompt());

    // Send final response
    const finalResult = results[results.length - 1];
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      response: finalResult.content || '',
      iterations: results.length,
      tool_calls: results.filter(r => r.type === 'tool_call').length
    })}\n\n`);

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('[Agent Stream Error]', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message
    })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Get conversation history
router.get('/chat/:conversation_id/history', async (req, res) => {
  // In production, fetch from MongoDB
  res.json({
    conversation_id: req.params.conversation_id,
    history: [],
    note: 'History retrieval not implemented in this version'
  });
});

// Super Agent: Get Agent Info
router.get('/info', (req, res) => {
  const agent = new AgentLoop({
    agentName: 'Super Agent'
  });

  res.json({
    status: 'ok',
    agent: agent.getAgentInfo(),
    service: 'bdask-super-agent-v2',
    version: '2.0.0-super-agent',
    gemini_configured: !!process.env.GEMINI_API_KEY,
    capabilities: {
      planning: 'Advanced task breakdown and step-by-step execution',
      memory: 'Short-term and long-term memory modules for context retention',
      knowledge: 'Dynamic knowledge base for learned information',
      tools: 'Extended tool registry for file, web, and system operations',
      streaming: 'Real-time event streaming for task progress',
      bengali: 'Native Bengali language support'
    }
  });
});

// Super Agent: Chat with planning
router.post('/chat/super', validateAgentRequest, async (req, res) => {
  try {
    const { 
      message, 
      conversation_id, 
      enable_tools = true,
      enable_planning = true,
      enable_memory = true,
      enable_knowledge = true,
      workspace_root,
      max_iterations = 50
    } = req.body;

    const convId = conversation_id || uuidv4();

    const agent = new AgentLoop({
      conversationId: convId,
      enableTools: enable_tools,
      enablePlanning: enable_planning,
      enableMemory: enable_memory,
      enableKnowledge: enable_knowledge,
      workspaceRoot: workspace_root || process.env.WORKSPACE_ROOT || process.cwd(),
      maxIterations: max_iterations,
      agentName: 'Super Agent',
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
    });

    // Create task plan
    const plan = agent.createTaskPlan(message);

    const startTime = Date.now();
    
    // Add knowledge before execution
    agent.addKnowledge({
      type: 'user_context',
      intent: message.substring(0, 100),
      timestamp: new Date()
    });

    const results = await agent.run(message, getSystemPrompt());
    const duration = Date.now() - startTime;

    // Store memory of execution
    agent.addToMemory({
      type: 'execution',
      message,
      duration,
      resultCount: results.length
    }, 'longTerm');

    const finalResult = results[results.length - 1];
    const toolCalls = results.filter(r => r.type === 'tool_call');

    res.json({
      success: finalResult.type !== 'error',
      response: finalResult.content || '',
      conversation_id: convId,
      agent_info: agent.getAgentInfo(),
      task_plan: plan,
      meta: {
        duration_ms: duration,
        iterations: results.length,
        tool_calls_count: toolCalls.length,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        memory_usage: {
          shortTerm: agent.memory.shortTerm.length,
          longTerm: agent.memory.longTerm.length,
          learnings: agent.memory.learnings.length
        }
      },
      tool_calls: toolCalls.map(t => ({
        tool: t.tool,
        args: Object.keys(t.args),
        status: t.result?.error ? 'error' : 'success',
        summary: summarizeToolCall(t.tool, t.args)
      }))
    });

  } catch (error) {
    console.error('[Super Agent Error]', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'bdask-super-agent',
    version: '2.0.0-super-agent',
    agent_type: 'Super Agent',
    gemini_configured: !!process.env.GEMINI_API_KEY
  });
});

// Helper function
function summarizeToolCall(tool, args) {
  switch (tool) {
    case 'Read':
      return `Reading ${path.basename(args.file_path)}`;
    case 'Write':
      return `Writing ${path.basename(args.file_path)}`;
    case 'Edit':
      return `Editing ${path.basename(args.file_path)}`;
    case 'Bash':
      return `Running: ${args.command?.substring(0, 30)}...`;
    case 'Glob':
      return `Finding files: ${args.pattern}`;
    case 'Grep':
      return `Searching: ${args.pattern?.substring(0, 30)}`;
    case 'WebSearch':
      return `Searching web: ${args.query?.substring(0, 30)}`;
    case 'WebFetch':
      return `Fetching: ${args.url?.substring(0, 40)}`;
    default:
      return `${tool} executed`;
  }
}

module.exports = router;
