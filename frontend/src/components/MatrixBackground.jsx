import React, { useEffect, useRef, useCallback } from 'react';

const MatrixBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Characters - mix of symbols and letters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>[]{}|/\\=+-*&^%$#@!?';
    
    const fontSize = 14;
    
    // Initialize static grid of characters
    if (!canvas.grid) {
      const cols = Math.ceil(width / fontSize) + 1;
      const rows = Math.ceil(height / fontSize) + 1;
      canvas.grid = [];
      canvas.gridAlpha = [];
      canvas.gridTarget = [];
      canvas.gridDirection = []; // For vertical movement
      
      for (let row = 0; row < rows; row++) {
        canvas.grid[row] = [];
        canvas.gridAlpha[row] = [];
        canvas.gridTarget[row] = [];
        canvas.gridDirection[row] = [];
        for (let col = 0; col < cols; col++) {
          canvas.grid[row][col] = chars[Math.floor(Math.random() * chars.length)];
          canvas.gridAlpha[row][col] = Math.random() * 0.25;
          canvas.gridTarget[row][col] = Math.random() * 0.3;
          canvas.gridDirection[row][col] = Math.random() > 0.5 ? 0.002 : -0.002;
        }
      }
      canvas.cols = cols;
      canvas.rows = rows;
    }

    // Clear with dark background
    ctx.fillStyle = '#0a1414';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px "JetBrains Mono", "Fira Code", monospace`;

    // Draw grid of characters
    for (let row = 0; row < canvas.rows; row++) {
      for (let col = 0; col < canvas.cols; col++) {
        const x = col * fontSize;
        const y = row * fontSize;
        const alpha = canvas.gridAlpha[row][col];
        
        // Subtle green color
        ctx.fillStyle = `rgba(40, 160, 100, ${alpha})`;
        ctx.fillText(canvas.grid[row][col], x, y);

        // Smoothly animate alpha toward target
        const diff = canvas.gridTarget[row][col] - alpha;
        canvas.gridAlpha[row][col] += diff * 0.02;

        // When close to target, pick new target
        if (Math.abs(diff) < 0.01) {
          canvas.gridTarget[row][col] = Math.random() * 0.35;
          // Occasionally change character
          if (Math.random() > 0.7) {
            canvas.grid[row][col] = chars[Math.floor(Math.random() * chars.length)];
          }
        }
      }
    }

    animationRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.grid = null;
      
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a1414';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: '#0a1414'
      }}
    />
  );
};

export default MatrixBackground;
