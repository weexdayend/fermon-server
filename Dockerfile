# Use the Node.js Alpine image
FROM node:alpine

# Set the working directory
WORKDIR /usr/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Install Prisma CLI
RUN npm install -g prisma

# Copy the rest of the application
COPY . .

# Build Prisma Client
RUN npx prisma generate

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start"]
