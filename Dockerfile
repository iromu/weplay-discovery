FROM node:8

# Create app directory
RUN mkdir -p /usr/src/app/discovery
RUN mkdir -p /usr/src/app/discovery/data
WORKDIR /usr/src/app/discovery

COPY . .

# Install app dependencies
RUN npm install

# Setup environment
ENV NODE_ENV production
ENV DISCOVERY_PORT 3010
ENV WEPLAY_REDIS_URI "redis:6379"
ENV WEPLAY_LOGSTASH_URI "logstash:5001"

# Run
CMD [ "node", "index.js" ]
