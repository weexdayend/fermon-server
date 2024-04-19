FROM node:alpine
WORKDIR /usr/app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy .env file
COPY .env .env

# Copy the rest of the application source code
COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]