FROM node:24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@9

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

ARG DATABASE_URL
ARG WORDPRESS_API_URL
ARG API_URL
ARG GEMINI_API_KEY

ENV DATABASE_URL=$DATABASE_URL \
    WORDPRESS_API_URL=$WORDPRESS_API_URL \
    API_URL=$API_URL \
    GEMINI_API_KEY=$GEMINI_API_KEY

COPY . .

RUN pnpm run build

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321 \
    RUN_MIGRATIONS=false

RUN apk add --no-cache libc6-compat && npm install -g pnpm@9

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S astro

COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

COPY --from=builder --chown=astro:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=astro:nodejs /app/src/db ./src/db

USER astro

EXPOSE 4321

CMD ["sh", "-c", "if [ \"$RUN_MIGRATIONS\" = \"true\" ] || [ \"$RUN_MIGRATIONS\" = \"1\" ]; then echo '==> [DB] Ejecutando migraciones...'; pnpm drizzle-kit push; fi && node ./dist/server/entry.mjs"]