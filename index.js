import { connectToWhatsApp, sendMessage } from './lib/whatsapp.js';
import { fetchNews } from './lib/news.js';
import config from './config.js';

// Intervalo em milissegundos
const CHECK_INTERVAL = config.pollingIntervalMinutes * 60 * 1000;

const startBot = async () => {
    const client = await connectToWhatsApp();

    // Listener para pegar ID dos grupos
    client.on('message', async (msg) => {
        const chat = await msg.getChat();
        if (chat.isGroup) {
            console.log(`[info] Mensagem de Grupo: ${chat.id._serialized}`);
            console.log(`Nome do Grupo: ${chat.name}`);
        }
    });

    // Função de verificação de notícias
    const checkAndSendNews = async () => {
        console.log(`Verificando notícias...`);
        const news = await fetchNews();

        if (news.length > 0) {
            console.log(`Encontradas ${news.length} novas notícias!`);

            if (!config.groupJid) {
                console.warn('ATENÇÃO: groupJid não configurado em config.js. As notícias não serão enviadas.');
                news.forEach(n => console.log(`[SIMULAÇÃO] Enviaria: ${n.title}`));
                return;
            }

            for (let i = 0; i < news.length; i++) {
                const item = news[i];
                const message = `🟢 *PALMEIRAS NEWS* 🟢\n\n📰 *${item.title}*\n\n🔗 ${item.link}\n\n📅 ${new Date(item.pubDate).toLocaleString('pt-BR')}`;

                // Envia a notícia
                await sendMessage(config.groupJid, message);
                console.log(`Enviado (${i + 1}/${news.length}): ${item.title}`);

                // Delay configurado entre mensagens, exceto a última
                if (i < news.length - 1) {
                    const delaySeconds = config.messageDelaySeconds || 900;
                    console.log(`Aguardando ${delaySeconds}s para enviar a próxima...`);
                    await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
                }
            }
        } else {
            console.log('Nenhuma notícia nova encontrada.');
        }
    };

    // Configura o intervalo de verificação
    setInterval(checkAndSendNews, CHECK_INTERVAL);

    // Primeira verificação após 15 segundos (para dar tempo de conectar)
    setTimeout(checkAndSendNews, 15000);

    console.log(`Bot iniciado. Verificação a cada ${config.pollingIntervalMinutes} minutos.`);
};

startBot();
