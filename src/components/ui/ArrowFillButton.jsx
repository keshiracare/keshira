import React from 'react';
import './ArrowFillButton.css';

/**
 * ArrowFillButton
 * Adapted from ObsidianUI's Arrow Fill Button for Keshira Ayurvedic Luxury branding.
 */
export default function ArrowFillButton({
  children = 'Shop Now',
  className = '',
  bgColor = 'var(--color-primary, #1f3d2b)',
  textColor = '#ffffff',
  fillBgColor = 'var(--color-accent-gold, #c8a261)',
  fillTextColor = '#1f3d2b',
  hoverFillBgColor,
  hoverFillTextColor,
  arrowColor,
  hoverArrowColor,
  as: Component = 'button',
  compact = false,
  onClick,
  style,
  ...props
}) {
  const customStyles = {
    '--btn-bg': bgColor,
    '--btn-text': textColor,
    '--btn-fill-bg': fillBgColor,
    '--btn-fill-text': fillTextColor,
    '--btn-fill-bg-hover': hoverFillBgColor || fillBgColor,
    '--btn-fill-text-hover': hoverFillTextColor || fillTextColor,
    '--btn-arrow': arrowColor || '#ffffff',
    '--btn-arrow-hover': hoverArrowColor || fillTextColor,
    ...style,
  };

  const arrowPath = (
    <svg
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="obsidian-arrow-fill-btn__icon"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 0L4.125 0.875L7.625 4.375L0 4.375L0 5.625Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <Component
      type={Component === 'button' ? 'button' : undefined}
      onClick={onClick}
      className={`obsidian-arrow-fill-btn ${compact ? 'obsidian-arrow-fill-btn--compact' : ''} ${className}`.trim()}
      style={customStyles}
      {...props}
    >
      <span className="obsidian-arrow-fill-btn__text">{children}</span>

      <div aria-hidden="true" className="obsidian-arrow-fill-btn__circle">
        <span className="obsidian-arrow-fill-btn__circle-text">{children}</span>
      </div>

      <div className="obsidian-arrow-fill-btn__icon-wrap" aria-hidden="true">
        {arrowPath}
        {arrowPath}
      </div>
    </Component>
  );
}
