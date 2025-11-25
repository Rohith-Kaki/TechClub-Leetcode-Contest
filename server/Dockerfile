# server/Dockerfile

# 1) Build & run in same image (simple prod image)
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./

RUN npm install --only=production

# Copy the rest of the server code
COPY . .

# Environment variables will be provided at runtime:
# - PORT
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - RAZORPAY_KEY_ID
# - RAZORPAY_KEY_SECRET
# - ANTICHEAT_THRESHOLD_SECONDS
# etc.

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# ESM entry point (you already have "type": "module" in package.json)
CMD ["node", "index.js"]
