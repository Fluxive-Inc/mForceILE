# Flutter/Node Perimeter Stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
# db.js MUST be here: server.js does require('./db') on line 3, so without it
# the container throws MODULE_NOT_FOUND at boot and the revision never becomes
# healthy. The old pipeline had no smoke test, so this shipped silently.
COPY server.js perimeter-guard.js perimeter.html db.js ./
# Flutter web build is already done locally in our scenario, but in CI it would be built.
# We'll just copy the UI build output
COPY mforce_ile_ui/build/web ./dist

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
CMD ["node", "server.js"]
