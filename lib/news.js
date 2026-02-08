import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import config from '../config.js';

const parser = new Parser();
const DATA_DIR = path.resolve('data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Garante que o diretório data existe
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Função para simplificar títulos e comparar (evitar notícias repetidas de blogs diferentes)
function getCleanTitle(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove pontuação e espaços
        .substring(0, 50); // Compara os primeiros 50 caracteres
}

async function getDirectLink(url) {
    if (!url.includes('articles/')) return url;
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        return response.url;
    } catch (e) {
        return url;
    }
}

const loadHistory = () => {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Erro ao ler history.json:', error);
    }
    return [];
};

const saveHistory = (history) => {
    try {
        const trimmedHistory = history.slice(-config.maxHistorySize);
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmedHistory, null, 2));
    } catch (error) {
        console.error('Erro ao salvar history.json:', error);
    }
};

// Gerenciamento de estatísticas diárias (limite de 4 notícias por período)
export const getDailyStats = () => {
    const today = new Date().toISOString().split('T')[0];
    try {
        if (fs.existsSync(STATS_FILE)) {
            const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
            if (stats.date === today) return stats;
        }
    } catch (e) { }
    return { date: today, morningCount: 0, afternoonCount: 0 };
};

export const updateDailyStats = (isMorning) => {
    const stats = getDailyStats();
    if (isMorning) stats.morningCount++;
    else stats.afternoonCount++;
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
};

export const fetchNews = async () => {
    try {
        const { query, lang, country, ceid, additionalRssFeeds, useGoogleNews } = config.search;
        const allFeedUrls = [...additionalRssFeeds];

        if (useGoogleNews) {
            const googleNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang}&gl=${country}&ceid=${ceid}`;
            allFeedUrls.unshift(googleNewsUrl);
        }

        const history = loadHistory(); // Agora histórico guarda IDs E Títulos limpos
        const newItems = [];

        for (const url of allFeedUrls) {
            try {
                console.log(`Buscando em: ${url}`);
                const feed = await parser.parseURL(url);

                for (const item of feed.items) {
                    const id = item.guid || item.link;
                    const cleanTitle = getCleanTitle(item.title);

                    const pubDate = new Date(item.pubDate);
                    const now = new Date();
                    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

                    // 1. Pula se for muito antiga
                    if (pubDate < twentyFourHoursAgo) continue;

                    // 2. Verifica se o ID ou o Título já foi enviado (evita duplicatas de outros blogs)
                    const isDuplicate = history.some(h => h.id === id || h.cleanTitle === cleanTitle);
                    const isAlreadyAdded = newItems.some(n => n.id === id || getCleanTitle(n.title) === cleanTitle);

                    if (!isDuplicate && !isAlreadyAdded) {
                        console.log(`[nova] ${item.title}`);
                        let directLink = item.link;
                        if (url.includes('google.com')) directLink = await getDirectLink(item.link);

                        newItems.push({
                            title: item.title,
                            link: directLink,
                            pubDate: item.pubDate,
                            id: id,
                            cleanTitle: cleanTitle
                        });
                    }
                }
            } catch (err) {
                console.error(`Erro no feed ${url}:`, err.message);
            }
        }

        return newItems.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        return [];
    }
};

// Exporta saveHistory para ser chamado após o envio real de cada notícia
export { saveHistory, loadHistory };
