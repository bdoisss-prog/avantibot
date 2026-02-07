export default {
    // Configurações do Bot
    groupJid: "120363423291834782@g.us", // JID do grupo do WhatsApp onde as notícias serão enviadas. O bot logará esse ID ao iniciar.

    // Configurações de Busca
    search: {
        query: "Palmeiras",
        lang: "pt-BR",
        country: "BR",
        ceid: "BR:pt"
    },

    // Configurações de Intervalo
    pollingIntervalMinutes: 30, // Verificar notícias a cada 30 minutos

    // Limite de histórico para evitar reenvios
    maxHistorySize: 100,

    // Intervalo entre envio de cada notícia (em segundos)
    messageDelaySeconds: 900 // 15 minutos
};
