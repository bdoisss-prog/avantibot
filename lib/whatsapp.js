import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

let client;

export const connectToWhatsApp = async () => {
    console.log('Iniciando cliente WhatsApp (v2.2)...');

    client = new Client({
        authStrategy: new LocalAuth({ dataPath: 'auth_info_wwebjs' }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
        }
    });

    client.on('qr', (qr) => {
        console.log('QR Code recebido! Se você já estiver conectado, ignore.');
        console.log('--- TEXTO DO QR CODE PARA COPIAR ---');
        console.log(qr);
        console.log('------------------------------------');
        try {
            qrcode.generate(qr, { small: true });
        } catch (e) {
            console.error('Erro ao gerar QR no terminal:', e);
        }
    });

    client.on('ready', () => {
        console.log('✅ WhatsApp conectado e pronto!');
    });

    try {
        await client.initialize();
    } catch (err) {
        console.error('Erro na inicialização:', err);
    }

    return client;
};

export const sendMessage = async (to, message) => {
    if (!client) return false;
    try {
        // Tenta buscar o chat primeiro para garantir que ele existe
        const chat = await client.getChatById(to);
        await chat.sendMessage(message);
        return true;
    } catch (error) {
        console.error('Falha ao enviar mensagem (Chat não carregado ou JID inválido):', error.message);
        return false;
    }
};
