FROM node:20

WORKDIR /usr/src/app

# Install all dependencies (including dev dependencies for build)
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# Copy source files and build
COPY . .
RUN npm run build

EXPOSE 3000

# Start both server and worker
CMD [ "npm", "run", "start" ]
