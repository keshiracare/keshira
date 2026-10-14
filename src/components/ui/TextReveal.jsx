import React from 'react';
import './TextReveal.css';

/**
 * TextReveal
 * Adapted from ObsidianUI's Rectangular Text Reveal for elegant editorial reveals.
 */
export default function TextReveal({
  children,
  as: Component = 'span',
  delay = 0,
  className = '',
  wrapperClassName = '',
  style,
  ...props
}) {
  return (
    <span className={`obsidian-text-reveal-wrapper ${wrapperClassName}`.trim()}>
      <Component
        className={`obsidian-text-reveal ${className}`.trim()}
        style={{
          animationDelay: `${delay}ms`,
          ...style,
        }}
        {...props}
      >
        {children}
      </Component>
    </span>
  );
}
