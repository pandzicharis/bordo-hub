FROM node:20-alpine

WORKDIR /usr/src/app

ENV NG_CLI_ANALYTICS=false

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 9000

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]
