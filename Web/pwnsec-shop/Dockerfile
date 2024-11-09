FROM node:18-slim
WORKDIR /usr/src/app
COPY ./src/package*.json ./
RUN npm install
COPY ./src .
RUN mkdir -p /usr/src/app/public/uploads && \
    chmod 777 /usr/src/app/public/uploads
RUN mv ./flag.txt /flag.txt &&\
    chmod 444 /flag.txt
RUN useradd -m appuser
USER appuser
EXPOSE 3000
CMD ["node", "app.js"]