FROM strapi/base

WORKDIR /usr/src/app/backend

COPY package*.json ./
COPY yarn.lock ./
RUN npm install
RUN npm run build

EXPOSE 1337

CMD ["yarn", "start"]