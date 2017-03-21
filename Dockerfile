FROM node:7-slim

RUN apt-get update && apt-get install libpng12-0

WORKDIR /cl2-front

ADD package.json package.json
ADD yarn.lock yarn.lock
ADD internals internals
RUN yarn install
ADD . .

RUN yarn run build:dll

CMD ["npm", "start"]
