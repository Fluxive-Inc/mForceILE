# ── ILE-BUILD-1 · STAGE 1: BUILD THE FLUTTER WEB APP ──────────────────────
# Same defect mForceCinema carried (CIN-BUILD-1): the COPY below asked Docker
# for mforce_ile_ui/build/web, a BUILD OUTPUT that is gitignored and therefore
# never in the build context, so every build died with
#     COPY failed: stat mforce_ile_ui/build/web: file does not exist
# A comment saying the build "would be built in CI" is not a build step.
# Base image :stable, matching mForceCinema/mForceBridge/mForceOS in this fleet.
# Only re-pin to a tag verified with
#   docker manifest inspect ghcr.io/cirruslabs/flutter:<tag>
FROM ghcr.io/cirruslabs/flutter:stable AS ui
WORKDIR /ui
COPY mforce_ile_ui/ ./
# Scaffold the web target if this app has never had one; harmless when web/ exists.
RUN flutter create --platforms web .
RUN flutter build web --release --no-wasm-dry-run --no-tree-shake-icons

# ── STAGE 2: the node perimeter, unchanged except where the UI comes from ──
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
# db.js MUST be here: server.js does require('./db') on line 3, so without it
# the container throws MODULE_NOT_FOUND at boot and the revision never becomes
# healthy. The old pipeline had no smoke test, so this shipped silently.
COPY server.js perimeter-guard.js perimeter.html db.js ./
# From the build stage above, not from the build context. This is the line that
# failed every build: it required an artefact nothing produced.
COPY --from=ui /ui/build/web ./dist
# Added by _scripts/fix-image-requires.sh — these are required at boot and were
# not in the image. git shipping a file is not the same as the image holding it.
COPY errlog-console.js fleet-scope.js mforce-security.js ./

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
CMD ["node", "server.js"]
