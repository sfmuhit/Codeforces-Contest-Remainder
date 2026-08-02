import {
  CodeforcesContest,
  CodeforcesUser,
  CodeforcesSubmission,
  DailySolvedStats,
  SolvedProblemItem,
  DivisionFilter,
} from '../types';

const CF_BASE_URL = 'https://codeforces.com/api';

// Cache in memory to prevent rate limits
let contestCache: { data: CodeforcesContest[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export async function fetchContests(forceRefresh = false): Promise<CodeforcesContest[]> {
  const now = Date.now();
  if (!forceRefresh && contestCache && now - contestCache.timestamp < CACHE_TTL_MS) {
    return contestCache.data;
  }

  try {
    const response = await fetch(`${CF_BASE_URL}/contest.list?gym=false`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'OK' && Array.isArray(data.result)) {
      const contests: CodeforcesContest[] = data.result;
      contestCache = { data: contests, timestamp: now };
      return contests;
    } else {
      throw new Error(data.comment || 'Failed to fetch contests from Codeforces');
    }
  } catch (error) {
    console.warn('Direct Codeforces API fetch failed, trying fallback...', error);
    // If direct fetch fails (e.g., CORS or network issue), attempt via allorigins CORS proxy
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`${CF_BASE_URL}/contest.list?gym=false`)}`;
      const proxyRes = await fetch(proxyUrl);
      const proxyData = await proxyRes.json();
      const parsedData = JSON.parse(proxyData.contents);
      if (parsedData.status === 'OK' && Array.isArray(parsedData.result)) {
        contestCache = { data: parsedData.result, timestamp: now };
        return parsedData.result;
      }
    } catch (proxyError) {
      console.error('Proxy fetch also failed:', proxyError);
    }
    
    // If cache exists even if old, return cached data
    if (contestCache) {
      return contestCache.data;
    }
    throw error;
  }
}

export async function fetchUserInfo(handle: string): Promise<CodeforcesUser | null> {
  const cleanHandle = handle.trim();
  if (!cleanHandle) return null;

  try {
    const response = await fetch(`${CF_BASE_URL}/user.info?handles=${encodeURIComponent(cleanHandle)}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status === 'OK' && Array.isArray(data.result) && data.result.length > 0) {
      return data.result[0];
    }
    return null;
  } catch (err) {
    console.error('Error fetching Codeforces user:', err);
    return null;
  }
}

export async function fetchUserSubmissions(
  handle: string,
  count = 200
): Promise<CodeforcesSubmission[]> {
  const cleanHandle = handle.trim();
  if (!cleanHandle) return [];

  const url = `${CF_BASE_URL}/user.status?handle=${encodeURIComponent(cleanHandle)}&from=1&count=${count}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error status ${response.status}`);
    const data = await response.json();
    if (data.status === 'OK' && Array.isArray(data.result)) {
      return data.result;
    }
    return [];
  } catch (err) {
    console.warn('Direct user.status fetch failed, trying proxy...', err);
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const proxyRes = await fetch(proxyUrl);
      const proxyData = await proxyRes.json();
      const parsedData = JSON.parse(proxyData.contents);
      if (parsedData.status === 'OK' && Array.isArray(parsedData.result)) {
        return parsedData.result;
      }
    } catch (proxyErr) {
      console.error('Proxy user.status fetch also failed:', proxyErr);
    }
    return [];
  }
}

export function calculateDailySolvedStats(
  handle: string,
  submissions: CodeforcesSubmission[],
  dailyGoal = 3
): DailySolvedStats {
  const now = new Date();
  const startOfTodayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfTodayMs = startOfTodayMs + 86400000;

  let totalOkTodayCount = 0;
  const uniqueProblems: SolvedProblemItem[] = [];
  const seenKeys = new Set<string>();

  for (const sub of submissions) {
    if (sub.verdict !== 'OK') continue;

    const subMs = sub.creationTimeSeconds * 1000;
    if (subMs >= startOfTodayMs && subMs < endOfTodayMs) {
      totalOkTodayCount++;

      const problemKey = sub.problem.contestId
        ? `${sub.problem.contestId}-${sub.problem.index}`
        : `${sub.problem.index}-${sub.problem.name}`;

      if (!seenKeys.has(problemKey)) {
        seenKeys.add(problemKey);

        const problemUrl = sub.problem.contestId
          ? `https://codeforces.com/contest/${sub.problem.contestId}/problem/${sub.problem.index}`
          : `https://codeforces.com/problemset`;

        uniqueProblems.push({
          id: problemKey,
          contestId: sub.problem.contestId || sub.contestId,
          index: sub.problem.index,
          name: sub.problem.name,
          rating: sub.problem.rating,
          tags: sub.problem.tags,
          solvedAtSeconds: sub.creationTimeSeconds,
          url: problemUrl,
        });
      }
    }
  }

  return {
    handle,
    uniqueSolvedTodayCount: uniqueProblems.length,
    totalOkTodayCount,
    problemsSolvedToday: uniqueProblems,
    lastUpdated: Date.now(),
    dailyGoal,
  };
}

export function parseDivision(contestName: string): DivisionFilter {
  const nameLower = contestName.toLowerCase();
  if (nameLower.includes('div. 1') && nameLower.includes('div. 2')) {
    return 'DIV1'; // Combined Div 1 + Div 2
  }
  if (nameLower.includes('div. 1')) return 'DIV1';
  if (nameLower.includes('div. 2')) return 'DIV2';
  if (nameLower.includes('div. 3')) return 'DIV3';
  if (nameLower.includes('div. 4')) return 'DIV4';
  if (nameLower.includes('educational')) return 'EDUCATIONAL';
  if (nameLower.includes('global')) return 'GLOBAL';
  return 'OTHER';
}

export function getRankColorClass(rank?: string): { text: string; bg: string; border: string } {
  if (!rank) return { text: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-700' };
  const r = rank.toLowerCase();
  
  if (r.includes('legendary grandmaster') || r.includes('tourist')) {
    return { text: 'text-red-500 font-bold', bg: 'bg-red-950/40', border: 'border-red-500/50' };
  }
  if (r.includes('grandmaster')) {
    return { text: 'text-red-500 font-semibold', bg: 'bg-red-950/30', border: 'border-red-500/30' };
  }
  if (r.includes('international master') || r.includes('master')) {
    return { text: 'text-orange-400 font-semibold', bg: 'bg-orange-950/30', border: 'border-orange-500/30' };
  }
  if (r.includes('candidate master')) {
    return { text: 'text-purple-400 font-semibold', bg: 'bg-purple-950/30', border: 'border-purple-500/30' };
  }
  if (r.includes('expert')) {
    return { text: 'text-blue-400 font-semibold', bg: 'bg-blue-950/30', border: 'border-blue-500/30' };
  }
  if (r.includes('specialist')) {
    return { text: 'text-cyan-400 font-semibold', bg: 'bg-cyan-950/30', border: 'border-cyan-500/30' };
  }
  if (r.includes('pupil')) {
    return { text: 'text-emerald-400 font-semibold', bg: 'bg-emerald-950/30', border: 'border-emerald-500/30' };
  }
  return { text: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-700' };
}
