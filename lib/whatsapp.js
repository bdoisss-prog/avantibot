import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

let client;

export const connectToWhatsApp = async () => {
    console.log('Iniciando cliente WhatsApp (via whatsapp-web.js)...');

    client = new Client({
        authStrategy: new LocalAuth({ dataPath: 'auth_info_wwebjs' }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH // Usa o Chrome instalado no Docker se disponível
        }
    });

    client.on('qr', (qr) => {
        console.log('QR Code recebido!');
        console.log('--- COPIE O TEXTO ABAIXO E COLE EM UM GERADOR DE QR CODE ONLINE (ex: https://www.the-qrcode-generator.com/) ---');
        console.log(qr);
        console.log('---------------------------------------------------------------------------------------------------------------');
        // Tenta mostrar no terminal também, vai que...
        try {
            qrcode.generate(qr, { small: true });
        } catch (e) {
            console.error('Erro ao gerar QR no terminal:', e);
        }
    });

    client.on('ready', () => {
        console.log('Cliente WhatsApp conectado e pronto!');
    });

    client.on('authenticated', () => {
        console.log('Autenticado com sucesso!');
    });

    client.on('auth_failure', (msg) => {
        console.error('Falha na autenticação:', msg);
    });

    client.on('disconnected', (reason) => {
        console.log('Cliente desconectado:', reason);
    });

    // Inicializa o cliente
    try {
        await client.initialize();
    } catch (error) {
        console.error('Erro ao inicializar cliente:', error);
    }

    return client;
};

export const sendMessage = async (to, message) => {
    if (client) {
        try {
            await client.sendMessage(to, message);
            return true;
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            return false;
        }
    }
    return false;
};
