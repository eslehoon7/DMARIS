import React, { useRef, ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'bronze' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
  onClick?: () => void;
}

const glowColorMap = {
  blue: { base: '210 90% 60%', border: '210 90% 70%' },
  purple: { base: '270 80% 65%', border: '270 80% 75%' },
  green: { base: '140 70% 55%', border: '140 70% 65%' },
  red: { base: '0 80% 60%', border: '0 80% 70%' },
  orange: { base: '25 90% 60%', border: '25 90% 70%' },
  bronze: { base: '38 42% 63%', border: '38 55% 72%' },
  gold: { base: '43 65% 65%', border: '43 80% 75%' }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'bronze',
  size = 'md',
  width,
  height,
  customSize = true,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafId = useRef<number | null>(null);

  const colors = glowColorMap[glowColor] || glowColorMap.bronze;

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafId.current !== null) return;

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (!cardRef.current) return;
      if (!rectRef.current) {
        rectRef.current = cardRef.current.getBoundingClientRect();
      }
      const x = clientX - rectRef.current.left;
      const y = clientY - rectRef.current.top;

      cardRef.current.style.setProperty('--spotlight-x', `${x}px`);
      cardRef.current.style.setProperty('--spotlight-y', `${y}px`);
      cardRef.current.style.setProperty('--spotlight-opacity', '1');
    });
  };

  const handlePointerLeave = () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    if (!cardRef.current) return;
    rectRef.current = null;
    cardRef.current.style.setProperty('--spotlight-opacity', '0');
  };

  const getSizeClasses = () => {
    if (customSize) return '';
    return sizeMap[size];
  };

  const inlineStyles: React.CSSProperties & Record<string, string | number> = {
    '--spotlight-x': '-500px',
    '--spotlight-y': '-500px',
    '--spotlight-opacity': '0',
    '--glow-base': colors.base,
    '--glow-border': colors.border,
  };

  if (width !== undefined) {
    inlineStyles.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height !== undefined) {
    inlineStyles.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={inlineStyles}
      className={`
        spotlight-card
        ${getSizeClasses()}
        rounded-xl 
        relative 
        overflow-hidden
        transition-[transform,border-color,box-shadow]
        duration-200
        will-change-transform
        cursor-pointer
        ${className}
      `}
    >
      {/* Radial Spotlight Background Effect */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-75"
        style={{
          opacity: 'var(--spotlight-opacity)',
          background: `radial-gradient(280px circle at var(--spotlight-x) var(--spotlight-y), hsl(var(--glow-base) / 0.22), transparent 80%)`
        }}
      />

      {/* Radial Spotlight Border Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 rounded-xl transition-opacity duration-75"
        style={{
          opacity: 'var(--spotlight-opacity)',
          padding: '1.5px',
          background: `radial-gradient(200px circle at var(--spotlight-x) var(--spotlight-y), hsl(var(--glow-border) / 0.9), transparent 80%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {children}
    </div>
  );
};

export { GlowCard };
