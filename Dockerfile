FROM node:14.17-alpine
RUN mkdir -p /home/node/futsal/node_modules && chown -R node:node /home/node/futsal
WORKDIR /home/node/futsal
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node ./client/ ./client/
COPY --chown=node:node ./server/ ./server/
ARG APP_PORT=8000
ENV PORT=$APP_PORT
EXPOSE $PORT
CMD ["node", "./server/app.js"]
