import { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 16;
const INITIAL_SPEED = 150;

const DIRECTION = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

export default function SnakeGame({ onEnd }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: DIRECTION.RIGHT,
    nextDirection: DIRECTION.RIGHT,
    running: true,
    score: 0
  });

  const spawnFood = useCallback((snake) => {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(s => s.x === food.x && s.y === food.y));
    return food;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function draw() {
      const g = gameRef.current;
      const w = GRID_SIZE * CELL_SIZE;
      const h = GRID_SIZE * CELL_SIZE;

      // Background
      ctx.fillStyle = '#0d0800';
      ctx.fillRect(0, 0, w, h);

      // Grid lines (subtle)
      ctx.strokeStyle = 'rgba(255, 176, 0, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(w, i * CELL_SIZE);
        ctx.stroke();
      }

      // Food
      ctx.fillStyle = '#ff6600';
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 8;
      ctx.fillRect(g.food.x * CELL_SIZE + 2, g.food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

      // Snake
      ctx.shadowColor = '#ffb000';
      ctx.shadowBlur = 6;
      g.snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#ffcc00' : '#ffb000';
        ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      });
      ctx.shadowBlur = 0;

      // Score
      ctx.fillStyle = '#ffb000';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText(`Score: ${g.score}`, 4, h - 6);
    }

    function tick() {
      const g = gameRef.current;
      if (!g.running) return;

      g.direction = g.nextDirection;
      const head = {
        x: g.snake[0].x + g.direction.x,
        y: g.snake[0].y + g.direction.y
      };

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        g.running = false;
        onEnd(g.score);
        return;
      }

      // Self collision
      if (g.snake.some(s => s.x === head.x && s.y === head.y)) {
        g.running = false;
        onEnd(g.score);
        return;
      }

      g.snake.unshift(head);

      // Food check
      if (head.x === g.food.x && head.y === g.food.y) {
        g.score += 10;
        setScore(g.score);
        g.food = spawnFood(g.snake);
      } else {
        g.snake.pop();
      }

      draw();
    }

    draw();
    const interval = setInterval(tick, INITIAL_SPEED);

    const handleKey = (e) => {
      const g = gameRef.current;
      if (e.key === 'Escape') {
        g.running = false;
        onEnd(g.score);
        return;
      }
      if (e.key === 'ArrowUp' && g.direction !== DIRECTION.DOWN) g.nextDirection = DIRECTION.UP;
      if (e.key === 'ArrowDown' && g.direction !== DIRECTION.UP) g.nextDirection = DIRECTION.DOWN;
      if (e.key === 'ArrowLeft' && g.direction !== DIRECTION.RIGHT) g.nextDirection = DIRECTION.LEFT;
      if (e.key === 'ArrowRight' && g.direction !== DIRECTION.LEFT) g.nextDirection = DIRECTION.RIGHT;
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onEnd, spawnFood]);

  return (
    <div className="snake-game-container">
      <div className="snake-header">
        🐍 SNAKE — Score: {score} — ESC to quit
      </div>
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="snake-canvas"
      />
    </div>
  );
}
