'use client';

import React, { useState, useRef } from 'react';
import './DepthText.css';

interface DepthTextProps {
  text: string;
  faceColor?: string;
  depthColor?: string;
  layers?: number;
  fontSize?: string;
  className?: string;
}

export default function DepthText({
  text,
  faceColor = '#ffffff',
  depthColor = '#52525b',
  layers = 20,
  fontSize = 'clamp(4rem, 10vw, 8rem)',
  className = '',
}: DepthTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({
      x: -(y / rect.height) * 25,
      y: (x / rect.width) * 25,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const layerElements = Array.from({ length: layers }, (_, i) => {
    const depthRatio = (i + 1) / layers;
    const offset = i + 1;
    return (
      <span
        key={i}
        className="depth-text-layer"
        style={{
          transform: `translateZ(${-offset * 2}px)`,
          color: depthColor,
          opacity: 1 - depthRatio * 0.35,
        }}
      >
        {text}
      </span>
    );
  });

  return (
    <div
      ref={containerRef}
      className={`depth-text-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ fontSize }}
    >
      <div
        className="depth-text-wrapper"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        <span
          className="depth-text-face"
          style={{ color: faceColor, transform: 'translateZ(0px)' }}
        >
          {text}
        </span>
        {layerElements}
      </div>
    </div>
  );
}
