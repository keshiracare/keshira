import React, { useRef, useState, useEffect, useCallback } from 'react';
import './DraggableMarquee.css';

/**
 * DraggableMarquee
 * Inspired by ObsidianUI's Draggable Marquee.
 * Supports smooth continuous auto-scroll and drag/swipe physics with mouse and touch.
 */
export default function DraggableMarquee({
  children,
  speed = 0.75, // pixels per frame
  className = '',
  pauseOnHover = true
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const prevXRef = useRef(0);
  const velocityRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const animFrameRef = useRef(null);

  const getHalfWidth = useCallback(() => {
    if (!trackRef.current) return 0;
    return trackRef.current.scrollWidth / 2;
  }, []);

  const animate = useCallback(() => {
    const halfWidth = getHalfWidth();

    if (!isDraggingRef.current && halfWidth > 0) {
      if (Math.abs(velocityRef.current) > 0.05) {
        offsetRef.current += velocityRef.current;
        velocityRef.current *= 0.94; // friction
      } else if (!isHovered || !pauseOnHover) {
        offsetRef.current -= speed;
      }

      // Infinite loop wrap
      if (offsetRef.current <= -halfWidth) {
        offsetRef.current += halfWidth;
      } else if (offsetRef.current > 0) {
        offsetRef.current -= halfWidth;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, [getHalfWidth, isHovered, pauseOnHover, speed]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [animate]);

  // Mouse / Touch handlers
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    startXRef.current = clientX;
    prevXRef.current = clientX;
    velocityRef.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const delta = clientX - prevXRef.current;
    prevXRef.current = clientX;
    offsetRef.current += delta;
    velocityRef.current = delta;

    const halfWidth = getHalfWidth();
    if (halfWidth > 0) {
      if (offsetRef.current <= -halfWidth) offsetRef.current += halfWidth;
      else if (offsetRef.current > 0) offsetRef.current -= halfWidth;
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`obsidian-marquee-viewport ${className}`.trim()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        isDraggingRef.current = false;
      }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      <div ref={trackRef} className="obsidian-marquee-track">
        <div className="obsidian-marquee-list">{children}</div>
        <div className="obsidian-marquee-list" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
