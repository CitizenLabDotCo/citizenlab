FROM cypress/base:10

WORKDIR /front

COPY citizenlab.config.json citizenlab.config.*.json /

ADD front/package.json front/package-lock.json ./
ADD front/internals internals

RUN npm install

ADD front/. .

CMD ["npm", "start"]
