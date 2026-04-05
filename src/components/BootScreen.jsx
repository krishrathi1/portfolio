import { useState, useEffect, useRef } from 'react';
import { BOOT_LOGO, BOOT_MESSAGES } from '../data/portfolio';
import './BootScreen.css';

export default function BootScreen({ onComplete }) {
  const [logoLines, setLogoLines] = useState([]);
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing system...');
  const logRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function runBoot() {
      // Phase 1: Logo typewriter
      const lines = BOOT_LOGO.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (cancelled) return;
        await sleep(50);
        setLogoLines(prev => [...prev, lines[i]]);
      }

      await sleep(300);

      // Phase 2: Boot messages
      for (let i = 0; i < BOOT_MESSAGES.length; i++) {
        if (cancelled) return;
        await sleep(60 + Math.random() * 60);
        setMessages(prev => [...prev, BOOT_MESSAGES[i]]);
        setProgress(Math.floor(((i + 1) / BOOT_MESSAGES.length) * 100));
        setStatusText(`Loading... ${Math.floor(((i + 1) / BOOT_MESSAGES.length) * 100)}%`);
      }

      setStatusText('Boot complete. Launching terminal...');
      await sleep(500);

      if (!cancelled) onComplete();
    }

    runBoot();
    return () => { cancelled = true; };
  }, [onComplete]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="boot-screen">
      <div className="boot-content">
        <pre className="boot-logo">{logoLines.join('\n')}</pre>
        <div className="boot-log" ref={logRef}>
          {messages.map((msg, i) => (
            <div key={i} className="boot-line" style={{ animationDelay: `${i * 0.02}s` }}>
              <span className={`boot-${msg.type}`}>{msg.text}</span>
            </div>
          ))}
        </div>
        <div className="boot-progress-container">
          <div className="boot-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="boot-progress-text">{statusText}</div>
      </div>
    </div>
  );
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
