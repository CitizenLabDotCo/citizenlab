// The picture for an empty gallery, made of shapes.
const A = 'var(--wb-accent)';
const T = 'var(--gv-teal-200)';
const L = 'var(--gv-grey-200)';
const W = 'var(--gv-white)';
const S = 'var(--wb-border-strong)';

export const PlaceholderArt = () => (
  <svg
    className="wb-empty-art"
    viewBox="0 0 236 164"
    width="236"
    height="164"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="40" y="20" width="70" height="56" rx="10" fill={W} stroke={S} />
    <rect x="54" y="40" width="42" height="16" rx="8" fill={A} />
    <rect x="125" y="20" width="70" height="56" rx="10" fill={W} stroke={S} />
    <rect x="139" y="38" width="20" height="20" rx="4" fill={T} />
    <rect x="164" y="44" width="18" height="8" rx="4" fill={L} />
    <rect x="40" y="88" width="70" height="56" rx="10" fill={W} stroke={S} />
    <rect x="54" y="108" width="30" height="16" rx="8" fill={L} />
    <circle cx="96" cy="116" r="6" fill={A} />
    <rect x="125" y="88" width="70" height="56" rx="10" fill={W} stroke={S} />
    <rect x="139" y="104" width="42" height="6" rx="3" fill={L} />
    <rect x="139" y="116" width="30" height="6" rx="3" fill={L} />
  </svg>
);
