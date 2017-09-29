FROM iromu/weplay-common-arm:latest

# Create app directory
RUN mkdir -p /usr/src/app/discovery
RUN mkdir -p /usr/src/app/discovery/data
WORKDIR /usr/src/app/discovery

COPY . .

# Install app dependencies
RUN yarn install
RUN yarn link weplay-common
RUN yarn

# Setup environment
ENV NODE_ENV production
ENV DISCOVERY_PORT 3080
ENV STATUS_PORT 8080
ENV WEPLAY_REDIS_URI "redis:6379"
ENV WEPLAY_LOGSTASH_URI "logstash:5001"

# Run
CMD [ "yarn", "start" ]
