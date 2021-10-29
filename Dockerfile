FROM node:16-alpine
WORKDIR /
COPY . .
RUN npm install
RUN npx tsc
CMD ["node", "dist/index.js"]