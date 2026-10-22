import type { ReactNode } from 'react';

// Empty states of the sections that are not built yet: a picture made of
// shapes, what the section will hold, and a way back to what works now.
type Kind = 'components' | 'patterns' | 'pages' | 'review' | 'proposal';

const A = 'var(--wb-accent)';
const T = 'var(--gv-teal-200)';
const L = 'var(--gv-grey-200)';
const W = 'var(--gv-white)';
const S = 'var(--wb-border-strong)';

const Frame = ({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) => (
  <>
    <rect x={x} y={y} width={w} height={h} rx="10" fill={W} stroke={S} />
    <path d={`M${x} ${y + 18}h${w}`} stroke={S} />
    <circle cx={x + 10} cy={y + 9} r="2.5" fill={L} />
    <circle cx={x + 18} cy={y + 9} r="2.5" fill={L} />
  </>
);

const PICTURES: Record<Kind, ReactNode> = {
  components: (
    <>
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
    </>
  ),
  patterns: (
    <>
      <rect
        x="40"
        y="20"
        width="155"
        height="124"
        rx="12"
        fill={W}
        stroke={S}
      />
      <rect x="54" y="34" width="127" height="14" rx="4" fill={L} />
      <rect x="54" y="58" width="56" height="72" rx="8" fill={T} />
      <rect x="120" y="58" width="61" height="8" rx="4" fill={L} />
      <rect x="120" y="72" width="44" height="8" rx="4" fill={L} />
      <rect x="120" y="112" width="40" height="18" rx="9" fill={A} />
    </>
  ),
  pages: (
    <>
      <Frame x={36} y={18} w={164} h={128} />
      <rect x="48" y="48" width="140" height="34" rx="6" fill={T} />
      <rect x="48" y="92" width="64" height="40" rx="6" fill={L} />
      <rect x="124" y="92" width="64" height="40" rx="6" fill={L} />
      <rect x="60" y="60" width="50" height="10" rx="5" fill={A} />
    </>
  ),
  review: (
    <>
      <Frame x={24} y={28} w={88} h={108} />
      <Frame x={124} y={28} w={88} h={108} />
      <rect x="34" y="58" width="68" height="10" rx="2" fill={L} />
      <rect x="34" y="76" width="44" height="22" rx="2" fill={L} />
      <rect x="134" y="58" width="68" height="10" rx="5" fill={T} />
      <rect x="134" y="76" width="44" height="22" rx="8" fill={A} />
      <circle cx="118" cy="82" r="10" fill={W} stroke={S} />
      <path d="m114 82 3 3 5-6" stroke={A} strokeWidth="2" fill="none" />
    </>
  ),
  proposal: (
    <>
      <rect
        x="56"
        y="16"
        width="124"
        height="132"
        rx="12"
        fill={W}
        stroke={S}
      />
      <rect x="72" y="36" width="64" height="8" rx="4" fill={L} />
      <rect
        x="72"
        y="58"
        width="92"
        height="12"
        rx="3"
        fill="var(--gv-red-100)"
      />
      <rect
        x="72"
        y="74"
        width="92"
        height="12"
        rx="3"
        fill="var(--gv-green-100)"
      />
      <rect x="72" y="96" width="76" height="8" rx="4" fill={L} />
      <rect x="72" y="112" width="56" height="8" rx="4" fill={L} />
      <circle cx="176" cy="132" r="16" fill={A} />
      <path d="m169 132 5 5 9-10" stroke={W} strokeWidth="2.5" fill="none" />
    </>
  ),
};

const COPY: Record<Kind, { lead: string; items: string[] }> = {
  components: {
    lead: 'Every library component on a live canvas, in both modes.',
    items: [
      'Each story with its controls and states',
      'The tokens a component reads, and where it still uses fixed values',
      'Usage across the platform and accessibility results',
    ],
  },
  patterns: {
    lead: 'Compositions of components that pages repeat.',
    items: [
      'Forms, cards, lists and headers built from the library',
      'The same token edits applied across a whole pattern',
    ],
  },
  pages: {
    lead: 'The redesigned pages of the platform.',
    items: [
      'Each page in Today and Redesign',
      'How much of a page already runs on tokens',
    ],
  },
  review: {
    lead: 'Real pages before and after a change, side by side.',
    items: [
      'Screenshots of each page in both modes',
      'What a token edit moves, page by page',
    ],
  },
  proposal: {
    lead: 'Turn the edits of a session into a change to the token source.',
    items: [
      'A summary of every edit and what it touches',
      'The token source diff, ready to hand to a developer',
    ],
  },
};

type Props = { title: string; kind: Kind };

const Placeholder = ({ title, kind }: Props) => (
  <article className="wb-page">
    <header className="wb-page-head">
      <h1>{title}</h1>
      <p className="wb-lead">{COPY[kind].lead}</p>
    </header>
    <section className="wb-empty" aria-label="Coming in this build">
      <svg
        className="wb-empty-art"
        viewBox="0 0 236 164"
        width="236"
        height="164"
        aria-hidden="true"
        focusable="false"
      >
        {PICTURES[kind]}
      </svg>
      <div className="wb-empty-text">
        <span className="wb-badge wb-badge-soon">Coming in this build</span>
        <h2>What this section will show</h2>
        <ul className="wb-checklist">
          {COPY[kind].items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <a className="wb-button" href="#/foundations">
          Explore Foundations
        </a>
      </div>
    </section>
  </article>
);

export default Placeholder;
