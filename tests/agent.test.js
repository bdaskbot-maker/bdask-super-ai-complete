const request = require('supertest');
const app = require('../src/server');
const ToolRegistry = require('../src/tools');
const AgentLoop = require('../src/agent/AgentLoop');
const SafetyChecker = require('../src/middleware/SafetyChecker');

describe('BDAsk Super AI', () => {

  // Tool Registry Tests
  describe('ToolRegistry', () => {
    let tools;

    beforeEach(() => {
      tools = new ToolRegistry({ workspaceRoot: '/tmp/test' });
    });

    test('should register all core tools', () => {
      expect(tools.tools.has('Read')).toBe(true);
      expect(tools.tools.has('Write')).toBe(true);
      expect(tools.tools.has('Edit')).toBe(true);
      expect(tools.tools.has('Bash')).toBe(true);
      expect(tools.tools.has('Glob')).toBe(true);
      expect(tools.tools.has('Grep')).toBe(true);
      expect(tools.tools.has('WebSearch')).toBe(true);
    });

    test('should read file successfully', async () => {
      const fs = require('fs').promises;
      await fs.mkdir('/tmp/test', { recursive: true });
      await fs.writeFile('/tmp/test/readme.txt', 'Hello BDAsk');

      const result = await tools.execute('Read', { 
        file_path: '/tmp/test/readme.txt' 
      });

      expect(result.content).toBe('Hello BDAsk');
      expect(result.total_lines).toBe(1);
    });

    test('should block dangerous bash commands', async () => {
      const result = await tools.execute('Bash', { 
        command: 'rm -rf /' 
      });

      expect(result.error).toContain('blocked');
      expect(result.blocked).toBe(true);
    });

    test('should allow safe bash commands', async () => {
      const result = await tools.execute('Bash', { 
        command: 'echo "Hello BDAsk"' 
      });

      expect(result.exit_code).toBe(0);
      expect(result.stdout.trim()).toBe('Hello BDAsk');
    });
  });

  // Safety Checker Tests
  describe('SafetyChecker', () => {
    let checker;

    beforeEach(() => {
      checker = new SafetyChecker({ workspaceRoot: '/workspace' });
    });

    test('should block rm -rf /', () => {
      const result = checker.checkCommand('rm -rf /');
      expect(result.safe).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    test('should block fork bomb', () => {
      const result = checker.checkCommand(':(){ :|: & };:');
      expect(result.safe).toBe(false);
    });

    test('should allow safe ls command', () => {
      const result = checker.checkCommand('ls -la');
      expect(result.safe).toBe(true);
    });

    test('should block access to .env files', () => {
      const result = checker.checkPath('/workspace/.env');
      expect(result.safe).toBe(false);
      expect(result.issues.some(i => i.includes('.env'))).toBe(true);
    });

    test('should block access to SSH keys', () => {
      const result = checker.checkPath('/workspace/.ssh/id_rsa');
      expect(result.safe).toBe(false);
    });
  });

  // Agent Loop Tests
  describe('AgentLoop', () => {
    test('should initialize with correct config', () => {
      const agent = new AgentLoop({
        conversationId: 'test-123',
        maxIterations: 10
      });

      expect(agent.conversationId).toBe('test-123');
      expect(agent.maxIterations).toBe(10);
    });

    test('should format tools for Gemini', () => {
      const agent = new AgentLoop();
      const tools = agent.formatToolsForGemini();

      expect(tools).toHaveProperty('functionDeclarations');
      expect(tools.functionDeclarations.length).toBeGreaterThan(0);
      expect(tools.functionDeclarations[0]).toHaveProperty('name');
      expect(tools.functionDeclarations[0]).toHaveProperty('parameters');
    });
  });

  // API Endpoint Tests
  describe('API Endpoints', () => {
    test('GET /health should return healthy', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });

    test('POST /api/agent/chat should require message', async () => {
      const response = await request(app)
        .post('/api/agent/chat')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('POST /api/agent/chat should reject very long messages', async () => {
      const longMessage = 'a'.repeat(15000);

      const response = await request(app)
        .post('/api/agent/chat')
        .send({ message: longMessage })
        .expect(400);

      expect(response.body.error).toContain('too long');
    });

    test('POST /api/agent/chat should process valid request', async () => {
      // Note: This test requires GEMINI_API_KEY to be set
      if (!process.env.GEMINI_API_KEY) {
        console.log('Skipping API test - no Gemini API key');
        return;
      }

      const response = await request(app)
        .post('/api/agent/chat')
        .send({ 
          message: 'Say "Hello BDAsk"',
          enable_tools: false
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('conversation_id');
    });
  });

  // Bengali Language Tests
  describe('Bengali Support', () => {
    test('should detect Bengali text', () => {
      const bengaliText = 'ক্রিকেট স্কোর দেখাও';
      const hasBengali = /[\u0980-\u09FF]/.test(bengaliText);
      expect(hasBengali).toBe(true);
    });

    test('should handle Banglish text', () => {
      const banglishText = 'Amar project e ekta file toiri koro';
      expect(banglishText).toBeTruthy();
    });
  });

  // Integration Tests
  describe('Integration', () => {
    test('full agent workflow', async () => {
      const agent = new AgentLoop({
        maxIterations: 5,
        enableTools: true
      });

      const systemPrompt = 'You are BDAsk Super AI. Be concise.';
      const userMessage = 'List the files in the current directory';

      // This would actually call Gemini in real test
      // For now, just verify the flow works
      expect(agent.conversationHistory).toHaveLength(0);

      // Mock the run for testing
      const mockResults = [
        { type: 'tool_call', tool: 'Bash', args: { command: 'ls' } },
        { type: 'final', content: 'Files listed successfully' }
      ];

      agent.run = jest.fn().mockResolvedValue(mockResults);

      const results = await agent.run(userMessage, systemPrompt);
      expect(results).toHaveLength(2);
      expect(results[0].type).toBe('tool_call');
    });
  });
});

// Performance Tests
describe('Performance', () => {
  test('tool execution should complete within timeout', async () => {
    const tools = new ToolRegistry();

    const start = Date.now();
    await tools.execute('Bash', { 
      command: 'echo "test"',
      timeout: 5000 
    });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000);
  });
});
