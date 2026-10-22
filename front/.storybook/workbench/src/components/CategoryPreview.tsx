import type { ComponentType, CSSProperties } from 'react';

// The picture on each Foundations card, drawn from the token values of the
// current mode (with the session's edits), so a card changes when a token
// does.
type Values = Record<string, string>;

const COLOUR_ROWS = [
  [
    'grey-800',
    'grey-700',
    'grey-600',
    'grey-500',
    'grey-400',
    'grey-300',
    'grey-200',
    'grey-100',
  ],
  [
    'blue-700',
    'blue-500',
    'blue-400',
    'cool-grey-600',
    'cool-grey-400',
    'cool-grey-300',
    'blue-10',
    'grey-50',
  ],
  [
    'teal-700',
    'teal-500',
    'teal-400',
    'teal-300',
    'teal-200',
    'teal-100',
    'teal-75',
    'teal-50',
  ],
  [
    'red-800',
    'red-500',
    'red-400',
    'orange-500',
    'amber-500',
    'green-500',
    'green-300',
    'green-100',
  ],
];

const SPACE_STEPS = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16'];
const RADIUS_STEPS = ['1', '2', '3', 'full'];
const FONT_STEPS = ['xs', 's', 'base', 'xl', 'xxxl', 'xxxxxl'];
const TEXT_STEPS: [string, string][] = [
  ['display', 'Display'],
  ['h2', 'Heading'],
  ['title', 'Title'],
  ['bodys', 'Body text for reading'],
  ['caption', 'Caption'],
];
const SHADOWS = ['shadow-menu', 'shadow-hover-lg', 'shadow'];

const px = (value: string | undefined, fallback: number) => {
  const n = parseFloat(value ?? '');
  return Number.isFinite(n) ? n : fallback;
};

const Colour = ({ v }: { v: Values }) => (
  <div className="wb-cp-colour">
    {COLOUR_ROWS.map((row) => (
      <div key={row[0]}>
        {row.map((n) => (
          <span key={n} style={{ background: v[`--gv-${n}`] }} />
        ))}
      </div>
    ))}
  </div>
);

const Space = ({ v }: { v: Values }) => (
  <div className="wb-cp-space">
    {SPACE_STEPS.map((s) => (
      <span
        key={s}
        style={{ height: Math.min(px(v[`--gv-space-${s}`], 0), 72) }}
      />
    ))}
  </div>
);

const Radius = ({ v }: { v: Values }) => (
  <div className="wb-cp-radius">
    {RADIUS_STEPS.map((s) => (
      <span key={s} style={{ borderRadius: v[`--gv-radius-${s}`] }} />
    ))}
  </div>
);

const Font = ({ v }: { v: Values }) => (
  <div
    className="wb-cp-font"
    style={{ fontFamily: `${v['--gv-font-family']}, sans-serif` }}
  >
    {FONT_STEPS.map((s) => (
      <span key={s} style={{ fontSize: v[`--gv-fs-${s}`] }}>
        Aa
      </span>
    ))}
  </div>
);

// Real weights and line heights, sizes at half scale so five roles fit.
const Text = ({ v }: { v: Values }) => (
  <div className="wb-cp-text">
    {TEXT_STEPS.map(([role, label]) => {
      const size = px(v[`--gv-type-${role}-size`], 16);
      return (
        <span
          key={role}
          style={{
            fontSize: Math.max(size * 0.6, 10),
            fontWeight: v[
              `--gv-type-${role}-weight`
            ] as CSSProperties['fontWeight'],
            letterSpacing: v[`--gv-type-${role}-ls`],
          }}
        >
          {label}
        </span>
      );
    })}
  </div>
);

const Shadow = ({ v }: { v: Values }) => (
  <div className="wb-cp-shadow">
    {SHADOWS.map((s) => (
      <span key={s} style={{ boxShadow: v[`--gv-${s}`] }} />
    ))}
  </div>
);

const Focus = ({ v }: { v: Values }) => (
  <div className="wb-cp-focus">
    <span
      style={{
        outline: `${v['--gv-focus-width']} solid ${v['--gv-focus-color']}`,
        outlineOffset: v['--gv-focus-offset'],
        boxShadow: v['--gv-focus-halo'],
      }}
    >
      Submit
    </span>
  </div>
);

const Motion = ({ v }: { v: Values }) => (
  <div
    className="wb-cp-motion"
    style={{ '--wb-cp-step': v['--gv-motion-base'] } as CSSProperties}
  >
    <span className="wb-cp-motion-track">
      <span className="wb-cp-motion-dot" />
    </span>
    <span className="wb-cp-motion-ticks">
      <span>{v['--gv-motion-fast']}</span>
      <span>{v['--gv-motion-base']}</span>
    </span>
  </div>
);

const Layers = () => (
  <div className="wb-cp-layers">
    <span />
    <span />
    <span />
  </div>
);

const PREVIEWS: Record<string, ComponentType<{ v: Values }>> = {
  color: Colour,
  space: Space,
  radius: Radius,
  font: Font,
  text: Text,
  shadow: Shadow,
  focus: Focus,
  motion: Motion,
  z: Layers,
};

const CategoryPreview = ({ id, values }: { id: string; values: Values }) => {
  const Draw = PREVIEWS[id];
  return (
    <div className={`wb-cp wb-cp-${id}-box`} aria-hidden="true">
      {Draw && <Draw v={values} />}
    </div>
  );
};

export default CategoryPreview;
