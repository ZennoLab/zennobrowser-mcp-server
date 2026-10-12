FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV ZB_API_TOKEN=introspection-placeholder
CMD ["node", "dist/index.js"]
