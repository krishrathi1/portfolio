import { useState, useCallback, useEffect } from 'react';
import BootScreen from './components/BootScreen';
import Terminal from './components/Terminal';
import MatrixRain from './components/MatrixRain';

export default function App() {
  const [booted, setBooted] = useState(false);
  const [matrixVisible, setMatrixVisible] = useState(true);

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
      <MatrixRain visible={matrixVisible} />
      {!booted ? (
        <BootScreen onComplete={handleBootComplete} />
      ) : (
        <Terminal />
      )}
    </>
  );
}
