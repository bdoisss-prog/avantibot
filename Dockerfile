FROM node:18-slim

# Instala dependências do Chrome para o Puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configura o diretório de trabalho
WORKDIR /usr/src/app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências do projeto
RUN npm install

# Copia o resto do código
COPY . .

# Cria diretório para persistência de sessão e dados
RUN mkdir -p auth_info_wwebjs data

# Define variáveis de ambiente para o Puppeteer rodar sem sandbox (necessário em container)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Comando para iniciar
CMD [ "npm", "start" ]
