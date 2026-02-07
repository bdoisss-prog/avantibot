import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import config from '../config.js';

const parser = new Parser();
const HISTORY_FILE = path.resolve('data/history.json');

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
        const { query, lang, country, ceid } = config.search;
        const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang}&gl=${country}&ceid=${ceid}`;

        console.log(`Buscando notícias em: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);
        const history = loadHistory();
        const newItems = [];

        // Filtra notícias que já foram enviadas (verificando GUID ou Link)
        for (const item of feed.items) {
            const id = item.guid || item.link;
            if (!history.includes(id)) {
                newItems.push({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    id: id
                });
            }
        }

        // Se houver novas notícias, atualiza o histórico
        if (newItems.length > 0) {
            const updatedHistory = [...history, ...newItems.map(n => n.id)];
            saveHistory(updatedHistory);
        }

        return newItems;
    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        return [];
    }
};
