const PlayScraper = require('google-play-scraper');
const AppStore = require('app-store-scraper');

const FALLBACK_REVIEWS = [
  { u: 'App Store', c: 'Great app for payments', s: 5, a: new Date().toISOString().slice(0,19).replace('T',' '), d: new Date().toISOString().slice(0,10), m: new Date().toISOString().slice(0,7), rep: '', st: 'POSITIVE', cat: 'General', tp: 'General Experience', sg: false, sp: false, source: 'fallback' },
  { u: 'Play Store User', c: 'Fast and secure transactions', s: 5, a: new Date().toISOString().slice(0,19).replace('T',' '), d: new Date().toISOString().slice(0,10), m: new Date().toISOString().slice(0,7), rep: '', st: 'POSITIVE', cat: 'General', tp: 'General Experience', sg: false, sp: false, source: 'fallback' },
  { u: 'User', c: 'Excellent service', s: 4, a: new Date().toISOString().slice(0,19).replace('T',' '), d: new Date().toISOString().slice(0,10), m: new Date().toISOString().slice(0,7), rep: '', st: 'POSITIVE', cat: 'General', tp: 'General Experience', sg: false, sp: false, source: 'fallback' }
];

function normalizeReview(review, source) {
  const text = review?.content || review?.body || review?.review || '';
  const rating = Number(review?.score || review?.rating || 0);
  const date = review?.date || review?.updated || review?.created || '';
  const username = review?.userName || review?.author || review?.user || 'Anonymous';
  const sentiment = rating >= 4 ? 'POSITIVE' : rating <= 2 ? 'NEGATIVE' : 'NEUTRAL';
  const category = review?.category || 'General';
  const touchpoint = review?.touchpoint || 'General Experience';

  return {
    u: username,
    c: text,
    s: rating || 3,
    th: 0,
    a: date ? new Date(date).toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 19).replace('T', ' '),
    d: date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    m: date ? new Date(date).toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7),
    rep: review?.reply || '',
    st: sentiment,
    cat: category,
    tp: touchpoint,
    sg: false,
    sp: false,
    source
  };
}

async function fetchPlayStoreReviews(packageName, limit = 50) {
  try {
    console.log(`[PlayStore] Fetching reviews for ${packageName}`);
    const reviews = await Promise.race([
      PlayScraper.reviews({
        appId: packageName,
        sort: PlayScraper.sort.NEWEST,
        num: limit,
        country: 'np'
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Play Store timeout')), 15000))
    ]);

    const normalized = (reviews?.data || []).slice(0, limit).map((item) => normalizeReview({
      content: item?.text,
      score: item?.score,
      date: item?.at,
      userName: item?.userName,
      reply: item?.replyText || '',
      category: 'General',
      touchpoint: 'General Experience'
    }, 'play-store'));
    console.log(`[PlayStore] Successfully fetched ${normalized.length} reviews`);
    return normalized;
  } catch (error) {
    console.error('[PlayStore] Failed:', error.message);
    return [];
  }
}

async function fetchAppStoreReviews(appStoreId, limit = 50) {
  try {
    console.log(`[AppStore] Fetching reviews for ${appStoreId}`);
    const reviews = await Promise.race([
      AppStore.reviews({
        id: appStoreId,
        sort: 'recent',
        page: 1,
        country: 'np',
        amount: limit
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('App Store timeout')), 15000))
    ]);

    const normalized = (reviews?.data || []).slice(0, limit).map((item) => normalizeReview({
      content: item?.review,
      score: item?.rating,
      date: item?.date,
      userName: item?.userName,
      reply: item?.reply || '',
      category: 'General',
      touchpoint: 'General Experience'
    }, 'app-store'));
    console.log(`[AppStore] Successfully fetched ${normalized.length} reviews`);
    return normalized;
  } catch (error) {
    console.error('[AppStore] Failed:', error.message);
    return [];
  }
}

async function fetchLiveReviews({ platform = 'both', playPackage = process.env.PLAY_STORE_APP_ID || 'com.esewa.android', appStoreId = process.env.APP_STORE_APP_ID || 'id1551981370', limit = 80 } = {}) {
  console.log(`[fetchLiveReviews] Starting with platform=${platform}, playPackage=${playPackage}, appStoreId=${appStoreId}, limit=${limit}`);
  const results = [];
  let playCount = 0;
  let appCount = 0;
  let source = [];

  if (platform === 'play' || platform === 'both') {
    const playReviews = await fetchPlayStoreReviews(playPackage, Math.max(20, Math.min(limit, 80)));
    results.push(...playReviews);
    playCount = playReviews.length;
    if (playCount > 0) source.push('play-store');
  }

  if (platform === 'app' || platform === 'both') {
    const appReviews = await fetchAppStoreReviews(appStoreId, Math.max(20, Math.min(limit, 80)));
    results.push(...appReviews);
    appCount = appReviews.length;
    if (appCount > 0) source.push('app-store');
  }

  let finalReviews = results.slice(0, limit);
  
  // If no reviews fetched, return fallback data
  if (finalReviews.length === 0) {
    console.log('[fetchLiveReviews] No live reviews fetched, using fallback data');
    finalReviews = FALLBACK_REVIEWS.slice(0, limit);
    source = ['fallback'];
  }

  console.log(`[fetchLiveReviews] Returning ${finalReviews.length} reviews from sources: ${source.join(', ')}`);
  return {
    reviews: finalReviews,
    sources: {
      playStore: playCount,
      appStore: appCount,
      total: finalReviews.length,
      sourcesUsed: source
    }
  };
}

module.exports = { fetchLiveReviews, fetchPlayStoreReviews, fetchAppStoreReviews };
