// Última atualização: 08/02/2026 16:06
import { connectToWhatsApp, sendMessage } from './lib/whatsapp.js';
import { fetchNews, saveHistory, loadHistory, getDailyStats, updateDailyStats } from './lib/news.js';
import config from './config.js';

const startBot = async () => {
    const client = await connectToWhatsApp();
    console.log('==============================================');
    console.log('---   AVANTIBOT ONLINE VERSION: 2.3.1    ---');
    console.log('---   Filtro de Duplicidade Refinado     ---');
    console.log('==============================================');

    client.on('ready', () => {
        const CHECK_INTERVAL = config.pollingIntervalMinutes * 60 * 1000;

        const checkAndSendNews = async () => {
            const now = new Date();
            const hour = now.getHours();

            if (hour < config.scheduler.startHour || hour >= config.scheduler.endHour) {
                console.log(`[agendador] Fora do horário comercial (${hour}h).`);
                return;
            }

            const stats = getDailyStats();
            const isMorning = hour < 12;
            const limit = isMorning ? config.scheduler.morningLimit : config.scheduler.afternoonLimit;
            const currentCount = isMorning ? stats.morningCount : stats.afternoonCount;

            if (currentCount >= limit) {
                console.log(`[limite] Já enviamos ${currentCount}/${limit} notícias.`);
                return;
            }

            const news = await fetchNews();

            if (news.length > 0) {
                let remainingInPeriod = limit - currentCount;
                for (let i = 0; i < news.length && remainingInPeriod > 0; i++) {
                    const item = news[i];
                    const message = `🟢 *PALMEIRAS NEWS* 🟢\n\n📰 *${item.title}*\n\n🔗 ${item.link}\n\n📅 ${new Date(item.pubDate).toLocaleString('pt-BR')}`;

                    const success = await sendMessage(config.groupJid, message);
                    if (success) {
                        console.log(`✅ Enviado: ${item.title}`);
                        const history = loadHistory();
                        history.push({ id: item.id, cleanTitle: item.cleanTitle });
                        saveHistory(history);
                        updateDailyStats(hour < 12);
                        remainingInPeriod--;
                        if (remainingInPeriod > 0 && i < news.length - 1) {
                            await new Promise(r => setTimeout(r, (config.messageDelaySeconds || 900) * 1000));
                        }
                    }
                }
            }
        };

        checkAndSendNews();
        setInterval(checkAndSendNews, CHECK_INTERVAL);
    });
};

startBot();
