FROM node:7

# Create app directory
RUN mkdir -p /usr/src/app/discovery
RUN mkdir -p /usr/src/app/discovery/data
WORKDIR /usr/src/app/discovery

COPY . .

# Install app dependencies
RUN npm install

# Setup environment
ENV WEPLAY_REDIS_URI "redis:6379"

# Run
CMD [ "node", "index.js" ]