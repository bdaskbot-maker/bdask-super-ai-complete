/**
 * Utility functions for BDAsk Super AI
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration for display
 */
function formatDuration(ms) {
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
  return (ms / 60000).toFixed(1) + 'm';
}

/**
 * Truncate text with ellipsis
 */
function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Detect language (Bengali, English, or Banglish)
 */
function detectLanguage(text) {
  // Check for Bengali Unicode range
  if (/[\u0980-\u09FF]/.test(text)) {
    return 'bengali';
  }

  // Check for Banglish (Romanized Bengali)
  const banglishPatterns = [
    /\b(amar|tumi|apni|ki|kemon|bhalo|khub|onek|jani|chai)\b/i,
    /\b(ami|tui|se|tar|ki|keno|kokhon|kothay)\b/i
  ];

  for (const pattern of banglishPatterns) {
    if (pattern.test(text)) return 'banglish';
  }

  return 'english';
}

/**
 * Simple Bengali transliteration (Banglish to Bengali)
 * This is a basic implementation - for production, use a proper library
 */
function transliterateBanglish(text) {
  const mappings = {
    'amar': 'আমার',
    'tumi': 'তুমি',
    'apni': 'আপনি',
    'ki': 'কি',
    'kemon': 'কেমন',
    'bhalo': 'ভালো',
    'khub': 'খুব',
    'onek': 'অনেক',
    'jani': 'জানি',
    'chai': 'চাই',
    'ami': 'আমি',
    'tui': 'তুই',
    'keno': 'কেন',
    'kokhon': 'কখন',
    'kothay': 'কোথায়'
  };

  let result = text;
  for (const [roman, bengali] of Object.entries(mappings)) {
    const regex = new RegExp(`\\b${roman}\\b`, 'gi');
    result = result.replace(regex, bengali);
  }

  return result;
}

/**
 * Get current time in Bangladesh timezone
 */
function getBangladeshTime() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    hour12: true
  });
}

/**
 * Check if Bangladesh is playing cricket today
 * (Simplified check - in production, use an API)
 */
async function isBangladeshPlaying() {
  // This is a placeholder - integrate with CricketData API
  return false;
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255);
}

/**
 * Parse code blocks from markdown
 */
function parseCodeBlocks(markdown) {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }

  return blocks;
}

/**
 * Retry a function with exponential backoff
 */
async function retry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

/**
 * Deep merge objects
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Generate unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email address
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Escape regex special characters
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Read file with fallback encodings
 */
async function readFileWithFallback(filePath) {
  const encodings = ['utf8', 'utf16le', 'latin1'];

  for (const encoding of encodings) {
    try {
      const content = await fs.readFile(filePath, encoding);
      return { content, encoding };
    } catch (err) {
      if (encoding === encodings[encodings.length - 1]) {
        throw err;
      }
    }
  }
}

/**
 * Get file extension
 */
function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

/**
 * Check if file is binary
 */
async function isBinaryFile(filePath) {
  const buffer = await fs.readFile(filePath);
  const chunk = buffer.slice(0, 8000);

  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i] === 0) return true;
  }

  return false;
}

/**
 * Format error for display
 */
function formatError(error) {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return JSON.stringify(error);
}

module.exports = {
  formatFileSize,
  formatDuration,
  truncate,
  detectLanguage,
  transliterateBanglish,
  getBangladeshTime,
  isBangladeshPlaying,
  sanitizeFilename,
  parseCodeBlocks,
  retry,
  deepMerge,
  generateId,
  isValidEmail,
  escapeRegex,
  readFileWithFallback,
  getFileExtension,
  isBinaryFile,
  formatError
};
