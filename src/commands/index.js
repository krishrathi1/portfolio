import {
  PORTFOLIO, SIDEBAR_ASCII, FORTUNES,
  THEMES, WEATHER_CONDITIONS, SUDO_RESPONSES
} from '../data/portfolio';
import { fetchProfile, fetchRepos, getLanguageStats, LANG_COLORS, USERNAME_GH } from '../utils/github';

// ──────────────────────────────────────────────
// VIRTUAL FILESYSTEM
// ──────────────────────────────────────────────
const FILE_SYSTEM = {
  '~': {
    type: 'dir',
    children: {
      'projects': {
        type: 'dir',
        children: {}  // populated below
      },
      'about.txt': {
        type: 'file',
        content: () => PORTFOLIO.bio.join('\n') + `\n\nName: ${PORTFOLIO.name}\nRole: ${PORTFOLIO.title}\nLocation: ${PORTFOLIO.location}`
      },
      'skills.json': {
        type: 'file',
        content: () => JSON.stringify(PORTFOLIO.skills, null, 2)
      },
      'experience.log': {
        type: 'file',
        content: () => PORTFOLIO.experience.map(e => `[${e.duration}] ${e.title} @ ${e.company}\n  ${e.desc}`).join('\n\n')
      },
      'education.md': {
        type: 'file',
        content: () => PORTFOLIO.education.map(e => `# ${e.degree}\n**${e.school}** (${e.year})\n${e.details}`).join('\n\n')
      },
      'contact.cfg': {
        type: 'file',
        content: () => `[contact]\nemail = ${PORTFOLIO.email}\ngithub = ${PORTFOLIO.github}\nlinkedin = ${PORTFOLIO.linkedin}\ntwitter = ${PORTFOLIO.twitter}\nwebsite = ${PORTFOLIO.website}`
      },
      'resume.pdf': {
        type: 'file',
        content: () => '[Binary file — use "resume --download" to get the PDF]'
      },
      '.secret': {
        type: 'file',
        hidden: true,
        content: () => '🎉 You found the secret file!\nThere\'s no secret — just a developer who loves building cool things.\nThanks for exploring! Type "contact" to get in touch.'
      },
      '.bashrc': {
        type: 'file',
        hidden: true,
        content: () => '# krish-sh configuration\nexport PS1="krish@portfolio:~$ "\nexport EDITOR=nvim\nalias cls=clear\nalias ll="ls -la"\nalias hack="echo Nice try 😎"'
      }
    }
  }
};

// Populate projects directory
PORTFOLIO.projects.forEach(p => {
  const slug = p.name.toLowerCase().replace(/\s+/g, '-');
  FILE_SYSTEM['~'].children.projects.children[slug] = {
    type: 'dir',
    children: {
      'README.md': {
        type: 'file',
        content: () => `# ${p.name}\n\n${p.desc}\n\n## Tech Stack\n${p.tech.map(t => `- ${t}`).join('\n')}\n\n## Links\n- GitHub: ${p.github}\n- Live: ${p.live}`
      },
      'package.json': {
        type: 'file',
        content: () => JSON.stringify({ name: slug, version: '1.0.0', keywords: p.tech }, null, 2)
      }
    }
  };
});

// Global mutable state for filesystem navigation
let currentPath = '~';

function resolvePath(path) {
  if (!path || path === '~') return '~';
  if (path === '/') return '~';
  if (path === '..') {
    const parts = currentPath.split('/');
    parts.pop();
    return parts.length === 0 ? '~' : parts.join('/');
  }
  if (path === '.') return currentPath;
  if (path.startsWith('~/')) return path;
  if (path.startsWith('/')) return '~' + path;
  return currentPath === '~' ? `~/${path}` : `${currentPath}/${path}`;
}

function getNode(path) {
  const resolved = resolvePath(path);
  if (resolved === '~') return FILE_SYSTEM['~'];
  const parts = resolved.replace('~/', '').split('/');
  let node = FILE_SYSTEM['~'];
  for (const part of parts) {
    if (node.type !== 'dir' || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

// ──────────────────────────────────────────────
// COMMAND REGISTRY
// ──────────────────────────────────────────────
const COMMAND_CATEGORIES = {
  "Navigation": ["help", "ls", "cd", "cat", "pwd", "find", "clear", "banner"],
  "About Me": ["about", "skills", "projects", "experience", "education", "whoami", "achievements", "certifications", "dsa", "timeline"],
  "GitHub": ["github", "repos", "langs"],
  "Contact": ["contact", "resume", "socials"],
  "System": ["date", "uptime", "neofetch", "history", "echo", "alias", "top"],
  "Fun": ["sudo", "matrix", "fortune", "weather", "theme", "snake", "sl", "rm", "hack", "ping", "credits", "exit"],
  "Utility": ["dashboard", "share", "repo"]
};

const commands = {};
const aliases = {};

// ──────────────────────────────────────────────
// COMMANDS
// ──────────────────────────────────────────────

// ─── help ───
commands.help = {
  desc: "Show all available commands",
  fn: (args, ctx) => {
    ctx.appendHtml('<div class="section-header">📋  Available Commands</div>');
    for (const [category, cmds] of Object.entries(COMMAND_CATEGORIES)) {
      ctx.appendHtml(`<div style="margin-top:8px"><span style="color:var(--accent-purple);font-weight:600">▸ ${category}</span></div>`);
      let html = '<div class="help-table">';
      for (const cmd of cmds) {
        const c = commands[cmd];
        html += `<span class="help-cmd">${cmd}</span><span class="help-desc">${c ? c.desc : ''}</span>`;
      }
      html += '</div>';
      ctx.appendHtml(html);
    }
    ctx.appendHtml(`<div style="margin-top:12px;color:var(--text-muted);font-size:0.75rem">💡 Tip: Try "ls ~/projects" then "cd" into one and "cat README.md"</div>`);
    ctx.appendHtml(`<div style="color:var(--text-muted);font-size:0.75rem">💡 Konami code (↑↑↓↓←→←→BA) triggers a surprise!</div>`);
  }
};

// ─── ls ───
commands.ls = {
  desc: "List directory contents",
  fn: (args, ctx) => {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
    const target = args.replace(/-[alisla]+/g, '').trim() || currentPath;

    const node = getNode(target);
    if (!node) {
      ctx.appendHtml(`<span class="output-error">ls: cannot access '${escapeHtml(target)}': No such file or directory</span>`);
      return;
    }
    if (node.type !== 'dir') {
      ctx.appendHtml(`<span style="color:var(--accent-green)">${target}</span>`);
      return;
    }

    const resolved = resolvePath(target);
    ctx.appendHtml(`<div class="section-header">📂  ${resolved}</div>`);

    const entries = Object.entries(node.children)
      .filter(([name, n]) => showAll || !n.hidden)
      .sort(([, a], [, b]) => (a.type === 'dir' ? -1 : 1) - (b.type === 'dir' ? -1 : 1));

    if (showLong) {
      let html = '<div style="font-size:0.78rem;padding-left:12px">';
      html += `<div style="color:var(--text-muted);margin-bottom:4px">total ${entries.length}</div>`;
      for (const [name, n] of entries) {
        const isDir = n.type === 'dir';
        const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = isDir ? '4096' : (n.content ? n.content().length.toString() : '0');
        const color = isDir ? 'var(--accent-blue)' : getFileColor(name);
        html += `<div><span style="color:var(--text-muted)">${perms}</span>  <span style="color:var(--text-muted)">${size.padStart(6)}</span>  <span style="color:${color};font-weight:${isDir ? '600' : '400'}">${name}${isDir ? '/' : ''}</span></div>`;
      }
      html += '</div>';
      ctx.appendHtml(html);
    } else {
      let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:4px;padding-left:12px">';
      for (const [name, n] of entries) {
        const isDir = n.type === 'dir';
        const color = isDir ? 'var(--accent-blue)' : getFileColor(name);
        html += `<span style="color:${color};font-weight:${isDir ? '600' : '400'}">${name}${isDir ? '/' : ''}</span>`;
      }
      html += '</div>';
      ctx.appendHtml(html);
    }
  }
};

// ─── cd ───
commands.cd = {
  desc: "Change directory",
  fn: (args, ctx) => {
    const target = args.trim() || '~';
    if (target === '-') {
      // go to previous (simplistic)
      currentPath = '~';
      ctx.updatePath(currentPath);
      return;
    }

    const resolved = resolvePath(target);
    const node = getNode(target);
    if (!node) {
      ctx.appendHtml(`<span class="output-error">cd: no such directory: ${escapeHtml(target)}</span>`);
      return;
    }
    if (node.type !== 'dir') {
      ctx.appendHtml(`<span class="output-error">cd: not a directory: ${escapeHtml(target)}</span>`);
      return;
    }
    currentPath = resolved;
    ctx.updatePath(currentPath);
  }
};

// ─── cat ───
commands.cat = {
  desc: "Read file contents",
  fn: (args, ctx) => {
    const file = args.trim();
    if (!file) {
      ctx.appendHtml('<span class="output-error">Usage: cat &lt;filename&gt;</span>');
      ctx.appendHtml('<span class="output-info">Try: cat README.md</span>');
      return;
    }

    const node = getNode(file);
    if (!node) {
      ctx.appendHtml(`<span class="output-error">cat: ${escapeHtml(file)}: No such file or directory</span>`);
      return;
    }
    if (node.type === 'dir') {
      ctx.appendHtml(`<span class="output-error">cat: ${escapeHtml(file)}: Is a directory</span>`);
      return;
    }

    const content = node.content ? node.content() : '';
    // Syntax highlight based on extension
    const ext = file.split('.').pop();
    const highlighted = highlightContent(content, ext);
    ctx.appendHtml(`<pre style="color:var(--text-secondary);font-size:0.8rem;line-height:1.5;white-space:pre-wrap;padding:8px 12px;background:var(--bg-tertiary);border-radius:6px;border:1px solid var(--border-color);margin:4px 0">${highlighted}</pre>`);
  }
};

// ─── pwd ───
commands.pwd = {
  desc: "Print working directory",
  fn: (args, ctx) => {
    ctx.appendHtml(`<span style="color:var(--accent-cyan)">/home/krish/${currentPath.replace('~', '')}</span>`);
  }
};

// ─── find ───
commands.find = {
  desc: "Find files by pattern",
  fn: (args, ctx) => {
    const pattern = args.replace(/.*-name\s+/i, '').replace(/["']/g, '').trim();
    if (!pattern) {
      ctx.appendHtml('<span class="output-error">Usage: find . -name "*.md"</span>');
      return;
    }

    const results = [];
    function walk(node, path) {
      if (node.type === 'dir') {
        for (const [name, child] of Object.entries(node.children)) {
          const fullPath = `${path}/${name}`;
          if (matchPattern(name, pattern)) results.push(fullPath);
          walk(child, fullPath);
        }
      }
    }
    walk(FILE_SYSTEM['~'], '~');

    if (results.length === 0) {
      ctx.appendHtml('<span class="output-info">No files found matching pattern.</span>');
    } else {
      for (const r of results) {
        const color = getFileColor(r);
        ctx.appendHtml(`<span style="color:${color}">${r}</span>`);
      }
    }
  }
};

// ─── about ───
commands.about = {
  desc: "Learn about Krish Rathi",
  fn: (args, ctx) => {
    ctx.appendHtml('<div class="section-header">👤  About Me</div>');
    ctx.appendHtml(`<div class="about-content">
      <div class="about-avatar">
        <pre class="avatar-ascii">${SIDEBAR_ASCII}</pre>
        <div style="padding-top:4px">
          <div style="color:var(--accent-cyan);font-size:1rem;font-weight:700">${PORTFOLIO.name}</div>
          <div style="color:var(--accent-yellow);font-size:0.8rem">${PORTFOLIO.title}</div>
          <div style="margin-top:4px"><span style="color:var(--accent-green)">◉</span> <span style="color:var(--text-secondary);font-size:0.75rem">Available for hire</span></div>
        </div>
      </div>
      <div class="about-details">
        ${Object.entries(PORTFOLIO.about).map(([k, v]) =>
          `<span class="about-label">${k}:</span><span class="about-value">${v}</span>`
        ).join('')}
      </div>
      <div style="margin-top:12px;color:var(--text-secondary);font-size:0.82rem;line-height:1.6">${PORTFOLIO.bio.join('<br>')}</div>
    </div>`);
  }
};

// ─── skills ───
commands.skills = {
  desc: "Display technical skills (--matrix for ASCII bars)",
  fn: (args, ctx) => {
    const useMatrix = args.includes('--matrix') || args.includes('-m');
    const filterCat = args.match(/--filter\s+(\w+)/)?.[1];
    const sortByLevel = args.includes('--sort');

    ctx.appendHtml('<div class="section-header">⚡  Technical Skills</div>');

    for (const [category, skills] of Object.entries(PORTFOLIO.skills)) {
      if (filterCat && !category.toLowerCase().includes(filterCat.toLowerCase())) continue;

      const sorted = sortByLevel ? [...skills].sort((a, b) => b.level - a.level) : skills;

      if (useMatrix) {
        // ASCII progress bar mode
        ctx.appendHtml(`<div style="margin:8px 0"><span style="color:var(--accent-purple);font-weight:600">▸ ${category}</span></div>`);
        for (const skill of sorted) {
          const filled = Math.round(skill.level / 5);
          const empty = 20 - filled;
          const bar = '█'.repeat(filled) + '░'.repeat(empty);
          const color = skill.level > 80 ? 'var(--accent-green)' : skill.level > 60 ? 'var(--accent-cyan)' : 'var(--accent-yellow)';
          ctx.appendHtml(`<div style="padding-left:12px;font-size:0.78rem"><span style="color:var(--text-secondary);display:inline-block;width:120px">${skill.name}</span> <span style="color:${color}">[${bar}]</span> <span style="color:var(--text-muted)">${skill.level}%</span></div>`);
        }
      } else {
        // Visual bar mode
        let html = `<div class="skill-category"><div class="skill-category-title">▸ ${category}</div>`;
        for (const skill of sorted) {
          const color = skill.level > 80 ? 'var(--accent-green)' : skill.level > 60 ? 'var(--accent-cyan)' : 'var(--accent-yellow)';
          html += `<div class="skill-item">
            <span class="skill-name">${skill.name}</span>
            <div class="skill-bar-container">
              <div class="skill-bar-fill" style="width:${skill.level}%;background:${color}"></div>
            </div>
            <span class="skill-level">${skill.level}%</span>
          </div>`;
        }
        html += '</div>';
        ctx.appendHtml(html);
      }
    }
    if (!useMatrix) {
      ctx.appendHtml(`<div style="margin-top:8px;color:var(--text-muted);font-size:0.7rem">💡 Try: skills --matrix | skills --filter frontend | skills --sort</div>`);
    }
  }
};

// ─── projects ───
commands.projects = {
  desc: "View project portfolio",
  fn: (args, ctx) => {
    const filter = args.match(/--filter\s+(\w+)/)?.[1];

    ctx.appendHtml('<div class="section-header">🚀  Projects</div>');
    for (const p of PORTFOLIO.projects) {
      if (filter && !p.tech.some(t => t.toLowerCase().includes(filter.toLowerCase()))) continue;

      const tags = p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
      const slug = p.name.toLowerCase().replace(/\s+/g, '-');
      ctx.appendHtml(`<div class="project-card">
        <div class="project-title">◈ ${p.name}</div>
        <div class="project-desc">${p.desc}</div>
        <div class="project-tech">${tags}</div>
        <div class="project-links">
          <a class="project-link" href="${p.github}" target="_blank" rel="noopener">⟨ GitHub ⟩</a>
          <a class="project-link" href="${p.live}" target="_blank" rel="noopener">⟨ Live Demo ⟩</a>
          <span class="project-link" style="color:var(--text-muted)">cd ~/projects/${slug}</span>
        </div>
      </div>`);
    }
    ctx.appendHtml(`<div style="margin-top:8px;color:var(--text-muted);font-size:0.7rem">💡 Use "cd ~/projects/project-name" then "cat README.md" to explore</div>`);
  }
};

// ─── experience ───
commands.experience = {
  desc: "Show work experience",
  fn: (args, ctx) => {
    ctx.appendHtml('<div class="section-header">💼  Experience</div>');
    for (const exp of PORTFOLIO.experience) {
      ctx.appendHtml(`<div class="exp-item">
        <div class="exp-title">${exp.title}</div>
        <div class="exp-company">${exp.company}</div>
        <div class="exp-duration">${exp.duration}</div>
        <div class="exp-desc">${exp.desc}</div>
      </div>`);
    }
  }
};

// ─── education ───
commands.education = {
  desc: "Display education history",
  fn: (args, ctx) => {
    ctx.appendHtml('<div class="section-header">🎓  Education</div>');
    for (const edu of PORTFOLIO.education) {
      ctx.appendHtml(`<div class="edu-item">
        <div class="edu-degree">${edu.degree}</div>
        <div class="edu-school">${edu.school}</div>
        <div class="edu-year">${edu.year}</div>
        <div style="color:var(--text-secondary);font-size:0.78rem;margin-top:4px">${edu.details}</div>
      </div>`);
    }
  }
};

// ─── contact (interactive wizard) ───
commands.contact = {
  desc: "Interactive contact form / show info",
  fn: (args, ctx) => {
    if (args.includes('--send') || args.includes('-s')) {
      ctx.startContactWizard();
      return;
    }

    ctx.appendHtml('<div class="section-header">📬  Contact</div>');
    const contacts = [
      { icon: "✉", label: "Email", value: `<a href="mailto:${PORTFOLIO.email}">${PORTFOLIO.email}</a>` },
      { icon: "📞", label: "Phone", value: PORTFOLIO.phone },
      { icon: "⚡", label: "GitHub", value: `<a href="${PORTFOLIO.github}" target="_blank" rel="noopener">${PORTFOLIO.github}</a>` },
      { icon: "💼", label: "LinkedIn", value: `<a href="${PORTFOLIO.linkedin}" target="_blank" rel="noopener">${PORTFOLIO.linkedin}</a>` },
      { icon: "🌐", label: "Website", value: `<a href="${PORTFOLIO.website}" target="_blank" rel="noopener">${PORTFOLIO.website}</a>` }
    ];
    for (const c of contacts) {
      ctx.appendHtml(`<div class="contact-item">
        <span class="contact-icon">${c.icon}</span>
        <span class="contact-label">${c.label}</span>
        <span class="contact-value">${c.value}</span>
      </div>`);
    }
    ctx.appendHtml(`<div style="color:var(--text-muted);font-size:0.75rem;margin-top:8px;padding-left:12px">💡 Try "contact --send" for interactive contact wizard</div>`);
  }
};

// ─── resume ───
commands.resume = {
  desc: "View or download resume",
  fn: (args, ctx) => {
    if (args.includes('--download') || args.includes('--pdf')) {
      ctx.appendHtml('<span class="output-info">📄 Preparing resume for download...</span>');
      ctx.appendHtml('<span class="output-warning">⚠  Resume PDF not yet linked. Add your PDF URL in data/portfolio.js</span>');
      return;
    }
    if (args.includes('--json')) {
      ctx.appendHtml(`<pre style="color:var(--text-secondary);font-size:0.78rem;padding:8px;background:var(--bg-tertiary);border-radius:6px;border:1px solid var(--border-color)">${JSON.stringify(PORTFOLIO.about, null, 2)}</pre>`);
      return;
    }

    // Inline ASCII resume
    ctx.appendHtml('<div class="section-header">📄  Resume</div>');
    ctx.appendHtml(`<div style="padding:12px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:8px;margin:8px 0">
      <div style="color:var(--accent-cyan);font-size:1.1rem;font-weight:700;text-align:center">${PORTFOLIO.name}</div>
      <div style="color:var(--accent-yellow);font-size:0.8rem;text-align:center">${PORTFOLIO.title}</div>
      <div style="color:var(--text-muted);font-size:0.75rem;text-align:center">${PORTFOLIO.email} · ${PORTFOLIO.location}</div>
      <div style="border-top:1px solid var(--border-color);margin:10px 0"></div>
      <div style="color:var(--accent-purple);font-weight:600;margin-bottom:4px">EXPERIENCE</div>
      ${PORTFOLIO.experience.map(e => `<div style="margin:6px 0"><span style="color:var(--accent-yellow)">${e.title}</span> <span style="color:var(--text-muted)">— ${e.company} (${e.duration})</span><div style="color:var(--text-secondary);font-size:0.78rem">${e.desc}</div></div>`).join('')}
      <div style="border-top:1px solid var(--border-color);margin:10px 0"></div>
      <div style="color:var(--accent-purple);font-weight:600;margin-bottom:4px">EDUCATION</div>
      ${PORTFOLIO.education.map(e => `<div style="margin:6px 0"><span style="color:var(--accent-yellow)">${e.degree}</span><div style="color:var(--text-muted);font-size:0.75rem">${e.school} (${e.year})</div></div>`).join('')}
      <div style="border-top:1px solid var(--border-color);margin:10px 0"></div>
      <div style="color:var(--accent-purple);font-weight:600;margin-bottom:4px">SKILLS</div>
      <div style="color:var(--text-secondary);font-size:0.78rem">${Object.entries(PORTFOLIO.skills).map(([cat, skills]) => `<span style="color:var(--accent-blue)">${cat}:</span> ${skills.map(s => s.name).join(', ')}`).join('<br>')}</div>
    </div>`);
    ctx.appendHtml(`<div style="color:var(--text-muted);font-size:0.7rem">💡 Flags: --download (PDF) | --json (raw data)</div>`);
  }
};

// ─── whoami ───
commands.whoami = {
  desc: "Display current user info",
  fn: (args, ctx) => {
    ctx.appendHtml(`<span style="color:var(--accent-green);font-weight:600">krish</span> <span class="output-info">— ${PORTFOLIO.title}</span>`);
    ctx.appendHtml(`<span style="color:var(--accent-green)">◉</span> <span style="color:var(--text-secondary);font-size:0.8rem">Available for hire</span>`);
    ctx.appendHtml(`<span style="color:var(--text-muted);font-size:0.75rem">📍 ${PORTFOLIO.location} | 🎓 BML Munjal University (2023-2027)</span>`);
  }
};

// ─── achievements ───
commands.achievements = {
  desc: "Show hackathon wins and awards",
  fn: (args, ctx) => {
    ctx.appendHtml('<div class="section-header">🏆  Achievements & Awards</div>');
    PORTFOLIO.achievements.forEach((a, i) => {
      const medals = ['🥇','🥉','🏅','🔹','🎯','🌟'];
      const medal = medals[i] || '⭐';
      ctx.appendHtml(`<div style="padding:4px 12px;font-size:0.82rem"><span style="color:var(--accent-yellow)">${medal}</span> <span style="color:var(--text-secondary)">${a}</span></div>`);
    });
    ctx.appendHtml(`<div style="margin-top:8px;color:var(--text-muted);font-size:0.75rem;padding-left:12px">🎮 DSA: ${PORTFOLIO.dsa.problems} problems on ${PORTFOLIO.dsa.platforms}</div>`);
    ctx.appendHtml(`<div style="color:var(--text-muted);font-size:0.75rem;padding-left:12px">🧠 Topics: ${PORTFOLIO.dsa.topics}</div>`);
  }
};

// ─── certifications ───
commands.certifications = {
  desc: "List certifications and credentials",
  fn: (args, ctx) => {
    ctx.appendHtml('<div class="section-header">📜  Certifications</div>');
    ctx.appendHtml(`<div style="color:var(--accent-yellow);font-size:0.75rem;padding-left:12px;margin-bottom:8px">Google Cloud Skills Boost</div>`);
    PORTFOLIO.certifications.forEach(cert => {
      ctx.appendHtml(`<div style="padding:3px 12px;font-size:0.82rem"><span style="color:var(--accent-green)">✓</span> <span style="color:var(--text-secondary)">${cert}</span></div>`);
    });
  }
};

// ─── dsa ───
commands.dsa = {
  desc: "Show competitive programming stats",
  fn: (args, ctx) => {
    ctx.appendHtml('<div class="section-header">⚡  Competitive Programming / DSA</div>');
    ctx.appendHtml(`<div style="padding:12px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:6px;margin:4px 0">
      <div style="color:var(--accent-cyan);font-weight:700;margin-bottom:8px">📊 Stats</div>
      <div style="font-size:0.82rem;line-height:2">
        <div><span style="color:var(--accent-yellow);display:inline-block;width:120px">Problems Solved:</span><span style="color:var(--text-primary);font-weight:700">${PORTFOLIO.dsa.problems}</span></div>
        <div><span style="color:var(--accent-yellow);display:inline-block;width:120px">Platforms:</span><span style="color:var(--text-secondary)">${PORTFOLIO.dsa.platforms}</span></div>
        <div><span style="color:var(--accent-yellow);display:inline-block;width:120px">Topics:</span><span style="color:var(--text-secondary)">${PORTFOLIO.dsa.topics}</span></div>
      </div>
    </div>`);
  }
};

// ─── date ───
commands.date = {
  desc: "Show current date and time",
  fn: (args, ctx) => {
    const now = new Date();
    ctx.appendHtml(`<span style="color:var(--accent-cyan)">${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>`);
    ctx.appendHtml(`<span style="color:var(--text-secondary)">${now.toLocaleTimeString('en-US', { hour12: true })}</span>`);
  }
};

// ─── uptime ───
commands.uptime = {
  desc: "Show session uptime",
  fn: (args, ctx) => {
    const elapsed = Date.now() - ctx.startTime;
    const s = Math.floor(elapsed / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    ctx.appendHtml(`<span class="output-info">Session uptime: ${h}h ${m % 60}m ${s % 60}s</span>`);
    ctx.appendHtml(`<span class="output-info">Commands executed: ${ctx.commandCount}</span>`);
  }
};

// ─── clear ───
commands.clear = {
  desc: "Clear terminal screen",
  fn: (args, ctx) => { ctx.clearOutput(); }
};

// ─── banner ───
commands.banner = {
  desc: "Display the welcome banner",
  fn: (args, ctx) => { ctx.showWelcome(); }
};

// ─── neofetch ───
commands.neofetch = {
  desc: "Display system info (--portfolio for real stats)",
  fn: (args, ctx) => {
    const isPortfolio = args.includes('--portfolio');
    const now = new Date();
    const uptime = Math.floor((Date.now() - ctx.startTime) / 1000);
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);

    const stats = isPortfolio ? [
      `<span style="color:var(--accent-yellow);font-weight:700">${PORTFOLIO.name}</span>`,
      `<span style="color:var(--text-muted)">------------------</span>`,
      `<span class="info-label">Title:</span>     ${PORTFOLIO.title}`,
      `<span class="info-label">Projects:</span>  ${PORTFOLIO.projects.length} completed`,
      `<span class="info-label">Skills:</span>    ${Object.keys(PORTFOLIO.skills).length} categories`,
      `<span class="info-label">Exp:</span>       ${PORTFOLIO.experience[0].duration}`,
      `<span class="info-label">Location:</span>  ${PORTFOLIO.location}`,
      `<span class="info-label">Email:</span>     ${PORTFOLIO.email}`,
      `<span class="info-label">Status:</span>    Available for Hire`,
    ] : [
      `<span style="color:var(--accent-green);font-weight:700">krish</span><span style="color:var(--text-muted)">@</span><span style="color:var(--accent-blue);font-weight:700">portfolio</span>`,
      `<span style="color:var(--text-muted)">------------------</span>`,
      `<span class="info-label">OS:</span>       KrishOS v2.0 (React 18)`,
      `<span class="info-label">Host:</span>     Terminal Portfolio v2.0`,
      `<span class="info-label">Kernel:</span>   Creative-6.4.2-ANTIGRAVITY`,
      `<span class="info-label">Uptime:</span>   ${h ? h + 'h ' : ''}${m}m`,
      `<span class="info-label">Shell:</span>    krish-sh 5.2`,
      `<span class="info-label">Theme:</span>    ${ctx.currentTheme}`,
      `<span class="info-label">CPU:</span>      Your Brain (Unlimited)`,
      `<span class="info-label">Memory:</span>   Ambition 64GB / Passion 128GB`,
      `<span class="info-label">GPU:</span>      RTX 5090 Neural (Virtual)`,
    ];

    const colors = ['#1a1b26','#f7768e','#9ece6a','#e0af68','#7aa2f7','#bb9af7','#7dcfff','#c0caf5']
      .map(c => `<span style="background:${c};width:16px;height:16px;display:inline-block;border-radius:2px;border:1px solid rgba(255,255,255,0.1)"></span>`).join(' ');

    ctx.appendHtml(`<div style="display:flex;gap:30px;font-size:0.85rem;line-height:1.6;margin:10px 0;align-items:flex-start">
      <pre style="color:var(--accent-blue);text-shadow:var(--glow-cyan);font-size:0.6rem;line-height:1.2;font-family:var(--font-mono);margin:0">${SIDEBAR_ASCII}</pre>
      <div>
        ${stats.join('<br>')}
        <div style="margin-top:12px">${colors}</div>
      </div>
    </div>`);
    
    if (!isPortfolio) {
      ctx.appendHtml(`<div style="color:var(--text-muted);font-size:0.7rem;margin-top:4px">💡 Try: neofetch --portfolio</div>`);
    }
  }
};

// ─── history ───
commands.history = {
  desc: "Show command history",
  fn: (args, ctx) => {
    ctx.appendHtml('<div class="section-header">📜  Command History</div>');
    if (ctx.commandHistory.length === 0) {
      ctx.appendHtml('<span class="output-info">No commands in history.</span>');
      return;
    }
    for (let i = 0; i < ctx.commandHistory.length; i++) {
      ctx.appendHtml(`  <span style="color:var(--text-muted);width:30px;display:inline-block">${i + 1}</span> <span style="color:var(--text-secondary)">${ctx.commandHistory[i]}</span>`);
    }
  }
};

// ─── theme ───
commands.theme = {
  desc: "Switch color theme (theme set <name>)",
  fn: (args, ctx) => {
    const parts = args.trim().split(/\s+/);
    const subCmd = parts[0]?.toLowerCase();
    const themeName = parts[1]?.toLowerCase() || parts[0]?.toLowerCase();

    if (!themeName || subCmd === 'list') {
      ctx.appendHtml('<div class="section-header">🎨  Available Themes</div>');
      for (const t of Object.keys(THEMES)) {
        const marker = t === ctx.currentTheme ? ' ◀ current' : '';
        ctx.appendHtml(`  <span style="color:var(--accent-yellow)">${t}</span><span style="color:var(--accent-green)">${marker}</span>`);
      }
      ctx.appendHtml(`<div style="margin-top:8px" class="output-info">Usage: theme set &lt;name&gt; | theme &lt;name&gt;</div>`);
      return;
    }

    const name = subCmd === 'set' ? themeName : subCmd;
    if (!THEMES[name]) {
      ctx.appendHtml(`<span class="output-error">Error: Theme '${name}' not found. Type 'theme' to see options.</span>`);
      return;
    }
    ctx.setTheme(name);
    ctx.appendHtml(`<span class="output-success">✓ Theme switched to <span style="color:var(--accent-yellow)">${name}</span></span>`);
  }
};

// ─── echo ───
commands.echo = {
  desc: "Echo a message",
  fn: (args, ctx) => { ctx.appendHtml(`<span style="color:var(--text-secondary)">${escapeHtml(args) || ''}</span>`); }
};

// ─── alias ───
commands.alias = {
  desc: "Create command alias",
  fn: (args, ctx) => {
    if (!args.trim()) {
      ctx.appendHtml('<div class="section-header">📎  Aliases</div>');
      if (Object.keys(aliases).length === 0) {
        ctx.appendHtml('<span class="output-info">No aliases defined. Usage: alias name="command"</span>');
      } else {
        for (const [k, v] of Object.entries(aliases)) {
          ctx.appendHtml(`  <span style="color:var(--accent-yellow)">${k}</span> = <span style="color:var(--text-secondary)">"${v}"</span>`);
        }
      }
      return;
    }
    const match = args.match(/^(\w+)=["']?(.+?)["']?$/);
    if (match) {
      aliases[match[1]] = match[2];
      ctx.appendHtml(`<span class="output-success">✓ Alias set: ${match[1]} → "${match[2]}"</span>`);
    } else {
      ctx.appendHtml('<span class="output-error">Usage: alias name="command"</span>');
    }
  }
};

// ─── socials ───
commands.socials = {
  desc: "Open social media links",
  fn: (args, ctx) => {
    ctx.appendHtml('<div class="section-header">🔗  Socials</div>');
    const socials = [
      { name: "GitHub", url: PORTFOLIO.github },
      { name: "LinkedIn", url: PORTFOLIO.linkedin },
      { name: "Twitter", url: PORTFOLIO.twitter }
    ];
    for (const s of socials) {
      ctx.appendHtml(`  <span style="color:var(--accent-cyan)">▸</span> <a href="${s.url}" target="_blank" rel="noopener" style="color:var(--accent-blue);text-decoration:none">${s.name}</a> <span style="color:var(--text-muted)">— ${s.url}</span>`);
    }
  }
};

// ─── sudo (with hire me easter egg) ───
commands.sudo = {
  desc: "Try running as superuser",
  fn: (args, ctx) => {
    if (args.toLowerCase().includes('hire') && args.toLowerCase().includes('me')) {
      // sudo hire me easter egg!
      ctx.appendHtml(`<span style="color:var(--accent-yellow)">[sudo] password for recruiter: </span><span style="color:var(--text-muted)">********</span>`);
      setTimeout(() => {
        ctx.appendHtml(`<span class="output-success" style="font-size:1rem">🎉 ACCESS GRANTED</span>`);
        ctx.appendHtml(`<div style="padding:12px;background:var(--bg-tertiary);border:1px solid var(--accent-green);border-radius:8px;margin:8px 0">
          <div style="color:var(--accent-green);font-weight:700;font-size:0.9rem">✨ Congratulations! You've unlocked the hire-me spec:</div>
          <div style="color:var(--text-secondary);margin-top:8px;font-size:0.82rem">
            • Status: <span style="color:var(--accent-green)">◉ Available for hire</span><br>
            • Response time: <span style="color:var(--accent-cyan)">&lt; 24 hours</span><br>
            • Email: <a href="mailto:${PORTFOLIO.email}" style="color:var(--accent-cyan)">${PORTFOLIO.email}</a><br>
            • Resume: Type <span style="color:var(--accent-yellow)">resume --download</span><br>
            • LinkedIn: <a href="${PORTFOLIO.linkedin}" target="_blank" style="color:var(--accent-cyan)">${PORTFOLIO.linkedin}</a>
          </div>
        </div>`);
        ctx.triggerGlitch();
      }, 800);
      return;
    }

    const r = SUDO_RESPONSES[Math.floor(Math.random() * SUDO_RESPONSES.length)];
    ctx.appendHtml(`<span class="output-error">${r}</span>`);
  }
};

// ─── matrix ───
commands.matrix = {
  desc: "Toggle matrix rain effect",
  fn: (args, ctx) => { ctx.toggleMatrix(); }
};

// ─── fortune ───
commands.fortune = {
  desc: "Get a random programming quote",
  fn: (args, ctx) => {
    const q = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    ctx.appendHtml(`<div style="padding:8px 12px;border-left:2px solid var(--accent-purple);margin:8px 0">
      <div style="color:var(--text-secondary);font-style:italic;font-size:0.82rem">"${q.text}"</div>
      <div style="color:var(--accent-purple);font-size:0.75rem;margin-top:4px">— ${q.author}</div>
    </div>`);
  }
};

// ─── weather ───
commands.weather = {
  desc: "Show current weather (fun)",
  fn: (args, ctx) => {
    const w = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
    ctx.appendHtml('<div class="section-header">🌡️  Weather Report</div>');
    ctx.appendHtml(`<div style="padding:8px 12px;background:var(--bg-tertiary);border-radius:8px;border:1px solid var(--border-color);margin:8px 0">
      <div style="font-size:1.5rem">${w.emoji}  <span style="color:var(--accent-yellow);font-weight:700">${w.temp}</span></div>
      <div style="color:var(--text-secondary);margin-top:4px;font-size:0.8rem">${w.desc}</div>
      <div style="color:var(--text-muted);font-size:0.7rem;margin-top:4px">Location: Developer's Paradise</div>
    </div>`);
  }
};

// ─── snake ───
commands.snake = {
  desc: "Play Snake in the terminal!",
  fn: (args, ctx) => {
    ctx.startSnakeGame();
  }
};

// ─── sl (steam locomotive easter egg) ───
commands.sl = {
  desc: "You meant 'ls', right?",
  fn: (args, ctx) => {
    const train = [
      '      ====        ________                ___________',
      '  _D _|  |_______/        \\__I_I_____===__|___________|',
      '   |(_)---  |   H\\________/ |   |        =|___ ___|',
      '   /     |  |   H  |  |     |   |         ||_| |_||',
      '  |      |  |   H  |__--------------------| [___] |',
      '  | ________|___H__/__|_____/[][]~\\_______|       |',
      '  |/ |   |-----------I_____I [][] []  D   |=======|__',
      '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__',
      ' |/-=|___|=    ||    ||    ||    |_____/~\\___/        ',
      '  \\_/      \\O=====O=====O=====O_/      \\_/           '
    ];
    ctx.appendHtml(`<pre style="color:var(--accent-yellow);font-size:0.6rem;line-height:1.1;font-family:var(--font-mono)">${train.join('\n')}</pre>`);
    ctx.appendHtml('<span style="color:var(--text-muted);font-size:0.75rem">🚂 Choo choo! (You probably meant "ls")</span>');
  }
};

// ─── rm ───
commands.rm = {
  desc: "Remove files (try rm -rf /)",
  fn: (args, ctx) => {
    if (args.includes('-rf') && (args.includes('/') || args.includes('*'))) {
      ctx.startDeletionAnimation();
      return;
    }
    ctx.appendHtml(`<span class="output-error">rm: refusing to remove '${escapeHtml(args)}' without -rf flag</span>`);
    ctx.appendHtml(`<span class="output-info">Just kidding — you can't actually delete anything here 😄</span>`);
  }
};

// ─── credits ───
commands.credits = {
  desc: "Show credits",
  fn: (args, ctx) => {
    ctx.appendHtml('<div class="section-header">✨  Credits</div>');
    ctx.appendHtml(`<span style="color:var(--text-secondary)">Built with ❤️ by <span style="color:var(--accent-cyan);font-weight:700">Krish Rathi</span></span>`);
    ctx.appendHtml(`<span style="color:var(--text-muted)">Inspired by terminal emulators, ricing culture, and the beauty of the CLI.</span>`);
    ctx.appendHtml(`<span style="color:var(--text-muted)">Theme: Tokyo Night | Font: JetBrains Mono | Stack: React + Vite</span>`);
    ctx.appendHtml(`<span style="color:var(--text-muted)">No frameworks were harmed in the making of this portfolio.</span>`);
  }
};

// ─── exit ───
commands.exit = {
  desc: "Close the terminal (just kidding!)",
  fn: (args, ctx) => {
    ctx.appendHtml('<span class="output-error">exit: Nice try! You can\'t escape this terminal 😄</span>');
    ctx.appendHtml('<span class="output-info">But seriously, thanks for visiting!</span>');
    ctx.triggerGlitch();
  }
};

// ─── warp ───
commands.warp = {
  desc: "Engage warp drive! (screensaver easter egg)",
  fn: (args, ctx) => {
    const factor = parseInt(args) || 10;
    ctx.appendHtml(`<span style="color:var(--accent-yellow);font-weight:700">🚀 Engaging warp drive (factor ${factor})...</span>`);
    window.dispatchEvent(new CustomEvent('starfield-warp', { detail: { factor } }));
    
    // Auto-reset after some time
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('starfield-warp', { detail: { factor: 1 } }));
    }, 10000);
  }
};

// ─── art ───
commands.art = {
  desc: "Generate AI ASCII art (art <prompt>)",
  fn: async (args, ctx) => {
    const prompt = args.trim();
    if (!prompt) {
      ctx.appendHtml('<span class="output-error">Usage: art &lt;prompt&gt;</span>');
      return;
    }

    ctx.appendHtml(`<span class="output-info">🎨 Dreaming up "${prompt}"...</span>`);
    
    try {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=64&height=64&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
      
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const gctx = canvas.getContext('2d');
      const width = 60;
      const height = 30;
      canvas.width = width;
      canvas.height = height;
      gctx.drawImage(img, 0, 0, width, height);
      
      const imageData = gctx.getImageData(0, 0, width, height).data;
      const chars = " .:-=+*#%@";
      let ascii = "";
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 4;
          const r = imageData[offset];
          const g = imageData[offset + 1];
          const b = imageData[offset + 2];
          const avg = (r + g + b) / 3;
          const char = chars[Math.floor((avg / 255) * (chars.length - 1))];
          // Use colored spans for extra sexiness
          ascii += `<span style="color:rgb(${r},${g},${b})">${char}</span>`;
        }
        ascii += "\n";
      }

      ctx.appendHtml(`<pre style="font-size:0.45rem;line-height:1;font-family:var(--font-mono);background:#000;padding:10px;border-radius:4px;border:1px solid var(--border-color);margin:10px 0">${ascii}</pre>`);
      ctx.appendHtml(`<span class="output-success">✓ Art generated successfully.</span>`);
    } catch (err) {
      ctx.appendHtml(`<span class="output-error">Error dreaming: ${err.message}</span>`);
    }
  }
};

// ─── repo ───
commands.repo = {
  desc: "Open the source code repository",
  fn: (args, ctx) => {
    ctx.appendHtml('<span class="output-info">📦 Opening source code repository...</span>');
    ctx.appendHtml(`<span style="color:var(--text-secondary)">This portfolio is open source! Check it out at:</span>`);
    ctx.appendHtml(`<a href="${PORTFOLIO.github}" target="_blank" rel="noopener" style="color:var(--accent-cyan)">${PORTFOLIO.github}</a>`);
  }
};


// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function escapeHtml(text) {
  const el = document.createElement('div');
  el.textContent = text;
  return el.innerHTML;
}

function getFileColor(name) {
  if (name.endsWith('.md')) return 'var(--accent-purple)';
  if (name.endsWith('.json')) return 'var(--accent-yellow)';
  if (name.endsWith('.txt')) return 'var(--accent-green)';
  if (name.endsWith('.cfg')) return 'var(--accent-orange)';
  if (name.endsWith('.log')) return 'var(--accent-yellow)';
  if (name.endsWith('.pdf')) return 'var(--accent-magenta)';
  if (name.startsWith('.')) return 'var(--text-muted)';
  return 'var(--text-secondary)';
}

function highlightContent(content, ext) {
  let text = escapeHtml(content);
  if (ext === 'md') {
    // Basic markdown highlighting
    text = text.replace(/^(#{1,3})\s+(.+)$/gm, '<span style="color:var(--accent-cyan);font-weight:700">$1 $2</span>');
    text = text.replace(/\*\*(.+?)\*\*/g, '<span style="color:var(--accent-yellow);font-weight:600">$1</span>');
    text = text.replace(/^- (.+)$/gm, '<span style="color:var(--accent-green)">•</span> $1');
  } else if (ext === 'json') {
    text = text.replace(/"(\w+)":/g, '<span style="color:var(--accent-blue)">"$1"</span>:');
    text = text.replace(/: "(.+?)"/g, ': <span style="color:var(--accent-green)">"$1"</span>');
    text = text.replace(/: (\d+)/g, ': <span style="color:var(--accent-yellow)">$1</span>');
  } else if (ext === 'cfg') {
    text = text.replace(/^\[(.+)\]$/gm, '<span style="color:var(--accent-purple);font-weight:700">[$1]</span>');
    text = text.replace(/^(\w+)\s*=/gm, '<span style="color:var(--accent-blue)">$1</span> =');
  }
  return text;
}

function matchPattern(name, pattern) {
  const regex = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
  return new RegExp(regex, 'i').test(name);
}

// ──────────────────────────────────────────────
// EXPORTS
// ──────────────────────────────────────────────
export function getAutocompleteSuggestions(partial) {
  const allCmds = [...Object.keys(commands), ...Object.keys(aliases)];
  return allCmds.filter(c => c.startsWith(partial.toLowerCase()));
}

export function executeCommand(input, ctx) {
  const trimmed = input.trim();
  if (!trimmed) return;

  const parts = trimmed.split(/\s+/);
  let cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  // Check aliases first
  if (aliases[cmd]) {
    const aliasedParts = aliases[cmd].split(/\s+/);
    cmd = aliasedParts[0];
    const aliasArgs = [...aliasedParts.slice(1), args].join(' ').trim();
    if (commands[cmd]) {
      commands[cmd].fn(aliasArgs, ctx);
      // Update URL
      updateUrl(trimmed);
      return;
    }
  }

  if (commands[cmd]) {
    commands[cmd].fn(args, ctx);
    updateUrl(trimmed);
  } else {
    ctx.appendHtml(`<span class="output-error">Command not found: ${escapeHtml(cmd)}</span>`);
    ctx.appendHtml(`<span class="output-info">Type <span style="color:var(--accent-yellow)">help</span> to see available commands.</span>`);
  }
}

function updateUrl(command) {
  const url = new URL(window.location);
  url.searchParams.set('cmd', command);
  window.history.replaceState({}, '', url);
}

export function getCurrentPath() {
  return currentPath;
}

export default commands;
