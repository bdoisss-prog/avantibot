import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import config from '../config.js';

const parser = new Parser();
const HISTORY_FILE = path.resolve('data/history.json');

// Função simples para tentar decodificar o link do Google News
async function getDirectLink(url) {
    if (!url.includes('articles/')) return url;
    try {
        // Tenta buscar a URL final seguindo os redirecionamentos
        // Usamos um User-Agent comum para evitar bloqueios simples
        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        return response.url;
    } catch (e) {
        return url; // Se falhar, retorna a original
    }
}

// Garante que o diretório data existe
if (!fs.existsSync(path.dirname(HISTORY_FILE))) {
    fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
}

// Carrega histórico de notícias enviadas
const loadHistory = () => {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Erro ao ler history.json:', error);
    }
    return [];
};

// Salva histórico
const saveHistory = (history) => {
    try {
        // Mantém apenas os últimos N itens para não crescer infinitamente
        const trimmedHistory = history.slice(-config.maxHistorySize);
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmedHistory, null, 2));
    } catch (error) {
        console.error('Erro ao salvar history.json:', error);
    }
};

export const fetchNews = async () => {
    try {
        const { query, lang, country, ceid, additionalRssFeeds, useGoogleNews } = config.search;

        // Lista de todas as URLs para buscar
        const allFeedUrls = [...additionalRssFeeds];

        if (useGoogleNews) {
            const googleNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang}&gl=${country}&ceid=${ceid}`;
            allFeedUrls.unshift(googleNewsUrl);
        }

        const history = loadHistory();
        const newItems = [];

        for (const url of allFeedUrls) {
            try {
                console.log(`Buscando notícias em: ${url}`);
                const feed = await parser.parseURL(url);

                for (const item of feed.items) {
                    const id = item.guid || item.link;

                    // Verifica se já está no histórico ou se já foi adicionado nesta rodada
                    if (!history.includes(id) && !newItems.find(n => n.id === id)) {
                        console.log(`[nova notícia] ${item.title}`);

                        // Tenta resolver o link se for do Google News
                        let directLink = item.link;
                        if (url.includes('google.com')) {
                            directLink = await getDirectLink(item.link);
                        }

                        newItems.push({
                            title: item.title,
                            link: directLink,
                            pubDate: item.pubDate,
                            id: id
                        });
                    }
                }
            } catch (err) {
                console.error(`Erro ao buscar feed (${url}):`, err.message);
            }
        }

        // Se houver novas notícias, atualiza o histórico
        if (newItems.length > 0) {
            const updatedHistory = [...history, ...newItems.map(n => n.id)];
            saveHistory(updatedHistory);
        }

        // Ordena por data (mais antigas primeiro para enviar na ordem correta)
        return newItems.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
    } catch (error) {
        console.error('Erro crítico ao buscar notícias:', error);
        return [];
    }
};
