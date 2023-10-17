FROM cypress/browsers:node16.14.0-chrome99-ff97

WORKDIR /

# Copy the necessary files from the parent directory
COPY /cl2-component-library/package.json ./front/cl2-component-library-package.json

# Install jq for version parsing
RUN apt-get update && apt-get install -y jq

# Change the working directory to /front
WORKDIR /front

ADD /front/package.json front/package-lock.json ./
ADD /front/internals internals

# Install CL2 Component Library and dependencies
RUN CL2_VERSION=$(cat cl2-component-library-package.json | jq -r .version) \
    && npm i --save @citizenlab/cl2-component-library@${CL2_VERSION} \
    && npm install

# Define the command to start your application
CMD ["npm", "start"]
