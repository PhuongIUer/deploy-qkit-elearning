# Build stage
FROM node:22-alpine AS build-stage

WORKDIR /app

# Copy package files và install dependencies
COPY package*.json ./
RUN yarn

# Copy source code và build production
COPY . .
RUN yarn build

# Production stage với nginx
FROM nginx:alpine AS production-stage

# Copy nginx config vào image
COPY nginx.conf /etc/nginx/nginx.conf

# Xóa static files mặc định của nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy built app vào nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
