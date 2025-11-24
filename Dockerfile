# Step 1 — Build Vite project
FROM node:18 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# Step 2 — Serve with Nginx
FROM nginx:alpine

# Cloud Run 會傳入 PORT=8080
EXPOSE 8080

# 覆蓋 Nginx default.conf
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf \
 && sed -i 's/try_files $uri $uri\/ =404;/try_files $uri $uri\/ \/index.html;/' /etc/nginx/conf.d/default.conf

# 放置 Vite build 結果
COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
