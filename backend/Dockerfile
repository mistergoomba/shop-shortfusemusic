FROM node:20

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
RUN npm ci --only=production
COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]
