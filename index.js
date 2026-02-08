import { connectToWhatsApp, sendMessage } from './lib/whatsapp.js';
import { fetchNews, saveHistory, loadHistory, getDailyStats, updateDailyStats } from './lib/news.js';
import config from './config.js';

const startBot = async () => {
    const client = await connectToWhatsApp();
    console.log('==============================================');
    console.log('---   AVANTIBOT ONLINE VERSION: 2.3.0    ---');
    console.log('---   Agendamento e Anti-Duplicidade     ---');
    console.log('==============================================');

    client.on('ready', () => {
        const CHECK_INTERVAL = config.pollingIntervalMinutes * 60 * 1000;
        console.log(`Monitorando a cada ${config.pollingIntervalMinutes} min.`);

        const checkAndSendNews = async () => {
            const now = new Date();
            const hour = now.getHours();

            // 1. Verifica horário de funcionamento
            if (hour < config.scheduler.startHour || hour >= config.scheduler.endHour) {
                console.log(`[agendador] Fora do horário comercial (${hour}h). Aguardando...`);
                return;
            }

            // 2. Verifica limites do período
            const isMorning = hour < 12;
            const stats = getDailyStats();
            const limit = isMorning ? config.scheduler.morningLimit : config.scheduler.afternoonLimit;
            const currentCount = isMorning ? stats.morningCount : stats.afternoonCount;

            if (currentCount >= limit) {
                console.log(`[limite] Já enviamos ${currentCount}/${limit} notícias no período da ${isMorning ? 'manhã' : 'tarde'}.`);
                return;
            }

            console.log(`Verificando notícias... (${isMorning ? 'Manhã' : 'Tarde'} - ${currentCount}/${limit})`);
            const news = await fetchNews();

            if (news.length > 0) {
                let remainingInPeriod = limit - currentCount;
                console.log(`Encontradas ${news.length} novidades. Podemos enviar mais ${remainingInPeriod} agora.`);

                for (let i = 0; i < news.length && remainingInPeriod > 0; i++) {
                    const item = news[i];

                    // Verifica novamente o horário antes de cada envio (caso o delay de 15min mude o período)
                    const currentHour = new Date().getHours();
                    const currentIsMorning = currentHour < 12;

                    const message = `🟢 *PALMEIRAS NEWS* 🟢\n\n📰 *${item.title}*\n\n🔗 ${item.link}\n\n📅 ${new Date(item.pubDate).toLocaleString('pt-BR')}`;

                    const success = await sendMessage(config.groupJid, message);
                    if (success) {
                        console.log(`Sucesso (${i + 1}): ${item.title}`);

                        // Atualiza Histórico (para evitar duplicatas)
                        const history = loadHistory();
                        history.push({ id: item.id, cleanTitle: item.cleanTitle });
                        saveHistory(history);

                        // Atualiza Estatísticas Diárias
                        updateDailyStats(currentIsMorning);
                        remainingInPeriod--;

                        // Delay entre notícias
                        if (remainingInPeriod > 0 && i < news.length - 1) {
                            const delay = (config.messageDelaySeconds || 900) * 1000;
                            console.log(`Aguardando ${config.messageDelaySeconds}s para a próxima...`);
                            await new Promise(r => setTimeout(r, delay));
                        }
                    }
                }
            } else {
                console.log('Nenhuma novidade relevante.');
            }
        };

        checkAndSendNews();
        setInterval(checkAndSendNews, CHECK_INTERVAL);
    });
};

startBot();
