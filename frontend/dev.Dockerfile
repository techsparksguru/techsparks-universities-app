FROM node:12.13.0
WORKDIR /usr/src/app/frontend
ADD package*.json ./
ADD . .
RUN ls
RUN npm install
EXPOSE 8083
RUN npm run serve
