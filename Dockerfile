# Step 1 — Build
FROM node:18 AS builder
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

COPY . .

# Build Vite project
RUN npm run build

# Step 2 — Run
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run uses PORT env
EXPOSE 8080

# Replace default nginx config to use Cloud Run port
RUN sed -i 's/listen 80;/listen 8080;/' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
