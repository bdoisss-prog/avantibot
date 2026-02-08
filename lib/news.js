// Última atualização: 08/02/2026 16:06
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import config from '../config.js';

const parser = new Parser();
const DATA_DIR = path.resolve('data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getCleanTitle(title) {
    if (!title) return '';
    const cleanTitle = title.split(/[|-] [^|-]+$/)[0].trim();
    return cleanTitle.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 60);
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
            const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
            return Array.isArray(history) ? history : [];
        }
    } catch (e) { }
    return [];
};

const saveHistory = (history) => {
    try {
        const trimmedHistory = history.slice(-config.maxHistorySize);
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmedHistory, null, 2));
    } catch (e) { }
};

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
        const history = loadHistory();
        const newItems = [];
        for (const url of allFeedUrls) {
            try {
                const feed = await parser.parseURL(url);
                for (const item of feed.items) {
                    const id = item.guid || item.link;
                    const cleanTitle = getCleanTitle(item.title);
                    const pubDate = new Date(item.pubDate);
                    const now = new Date();
                    const twelveHoursAgo = new Date(now.getTime() - (12 * 60 * 60 * 1000));
                    if (pubDate < twelveHoursAgo) continue;
                    const isDuplicate = history.some(h => {
                        if (typeof h === 'string') return h === id;
                        return h.id === id || h.cleanTitle === cleanTitle;
                    });
                    const isAlreadyAdded = newItems.some(n => n.id === id || n.cleanTitle === cleanTitle);
                    if (!isDuplicate && !isAlreadyAdded) {
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
            } catch (e) { }
        }
        return newItems.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
    } catch (e) {
        return [];
    }
};

export { saveHistory, loadHistory };
