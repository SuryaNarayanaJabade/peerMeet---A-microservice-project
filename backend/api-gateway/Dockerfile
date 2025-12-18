FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8000

# Start command
CMD ["node", "dist/index.js"]
