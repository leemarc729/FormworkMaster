# Step 1: Build frontend
FROM node:20 AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy built Vite files to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run requires listening on $PORT, not 80
# So we rewrite Nginx default config to use $PORT
RUN sed -i 's/listen       80;/listen       ${PORT};/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
