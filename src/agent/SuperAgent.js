const AgentLoop = require('./AgentLoop');

/**
 * SuperAgent - Enterprise-Grade AI Agent with Advanced Capabilities
 * 
 * Features:
 * - Advanced task planning and breakdown
 * - Multi-modal memory systems
 * - Dynamic knowledge base management
 * - Real-time event streaming
 * - Performance optimization
 * - Error recovery and resilience
 */
class SuperAgent extends AgentLoop {
  constructor(config = {}) {
    super({
      ...config,
      agentName: 'Super Agent',
      enablePlanning: true,
      enableKnowledge: true,
      enableMemory: true
    });

    this.config = config;
    this.performanceMetrics = {
      startTime: Date.now(),
      toolExecutionTimes: {},
      errors: 0,
      successes: 0
    };
    this.taskContext = {
      objectives: [],
      constraints: [],
      dependencies: []
    };
    this.executionLog = [];
  }

  /**
   * Advanced task execution with planning and context management
   */
  async executeTask(userInput, systemPrompt) {
    try {
      // Initialize execution context
      this.emit('execution_start', {
        agentName: this.agentName,
        taskId: this.conversationId,
        timestamp: new Date()
      });

      // Create comprehensive task plan
      const plan = this.createTaskPlan(userInput);
      this.emit('plan_created', plan);

      // Extract and store task context
      this.parseTaskContext(userInput);

      // Run the agent with enhanced tracking
      const results = await this.run(userInput, systemPrompt);

      // Log execution details
      this.logExecution(results);

      // Emit completion with metrics
      this.emit('execution_complete', {
        taskId: this.conversationId,
        totalIterations: this.iterationCount,
        successCount: this.performanceMetrics.successes,
        errorCount: this.performanceMetrics.errors,
        duration: Date.now() - this.performanceMetrics.startTime,
        metrics: this.getPerformanceMetrics()
      });

      return results;
    } catch (error) {
      this.performanceMetrics.errors++;
      this.emit('execution_error', {
        error: error.message,
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Parse user input to extract objectives and constraints
   */
  parseTaskContext(userInput) {
    const lines = userInput.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect objectives (lines with action verbs)
      if (/^(find|create|write|analyze|search|build|check|audit|implement|fix|optimize)/i.test(trimmed)) {
        this.taskContext.objectives.push(trimmed);
      }
      
      // Detect constraints (lines mentioning constraints, requirements, or limitations)
      if (/^(must|should|require|ensure|limit|max|min|use|avoid|disable)/i.test(trimmed)) {
        this.taskContext.constraints.push(trimmed);
      }
    }

    // Store context in memory
    if (this.taskContext.objectives.length > 0 || this.taskContext.constraints.length > 0) {
      this.addToMemory({
        type: 'context_analysis',
        objectives: this.taskContext.objectives,
        constraints: this.taskContext.constraints,
        timestamp: new Date()
      }, 'longTerm');
    }
  }

  /**
   * Log execution details for audit and learning
   */
  logExecution(results) {
    const executionRecord = {
      timestamp: new Date(),
      conversationId: this.conversationId,
      iterations: this.iterationCount,
      resultCount: results.length,
      toolCalls: results.filter(r => r.type === 'tool_call').length,
      errors: results.filter(r => r.type === 'error').length,
      duration: Date.now() - this.performanceMetrics.startTime,
      success: results.some(r => r.type === 'final')
    };

    this.executionLog.push(executionRecord);

    // Update metrics
    if (executionRecord.success) {
      this.performanceMetrics.successes++;
    } else {
      this.performanceMetrics.errors++;
    }

    // Store in long-term memory
    this.addToMemory(executionRecord, 'longTerm');
  }

  /**
   * Get comprehensive performance metrics
   */
  getPerformanceMetrics() {
    const toolTimes = Object.values(this.performanceMetrics.toolExecutionTimes);
    const avgToolTime = toolTimes.length > 0 
      ? toolTimes.reduce((a, b) => a + b, 0) / toolTimes.length 
      : 0;

    return {
      totalTime: Date.now() - this.performanceMetrics.startTime,
      averageToolExecutionTime: avgToolTime,
      successRate: this.performanceMetrics.successes / (this.performanceMetrics.successes + this.performanceMetrics.errors || 1),
      executionHistory: this.executionLog.slice(-10) // Last 10 executions
    };
  }

  /**
   * Optimize for complex tasks by using advanced reasoning
   */
  async executeComplexTask(userInput, systemPrompt, options = {}) {
    const {
      enableDeepAnalysis = true,
      enableMultiPass = false,
      maxPasses = 2
    } = options;

    if (enableDeepAnalysis) {
      // Add reasoning instruction to prompt
      const enhancedPrompt = systemPrompt + '\n\nIMPORTANT: For this complex task, perform deep analysis and break it down into clear steps.';
      
      if (enableMultiPass) {
        // Execute multiple passes for comprehensive understanding
        const results = [];
        for (let pass = 0; pass < maxPasses; pass++) {
          this.emit('multi_pass', { pass: pass + 1, total: maxPasses });
          const passResults = await this.executeTask(userInput, enhancedPrompt);
          results.push(...passResults);
        }
        return results;
      } else {
        return await this.executeTask(userInput, enhancedPrompt);
      }
    }

    return await this.executeTask(userInput, systemPrompt);
  }

  /**
   * Get comprehensive agent status report
   */
  getStatusReport() {
    return {
      agent: this.getAgentInfo(),
      taskContext: this.taskContext,
      performance: this.getPerformanceMetrics(),
      memory: {
        shortTerm: this.memory.shortTerm.length,
        longTerm: this.memory.longTerm.length,
        learnings: this.memory.learnings.length
      },
      knowledge: {
        baseSize: this.knowledge.length,
        recent: this.knowledge.slice(-5)
      },
      executionLog: {
        totalExecutions: this.executionLog.length,
        recentExecutions: this.executionLog.slice(-5)
      },
      health: {
        status: this.performanceMetrics.errors === 0 ? 'healthy' : 'degraded',
        errorRate: (this.performanceMetrics.errors / (this.performanceMetrics.successes + this.performanceMetrics.errors || 1)) * 100,
        lastExecution: this.executionLog[this.executionLog.length - 1]?.timestamp || null
      }
    };
  }

  /**
   * Export agent state for persistence
   */
  exportState() {
    return {
      conversationId: this.conversationId,
      agentName: this.agentName,
      agentVersion: this.agentVersion,
      taskContext: this.taskContext,
      memory: this.memory,
      knowledge: this.knowledge,
      executionLog: this.executionLog,
      performanceMetrics: this.performanceMetrics,
      exportedAt: new Date()
    };
  }

  /**
   * Import previous agent state
   */
  importState(state) {
    if (!state) return;

    this.taskContext = state.taskContext || this.taskContext;
    this.memory = state.memory || this.memory;
    this.knowledge = state.knowledge || this.knowledge;
    this.executionLog = state.executionLog || this.executionLog;
    this.performanceMetrics = state.performanceMetrics || this.performanceMetrics;

    this.emit('state_imported', {
      conversationId: state.conversationId,
      timestamp: new Date()
    });
  }
}

module.exports = SuperAgent;
