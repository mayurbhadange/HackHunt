# syntax=docker/dockerfile:1
FROM node:20-slim

# Minimal OS packages
RUN apt-get update && apt-get install -y \
  ca-certificates \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install only production deps
COPY package*.json ./

# Set production env
ENV NODE_ENV=production

# Speed up install: skip Chromium download and disable audits/funding noise
RUN npm ci --omit=dev --no-audit --no-fund --prefer-offline

# Copy app source
COPY . .

# Expose port
EXPOSE 8000

# Healthcheck (adjust path if needed)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get(`http://localhost:${process.env.PORT||8000}/hackathons`, res=>{if(res.statusCode>=200&&res.statusCode<500)process.exit(0);process.exit(1) }).on('error',()=>process.exit(1))"

# Run the app
CMD ["node", "index.js"]