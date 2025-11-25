# client/Dockerfile

# 1) Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# This should output to /app/dist
RUN npm run build

# 2) Nginx stage (serve built files)
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Simple default nginx.conf is enough here
# If you need SPA fallback, you can add a custom nginx.conf later.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
