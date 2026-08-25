# Flutter/Node Perimeter Stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server.js perimeter-guard.js perimeter.html ./
# Flutter web build is already done locally in our scenario, but in CI it would be built.
# We'll just copy the UI build output
COPY mforce_ile_ui/build/web ./dist

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
CMD ["node", "server.js"]
