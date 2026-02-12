
ARG NODE_VERSION='20.11.1'
ARG CHROME_VERSION='138.0.7204.100-1'

FROM cypress/factory:4.1.0

WORKDIR /

# Install jq for version parsing
RUN rm -f /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y jq curl

# Change the working directory to /front
WORKDIR /front

ADD front/package.json front/package-lock.json ./
ADD front/internals internals

# Install dependencies
RUN npm install

ADD front/. .

# Define the command to start your application
CMD ["npm", "start"]
