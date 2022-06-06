FROM cypress/browsers:node16.14.0-chrome99-ff97

WORKDIR /front

COPY citizenlab.config.json citizenlab.config.*.json /

ADD front/package.json front/package-lock.json ./
ADD front/internals internals

RUN npm install

ADD front/. .

CMD ["npm", "start"]
