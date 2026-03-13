/**
 * Safety Checker for BDAsk Super AI
 * Validates commands and requests for security
 */

class SafetyChecker {
  constructor(config = {}) {
    this.workspaceRoot = config.workspaceRoot || process.cwd();
    this.blockedCommands = config.blockedCommands || this.getDefaultBlockedCommands();
    this.allowedPaths = config.allowedPaths || [this.workspaceRoot];
    this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxCommandLength = config.maxCommandLength || 10000;
  }

  getDefaultBlockedCommands() {
    return [
      // Destructive commands
      'rm -rf /',
      'rm -rf /*',
      'rm -rf ~',
      'mkfs',
      'mkfs.ext',
      'mkfs.xfs',
      'dd if=/dev/zero',
      'dd if=/dev/random',
      'dd if=/dev/urandom',
      ':(){ :|: & };:', // Fork bomb
      'shutdown',
      'reboot',
      'halt',
      'poweroff',
      'init 0',
      'init 6',

      // System file modification
      '> /etc/passwd',
      '> /etc/shadow',
      '> /etc/hosts',
      'echo * > /etc/',

      // Network attacks
      'ping -f',
      'hping3',
      'nmap',

      // Privilege escalation
      'sudo',
      'su -',
      'chmod 777 /',
      'chmod -R 777 /',

      // Data exfiltration risks
      'curl * | bash',
      'wget * | bash',
      'fetch * | bash',

      // Cryptocurrency miners (common attack)
      'xmrig',
      'minerd',
      'stratum',

      // Reverse shells
      'nc -e',
      'ncat -e',
      'bash -i',
      'sh -i',
      '/bin/bash -i',
      'python -c "import socket,subprocess,os"',
      'python3 -c "import socket,subprocess,os"',
      'ruby -rsocket',
      'perl -e "use Socket"'
    ];
  }

  /**
   * Check if a bash command is safe to execute
   */
  checkCommand(command) {
    const issues = [];

    // Check command length
    if (command.length > this.maxCommandLength) {
      issues.push(`Command too long (${command.length} > ${this.maxCommandLength})`);
    }

    // Check for blocked patterns
    for (const pattern of this.blockedCommands) {
      if (command.toLowerCase().includes(pattern.toLowerCase())) {
        issues.push(`Blocked pattern detected: ${pattern}`);
      }
    }

    // Check for path traversal attempts
    if (command.includes('..') && !this.isInAllowedPath(command)) {
      issues.push('Path traversal attempt detected');
    }

    // Check for command chaining that could be dangerous
    const dangerousChains = ['; rm', '&& rm', '|| rm', '; sudo', '&& sudo'];
    for (const chain of dangerousChains) {
      if (command.includes(chain)) {
        issues.push(`Potentially dangerous command chaining: ${chain}`);
      }
    }

    // Check for environment variable exposure
    if (command.includes('env') || command.includes('printenv') || command.includes('set')) {
      // Allow but log - these are useful for debugging
    }

    return {
      safe: issues.length === 0,
      issues,
      command: command.substring(0, 100)
    };
  }

  /**
   * Check if a file path is within allowed directories
   */
  checkPath(filePath) {
    const issues = [];
    const resolved = require('path').resolve(filePath);

    // Check if path is within allowed paths
    const isAllowed = this.allowedPaths.some(allowed => 
      resolved.startsWith(require('path').resolve(allowed))
    );

    if (!isAllowed) {
      issues.push(`Path outside allowed directories: ${resolved}`);
    }

    // Check for path traversal
    if (resolved.includes('..') || filePath.includes('\x00')) {
      issues.push('Path traversal attempt detected');
    }

    // Check for sensitive file access
    const sensitivePatterns = [
      '.env',
      '.ssh',
      '.aws',
      '.docker',
      '.kube',
      'id_rsa',
      'id_dsa',
      'id_ecdsa',
      'id_ed25519',
      '.pgpass',
      '.netrc',
      '.npmrc',
      '.pypirc'
    ];

    for (const pattern of sensitivePatterns) {
      if (resolved.includes(pattern)) {
        issues.push(`Access to sensitive file pattern: ${pattern}`);
      }
    }

    return {
      safe: issues.length === 0,
      issues,
      resolvedPath: resolved
    };
  }

  /**
   * Check file content for malicious patterns
   */
  checkFileContent(content, filePath) {
    const issues = [];

    // Check file size
    if (Buffer.byteLength(content, 'utf8') > this.maxFileSize) {
      issues.push(`File too large (${Buffer.byteLength(content, 'utf8')} > ${this.maxFileSize})`);
    }

    // Check for executable code in non-executable files
    const extension = require('path').extname(filePath).toLowerCase();
    const executablePatterns = [
      'eval(',
      'exec(',
      'system(',
      'subprocess.call(',
      'os.system(',
      'child_process',
      'Function(',
      'setTimeout(',
      'setInterval('
    ];

    if (['.txt', '.md', '.json', '.csv'].includes(extension)) {
      for (const pattern of executablePatterns) {
        if (content.includes(pattern)) {
          issues.push(`Suspicious pattern in non-executable file: ${pattern}`);
        }
      }
    }

    // Check for secrets/tokens
    const secretPatterns = [
      /api[_-]?key[\s]*[=:][\s]*["'][\w-]+["']/i,
      /password[\s]*[=:][\s]*["'][^"']+["']/i,
      /secret[\s]*[=:][\s]*["'][^"']+["']/i,
      /token[\s]*[=:][\s]*["'][^"']+["']/i,
      /mongodb[+srv]*:\/\/[^\s]+/i,
      /sk-[a-zA-Z0-9]{20,}/ // OpenAI-style keys
    ];

    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        issues.push('Potential secret/token detected in content');
        break;
      }
    }

    return {
      safe: issues.length === 0,
      issues
    };
  }

  /**
   * Check web URL for safety
   */
  checkUrl(url) {
    const issues = [];

    try {
      const parsed = new URL(url);

      // Check protocol
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        issues.push(`Unsafe protocol: ${parsed.protocol}`);
      }

      // Check for localhost/private IPs
      const hostname = parsed.hostname;
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.')) {
        issues.push('Localhost/private network access not allowed');
      }

      // Check for file protocol
      if (parsed.protocol === 'file:') {
        issues.push('File protocol not allowed');
      }

      // Check port
      if (parsed.port && !['80', '443', ''].includes(parsed.port)) {
        // Non-standard port - flag for review
        issues.push(`Non-standard port: ${parsed.port}`);
      }

    } catch (error) {
      issues.push('Invalid URL format');
    }

    return {
      safe: issues.length === 0,
      issues
    };
  }

  /**
   * Validate a complete tool request
   */
  validateToolRequest(toolName, params) {
    const checks = [];

    switch (toolName) {
      case 'Bash':
        checks.push(this.checkCommand(params.command));
        break;

      case 'Read':
      case 'Write':
      case 'Edit':
        checks.push(this.checkPath(params.file_path));
        if (params.content) {
          checks.push(this.checkFileContent(params.content, params.file_path));
        }
        break;

      case 'WebFetch':
        checks.push(this.checkUrl(params.url));
        break;

      case 'Glob':
        if (params.path) {
          checks.push(this.checkPath(params.path));
        }
        break;
    }

    const allIssues = checks.flatMap(c => c.issues);

    return {
      allowed: allIssues.length === 0,
      issues: allIssues,
      tool: toolName
    };
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // Remove null bytes
    let sanitized = input.replace(/\x00/g, '');

    // Limit length
    if (sanitized.length > 100000) {
      sanitized = sanitized.substring(0, 100000);
    }

    return sanitized;
  }

  isInAllowedPath(command) {
    // Check if command references paths outside workspace
    const pathMatches = command.match(/[\/\w.-]+/g) || [];
    for (const match of pathMatches) {
      if (match.startsWith('/') || match.startsWith('C:\\')) {
        const resolved = require('path').resolve(match);
        const allowed = this.allowedPaths.some(p => 
          resolved.startsWith(require('path').resolve(p))
        );
        if (!allowed) return false;
      }
    }
    return true;
  }
}

module.exports = SafetyChecker;
