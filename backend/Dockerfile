# ------ Build ------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


# -----Runtime-----
FROM node:22-alpine 

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build package.json ./

RUN mkdir -p /app/data/uploads

EXPOSE 3001

RUN ["node", "dist/app.js"]

