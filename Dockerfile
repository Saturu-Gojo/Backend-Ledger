FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

# Default command runs the API; overridden for the worker service in docker-compose.yml
CMD ["node", "src/server.js"]
