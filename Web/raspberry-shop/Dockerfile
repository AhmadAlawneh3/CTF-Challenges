# This needs to be served by nginx
FROM node:22-slim@sha256:6e6df5c992a4b2ca100d9f99f2fff6e1bc7a978c60c39630a2390adbbc7b332b
RUN apt update -y && apt upgrade -y
WORKDIR /app
COPY src .
RUN npm init -y && \
    npm install express express-session crypto uuid dotenv ejs --omit=dev && \
    npm install pm2@latest -g && \
    npm cache clean --force 
EXPOSE 8080
CMD [ "pm2-runtime", "start", "app.js" ]