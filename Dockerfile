FROM node:7-slim

RUN apt-get update && apt-get install libpng12-0

WORKDIR /cl2-front

ADD package.json package.json
ADD internals internals
RUN npm install
ADD . .

CMD ["npm", "start:production"]
