FROM node:20-alpine

WORKDIR /usr/src/app

# Install backend dependencies
COPY package*.json ./
RUN npm install

# Build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY . .
RUN cd frontend && npm run build

EXPOSE 5000

ENV NODE_ENV=production

# Default command runs the unified API & Frontend server
CMD ["node", "src/server.js"]
