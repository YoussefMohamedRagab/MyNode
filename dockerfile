FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Install the project dependencies
EXPOSE 8080
CMD ["npm", "start"]