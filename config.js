export default {
    // Configurações do Bot
    groupJid: "120363423291834782@g.us", // JID do grupo do WhatsApp onde as notícias serão enviadas. O bot logará esse ID ao iniciar.

    // Configurações de Busca
    search: {
        useGoogleNews: false, // Definido como false para buscar APENAS dos links abaixo
        query: "Palmeiras",
        lang: "pt-BR",
        country: "BR",
        ceid: "BR:pt",
        // Lista exclusiva de feeds solicitada
        additionalRssFeeds: [
            "https://ptd.verdao.net/feed/",
            "https://nossopalestra.com.br/feed/",
            "https://palmeirasonline.com/feed/",
            "https://www.mondopalmeiras.net/feed/",
            "https://anythingpalmeiras.com/feed/",
            "https://arquivospalmeiras.blogspot.com/feeds/posts/default?alt=rss",
            "https://se-palmeiras.webnode.page/rss/all.xml",
            "https://se-palmeiras.webnode.page/rss/noticias.xml",
            "https://palmeiras-noticias5.webnode.page/rss/all.xml",
            "https://palmeiras-noticias5.webnode.page/rss/noticias.xml",
            "https://palmeiras-noticias5.webnode.page/rss/blog.xml",
            "https://tudopalmeiras.webnode.page/rss/all.xml",
            "https://tudopalmeiras.webnode.page/rss/brasileir%c3%a3o%202008.xml",
            "https://tudopalmeiras.webnode.page/rss/links-relacionados.xml"
        ]
    },

    // Configurações de Intervalo
    pollingIntervalMinutes: 30, // Verificar notícias a cada 30 minutos

    // Limite de histórico para evitar reenvios (guarda títulos para evitar duplicatas de blogs diferentes)
    maxHistorySize: 200,

    // Configurações de Horário e Limites Diários
    scheduler: {
        startHour: 8,       // Começa às 08:00
        endHour: 22,        // Para às 22:00
        morningLimit: 4,    // 4 notícias de manhã (08:00 - 12:00)
        afternoonLimit: 4   // 4 notícias de tarde (12:00 - 18:00)
    },

    // Intervalo entre envio de cada notícia (em segundos)
    messageDelaySeconds: 900 // 15 minutos
};
