FROM cypress/browsers:node16.14.0-chrome99-ff97

WORKDIR /

# Install jq for version parsing
RUN apt-get update && apt-get install -y jq

# Change the working directory to /front
WORKDIR /front

ADD front/package.json front/package-lock.json ./
ADD front/internals internals

# Install dependencies
RUN npm install

ADD front/. .

# Define the command to start your application
CMD ["npm", "start"]
