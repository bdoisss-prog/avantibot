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

    pollingIntervalMinutes: 30,
    maxHistorySize: 200,

    scheduler: {
        startHour: 8,
        endHour: 22,
        morningLimit: 4,
        afternoonLimit: 4
    },

    messageDelaySeconds: 900
};
