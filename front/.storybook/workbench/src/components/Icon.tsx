import type { ReactNode } from 'react';

// Small line icons drawn for the shell (24 grid, stroke follows the text
// colour). Decorative: always aria-hidden next to a visible label.
const PATHS = {
  start: (
    <>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
    </>
  ),
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
