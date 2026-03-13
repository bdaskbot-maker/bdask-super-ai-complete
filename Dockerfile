FROM node:20-alpine

# Install ripgrep for Grep tool
RUN apk add --no-cache ripgrep git

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY src/ ./src/
COPY .env.example ./.env.example

# Create workspace directory
RUN mkdir -p /workspace && chmod 755 /workspace

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bdask -u 1001

# Change ownership
RUN chown -R bdask:nodejs /app /workspace

USER bdask

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start command
CMD ["node", "src/server.js"]
