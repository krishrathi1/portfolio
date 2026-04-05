// ─── GitHub API Utility ─── live data for krishrathi1
const USERNAME = 'krishrathi1';
const BASE = 'https://api.github.com';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const cache = {};

async function fetchWithCache(url, key) {
  const now = Date.now();
  if (cache[key] && now - cache[key].ts < CACHE_TTL) return cache[key].data;

  // Try localStorage fallback
  try {
    const stored = JSON.parse(localStorage.getItem(`gh_${key}`) || 'null');
    if (stored && now - stored.ts < CACHE_TTL) {
      cache[key] = stored;
      return stored.data;
    }
  } catch {}

  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
  const data = await res.json();

  cache[key] = { data, ts: now };
  try { localStorage.setItem(`gh_${key}`, JSON.stringify({ data, ts: now })); } catch {}
  return data;
}

export async function fetchProfile() {
  return fetchWithCache(`${BASE}/users/${USERNAME}`, 'profile');
}

export async function fetchRepos() {
  // fetch all pages
  let page = 1, all = [];
  while (true) {
    const batch = await fetchWithCache(
      `${BASE}/users/${USERNAME}/repos?per_page=100&page=${page}&sort=updated`,
      `repos_p${page}`
    );
    all = [...all, ...batch];
    if (batch.length < 100) break;
    page++;
  }
  return all.filter(r => !r.fork); // skip forks, show only owned
}

export function getLanguageStats(repos) {
  const counts = {};
  for (const r of repos) {
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, count]) => ({ lang, count, pct: Math.round((count / total) * 100) }));
}

// Language → color map (GitHub's official palette)
export const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Dart: '#00B4AB',
  Vue: '#41b883',
  Jupyter Notebook: '#DA5B0B',
};

export const USERNAME_GH = USERNAME;
