# Use an official Node.js runtime as the base image
FROM node:18.17.1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# generated prisma files
COPY prisma ./prisma/

#COPY env.example ./.env
COPY env.example ./.env

# Install project dependencies
RUN npm install

RUN npx prisma generate

RUN command

# Copy the rest of the application code to the container
COPY . .

# Expose the port your app runs on
EXPOSE 3002

# Command to run your app when the container starts
CMD ["node", "server.js"]
