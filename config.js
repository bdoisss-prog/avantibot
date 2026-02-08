export default {
    // Última atualização: 08/02/2026 16:06
    // Configurações do Bot
    groupJid: "120363423291834782@g.us",

    // Configurações de Busca
    search: {
        useGoogleNews: false,
        query: "Palmeiras",
        lang: "pt-BR",
        country: "BR",
        ceid: "BR:pt",
        // Lista exclusiva: apenas Palmeiras Todo Dia
        additionalRssFeeds: [
            "https://ptd.verdao.net/feed/"
        ]
    },

    // Configurações de Intervalo
    pollingIntervalMinutes: 60, // Verificar a cada 1 hora
    // Limite de histórico para evitar reenvios
    maxHistorySize: 200,

    // Configurações de Horário e Limites Diários
    scheduler: {
        startHour: 8,
        endHour: 22,
        morningLimit: 4,
        afternoonLimit: 4
    },

    // Intervalo entre envio de cada notícia (em segundos)
    // Aumentado para 3600 (1 hora) para espaçar melhor durante o período
    messageDelaySeconds: 3600
};
