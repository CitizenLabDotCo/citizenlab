import type { TokenMeta } from './data';

// The colour tokens in groups a person looks things up by: one per palette
// ramp (greys, blue, teal...), then the roles by where they are used.
export type ColourGroup = {
  id: string;
  label: string;
  tokens: TokenMeta[];
};

const RAMP_LABEL: Record<string, string> = {
  grey: 'Neutrals',
  'cool-grey': 'Cool grey',
  blue: 'Blue',
  teal: 'Teal',
  red: 'Red',
  green: 'Green',
  orange: 'Orange',
  amber: 'Amber',
};

const ROLE_GROUPS: { id: string; label: string; test: RegExp }[] = [
  { id: 'text', label: 'Text', test: /^--gv-(color-)?(text|header-text)/ },
  { id: 'tenant', label: 'City colours', test: /^--gv-(color-)?tenant/ },
  { id: 'bo', label: 'Back office', test: /^--gv-(color-)?bo-/ },
  { id: 'chart', label: 'Charts', test: /^--gv-chart-/ },
];

// The ramp a palette token belongs to: --gv-cool-grey-600 is cool-grey,
// black and white sit with the greys.
export const rampOf = (name: string): string | undefined => {
  if (name === '--gv-black' || name === '--gv-white') return 'grey';
  const m = /^--gv-([a-z]+(?:-grey)?)-(\d+|mint)$/.exec(name);
  return m && RAMP_LABEL[m[1]] ? m[1] : undefined;
};

// The last part of a token name, as a swatch caption (800, mint, primary).
export const stepOf = (name: string) =>
  rampOf(name) && !/^--gv-(black|white)$/.test(name)
    ? name.replace(/^.*-/, '')
    : name.replace(/^--gv-(color-)?/, '');

export const colourGroups = (tokens: TokenMeta[]): ColourGroup[] => {
  const groups = new Map<string, ColourGroup>();
  const add = (id: string, label: string, t: TokenMeta) => {
    const g = groups.get(id) ?? { id, label, tokens: [] };
    g.tokens.push(t);
    groups.set(id, g);
  };
  const roles: TokenMeta[] = [];
  tokens.forEach((t) => {
    const ramp = rampOf(t.name);
    if (ramp) add(ramp, RAMP_LABEL[ramp], t);
    else roles.push(t);
  });
  roles.forEach((t) => {
    const role = ROLE_GROUPS.find((r) => r.test.test(t.name));
    if (role) add(role.id, role.label, t);
    else add('roles', 'States and surfaces', t);
  });
  // Ramps first in token order, then the role groups in a fixed order.
  const order = [
    ...Object.keys(RAMP_LABEL),
    'roles',
    ...ROLE_GROUPS.map((r) => r.id),
  ];
  return order.flatMap((id) => groups.get(id) ?? []);
};
