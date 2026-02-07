import { connectToWhatsApp, sendMessage } from './lib/whatsapp.js';
import { fetchNews } from './lib/news.js';
import config from './config.js';

const startBot = async () => {
    const client = await connectToWhatsApp();
    console.log('--- AVANTIBOT VERSION: 2.2 (Proteção getChat) ---');

    client.on('ready', () => {
        const CHECK_INTERVAL = config.pollingIntervalMinutes * 60 * 1000;

        console.log(`Iniciando monitoramento a cada ${config.pollingIntervalMinutes} min.`);

        const checkAndSendNews = async () => {
            console.log(`Verificando notícias brasileiras...`);
            const news = await fetchNews();

            if (news.length > 0) {
                console.log(`Encontradas ${news.length} novidades.`);

                if (!config.groupJid) {
                    console.warn('ConfigJid ausente. Abortando.');
                    return;
                }

                for (let i = 0; i < news.length; i++) {
                    const item = news[i];
                    const message = `🟢 *PALMEIRAS NEWS* 🟢\n\n📰 *${item.title}*\n\n🔗 ${item.link}\n\n📅 ${new Date(item.pubDate).toLocaleString('pt-BR')}`;

                    const success = await sendMessage(config.groupJid, message);
                    if (success) {
                        console.log(`Sucesso (${i + 1}/${news.length}): ${item.title}`);
                        if (i < news.length - 1) {
                            const delay = (config.messageDelaySeconds || 900) * 1000;
                            console.log(`Aguardando ${config.messageDelaySeconds}s...`);
                            await new Promise(r => setTimeout(r, delay));
                        }
                    } else {
                        console.log(`Pulando ${item.title} devido a erro no envio.`);
                    }
                }
            } else {
                console.log('Nada novo por enquanto.');
            }
        };

        // Começa a rodar
        checkAndSendNews();
        setInterval(checkAndSendNews, CHECK_INTERVAL);
    });
};

startBot();
