// ─── Portfolio Data ─── All your personal info in one place
export const PORTFOLIO = {
  name: "Krish Rathi",
  title: "Full-Stack Developer & AI Enthusiast",
  location: "India",
  email: "krish@example.com",
  github: "https://github.com/krishrathi",
  linkedin: "https://linkedin.com/in/krishrathi",
  twitter: "https://twitter.com/krishrathi",
  website: "https://krishrathi.dev",
  bio: [
    "Passionate developer with a keen interest in building innovative",
    "solutions at the intersection of AI, web development, and creative",
    "technology. I love turning complex problems into elegant, user-",
    "friendly experiences."
  ],
  about: {
    Name: "Krish Rathi",
    Role: "Full-Stack Developer & AI Enthusiast",
    Location: "India",
    Languages: "English, Hindi",
    Interests: "AI/ML, Web Dev, Open Source, Creative Coding",
    Editor: "VS Code + Neovim",
    OS: "Windows 11 / Ubuntu",
    Hobbies: "Music, Chess, Photography"
  },
  skills: {
    Languages: [
      { name: "JavaScript", level: 90 },
      { name: "Python", level: 88 },
      { name: "TypeScript", level: 82 },
      { name: "C++", level: 70 },
      { name: "Rust", level: 55 }
    ],
    Frontend: [
      { name: "React", level: 88 },
      { name: "Next.js", level: 82 },
      { name: "HTML/CSS", level: 92 },
      { name: "Three.js", level: 65 },
      { name: "Tailwind", level: 85 }
    ],
    Backend: [
      { name: "Node.js", level: 86 },
      { name: "Express", level: 84 },
      { name: "FastAPI", level: 78 },
      { name: "PostgreSQL", level: 75 },
      { name: "MongoDB", level: 72 }
    ],
    "AI/ML": [
      { name: "PyTorch", level: 76 },
      { name: "HuggingFace", level: 80 },
      { name: "LangChain", level: 74 },
      { name: "Fine-tuning", level: 78 },
      { name: "RAG Systems", level: 72 }
    ],
    DevOps: [
      { name: "Docker", level: 78 },
      { name: "Git", level: 90 },
      { name: "Linux", level: 82 },
      { name: "CI/CD", level: 70 },
      { name: "AWS", level: 65 }
    ]
  },
  projects: [
    {
      name: "Neural Prompt Optimizer",
      desc: "A 10-stage neural prompt optimization engine for Stable Diffusion with genetic evolution loops, context-aware negative prompt shielding, and CLIP-based scoring.",
      tech: ["Python", "PyTorch", "Stable Diffusion", "CLIP"],
      github: "#",
      live: "#"
    },
    {
      name: "LLaMA 3.2 Fine-Tuner",
      desc: "QLoRA/PEFT fine-tuning pipeline for LLaMA 3.2 with custom datasets, integrated RAG assistant, and comprehensive benchmarking suite.",
      tech: ["Python", "HuggingFace", "LoRA", "RAG"],
      github: "#",
      live: "#"
    },
    {
      name: "Crypto Trading Platform",
      desc: "Real-time cryptocurrency trading dashboard with interactive charts, global adoption heatmap, and portfolio analytics.",
      tech: ["React", "Next.js", "D3.js", "WebSocket"],
      github: "#",
      live: "#"
    },
    {
      name: "Terminal Portfolio",
      desc: "This very website! An interactive terminal-style portfolio built with React + Vite, featuring boot sequences, neofetch, and 20+ commands.",
      tech: ["React", "Vite", "CSS", "Love"],
      github: "#",
      live: "#"
    }
  ],
  education: [
    {
      degree: "Bachelor of Technology in Computer Science",
      school: "University Name",
      year: "2022 — 2026",
      details: "Focus on AI/ML, Data Structures, and Software Engineering"
    }
  ],
  experience: [
    {
      title: "Full-Stack Developer",
      company: "Freelance / Open Source",
      duration: "2023 — Present",
      desc: "Building web applications, AI-powered tools, and contributing to open-source projects."
    },
    {
      title: "AI/ML Researcher",
      company: "Personal Projects",
      duration: "2024 — Present",
      desc: "Fine-tuning LLMs, building RAG systems, and experimenting with generative AI pipelines."
    }
  ]
};

// ─── ASCII Art ───
export const BOOT_LOGO = `██╗  ██╗██████╗ ██╗███████╗██╗  ██╗
██║ ██╔╝██╔══██╗██║██╔════╝██║  ██║
█████╔╝ ██████╔╝██║███████╗███████║
██╔═██╗ ██╔══██╗██║╚════██║██╔══██║
██║  ██╗██║  ██║██║███████║██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝
██████╗  █████╗ ████████╗██╗  ██╗██╗
██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██║
██████╔╝███████║   ██║   ███████║██║
██╔══██╗██╔══██║   ██║   ██╔══██║██║
██║  ██║██║  ██║   ██║   ██║  ██║██║
╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝`;

export const SIDEBAR_ASCII = `    ╔══════════════╗
    ║   ▓▓▓▓▓▓▓   ║
    ║  ▓▓▓▓▓▓▓▓▓  ║
    ║ ▓▓  ▓▓  ▓▓▓ ║
    ║ ▓▓▓▓▓▓▓▓▓▓▓ ║
    ║  ▓▓ ▓▓▓ ▓▓  ║
    ║   ▓▓▓▓▓▓▓   ║
    ║    ▓▓▓▓▓▓   ║
    ╚══════════════╝`;

export const WELCOME_ASCII = `  ╦╔═╦═╗╦╔═╗╦ ╦  ╦═╗╔═╗╔╦╗╦ ╦╦
  ╠╩╗╠╦╝║╚═╗╠═╣  ╠╦╝╠═╣ ║ ╠═╣║
  ╩ ╩╩╚═╩╚═╝╩ ╩  ╩╚═╩ ╩ ╩ ╩ ╩╩`;

// ─── Boot Sequence ───
export const BOOT_MESSAGES = [
  { text: "BIOS Version 4.2.0 — KrishOS", type: "info" },
  { text: "Detecting hardware...", type: "info" },
  { text: "[  OK  ] CPU: Creative-Core i9 @ 4.2 GHz", type: "ok" },
  { text: "[  OK  ] RAM: 32GB DDR5 Imagination", type: "ok" },
  { text: "[  OK  ] GPU: RTX 5090 Neural Engine", type: "ok" },
  { text: "[  OK  ] Storage: ∞ TB Curiosity Drive", type: "ok" },
  { text: "Loading kernel modules...", type: "info" },
  { text: "[  OK  ] Loading module: creativity.ko", type: "ok" },
  { text: "[  OK  ] Loading module: problem-solving.ko", type: "ok" },
  { text: "[  OK  ] Loading module: coffee-dependency.ko", type: "ok" },
  { text: "[ WARN ] Coffee levels critically low", type: "warn" },
  { text: "[  OK  ] Loading module: full-stack.ko", type: "ok" },
  { text: "[  OK  ] Loading module: ai-ml-engine.ko", type: "ok" },
  { text: "Initializing network interfaces...", type: "info" },
  { text: "[  OK  ] Connected to the internet", type: "ok" },
  { text: "[  OK  ] GitHub sync established", type: "ok" },
  { text: "Starting portfolio services...", type: "info" },
  { text: "[  OK  ] Terminal emulator ready", type: "ok" },
  { text: "[  OK  ] Portfolio data loaded", type: "ok" },
  { text: "[  OK  ] All systems operational", type: "ok" },
  { text: "", type: "info" },
  { text: "System boot complete. Welcome, visitor!", type: "ok" }
];

// ─── Fun Quotes ───
export const FORTUNES = [
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Fix the cause, not the symptom.", author: "Steve Maguire" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "It's not a bug — it's an undocumented feature.", author: "Anonymous" },
  { text: "In order to be irreplaceable, one must always be different.", author: "Coco Chanel" }
];

// ─── Themes ───
export const THEMES = {
  'amber': {
    '--bg-primary': '#0a0600',
    '--bg-secondary': '#0d0800',
    '--bg-tertiary': '#1a1000',
    '--text-primary': '#ffd699',
    '--text-secondary': '#ffb000',
    '--text-muted': '#b37b00',
    '--accent-cyan': '#ffc44d',
    '--accent-blue': '#ffaa00',
    '--accent-purple': '#e69900',
    '--accent-green': '#ffb000',
    '--accent-yellow': '#ffcc00'
  },
  'green-phosphor': {
    '--bg-primary': '#000800',
    '--bg-secondary': '#001a00',
    '--bg-tertiary': '#002b00',
    '--text-primary': '#88ff88',
    '--text-secondary': '#00ff00',
    '--text-muted': '#008800',
    '--accent-cyan': '#00ffaa',
    '--accent-blue': '#00cc00',
    '--accent-purple': '#44ff44',
    '--accent-green': '#00ff00',
    '--accent-yellow': '#aaff00'
  },
  'cherry': {
    '--bg-primary': '#1a0000',
    '--bg-secondary': '#2b0000',
    '--bg-tertiary': '#400000',
    '--text-primary': '#ffb3b3',
    '--text-secondary': '#ff4d4d',
    '--text-muted': '#990000',
    '--accent-cyan': '#ff8080',
    '--accent-blue': '#ff3333',
    '--accent-purple': '#ff6666',
    '--accent-green': '#ff4d4d',
    '--accent-yellow': '#ff9999'
  },
  'ocean': {
    '--bg-primary': '#00081a',
    '--bg-secondary': '#001433',
    '--bg-tertiary': '#00224d',
    '--text-primary': '#add8e6',
    '--text-secondary': '#00bfff',
    '--text-muted': '#0059b3',
    '--accent-cyan': '#00ffff',
    '--accent-blue': '#0080ff',
    '--accent-purple': '#80bfff',
    '--accent-green': '#00bfff',
    '--accent-yellow': '#66ccff'
  }
};

// ─── Weather options ───
export const WEATHER_CONDITIONS = [
  { emoji: "☀️", desc: "Sunny and productive! Perfect coding weather.", temp: "28°C" },
  { emoji: "🌤️", desc: "Partly cloudy with a chance of breakthroughs.", temp: "24°C" },
  { emoji: "⛈️", desc: "Thunderstorm of ideas incoming!", temp: "22°C" },
  { emoji: "🌙", desc: "Late night coding session vibes.", temp: "18°C" },
  { emoji: "🌈", desc: "Rainbow after debugging. All green!", temp: "26°C" }
];

// ─── Sudo Responses ───
export const SUDO_RESPONSES = [
  "Nice try! But this terminal doesn't do sudo 🙃",
  "Permission denied: You're not Krish. But you can still explore!",
  "sudo: krish is already the superuser here 😎",
  "Error: sudo requires a mass deployment of coffee. Try 'fortune' instead.",
  "ACCESS DENIED. Just kidding — type 'help' to see what you CAN do!",
  "🔐 Root access removed for security. Try 'about' to learn more!"
];
