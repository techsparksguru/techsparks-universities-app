# build stage
FROM node:lts-alpine as build-stage

ENV VUE_APP_API_URL=http://localhost:1337/
ENV VUE_APP_APP_NAME="Universities app"
ENV VUE_APP_FOOTER_TEXT="2020 Created by Techsparks"

WORKDIR /app
RUN apk add --no-cache git
RUN mkdir /app/node_modules && git config --global url."https://".insteadOf git://
COPY package*.json ./
RUN npm install
COPY . .
RUN node --max_old_space_size=5120 && npm run build

# production stage
FROM nginx:1.19.3-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy the respective nginx configuration files
COPY nginx_config/nginx.conf /etc/nginx/nginx.conf
COPY nginx_config/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
