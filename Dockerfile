FROM node:alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

RUN npm install -g prisma

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "start"]
