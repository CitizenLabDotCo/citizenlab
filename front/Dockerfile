FROM cypress/browsers:node-20.11.1-chrome-123.0.6312.58-1-ff-124.0-edge-122.0.2365.92-1

WORKDIR /

# Install jq for version parsing
RUN apt-get update && apt-get install -y jq curl

# Change the working directory to /front
WORKDIR /front

ADD front/package.json front/package-lock.json ./
ADD front/internals internals

# Install dependencies
RUN npm install

ADD front/. .

# Define the command to start your application
CMD ["npm", "start"]
