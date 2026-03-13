const { GoogleGenerativeAI } = require('@google/generative-ai');
const ToolRegistry = require('../tools');
const EventEmitter = require('events');

class AgentLoop extends EventEmitter {
  constructor(config = {}) {
    super();
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.modelName = config.model || 'gemini-2.0-flash-exp';
    this.workspaceRoot = config.workspaceRoot || process.cwd();
    this.conversationId = config.conversationId || `conv_${Date.now()}`;
    this.maxIterations = config.maxIterations || 50;
    this.enableTools = config.enableTools !== false;
    this.conversationHistory = [];
    this.todos = [];
    this.iterationCount = 0;

    this.tools = new ToolRegistry({
      workspaceRoot: this.workspaceRoot,
      conversationId: this.conversationId
    });
  }

  formatToolsForGemini() {
    if (!this.enableTools) return null;

    const functionDeclarations = [
      {
        name: 'Read',
        description: 'Read a file from the filesystem. Returns content with line numbers.',
        parameters: {
          type: 'object',
          properties: {
            file_path: { 
              type: 'string', 
              description: 'Absolute path or relative path from workspace root' 
            },
            offset: { 
              type: 'number', 
              description: 'Line number to start reading from (0-indexed)' 
            },
            limit: { 
              type: 'number', 
              description: 'Maximum number of lines to read' 
            }
          },
          required: ['file_path']
        }
      },
      {
        name: 'Write',
        description: 'Write content to a file. Creates directories if needed.',
        parameters: {
          type: 'object',
          properties: {
            file_path: { type: 'string' },
            content: { type: 'string' }
          },
          required: ['file_path', 'content']
        }
      },
      {
        name: 'Edit',
        description: 'Replace text in a file. Old string must match exactly.',
        parameters: {
          type: 'object',
          properties: {
            file_path: { type: 'string' },
            old_string: { type: 'string' },
            new_string: { type: 'string' },
            replace_all: { 
              type: 'boolean', 
              description: 'Replace all occurrences' 
            }
          },
          required: ['file_path', 'old_string', 'new_string']
        }
      },
      {
        name: 'Glob',
        description: 'Find files matching a pattern (e.g., "**/*.js")',
        parameters: {
          type: 'object',
          properties: {
            pattern: { type: 'string' },
            path: { type: 'string' }
          },
          required: ['pattern']
        }
      },
      {
        name: 'Grep',
        description: 'Search for text in files using regex',
        parameters: {
          type: 'object',
          properties: {
            pattern: { type: 'string' },
            path: { type: 'string' },
            glob: { type: 'string' }
          },
          required: ['pattern']
        }
      },
      {
        name: 'LS',
        description: 'List directory contents',
        parameters: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            ignore: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Patterns to ignore (e.g., ["node_modules", ".git"])'
            }
          }
        }
      },
      {
        name: 'Bash',
        description: 'Execute a bash command in the workspace',
        parameters: {
          type: 'object',
          properties: {
            command: { type: 'string' },
            timeout: { 
              type: 'number', 
              description: 'Timeout in milliseconds (default: 120000)' 
            },
            description: { 
              type: 'string',
              description: 'Short description of what this command does'
            }
          },
          required: ['command']
        }
      },
      {
        name: 'WebSearch',
        description: 'Search the web using Google',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          },
          required: ['query']
        }
      },
      {
        name: 'WebFetch',
        description: 'Fetch content from a URL',
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            prompt: { 
              type: 'string',
              description: 'What to extract from the page'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'TodoWrite',
        description: 'Create or update a todo list for tracking tasks',
        parameters: {
          type: 'object',
          properties: {
            todos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  content: { type: 'string' },
                  status: { 
                    type: 'string', 
                    enum: ['pending', 'in_progress', 'completed'] 
                  }
                },
                required: ['id', 'content', 'status']
              }
            }
          },
          required: ['todos']
        }
      }
    ];

    return { functionDeclarations };
  }

  async run(userInput, systemPrompt) {
    this.iterationCount = 0;
    this.conversationHistory = [];

    // Initialize conversation
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });

    this.conversationHistory.push({
      role: 'model',
      parts: [{ text: 'Understood. I am BDAsk Super AI ready to assist with coding, file operations, and task execution.' }]
    });

    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userInput }]
    });

    const results = [];
    let isComplete = false;

    this.emit('started', { conversationId: this.conversationId });

    while (!isComplete && this.iterationCount < this.maxIterations) {
      this.iterationCount++;

      try {
        // Get model response
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          tools: this.formatToolsForGemini(),
          toolConfig: {
            functionCallingConfig: {
              mode: 'AUTO' // Let model decide when to call functions
            }
          }
        });

        const result = await model.generateContent({
          contents: this.conversationHistory,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192
          }
        });

        const response = result.response;
        const text = response.text();
        const functionCalls = response.functionCalls();

        // Check if there are function calls
        if (functionCalls && functionCalls.length > 0) {
          // Claude-style: Execute ONE tool at a time for reliability
          const call = functionCalls[0];

          this.emit('tool_call', {
            tool: call.name,
            args: call.args,
            iteration: this.iterationCount
          });

          // Execute the tool
          const toolResult = await this.tools.execute(call.name, call.args);

          this.emit('tool_result', {
            tool: call.name,
            result: toolResult,
            iteration: this.iterationCount
          });

          results.push({
            type: 'tool_call',
            tool: call.name,
            args: call.args,
            result: toolResult,
            iteration: this.iterationCount
          });

          // Add function call to history
          this.conversationHistory.push({
            role: 'model',
            parts: [{ functionCall: call }]
          });

          // Add function response to history
          this.conversationHistory.push({
            role: 'user',
            parts: [{
              functionResponse: {
                name: call.name,
                response: toolResult
              }
            }]
          });

        } else {
          // No function calls - final response
          isComplete = true;

          results.push({
            type: 'final',
            content: text,
            iteration: this.iterationCount
          });

          this.emit('complete', { 
            content: text, 
            totalIterations: this.iterationCount 
          });
        }

      } catch (error) {
        results.push({
          type: 'error',
          error: error.message,
          iteration: this.iterationCount
        });

        this.emit('error', { error: error.message });

        // Try to recover or exit
        if (this.iterationCount >= 3) {
          isComplete = true;
          results.push({
            type: 'final',
            content: 'দুঃখিত, একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন। (Error: ' + error.message + ')',
            iteration: this.iterationCount
          });
        }
      }
    }

    if (this.iterationCount >= this.maxIterations) {
      results.push({
        type: 'final',
        content: 'অনুরোধটি খুব জটিল। অনুগ্রহ করে ছোট অংশে ভাগ করে চেষ্টা করুন। (Request too complex)',
        iteration: this.iterationCount,
        truncated: true
      });
    }

    return results;
  }

  async *stream(userInput, systemPrompt) {
    // Generator function for streaming
    const results = await this.run(userInput, systemPrompt);

    for (const result of results) {
      yield result;
    }
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  getStats() {
    return {
      conversationId: this.conversationId,
      iterations: this.iterationCount,
      maxIterations: this.maxIterations,
      toolCalls: this.conversationHistory.filter(m => 
        m.parts.some(p => p.functionCall)
      ).length
    };
  }
}

module.exports = AgentLoop;
