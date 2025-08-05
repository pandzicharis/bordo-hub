FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g nodemon ts-node

CMD ["npm", "run", "start:dev"]

EXPOSE 3000

