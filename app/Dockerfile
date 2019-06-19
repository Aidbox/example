FROM node:12.4-alpine

WORKDIR /app

COPY *.json /app/
COPY *.js /app/

RUN npm install

CMD ["node", "index.js"]
