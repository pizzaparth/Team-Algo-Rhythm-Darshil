# Single Node process: serves the REST API and the built frontend from
# the same origin (see server/index.ts). Runs the backend from source via
# tsx rather than the esbuild-bundled server.js, since bundling flattens
# server/database/db.ts's import.meta.url-relative path to schema.sql
# (and similarly for logger.ts, files.ts, exportService.ts).
FROM node:25-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3002

CMD ["npm", "run", "server"]
