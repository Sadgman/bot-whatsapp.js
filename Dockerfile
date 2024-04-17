FROM node:20

WORKDIR /usr/src/bot

COPY . .

RUN apt-get update && apt-get install -y wget gnupg2

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list

RUN apt-get update && apt-get install -y google-chrome-stable

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

RUN npm install

EXPOSE 3000

ENTRYPOINT ["node", "index.js"]
