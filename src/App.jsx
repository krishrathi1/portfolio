import { useState, useCallback, useEffect, useRef } from 'react';
import BootScreen from './components/BootScreen';
import Terminal from './components/Terminal';
import MatrixRain from './components/MatrixRain';
import Starfield from './components/Starfield';

export default function App() {
  const [booted, setBooted] = useState(false);
  const [matrixVisible, setMatrixVisible] = useState(true);
  const [idleTime, setIdleTime] = useState(0);
  const [warpFactor, setWarpFactor] = useState(1);
  const videoRef = useRef(null);

  // Idle Timer
  useEffect(() => {
    const handleActivity = () => setIdleTime(0);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      setIdleTime(prev => prev + 1);
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, []);

  // Listen for warp command
  useEffect(() => {
    const handleWarp = (e) => setWarpFactor(e.detail.factor || 1);
    window.addEventListener('starfield-warp', handleWarp);
    return () => window.removeEventListener('starfield-warp', handleWarp);
  }, []);

  // Force video play
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log('Video autoplay blocked:', err));
    }
  }, []);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  // Listen for matrix toggle from Terminal
  useEffect(() => {
    const handler = (e) => {
      setMatrixVisible(e.detail.visible);
    };
    window.addEventListener('toggle-matrix', handler);
    return () => window.removeEventListener('toggle-matrix', handler);
  }, []);

  // Check if boot was already seen (skip on revisit)
  useEffect(() => {
    const seen = sessionStorage.getItem('boot-seen');
    if (seen) {
      setBooted(true);
    }
  }, []);

  useEffect(() => {
    if (booted) {
      sessionStorage.setItem('boot-seen', '1');
    }
  }, [booted]);

  // Execute command from URL on load
  useEffect(() => {
    if (booted) {
      const params = new URLSearchParams(window.location.search);
      const cmd = params.get('cmd');
      if (cmd) {
        // Dispatch to terminal after a brief delay so it's mounted
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('execute-url-command', { detail: { command: cmd } }));
        }, 500);
      }
    }
  }, [booted]);

  return (
    <>
      <Starfield visible={idleTime >= 60} speed={1} />
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -2,
          opacity: 0.3,
          filter: 'sepia(1) hue-rotate(-20deg) saturate(2.5) brightness(0.5) contrast(1.1)'
        }}
      >
        <source src="/hunt-showdown.mp4" type="video/mp4" />
      </video>
      <MatrixRain visible={matrixVisible} />
      {!booted ? (
        <BootScreen onComplete={handleBootComplete} />
      ) : (
        <Terminal />
      )}
    </>
  );
}
