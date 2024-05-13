FROM node:alpine

# Install Python 3, pip, Python 3 development headers, and build-essential
RUN apk add --no-cache python3 python3-dev py3-pip build-base

# Install libpq-dev for psycopg2
RUN apk add --no-cache libpq

# Install psycopg2 and setuptools
RUN pip install --no-cache-dir psycopg2 setuptools

# Install python-socketio[client]
RUN pip install --no-cache-dir "python-socketio[client]"

# Set up working directory
WORKDIR /usr/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Prisma globally
RUN npm install -g prisma

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port 4000
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start"]
