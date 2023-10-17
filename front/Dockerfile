FROM cypress/browsers:node16.14.0-chrome99-ff97

WORKDIR /front

ADD front/package.json front/package-lock.json ./
ADD front/internals internals

# Install jq for version parsing
RUN apt-get update && apt-get install -y jq

# Copy the CL2 Component Library package.json into the current context
COPY ../cl2-component-library/package.json ./cl2-component-library-package.json

# Install CL2 Component Library and dependencies
RUN CL2_VERSION=$(cat cl2-component-library-package.json | jq -r .version) \
    && npm i --save @citizenlab/cl2-component-library@${CL2_VERSION} \
    && npm ci

ADD front/. .

CMD ["npm", "start"]
