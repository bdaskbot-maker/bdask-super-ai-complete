const mongoose = require('mongoose');

// Conversation schema
const conversationSchema = new mongoose.Schema({
  conversation_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user_id: {
    type: String,
    index: true
  },
  workspace_root: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'error', 'timeout'],
    default: 'active'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'model', 'system', 'tool']
    },
    content: String,
    tool_calls: [{
      tool: String,
      args: mongoose.Schema.Types.Mixed,
      result: mongoose.Schema.Types.Mixed,
      timestamp: { type: Date, default: Date.now }
    }],
    timestamp: { type: Date, default: Date.now }
  }],
  metadata: {
    total_iterations: Number,
    total_tool_calls: Number,
    duration_ms: Number,
    model: String
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Todo/Task schema
const todoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  conversation_id: {
    type: String,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  created_at: { type: Date, default: Date.now },
  completed_at: Date
});

// Agent execution log
const agentLogSchema = new mongoose.Schema({
  conversation_id: String,
  iteration: Number,
  tool_name: String,
  tool_args: mongoose.Schema.Types.Mixed,
  tool_result: mongoose.Schema.Types.Mixed,
  duration_ms: Number,
  error: String,
  timestamp: { type: Date, default: Date.now }
});

// Sub-agent schema
const subAgentSchema = new mongoose.Schema({
  agent_id: {
    type: String,
    required: true,
    unique: true
  },
  parent_conversation_id: String,
  description: String,
  agent_type: {
    type: String,
    enum: ['general-purpose', 'code-reviewer', 'greeting-responder', 'statusline-setup', 'output-style-setup']
  },
  prompt: String,
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'error'],
    default: 'queued'
  },
  result: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: Date.now },
  completed_at: Date
});

// User workspace settings
const workspaceSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  root_path: {
    type: String,
    required: true
  },
  allowed_tools: [{
    type: String,
    enum: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebSearch', 'WebFetch']
  }],
  blocked_commands: [String],
  max_iterations: {
    type: Number,
    default: 50
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Create models
const Conversation = mongoose.model('Conversation', conversationSchema);
const Todo = mongoose.model('Todo', todoSchema);
const AgentLog = mongoose.model('AgentLog', agentLogSchema);
const SubAgent = mongoose.model('SubAgent', subAgentSchema);
const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = {
  Conversation,
  Todo,
  AgentLog,
  SubAgent,
  Workspace
};
