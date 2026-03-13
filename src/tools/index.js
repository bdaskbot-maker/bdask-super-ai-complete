const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const { glob } = require('glob');
const axios = require('axios');

const execPromise = util.promisify(exec);

class ToolRegistry {
  constructor(config = {}) {
    this.tools = new Map();
    this.workspaceRoot = config.workspaceRoot || process.cwd();
    this.conversationId = config.conversationId;
    this.registerCoreTools();
  }

  registerCoreTools() {
    // File Operations
    this.register('Read', this.readFile.bind(this));
    this.register('Write', this.writeFile.bind(this));
    this.register('Edit', this.editFile.bind(this));
    this.register('MultiEdit', this.multiEdit.bind(this));
    this.register('Glob', this.globFiles.bind(this));
    this.register('Grep', this.grepSearch.bind(this));
    this.register('LS', this.listDirectory.bind(this));

    // System Operations
    this.register('Bash', this.executeBash.bind(this));
    this.register('BashOutput', this.getBashOutput.bind(this));
    this.register('KillBash', this.killBash.bind(this));

    // Web Operations
    this.register('WebSearch', this.webSearch.bind(this));
    this.register('WebFetch', this.webFetch.bind(this));

    // Task Management
    this.register('TodoWrite', this.manageTodos.bind(this));
    this.register('Task', this.launchSubAgent.bind(this));

    // Notebook
    this.register('NotebookEdit', this.notebookEdit.bind(this));
  }

  register(name, handler) {
    this.tools.set(name, handler);
  }

  async execute(toolName, params) {
    console.log(`[TOOL] Executing: ${toolName}`, JSON.stringify(params).substring(0, 200));
    const tool = this.tools.get(toolName);
    if (!tool) throw new Error(`Tool ${toolName} not found`);

    try {
      const result = await tool(params);
      console.log(`[TOOL] ${toolName} completed`);
      return result;
    } catch (error) {
      console.error(`[TOOL] ${toolName} failed:`, error.message);
      return { error: error.message, tool: toolName };
    }
  }

  // ==================== FILE OPERATIONS ====================

  async readFile({ file_path, offset, limit }) {
    const fullPath = this.resolvePath(file_path);

    try {
      const content = await fs.readFile(fullPath, 'utf8');
      const lines = content.split('\n');
      const start = offset || 0;
      const end = limit ? Math.min(start + limit, lines.length) : lines.length;

      return {
        content: lines.slice(start, end).join('\n'),
        total_lines: lines.length,
        read_lines: `${start + 1}-${end}`,
        file_path: fullPath
      };
    } catch (err) {
      if (err.code === 'ENOENT') {
        return { error: `File not found: ${file_path}`, file_path: fullPath };
      }
      return { error: err.message, file_path: fullPath };
    }
  }

  async writeFile({ file_path, content }) {
    const fullPath = this.resolvePath(file_path);

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf8');

      return { 
        success: true, 
        file_path: fullPath,
        bytes_written: Buffer.byteLength(content, 'utf8')
      };
    } catch (err) {
      return { error: err.message, file_path: fullPath };
    }
  }

  async editFile({ file_path, old_string, new_string, replace_all = false }) {
    const fullPath = this.resolvePath(file_path);

    try {
      const content = await fs.readFile(fullPath, 'utf8');

      if (!content.includes(old_string)) {
        return { 
          error: 'Old string not found in file. File may have changed.',
          file_path: fullPath,
          hint: 'Use Read tool first to see current content'
        };
      }

      let newContent;
      if (replace_all) {
        newContent = content.split(old_string).join(new_string);
      } else {
        newContent = content.replace(old_string, new_string);
      }

      await fs.writeFile(fullPath, newContent, 'utf8');

      return { 
        success: true, 
        file_path: fullPath,
        replacements: replace_all ? (content.match(new RegExp(old_string, 'g')) || []).length : 1
      };
    } catch (err) {
      return { error: err.message, file_path: fullPath };
    }
  }

  async multiEdit({ file_path, edits }) {
    const results = [];

    for (const edit of edits) {
      const result = await this.editFile({
        file_path,
        old_string: edit.old_string,
        new_string: edit.new_string,
        replace_all: edit.replace_all || false
      });
      results.push(result);

      if (result.error) break; // Stop on first error
    }

    return {
      file_path: this.resolvePath(file_path),
      edits_applied: results.filter(r => r.success).length,
      edits_failed: results.filter(r => r.error).length,
      results
    };
  }

  async globFiles({ pattern, path: searchPath }) {
    const cwd = searchPath ? this.resolvePath(searchPath) : this.workspaceRoot;

    try {
      const files = await glob(pattern, { 
        cwd,
        absolute: true,
        nodir: true
      });

      // Get file stats for sorting by modification time
      const filesWithStats = await Promise.all(
        files.map(async (f) => {
          try {
            const stat = await fs.stat(f);
            return { path: f, mtime: stat.mtime };
          } catch {
            return { path: f, mtime: new Date(0) };
          }
        })
      );

      filesWithStats.sort((a, b) => b.mtime - a.mtime);

      return { 
        files: filesWithStats.map(f => f.path),
        count: files.length,
        pattern
      };
    } catch (err) {
      return { error: err.message, pattern };
    }
  }

  async grepSearch({ pattern, path: searchPath, glob: filePattern, output_mode = 'content', 
                     '-n': showLineNumbers = true, '-i': caseInsensitive = false,
                     '-B': beforeContext = 0, '-A': afterContext = 0, '-C': context = 0 }) {

    const cwd = searchPath ? this.resolvePath(searchPath) : this.workspaceRoot;

    try {
      // Use ripgrep if available, fallback to simple grep
      let cmd = 'rg';
      const args = [];

      if (showLineNumbers) args.push('-n');
      if (caseInsensitive) args.push('-i');
      if (context > 0) args.push(`-C ${context}`);
      else {
        if (beforeContext > 0) args.push(`-B ${beforeContext}`);
        if (afterContext > 0) args.push(`-A ${afterContext}`);
      }

      args.push(`"${pattern.replace(/"/g, '\"')}"`);
      args.push('.');

      if (filePattern) args.push(`--glob "${filePattern}"`);

      const { stdout } = await execPromise(`${cmd} ${args.join(' ')}`, { cwd });

      const matches = stdout.split('\n').filter(Boolean);

      if (output_mode === 'files_with_matches') {
        const uniqueFiles = [...new Set(matches.map(m => m.split(':')[0]))];
        return { files: uniqueFiles, count: uniqueFiles.length };
      }

      if (output_mode === 'count') {
        return { count: matches.length };
      }

      return { matches, count: matches.length };
    } catch (err) {
      // rg returns exit code 1 when no matches found
      if (err.code === 1) {
        return { matches: [], count: 0 };
      }

      // Fallback to Node.js implementation if rg not available
      return this.grepFallback(pattern, cwd, filePattern);
    }
  }

  async grepFallback(pattern, cwd, filePattern) {
    const files = await glob(filePattern || '**/*', { cwd, nodir: true });
    const matches = [];
    const regex = new RegExp(pattern, 'g');

    for (const file of files.slice(0, 100)) { // Limit for performance
      try {
        const content = await fs.readFile(path.join(cwd, file), 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, idx) => {
          if (regex.test(line)) {
            matches.push(`${file}:${idx + 1}:${line}`);
          }
        });
      } catch {
        // Skip binary or unreadable files
      }
    }

    return { matches, count: matches.length, fallback: true };
  }

  async listDirectory({ path: dirPath, ignore = [] }) {
    const fullPath = dirPath ? this.resolvePath(dirPath) : this.workspaceRoot;

    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      const filtered = entries.filter(e => {
        return !ignore.some(pattern => {
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(e.name);
          }
          return e.name === pattern || e.name.startsWith(pattern);
        });
      });

      const result = await Promise.all(
        filtered.map(async (e) => {
          const entryPath = path.join(fullPath, e.name);
          let size = null;
          let modified = null;

          if (e.isFile()) {
            try {
              const stat = await fs.stat(entryPath);
              size = stat.size;
              modified = stat.mtime;
            } catch {}
          }

          return {
            name: e.name,
            type: e.isDirectory() ? 'directory' : 'file',
            path: entryPath,
            size,
            modified
          };
        })
      );

      // Sort: directories first, then by name
      result.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      return {
        path: fullPath,
        entries: result,
        count: result.length
      };
    } catch (err) {
      return { error: err.message, path: fullPath };
    }
  }

  // ==================== SYSTEM OPERATIONS ====================

  async executeBash({ command, timeout = 120000, description, run_in_background = false }) {
    // Security checks
    const dangerousPatterns = [
      'rm -rf /', 'rm -rf /*', 'mkfs', 'dd if=/dev/zero',
      ':(){ :|: & };:', 'fork bomb', 'shutdown', 'reboot',
      '> /etc/passwd', '> /etc/shadow'
    ];

    for (const pattern of dangerousPatterns) {
      if (command.includes(pattern)) {
        return { 
          error: `Dangerous command blocked: ${pattern}`,
          blocked: true,
          command: command.substring(0, 50) + '...'
        };
      }
    }

    // Restrict to workspace
    const env = {
      ...process.env,
      PWD: this.workspaceRoot
    };

    try {
      if (run_in_background) {
        const child = exec(command, { 
          cwd: this.workspaceRoot, 
          env,
          timeout: 0 // No timeout for background
        });

        const bashId = `bash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store reference (in production, use proper process management)
        global.backgroundProcesses = global.backgroundProcesses || {};
        global.backgroundProcesses[bashId] = child;

        return {
          bash_id: bashId,
          status: 'running_in_background',
          command: command.substring(0, 100)
        };
      }

      const { stdout, stderr } = await execPromise(command, { 
        cwd: this.workspaceRoot, 
        timeout,
        env
      });

      return {
        stdout: stdout || '',
        stderr: stderr || '',
        exit_code: 0,
        command: command.substring(0, 100)
      };
    } catch (err) {
      return {
        stdout: err.stdout || '',
        stderr: err.stderr || '',
        exit_code: err.code || 1,
        error: err.message,
        command: command.substring(0, 100)
      };
    }
  }

  async getBashOutput({ bash_id, filter }) {
    // In production, implement proper output streaming
    return { 
      error: 'Background process output retrieval not implemented in this version',
      bash_id 
    };
  }

  async killBash({ bash_id }) {
    if (global.backgroundProcesses && global.backgroundProcesses[bash_id]) {
      global.backgroundProcesses[bash_id].kill();
      delete global.backgroundProcesses[bash_id];
      return { success: true, bash_id, status: 'killed' };
    }
    return { error: 'Process not found', bash_id };
  }

  // ==================== WEB OPERATIONS ====================

  async webSearch({ query, allowed_domains, blocked_domains }) {
    try {
      // Using Serper.dev API (Google Search)
      const response = await axios.post('https://google.serper.dev/search', {
        q: query,
        num: 10
      }, {
        headers: { 
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      let results = response.data.organic || [];

      // Domain filtering
      if (allowed_domains) {
        results = results.filter(r => allowed_domains.some(d => r.link.includes(d)));
      }
      if (blocked_domains) {
        results = results.filter(r => !blocked_domains.some(d => r.link.includes(d)));
      }

      return {
        query,
        results: results.map(r => ({
          title: r.title,
          link: r.link,
          snippet: r.snippet,
          date: r.date
        })),
        count: results.length
      };
    } catch (err) {
      return { error: err.message, query };
    }
  }

  async webFetch({ url, prompt }) {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'BDAskBot/1.0 (Research Bot)'
        }
      });

      let content = response.data;

      // Basic HTML stripping if content is HTML
      if (typeof content === 'string' && content.includes('<')) {
        content = content
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      // Truncate if too long
      if (content.length > 15000) {
        content = content.substring(0, 15000) + '... [truncated]';
      }

      return {
        url,
        content,
        content_type: response.headers['content-type'],
        length: content.length
      };
    } catch (err) {
      return { error: err.message, url };
    }
  }

  // ==================== TASK MANAGEMENT ====================

  async manageTodos({ todos }) {
    // In production, save to MongoDB
    // For now, return success for agent loop integration
    return {
      success: true,
      todos_updated: todos.length,
      todos: todos.map(t => ({
        id: t.id,
        content: t.content,
        status: t.status
      }))
    };
  }

  async launchSubAgent({ description, prompt, subagent_type }) {
    // This would spawn a new agent instance
    // For now, return a reference that can be checked later
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      agent_id: agentId,
      description,
      subagent_type,
      status: 'queued',
      message: 'Sub-agent queued for execution'
    };
  }

  // ==================== NOTEBOOK ====================

  async notebookEdit({ notebook_path, cell_id, new_source, edit_mode = 'replace', cell_type }) {
    try {
      const content = await fs.readFile(this.resolvePath(notebook_path), 'utf8');
      const notebook = JSON.parse(content);

      // Find cell by ID
      const cellIndex = notebook.cells.findIndex(c => c.id === cell_id || c.metadata?.id === cell_id);

      if (cellIndex === -1 && edit_mode !== 'insert') {
        return { error: `Cell ${cell_id} not found` };
      }

      if (edit_mode === 'delete') {
        notebook.cells.splice(cellIndex, 1);
      } else if (edit_mode === 'insert') {
        const newCell = {
          cell_type: cell_type || 'code',
          metadata: { id: cell_id || `cell_${Date.now()}` },
          source: new_source.split('\n'),
          outputs: []
        };
        const insertIndex = cellIndex >= 0 ? cellIndex + 1 : notebook.cells.length;
        notebook.cells.splice(insertIndex, 0, newCell);
      } else {
        // replace
        notebook.cells[cellIndex].source = new_source.split('\n');
        if (cell_type) {
          notebook.cells[cellIndex].cell_type = cell_type;
        }
      }

      await fs.writeFile(
        this.resolvePath(notebook_path), 
        JSON.stringify(notebook, null, 2), 
        'utf8'
      );

      return {
        success: true,
        notebook_path,
        operation: edit_mode,
        cell_id
      };
    } catch (err) {
      return { error: err.message, notebook_path };
    }
  }

  // ==================== HELPERS ====================

  resolvePath(filePath) {
    if (path.isAbsolute(filePath)) {
      // Ensure it's within workspace
      if (!filePath.startsWith(this.workspaceRoot)) {
        throw new Error('Access denied: Path outside workspace');
      }
      return filePath;
    }
    return path.join(this.workspaceRoot, filePath);
  }
}

module.exports = ToolRegistry;
