import { useState, useEffect } from 'react';
import { fetchProfile, fetchRepos, getLanguageStats, LANG_COLORS } from '../utils/github';
import './Sidebar.css';

export default function Sidebar() {
  const [uptime, setUptime] = useState('0d 0h 0m');
  const [resolution, setResolution] = useState('');
  const [stats, setStats] = useState({ cpu: 73, mem: 42, dsk: 61 });
  const [ghImgLoaded, setGhImgLoaded] = useState(false);
  const [graphImgLoaded, setGraphImgLoaded] = useState(false);
  const [ghData, setGhData] = useState(null);

  useEffect(() => {
    setResolution(`${window.innerWidth}x${window.innerHeight}`);

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const s = Math.floor(elapsed / 1000);
      const m = Math.floor(s / 60);
      const h = Math.floor(m / 60);
      const d = Math.floor(h / 24);
      setUptime(`${d}d ${h % 24}h ${m % 60}m`);
      setStats({
        cpu: 73 + Math.floor(Math.random() * 8 - 4),
        mem: 42 + Math.floor(Math.random() * 6 - 3),
        dsk: 61
      });
    }, 5000);

    const handleResize = () => setResolution(`${window.innerWidth}x${window.innerHeight}`);
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch live GitHub data
  useEffect(() => {
    (async () => {
      try {
        const [profile, repos] = await Promise.all([fetchProfile(), fetchRepos()]);
        const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
        const langs = getLanguageStats(repos).slice(0, 4);
        setGhData({ profile, repos, totalStars, langs });
      } catch {}
    })();
  }, []);

  return (
    <aside className="sidebar">
      {/* Neofetch */}
      <div className="neofetch">
        <div className="sidebar-video-wrap">
          <img
            src="https://media2.giphy.com/media/ZVik7pBtu9dNS/giphy.gif"
            alt="hacker typing"
            className="sidebar-gif"
          />
          <div className="sidebar-video-overlay" />
        </div>
        <div className="system-info">
          <InfoLine label="OS" value="KrishOS v2.0" />
          <InfoLine label="Host" value="Portfolio System" />
          <InfoLine label="Kernel" value="Creative-6.4.2" />
          <InfoLine label="Uptime" value={uptime} />
          <InfoLine label="Shell" value="krish-sh 5.2" />
          <InfoLine label="Resolution" value={resolution} />
          <InfoLine label="Theme" value="Amber CRT" />
          <InfoLine label="Terminal" value="portfolio-term" />
          <div className="info-separator" />
          <div className="color-blocks">
            {['#1a1b26','#f7768e','#9ece6a','#e0af68','#7aa2f7','#bb9af7','#7dcfff','#c0caf5'].map(c => (
              <span key={c} className="color-block" style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="sidebar-stats">
        <StatBar label="CPU" value={stats.cpu} />
        <StatBar label="MEM" value={stats.mem} />
        <StatBar label="DSK" value={stats.dsk} />
      </div>

      {/* Live GitHub Stats */}
      <div className="gh-section">
        <div className="gh-section-title">
          <span className="gh-icon">◈</span> GitHub Live
        </div>

        {ghData ? (
          <>
            {/* Live counters */}
            <div className="gh-quick-stats">
              <QuickStat label="Repos" value={ghData.profile.public_repos} />
              <QuickStat label="Stars" value={ghData.totalStars} />
              <QuickStat label="Followers" value={ghData.profile.followers} />
            </div>

            {/* Language bars */}
            <div className="gh-langs-mini">
              {ghData.langs.map(({ lang, pct }) => {
                const col = LANG_COLORS[lang] || '#888';
                return (
                  <div key={lang} className="gh-lang-mini-row">
                    <span className="gh-lang-mini-dot" style={{ background: col }} />
                    <span className="gh-lang-mini-name">{lang}</span>
                    <div className="gh-lang-mini-bar">
                      <div className="gh-lang-mini-fill" style={{ width: `${pct}%`, background: col }} />
                    </div>
                    <span className="gh-lang-mini-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="gh-placeholder">⟳ Fetching live data...</div>
        )}

        {/* Streak image */}
        <div className="gh-image-wrap" style={{ marginTop: 8 }}>
          {!ghImgLoaded && <div className="gh-placeholder">Loading streak...</div>}
          <img
            src="https://streak-stats.demolab.com?user=krishrathi1&theme=dark&hide_border=true&border_radius=4&background=0a0600&ring=ffb000&fire=ff7700&currStreakLabel=ffd699&sideLabels=b37b00&dates=b37b00&stroke=ffb00033&currStreakNum=ffcc00&sideNums=ffc44d&mode=daily"
            alt="GitHub Streak"
            className={`gh-img ${ghImgLoaded ? 'gh-img-visible' : ''}`}
            onLoad={() => setGhImgLoaded(true)}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Contribution Graph */}
        <div className="gh-image-wrap" style={{ marginTop: 6 }}>
          {!graphImgLoaded && <div className="gh-placeholder">Loading graph...</div>}
          <img
            src="https://github-readme-activity-graph.vercel.app/graph?username=krishrathi1&theme=react-dark&hide_border=true&area=true&area_color=ffb000&line=ffb000&point=ffcc00&color=ffd699&bg_color=0a0600&height=120"
            alt="GitHub Contributions"
            className={`gh-img ${graphImgLoaded ? 'gh-img-visible' : ''}`}
            onLoad={() => setGraphImgLoaded(true)}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Quick streak row */}
        <div className="gh-quick-stats" style={{ marginTop: 6 }}>
          <QuickStat label="Total Contribs" value="1,389+" />
          <QuickStat label="Best Streak" value="37 days" />
        </div>
      </div>
    </aside>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="info-line">
      <span className="info-label">{label}:</span> {value}
    </div>
  );
}

function StatBar({ label, value }) {
  return (
    <div className="stat-item">
      <span className="stat-label">{label}</span>
      <div className="stat-bar">
        <div className="stat-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="stat-value">{value}%</span>
    </div>
  );
}

function QuickStat({ label, value }) {
  return (
    <div className="gh-quick-stat">
      <span className="gh-quick-value">{value}</span>
      <span className="gh-quick-label">{label}</span>
    </div>
  );
}
