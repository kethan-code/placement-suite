'use client';

import React, { useState, useRef } from 'react';
import './BorderGlow.css';

interface BorderGlowProps {
  children: React.ReactNode;
  glowColor?: string; // HSL value string e.g. "210 100% 60%"
  colors?: string[]; // Array of color hex values for dynamic gradient border
  className?: string;
}

export default function BorderGlow({
  children,
  glowColor = '210 100% 60%',
  colors = ['#38bdf8', '#818cf8', '#c084fc'],
  className = '',
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const gradientColors = colors.join(', ');

  return (
    <div
      ref={cardRef}
      className={`border-glow-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        {
          '--mouse-x': `${mousePos.x}%`,
          '--mouse-y': `${mousePos.y}%`,
          '--glow-color': glowColor,
          '--gradient-colors': gradientColors,
          '--glow-opacity': isHovered ? '1' : '0.45',
        } as React.CSSProperties
      }
    >
      <div className="border-glow-bg" />
      <div className="border-glow-border" />
      <div className="border-glow-content">{children}</div>
    </div>
  );
}
