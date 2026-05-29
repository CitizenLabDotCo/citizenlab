import React from 'react';

// One character in every Public Sans weight × style. snapdom's throwaway
// warmup capture targets this so every font face is exercised once before the
// real per-section loop. On a cold session, snapdom's first capture of a
// fresh weight races its own font fetch and rasterizes without glyphs —
// observed as bold rendering but regular missing.
const VARIANTS: Array<{ weight: number; style: 'normal' | 'italic' }> = [
  { weight: 300, style: 'normal' },
  { weight: 300, style: 'italic' },
  { weight: 400, style: 'normal' },
  { weight: 400, style: 'italic' },
  { weight: 500, style: 'normal' },
  { weight: 500, style: 'italic' },
  { weight: 600, style: 'normal' },
  { weight: 600, style: 'italic' },
  { weight: 700, style: 'normal' },
  { weight: 700, style: 'italic' },
];

const FontWarmup = () => (
  <div data-pdf-font-warmup="true">
    {VARIANTS.map(({ weight, style }) => (
      <span
        key={`${weight}-${style}`}
        style={{ fontWeight: weight, fontStyle: style }}
      >
        a
      </span>
    ))}
  </div>
);

export default FontWarmup;
