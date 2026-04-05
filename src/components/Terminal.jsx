import { useState, useEffect, useRef, useCallback } from 'react';
import { WELCOME_ASCII, THEMES } from '../data/portfolio';
import { executeCommand, getAutocompleteSuggestions, getCurrentPath } from '../commands';
import Sidebar from './Sidebar';
import SnakeGame from './SnakeGame';
import './Terminal.css';

export default function Terminal() {
  const [lines, setLines] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cmdHistory') || '[]'); } catch { return []; }
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandCount, setCommandCount] = useState(0);
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved && THEMES[saved]) return saved;
    return 'amber';
  });
  const [glitching, setGlitching] = useState(false);
  const [matrixVisible, setMatrixVisible] = useState(true);
  const [clock, setClock] = useState('');
  const [currentDir, setCurrentDir] = useState('~');
  const [snakeActive, setSnakeActive] = useState(false);
  const [contactWizardStep, setContactWizardStep] = useState(-1); // -1 = inactive
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [deletionActive, setDeletionActive] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);

  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const lineIdRef = useRef(0);
  const konamiRef = useRef([]);
  const welcomeShownRef = useRef(false);

  // ─── Konami code detector ───
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

  // ─── Clock ───
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour12: false });
      const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      setClock(`${date} ${time}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Restore theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved && THEMES[saved]) {
      const root = document.documentElement;
      for (const [prop, val] of Object.entries(THEMES[saved])) {
        root.style.setProperty(prop, val);
      }
    }
  }, []);

  // ─── Welcome message (only once) ───
  const showWelcome = useCallback(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const welcomeLines = [
      { html: `<pre class="welcome-ascii">${WELCOME_ASCII}</pre>` },
      { html: `<div class="welcome-tagline"><span class="wt-dot">◉</span> Full-Stack &amp; AI/ML Developer &nbsp;|&nbsp; Chatbot Expert &nbsp;|&nbsp; Hackathon Winner</div>` },
      { html: '' },
      { html: `<div class="welcome-info-row"><span class="wi-key">os</span><span class="wi-sep">~</span><span class="wi-val">KrishOS v3.0 · React + Vite</span> &nbsp;&nbsp; <span class="wi-key">date</span><span class="wi-sep">~</span><span class="wi-val">${dateStr} ${timeStr}</span></div>` },
      { html: `<div class="welcome-info-row"><span class="wi-key">uni</span><span class="wi-sep">~</span><span class="wi-val">BML Munjal University · B.Tech CS · 2023–2027</span></div>` },
      { html: `<div class="welcome-info-row"><span class="wi-key">gh</span><span class="wi-sep">~</span><span class="wi-val"><a href="https://github.com/krishrathi1" target="_blank" style="color:var(--accent-cyan);text-decoration:none">github.com/krishrathi1</a> · 1,389+ contributions</span></div>` },
      { html: '' },
      { html: `<div class="welcome-cmd-hint"><span style="color:var(--text-muted)">Quick start →</span> <span class="wcmd">dashboard</span> <span class="wcmd">github</span> <span class="wcmd">repos</span> <span class="wcmd">timeline</span> <span class="wcmd">hack</span> <span class="wcmd">snake</span></div>` },
      { html: `<div style="color:var(--text-muted);font-size:0.72rem;margin-top:2px">Type <span style="color:var(--accent-yellow)">help</span> for all commands · <span style="color:var(--accent-yellow)">Tab</span> autocomplete · <span style="color:var(--accent-yellow)">↑/↓</span> history</div>` },
      { html: '' },
    ];
    setLines(prev => [...prev, ...welcomeLines.map(l => ({ ...l, id: lineIdRef.current++ }))]);
  }, []);

  useEffect(() => {
    if (!welcomeShownRef.current) {
      welcomeShownRef.current = true;
      showWelcome();
    }
    inputRef.current?.focus();
  }, [showWelcome]);

  // ─── URL command execution ───
  useEffect(() => {
    const handler = (e) => {
      const cmd = e.detail?.command;
      if (cmd) {
        processInput(cmd);
      }
    };
    window.addEventListener('execute-url-command', handler);
    return () => window.removeEventListener('execute-url-command', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  // Persist command history
  useEffect(() => {
    try { localStorage.setItem('cmdHistory', JSON.stringify(commandHistory.slice(-100))); } catch {}
  }, [commandHistory]);

  // ─── Output helpers ───
  const appendHtml = useCallback((html) => {
    setLines(prev => [...prev, { id: lineIdRef.current++, html }]);
  }, []);

  const clearOutput = useCallback(() => {
    setLines([]);
  }, []);

  const setTheme = useCallback((name) => {
    const vars = THEMES[name];
    if (vars) {
      const root = document.documentElement;
      for (const [prop, val] of Object.entries(vars)) {
        root.style.setProperty(prop, val);
      }
      setCurrentTheme(name);
      localStorage.setItem('theme', name);
    }
  }, []);

  const triggerGlitch = useCallback(() => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 300);
  }, []);

  const toggleMatrix = useCallback(() => {
    setMatrixVisible(prev => {
      const next = !prev;
      window.dispatchEvent(new CustomEvent('toggle-matrix', { detail: { visible: next } }));
      if (next) {
        appendHtml('<span class="output-success">☔ Matrix rain enabled</span>');
      } else {
        appendHtml('<span class="output-info">☔ Matrix rain disabled</span>');
      }
      return next;
    });
  }, [appendHtml]);

  const updatePath = useCallback((path) => {
    setCurrentDir(path);
  }, []);

  // ─── Snake game ───
  const startSnakeGame = useCallback(() => {
    setSnakeActive(true);
    setInputDisabled(true);
  }, []);

  const endSnakeGame = useCallback((score) => {
    setSnakeActive(false);
    setInputDisabled(false);
    appendHtml(`<span class="output-success">🐍 Game Over! Final score: ${score}</span>`);
    const highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
    if (score > highScore) {
      localStorage.setItem('snakeHighScore', score.toString());
      appendHtml(`<span class="output-success">🏆 New high score!</span>`);
    } else {
      appendHtml(`<span class="output-info">High score: ${highScore}</span>`);
    }
    inputRef.current?.focus();
  }, [appendHtml]);

  // ─── Contact wizard ───
  const startContactWizard = useCallback(() => {
    setContactWizardStep(0);
    setContactData({ name: '', email: '', message: '' });
    setInputDisabled(false);
    appendHtml('<div class="section-header">📬  Contact Form</div>');
    appendHtml('<span style="color:var(--accent-cyan)">Step 1/3:</span> <span style="color:var(--text-secondary)">Enter your name:</span>');
  }, [appendHtml]);

  // ─── rm -rf / deletion animation ───
  const startDeletionAnimation = useCallback(() => {
    setDeletionActive(true);
    setInputDisabled(true);

    const fakeFiles = [
      '/usr/bin/creativity.ko', '/var/log/coffee.log', '/home/krish/.bashrc',
      '/etc/portfolio.conf', '/usr/lib/react.so', '/opt/node_modules/',
      '/home/krish/projects/', '/var/data/skills.db', '/usr/share/fonts/',
      '/home/krish/experience.log', '/sys/kernel/imagination',
      '/boot/system.initiative', '/tmp/bugs.tmp', '/dev/null',
      '/home/krish/.secret', '/usr/lib/python3.11/', '/etc/ssl/certs/',
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < fakeFiles.length) {
        appendHtml(`<span class="output-error">removing ${fakeFiles[i]} ...</span>`);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          appendHtml('');
          appendHtml('<span style="color:var(--accent-magenta);font-size:1.2rem;font-weight:700">💥 SYSTEM DESTROYED</span>');
          triggerGlitch();

          setTimeout(() => {
            appendHtml('');
            appendHtml('<span style="color:var(--accent-green);font-size:1rem">...just kidding 😄</span>');
            appendHtml('<span style="color:var(--text-secondary)">Everything is fine. This is a portfolio, not a real OS.</span>');
            appendHtml('<span style="color:var(--text-muted);font-size:0.75rem">But seriously, rm -rf / in a real terminal? Don\'t.</span>');
            setDeletionActive(false);
            setInputDisabled(false);
            inputRef.current?.focus();
          }, 1500);
        }, 400);
      }
    }, 120);
  }, [appendHtml, clearOutput, triggerGlitch]);

  // ─── Process input (shared between normal + wizard) ───
  const processInput = useCallback((rawValue) => {
    const val = rawValue || inputValue;

    // Contact wizard mode
    if (contactWizardStep >= 0) {
      const trimmed = val.trim();
      appendHtml(`<span style="color:var(--text-muted)">  → ${escapeHtml(trimmed)}</span>`);

      if (contactWizardStep === 0) {
        if (!trimmed) {
          appendHtml('<span class="output-error">Name cannot be empty.</span>');
          return;
        }
        setContactData(prev => ({ ...prev, name: trimmed }));
        setContactWizardStep(1);
        appendHtml('<span style="color:var(--accent-cyan)">Step 2/3:</span> <span style="color:var(--text-secondary)">Enter your email:</span>');
      } else if (contactWizardStep === 1) {
        if (!trimmed.includes('@') || !trimmed.includes('.')) {
          appendHtml('<span class="output-error">Please enter a valid email address.</span>');
          return;
        }
        setContactData(prev => ({ ...prev, email: trimmed }));
        setContactWizardStep(2);
        appendHtml('<span style="color:var(--accent-cyan)">Step 3/3:</span> <span style="color:var(--text-secondary)">Enter your message:</span>');
      } else if (contactWizardStep === 2) {
        if (!trimmed) {
          appendHtml('<span class="output-error">Message cannot be empty.</span>');
          return;
        }
        setContactData(prev => ({ ...prev, message: trimmed }));
        setContactWizardStep(-1);

        // Envelope animation
        const envelope = [
          '     ╔═══════════════════════╗',
          '     ║  ✉  Message Sent!  ✉  ║',
          '     ╟───────────────────────╢',
          `     ║  From: ${trimmed.slice(0, 17).padEnd(17)}║`,
          '     ║  Status: Delivered ✓  ║',
          '     ╚═══════════════════════╝'
        ];
        appendHtml(`<pre style="color:var(--accent-green);font-size:0.75rem;margin:8px 0;font-family:var(--font-mono)">${envelope.join('\n')}</pre>`);
        appendHtml('<span class="output-success">✓ Message sent successfully! (connect EmailJS for real delivery)</span>');
        appendHtml(`<span class="output-info">Thank you, ${contactData.name || trimmed}! I'll get back to you soon.</span>`);
      }

      setInputValue('');
      return;
    }

    // Normal mode: echo prompt + command
    const displayPath = currentDir === '~' ? '~' : currentDir;
    appendHtml(
      `<div class="output-prompt"><span class="prompt-user">krish</span><span class="prompt-at">@</span><span class="prompt-host">portfolio</span><span class="prompt-colon">:</span><span class="prompt-path">${displayPath}</span><span class="prompt-dollar">$</span> <span style="color:var(--text-primary)">${escapeHtml(val)}</span></div>`
    );

    if (val.trim()) {
      setCommandHistory(prev => [...prev, val.trim()]);
      setCommandCount(prev => prev + 1);

      const ctx = {
        appendHtml,
        appendLine: appendHtml,
        clearOutput,
        setTheme,
        currentTheme,
        commandHistory: [...commandHistory, val.trim()],
        commandCount: commandCount + 1,
        startTime: startTimeRef.current,
        triggerGlitch,
        toggleMatrix,
        showWelcome,
        updatePath,
        startSnakeGame,
        startContactWizard,
        startDeletionAnimation
      };

      executeCommand(val, ctx);
    }

    setInputValue('');
    setHistoryIndex(-1);
  }, [inputValue, appendHtml, clearOutput, setTheme, currentTheme, commandHistory, commandCount,
      triggerGlitch, toggleMatrix, showWelcome, updatePath, startSnakeGame, startContactWizard,
      startDeletionAnimation, contactWizardStep, contactData, currentDir]);

  // ─── Key Handling ───
  const handleKeyDown = useCallback((e) => {
    // Konami code detection (global)
    konamiRef.current.push(e.key);
    if (konamiRef.current.length > 10) konamiRef.current.shift();
    if (konamiRef.current.join(',') === KONAMI.join(',')) {
      konamiRef.current = [];
      // Trigger matrix rain!
      window.dispatchEvent(new CustomEvent('toggle-matrix', { detail: { visible: true } }));
      setMatrixVisible(true);
      appendHtml('<span class="output-success" style="font-size:1rem">🎮 KONAMI CODE ACTIVATED! Matrix rain unleashed!</span>');
      triggerGlitch();
      return;
    }

    if (inputDisabled) return;

    if (e.key === 'Enter') {
      processInput();
    } else if (e.key === 'ArrowUp' && contactWizardStep < 0) {
      e.preventDefault();
      setHistoryIndex(prev => {
        const next = prev === -1 ? commandHistory.length - 1 : Math.max(0, prev - 1);
        if (next >= 0 && next < commandHistory.length) {
          setInputValue(commandHistory[next]);
        }
        return next;
      });
    } else if (e.key === 'ArrowDown' && contactWizardStep < 0) {
      e.preventDefault();
      setHistoryIndex(prev => {
        const next = prev + 1;
        if (next >= commandHistory.length) {
          setInputValue('');
          return -1;
        }
        setInputValue(commandHistory[next]);
        return next;
      });
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && contactWizardStep < 0) {
        const suggestions = getAutocompleteSuggestions(val);
        if (suggestions.length === 1) {
          setInputValue(suggestions[0]);
        } else if (suggestions.length > 1) {
          appendHtml(`<span class="output-info">${suggestions.join('  ')}</span>`);
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clearOutput();
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      if (contactWizardStep >= 0) {
        setContactWizardStep(-1);
        appendHtml('<span class="output-error">^C — Contact form cancelled.</span>');
      } else {
        setInputValue('');
        const displayPath = currentDir === '~' ? '~' : currentDir;
        appendHtml(`<div class="output-prompt"><span class="prompt-user">krish</span><span class="prompt-at">@</span><span class="prompt-host">portfolio</span><span class="prompt-colon">:</span><span class="prompt-path">${displayPath}</span><span class="prompt-dollar">$</span> <span style="color:var(--text-primary)">${escapeHtml(inputValue)}</span><span class="output-error">^C</span></div>`);
      }
    } else if (e.key === 'u' && e.ctrlKey) {
      e.preventDefault();
      setInputValue('');
    }
  }, [processInput, inputValue, commandHistory, appendHtml, clearOutput, contactWizardStep,
      currentDir, inputDisabled, triggerGlitch]);

  // ─── Focus on click ───
  const handleContainerClick = useCallback(() => {
    if (!snakeActive) inputRef.current?.focus();
  }, [snakeActive]);

  // ─── Prompt text ───
  const displayPath = currentDir === '~' ? '~' : currentDir;
  const promptLabel = contactWizardStep >= 0
    ? ['📬', 'contact', ':', contactWizardStep === 0 ? 'name' : contactWizardStep === 1 ? 'email' : 'message', '>']
    : null;

  return (
    <div className={`terminal-container fade-in ${glitching ? 'glitch-effect' : ''}`} onClick={handleContainerClick}>
      <div className="scan-bar" />
      {/* Top Bar */}
      <div className="terminal-topbar">
        <div className="topbar-left">
          <span className="topbar-dot red" />
          <span className="topbar-dot yellow" />
          <span className="topbar-dot green" />
        </div>
        <div className="topbar-title">krish@portfolio:{displayPath}</div>
        <div className="topbar-right">{clock}</div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        <div className="tab active">
          <span className="tab-icon">⌂</span> main
          <span className="tab-close">×</span>
        </div>
        {snakeActive && (
          <div className="tab active" style={{ marginLeft: 2 }}>
            <span className="tab-icon">🐍</span> snake
          </div>
        )}
      </div>

      {/* Body */}
      <div className="terminal-body">
        <Sidebar />
        <main className="terminal-main">
          <div className="output" ref={outputRef}>
            {lines.map(line => (
              <div
                key={line.id}
                className="output-line"
                dangerouslySetInnerHTML={{ __html: line.html }}
              />
            ))}
            {/* Snake game overlay */}
            {snakeActive && <SnakeGame onEnd={endSnakeGame} />}
          </div>
          <div className="input-line">
            {promptLabel ? (
              <span className="prompt">
                <span style={{ color: 'var(--accent-cyan)' }}>{promptLabel[0]}</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{promptLabel[1]}</span>
                <span style={{ color: 'var(--text-muted)' }}>{promptLabel[2]}</span>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{promptLabel[3]}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>{promptLabel[4]}</span>
              </span>
            ) : (
              <span className="prompt">
                <span className="prompt-user">krish</span>
                <span className="prompt-at">@</span>
                <span className="prompt-host">portfolio</span>
                <span className="prompt-colon">:</span>
                <span className="prompt-path">{displayPath}</span>
                <span className="prompt-dollar">$</span>
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              className="command-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck={false}
              disabled={inputDisabled && contactWizardStep < 0}
              aria-label="Terminal command input"
            />
            <span className="cursor-block">█</span>
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span className="status-item mode-indicator">
            {snakeActive ? 'GAME' : contactWizardStep >= 0 ? 'INPUT' : 'NORMAL'}
          </span>
          <span className="status-item">{displayPath === '~' ? '~/portfolio' : displayPath}</span>
        </div>
        <div className="status-center">
          <span className="status-item">
            {snakeActive ? '🐍 Arrow keys to move, ESC to quit' :
             contactWizardStep >= 0 ? '📬 Fill in the form (Ctrl+C to cancel)' :
             commandCount === 0 ? "Type 'help' to get started" :
             `Last: ${commandHistory[commandHistory.length - 1] || ''}`}
          </span>
        </div>
        <div className="status-right">
          <span className="status-item">Ln {lines.length}</span>
          <span className="status-item">Cmd: {commandCount}</span>
          <span className="status-item">{clock.split(' ').pop()}</span>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(text) {
  const el = document.createElement('div');
  el.textContent = text;
  return el.innerHTML;
}
