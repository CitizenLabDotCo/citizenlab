import type { ReactNode } from 'react';

// Small line icons drawn for the shell (24 grid, stroke follows the text
// colour). Decorative: always aria-hidden next to a visible label.
const PATHS = {
  foundations: (
    <>
      <circle cx="8" cy="8" r="3.5" />
      <rect x="13" y="4.5" width="7" height="7" rx="1.5" />
      <path d="M4.5 19.5 8 13.5l3.5 6z" />
      <path d="M13 17h7M13 20h4" />
    </>
  ),
  components: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="3.5" />
    </>
  ),
  patterns: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="2" />
      <path d="M3.5 9h17M10 9v11" />
    </>
  ),
  pages: (
    <>
      <path d="M6 3.5h8l4.5 4.5v12a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z" />
      <path d="M13.5 3.5V8.5h5M8.5 13h7M8.5 16.5h5" />
    </>
  ),
  review: (
    <>
      <rect x="3" y="5" width="8" height="14" rx="1.5" />
      <rect x="13" y="5" width="8" height="14" rx="1.5" />
      <path d="M15.5 12.5l1.5 1.5 2.5-3" />
    </>
  ),
  proposal: (
    <>
      <circle cx="7" cy="6" r="2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
      <path d="M7 8v8M17 16v-5a3 3 0 0 0-3-3h-3m2-2.5L10.5 8l2.5 2.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  cross: <path d="M7 7l10 10M17 7 7 17" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />,
  reset: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 4.5v4h4" />
    </>
  ),
  single: <rect x="4" y="5" width="16" height="14" rx="2" />,
  split: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M12 5v14" />
    </>
  ),
  sliders: (
    <>
      <path d="M5 7h8m4 0h2M5 17h2m4 0h8" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  tokens: (
    <>
      <path d="M12 3.5c3 3.6 5.5 6.6 5.5 9.9a5.5 5.5 0 0 1-11 0c0-3.3 2.5-6.3 5.5-9.9z" />
      <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  usage: (
    <>
      <circle cx="6" cy="6" r="2.25" />
      <circle cx="18" cy="12" r="2.25" />
      <circle cx="6" cy="18" r="2.25" />
      <path d="M8.25 6.5 15.8 11M8.25 17.5l7.55-4.5" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
    </>
  ),
  external: (
    <>
      <path d="M13.5 4.5h6v6M19.5 4.5l-8 8" />
      <path d="M17.5 14v4.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1H10" />
    </>
  ),
  heal: (
    <>
      <path d="m14.5 4.5 5 5-10 10a3.5 3.5 0 0 1-5-5z" />
      <path d="M10 10.5l1 1M12.5 13l1 1M7.5 13l1 1M10 15.5l1 1" />
    </>
  ),
  route: (
    <>
      <circle cx="6.5" cy="18" r="2" />
      <circle cx="17.5" cy="6" r="2" />
      <path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  file: (
    <>
      <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z" />
      <path d="M13.5 3.5v4.5h4.5" />
    </>
  ),
  a11y: (
    <>
      <circle cx="12" cy="4.75" r="1.75" />
      <path d="M5 8.5c2.3.7 4.6 1 7 1s4.7-.3 7-1M12 9.5v4.5m0 0-3 6m3-6 3 6" />
    </>
  ),
  keyboard: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h.01M10.5 10h.01M14 10h.01M17.5 10h.01M8 14h8" />
    </>
  ),
  checklist: (
    <>
      <path d="m4 6.5 1.5 1.5L8 5.5M4 12.5 5.5 14 8 11.5M4.5 18h3" />
      <path d="M11 7h9M11 13h9M11 18h9" />
    </>
  ),
  question: (
    <>
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14" />
      <path d="M12 17.5h.01" />
    </>
  ),
  minus: <path d="M7 12h10" />,
  plus: <path d="M12 7v10M7 12h10" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  // The canvas tools: pick an element, or use the story.
  pointer: <path d="M6 4l12.5 7.2-5.6 1.4-2.9 5.4z" />,
  hand: (
    <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12m0-6.5V5a1.5 1.5 0 0 1 3 0v7m0-5.5a1.5 1.5 0 0 1 3 0V13m0-3.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.2a6 6 0 0 1-4.6-2.2L4.6 15a1.6 1.6 0 0 1 2.5-2L8 14" />
  ),
  // Select the parent layer.
  up: <path d="M12 19V6m-5 5 5-5 5 5" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </>
  ),
  sidebar: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M9.5 4.5v15" />
    </>
  ),
  moon: <path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z" />,
  monitor: (
    <>
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.5" />
      <path d="M9 20h6M12 16.5V20" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 3.5 19h17z" />
      <path d="M12 10v4M12 16.5h.01" />
    </>
  ),
  width: <path d="M4 12h16M7 9l-3 3 3 3M17 9l3 3-3 3" />,
  height: <path d="M12 4v16M9 7l3-3 3 3M9 17l3 3 3-3" />,
  padding: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1" />
    </>
  ),
  'padding-y': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8.5h8M8 15.5h8" />
    </>
  ),
  'padding-x': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8.5 8v8M15.5 8v8" />
    </>
  ),
  'padding-top': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8.5h8" />
    </>
  ),
  'padding-right': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M15.5 8v8" />
    </>
  ),
  'padding-bottom': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 15.5h8" />
    </>
  ),
  'padding-left': (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8.5 8v8" />
    </>
  ),
  gap: (
    <>
      <rect x="4" y="5" width="5" height="14" rx="1" />
      <rect x="15" y="5" width="5" height="14" rx="1" />
      <path d="M10.5 12h3" />
    </>
  ),
  'gap-row': (
    <>
      <rect x="5" y="4" width="14" height="5" rx="1" />
      <rect x="5" y="15" width="14" height="5" rx="1" />
      <path d="M12 10.5v3" />
    </>
  ),
  'gap-col': (
    <>
      <rect x="4" y="5" width="5" height="14" rx="1" />
      <rect x="15" y="5" width="5" height="14" rx="1" />
      <path d="M10.5 12h3" />
    </>
  ),
  radius: <path d="M5 19V11a6 6 0 0 1 6-6h8" />,
  fill: <path d="M12 3.5 6.5 9a7.8 7.8 0 1 0 11 0z" />,
  stroke: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </>
  ),
  'stroke-width': (
    <>
      <path d="M4 6.5h16" strokeWidth="1" />
      <path d="M4 12h16" strokeWidth="2" />
      <path d="M4 18h16" strokeWidth="3" />
    </>
  ),
  text: (
    <>
      <path d="M4 18 9.5 5l5.5 13M6 14h7" />
      <path d="M16 12.5a2.3 2.3 0 0 1 4 1.5v4m0-2.5h-2.2a1.6 1.6 0 0 0 0 3.2H20" />
    </>
  ),
  'font-size': (
    <>
      <path d="M3.5 18 8.5 6l5 12M5.3 14h6.4" />
      <path d="M15 18l2.5-7 2.5 7M16 15.8h3" />
    </>
  ),
  'font-weight': (
    <path
      d="M7 5h6.5a3.5 3.5 0 0 1 0 7H7zM7 12h7.5a3.5 3.5 0 0 1 0 7H7z"
      strokeWidth="2.2"
    />
  ),
  'line-height': (
    <path d="M4 5h16M4 19h16M12 8.5v7M9.5 11 12 8.5l2.5 2.5M9.5 13 12 15.5l2.5-2.5" />
  ),
  'letter-spacing': (
    <path d="M5 4v16M19 4v16M8 12h8M10 9.5 7.5 12l2.5 2.5M14 9.5l2.5 2.5-2.5 2.5" />
  ),
  shadow: (
    <>
      <rect x="4" y="4" width="13" height="13" rx="2" />
      <path d="M8 20h10a2 2 0 0 0 2-2V8" />
    </>
  ),
  detach: (
    <path d="M9.5 14.5 7 17a3 3 0 0 1-4.2-4.2l2.5-2.5M14.5 9.5 17 7a3 3 0 0 1 4.2 4.2l-2.5 2.5M5 5l14 14" />
  ),
  attach: (
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" />
  ),
  swap: <path d="M4 8h13m-4-4 4 4-4 4M20 16H7m4 4-4-4 4-4" />,
  layers: <path d="m12 4 8 4.5-8 4.5-8-4.5zM4 13l8 4.5 8-4.5" />,
  city: <path d="M4 20V9l5-3v14M9 20V11l6 3v6M15 20v-9l5-2v11M4 20h16" />,
  language: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16" />
    </>
  ),
  caution: <path d="M12 4 2.5 20h19zM12 10v4.5M12 17.2v.3" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

const Icon = ({ name, size = 20 }: { name: IconName; size?: number }) => (
  <svg
    className="wb-icon"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {PATHS[name]}
  </svg>
);

export default Icon;
