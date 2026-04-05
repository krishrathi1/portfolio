import { useEffect, useRef } from 'react';

export default function Starfield({ visible, speed = 1 }) {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animRef = useRef(null);
  const warpFactorRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const starCount = 400;
    
    function initStars() {
      const stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: Math.random() * 2000,
          size: Math.random() * 2
        });
      }
      starsRef.current = stars;
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      // Clear with slight trail
      ctx.fillStyle = 'rgba(10, 6, 0, 0.2)'; // Amber-ish black
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const stars = starsRef.current;

      const currentSpeed = speed * warpFactorRef.current;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        
        // Move star closer
        s.z -= 10 * currentSpeed;
        
        // Reset star if it passes the viewer
        if (s.z <= 0) {
          s.z = 2000;
          s.x = (Math.random() - 0.5) * 2000;
          s.y = (Math.random() - 0.5) * 2000;
        }

        // Project 3D coordinates to 2D
        const k = 128 / s.z;
        const px = s.x * k + centerX;
        const py = s.y * k + centerY;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - s.z / 2000) * 5 * s.size;
          ctx.fillStyle = warpFactorRef.current > 1 ? '#ffcc00' : '#ffd699'; // Amber glow
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add motion blur if warping
          if (warpFactorRef.current > 1) {
            ctx.strokeStyle = `rgba(255, 176, 0, ${0.1 * warpFactorRef.current})`;
            ctx.lineWidth = size;
            ctx.beginPath();
            ctx.moveTo(px, py);
            const prevK = 128 / (s.z + 20 * warpFactorRef.current);
            ctx.lineTo(s.x * prevK + centerX, s.y * prevK + centerY);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    initStars();
    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(draw);

    // Listen for warp command
    const handleWarp = (e) => {
      warpFactorRef.current = e.detail.factor || 1;
    };
    window.addEventListener('starfield-warp', handleWarp);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('starfield-warp', handleWarp);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [speed]);

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
        opacity: visible ? 1 : 0,
        zIndex: 50, // Above terminal when active
        transition: 'opacity 0.8s ease'
      }}
    />
  );
}
