# syntax=docker/dockerfile:1
FROM node:20-slim

# Install Chromium deps and Chromium for Puppeteer
RUN apt-get update && apt-get install -y \
  ca-certificates \
  chromium \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Set production env
ENV NODE_ENV=production

# Speed up install: skip Chromium download and disable audits/funding noise
RUN PUPPETEER_SKIP_DOWNLOAD=true npm ci --omit=dev --no-audit --no-fund --prefer-offline

# Copy app source
COPY . .

# Expose port
EXPOSE 8000

# Healthcheck (adjust path if needed)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get(`http://localhost:${process.env.PORT||8000}/hackathons`, res=>{if(res.statusCode>=200&&res.statusCode<500)process.exit(0);process.exit(1) }).on('error',()=>process.exit(1))"

# Run the app
CMD ["node", "index.js"]