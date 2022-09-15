FROM apify/actor-node:16 AS pnpm

RUN rm -rf node_modules
ARG PNPM_VERSION=7.11.0

# Install pnpm
RUN npm --no-fund --global install pnpm@${PNPM_VERSION}

# Check PNPM installation
RUN pnpm --version

# Specify the base Docker image. You can read more about
# the available images at https://crawlee.dev/docs/guides/docker-images
# You can also use any other image from Docker Hub.
FROM pnpm AS builder
ENV CI=1
ENV NODE_ENV=development

# Copy just package.json and pnpm-lock.json
# to speed up the build using Docker layer cache.
COPY package.json pnpm-lock.yaml ./

# Install all dependencies. Don't audit to speed up the installation.
RUN pnpm install --frozen-lockfile --unsafe-perm

# Next, copy the source files using the user set
# in the base image.
COPY . ./

# Install all dependencies and build the project.
RUN pnpm run build

ENV NODE_ENV=production
# Then install only prod dependencies
RUN rm -rf node_modules
RUN pnpm install --prod --no-frozen-lockfile

# Create final image
FROM pnpm
ENV CI=1

# Copy only built JS files from builder image
COPY --from=builder /usr/src/app/dist ./dist

# Copy just package.json and package-lock.json
# to speed up the build using Docker layer cache.
COPY package.json pnpm-lock.yaml ./

# Copy node_modules
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Next, copy the remaining files and directories with the source code.
# Since we do this after NPM install, quick build will be really fast
# for most source file changes.
COPY . ./


# Run the image.
CMD npm run start:prod --silent
