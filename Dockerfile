FROM node:20-alpine

WORKDIR /app

# Copy package.json and workspace configurations
COPY package*.json ./
COPY gateway/package*.json ./gateway/
COPY services/auth-service/package*.json ./services/auth-service/
COPY services/accounts-service/package*.json ./services/accounts-service/
COPY services/transactions-service/package*.json ./services/transactions-service/

# Install all dependencies using npm install (creates node_modules at root)
RUN npm install

# Copy source code
COPY . .

# Expose ports that might be used
EXPOSE 8000 3001 3002 3003

# Default command can be overridden by docker-compose
CMD ["npm", "start"]
