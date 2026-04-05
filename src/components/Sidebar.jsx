import { useState, useEffect } from 'react';
import { SIDEBAR_ASCII } from '../data/portfolio';
import './Sidebar.css';

export default function Sidebar() {
  const [uptime, setUptime] = useState('0d 0h 0m');
  const [resolution, setResolution] = useState('');
  const [stats, setStats] = useState({
    cpu: 73, mem: 42, dsk: 61
  });

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

      // Animate stats slightly
      setStats({
        cpu: 73 + Math.floor(Math.random() * 8 - 4),
        mem: 42 + Math.floor(Math.random() * 6 - 3),
        dsk: 61
      });
    }, 5000);

    const handleResize = () => {
      setResolution(`${window.innerWidth}x${window.innerHeight}`);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="neofetch">
        <pre className="ascii-art">{SIDEBAR_ASCII}</pre>
        <div className="system-info">
          <InfoLine label="OS" value="KrishOS v2.0" />
          <InfoLine label="Host" value="Portfolio System" />
          <InfoLine label="Kernel" value="Creative-6.4.2" />
          <InfoLine label="Uptime" value={uptime} />
          <InfoLine label="Shell" value="krish-sh 5.2" />
          <InfoLine label="Resolution" value={resolution} />
          <InfoLine label="Theme" value="Cyber Neon" />
          <InfoLine label="Terminal" value="portfolio-term" />
          <div className="info-separator" />
          <div className="color-blocks">
            {['#1a1b26','#f7768e','#9ece6a','#e0af68','#7aa2f7','#bb9af7','#7dcfff','#c0caf5'].map(c => (
              <span key={c} className="color-block" style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>
      <div className="sidebar-stats">
        <StatBar label="CPU" value={stats.cpu} />
        <StatBar label="MEM" value={stats.mem} />
        <StatBar label="DSK" value={stats.dsk} />
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
