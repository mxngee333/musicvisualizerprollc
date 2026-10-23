FROM node:24-alpine AS build
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

COPY --from=build /app/dist ./dist
COPY package*.json server.mjs ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/health || exit 1

CMD ["node", "server.mjs"]
