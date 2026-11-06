import React from 'react';

/**
 * VubeeLogo — Inline SVG logo Vuebee
 * Palet warna:
 *   Rose Gold   #B98270
 *   Champagne   #D8B99A
 *   Dark Navy   #171B2C
 *   Soft Cream  #FAF5F1
 *
 * Props:
 *   height     — tinggi logo (default 38)
 *   variant    — 'default' | 'light' | 'dark'
 *                'light'  → semua teks & ornamen putih (untuk bg gelap/footer)
 *                'dark'   → semua teks Dark Navy (untuk bg terang)
 *   className  — class tambahan
 *   style      — style inline tambahan
 */
export const VubeeLogo = ({
  height = 38,
  variant = 'default',
  className = '',
  style = {},
  iconOnly = false
}) => {
  const textColor =
    variant === 'light' ? '#FAF5F1'
    : variant === 'dark' ? '#171B2C'
    : '#171B2C';

  const accentColor =
    variant === 'light' ? '#D8B99A'
    : '#B98270';

  const champagneColor =
    variant === 'light' ? '#FAF5F1'
    : '#D8B99A';

  /* 200 × 56 viewBox (full) / 52 × 52 viewBox (iconOnly) */
  if (iconOnly) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
        height={height}
        style={{ display: 'inline-block', flexShrink: 0, ...style }}
        className={className}
        aria-label="Vuebee Logo"
        role="img"
      >
        <g transform="translate(2, 2)">
          <rect
            x="0" y="0" width="48" height="48"
            rx="12"
            fill={variant === 'light' ? 'rgba(255,255,255,0.12)' : '#FAF5F1'}
          />
          <polyline
            points="10,13 24,37 38,13"
            fill="none"
            stroke={accentColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse
            cx="38" cy="11"
            rx="5" ry="3"
            transform="rotate(-30, 38, 11)"
            fill={champagneColor}
            opacity="0.85"
          />
          <line
            x1="38" y1="11" x2="34" y2="15"
            stroke={accentColor}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.7"
          />
          <rect
            x="36" y="30"
            width="6" height="11"
            rx="1.5"
            fill={accentColor}
            opacity="0.75"
          />
          <polygon
            points="36,30 42,30 39,25"
            fill={champagneColor}
            opacity="0.9"
          />
          <ellipse
            cx="12" cy="40"
            rx="6" ry="3.5"
            fill={champagneColor}
            opacity="0.8"
          />
          <rect
            x="6" y="36"
            width="12" height="4"
            rx="1"
            fill={champagneColor}
            opacity="0.6"
          />
          <line
            x1="6" y1="38" x2="18" y2="38"
            stroke={accentColor}
            strokeWidth="0.75"
            opacity="0.5"
          />
        </g>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 56"
      height={height}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      className={className}
      aria-label="Vuebee Logo"
      role="img"
    >
      {/* ── Icon Mark (left) ── */}
      {/* Hexagon / V-shape base */}
      <g transform="translate(4, 4)">
        {/* Outer soft-hex background */}
        <rect
          x="0" y="0" width="48" height="48"
          rx="12"
          fill={variant === 'light' ? 'rgba(255,255,255,0.12)' : '#FAF5F1'}
        />

        {/* V letterform – thick stroke, rose gold */}
        <polyline
          points="10,13 24,37 38,13"
          fill="none"
          stroke={accentColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Leaf ornament – top-right of V */}
        <ellipse
          cx="38" cy="11"
          rx="5" ry="3"
          transform="rotate(-30, 38, 11)"
          fill={champagneColor}
          opacity="0.85"
        />
        {/* Leaf vein */}
        <line
          x1="38" y1="11" x2="34" y2="15"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Lipstick silhouette – bottom-right, tiny */}
        <rect
          x="36" y="30"
          width="6" height="11"
          rx="1.5"
          fill={accentColor}
          opacity="0.75"
        />
        <polygon
          points="36,30 42,30 39,25"
          fill={champagneColor}
          opacity="0.9"
        />

        {/* Cream jar – bottom-left, tiny */}
        <ellipse
          cx="12" cy="40"
          rx="6" ry="3.5"
          fill={champagneColor}
          opacity="0.8"
        />
        <rect
          x="6" y="36"
          width="12" height="4"
          rx="1"
          fill={champagneColor}
          opacity="0.6"
        />
        <line
          x1="6" y1="38" x2="18" y2="38"
          stroke={accentColor}
          strokeWidth="0.75"
          opacity="0.5"
        />
      </g>

      {/* ── Wordmark ── */}
      {/* "Vuebee" */}
      <text
        x="62"
        y="28"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="700"
        fontSize="22"
        fill={textColor}
        dominantBaseline="middle"
      >
        Vuebee
      </text>

      {/* Tagline */}
      <text
        x="62"
        y="43"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="500"
        fontSize="8.5"
        fill={accentColor}
        dominantBaseline="middle"
        letterSpacing="0.12em"
      >
        SKINCARE &amp; MAKEUP
      </text>
    </svg>
  );
};

export default VubeeLogo;

