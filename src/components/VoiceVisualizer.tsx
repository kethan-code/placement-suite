'use client';
import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  analyser: AnalyserNode | null;
  isListening: boolean;
  color?: string;
  barCount?: number;
  width?: number;
  height?: number;
  theme?: 'purple' | 'blue' | 'orange';
  className?: string;
}

export default function VoiceVisualizer({
  analyser,
  isListening,
  color,
  barCount = 24,
  width = 115,
  height = 20,
  theme = 'purple',
  className = ''
}: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const smoothedLevelRef = useRef<number>(0);
  const barHeightsRef = useRef<Float32Array>(new Float32Array(barCount));

  // Determine active accent color
  const activeColor =
    color ||
    (theme === 'blue'
      ? '#2563eb'
      : theme === 'orange'
        ? '#f59e0b'
        : '#7c3aed');

  const badgeThemeClasses =
    theme === 'blue'
      ? 'bg-blue-50/70 border-blue-200/60'
      : theme === 'orange'
        ? 'bg-amber-50/70 border-amber-200/60'
        : 'bg-purple-50/60 border-purple-200/50';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI screen support for pixel-perfect rounded bars
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Detect user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    const barWidth = 2.5;
    const spacing = (width - barCount * barWidth) / (barCount - 1);
    const minHeight = 3.5;
    const maxHeight = height - 2;

    let startTime = performance.now();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      let rawLevel = 0;
      if (analyser && dataArray && isListening) {
        analyser.getByteFrequencyData(dataArray);

        // Sample speech-dominant frequency bins (~100Hz to 3000Hz)
        const relevantBins = Math.min(dataArray.length, 36);
        let sum = 0;
        let count = 0;
        for (let i = 2; i < relevantBins; i++) {
          sum += dataArray[i];
          count++;
        }
        const avg = count > 0 ? sum / count : 0;
        // Normalize with noise gate
        rawLevel = Math.max(0, (avg - 12) / 160);
        rawLevel = Math.min(1.0, Math.pow(rawLevel, 1.2) * 1.5);
      }

      // Smooth attack and decay interpolation
      const attackSpeed = 0.35;
      const decaySpeed = 0.12;
      const targetLevel = isListening ? rawLevel : 0;

      if (targetLevel > smoothedLevelRef.current) {
        smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * attackSpeed;
      } else {
        smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * decaySpeed;
      }

      const currentSpeechLevel = smoothedLevelRef.current;
      const elapsed = (performance.now() - startTime) / 1000;

      ctx.fillStyle = activeColor;

      for (let i = 0; i < barCount; i++) {
        // Bell-curve envelope (center bars react stronger, edge bars stay smaller)
        const normalizedPos = (i - (barCount - 1) / 2) / ((barCount - 1) / 2); // -1 to 1
        const bellCurve = Math.max(0.35, 1 - Math.pow(normalizedPos, 2) * 0.65);

        // Conversational harmonic oscillations for organic ChatGPT feel
        let organicMotion = 1.0;
        if (!prefersReducedMotion) {
          const wave1 = Math.sin(elapsed * 4.2 + i * 0.45);
          const wave2 = Math.cos(elapsed * 2.8 - i * 0.35);
          organicMotion = 0.65 + 0.2 * wave1 + 0.15 * wave2;
        }

        let targetH = minHeight;

        if (isListening) {
          if (currentSpeechLevel > 0.03) {
            // Active speech response
            let binVal = 0;
            if (dataArray && analyser) {
              const binIdx = Math.floor(2 + (i / barCount) * 20);
              binVal = (dataArray[binIdx] || 0) / 255;
            }

            const dynamicBoost = currentSpeechLevel * 0.75 + binVal * 0.25;
            const reactiveHeight = (maxHeight - minHeight) * dynamicBoost * bellCurve * organicMotion;
            targetH = minHeight + Math.min(maxHeight - minHeight, reactiveHeight);
          } else {
            // Idle calm conversational breathing when candidate is silent
            const subtleBreath = prefersReducedMotion
              ? 0.5
              : Math.sin(elapsed * 2.2 + i * 0.3) * 0.5 + 0.5;
            targetH = minHeight + subtleBreath * 1.5 * bellCurve;
          }
        } else {
          // Dormant/frozen when recording is stopped
          targetH = minHeight;
        }

        // Smooth interpolation per bar to prevent harsh jumps
        const currentH = barHeightsRef.current[i];
        const newH = currentH + (targetH - currentH) * 0.28;
        barHeightsRef.current[i] = newH;

        // Draw pill capsule bar vertically centered
        const x = i * (barWidth + spacing);
        const y = (height - newH) / 2;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, newH, barWidth / 2);
        } else {
          // Fallback for older canvas engines
          const radius = barWidth / 2;
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + barWidth - radius, y);
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
          ctx.lineTo(x + barWidth, y + newH - radius);
          ctx.quadraticCurveTo(x + barWidth, y + newH, x + barWidth - radius, y + newH);
          ctx.lineTo(x + radius, y + newH);
          ctx.quadraticCurveTo(x, y + newH, x, y + newH - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
        }
        ctx.fill();
      }

      if (isListening) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    if (isListening) {
      animFrameRef.current = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [analyser, isListening, activeColor, barCount, width, height]);

  return (
    <div
      className={`inline-flex items-center justify-center h-6 px-1.5 py-0.5 rounded-lg border select-none transition-colors ${badgeThemeClasses} ${className}`}
      title="Live Voice Activity"
      style={{ minWidth: `${width + 12}px` }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="block"
      />
    </div>
  );
}
