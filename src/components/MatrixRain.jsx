import { useEffect, useRef } from 'react';

export default function MatrixRain({ visible }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const dropsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
    const fontSize = 14;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columns = Math.floor(canvas.width / fontSize);
      dropsRef.current = new Array(columns).fill(1);
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      // Get current theme colors dynamically
      const computed = getComputedStyle(document.body);
      const bgColor = computed.getPropertyValue('--bg-primary').trim() || '#0a0600';
      const textColor = computed.getPropertyValue('--accent-yellow').trim() || '#ffcc00';

      ctx.fillStyle = bgColor;
      ctx.globalAlpha = 0.05; // Fade effect instead of fixed rgba
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
      
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px monospace`;

      const drops = dropsRef.current;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: visible ? 0.06 : 0,
        zIndex: -1,
        transition: 'opacity 0.5s ease'
      }}
    />
  );
}
