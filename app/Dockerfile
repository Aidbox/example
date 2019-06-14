FROM node:12.4-alpine

ENV APP_PORT=8888

RUN mkdir /app

COPY package.json /app
RUN cd /app && npm install

COPY *.js /app/

EXPOSE 8888

ENTRYPOINT cd /app && node index.js