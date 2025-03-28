# FROM node:20
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# CMD ["npm", "start"]


FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]  # Ensure this matches your entry point file
