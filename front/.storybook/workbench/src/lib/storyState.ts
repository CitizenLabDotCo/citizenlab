// A state on top of a variant: Primary and Disabled, Outlined and Hover.
// States are stories of their own (the Task 11 conventions): `Default`'s
// args plus a change, either args (`disabled`, `processing`, a long label)
// or a pseudo-state (`parameters.pseudo`, storybook-addon-pseudo-states).
// The layer is that change, read against `Default`, so the variant keeps
// its own style. A state with its own render (RTL) has no layer: it stays
// a story of its own.

export type StoryFacts = {
  initialArgs?: Record<string, unknown>;
  parameters?: { pseudo?: Record<string, unknown> };
  originalStoryFn?: unknown;
};

export type StateLayer = {
  args: Record<string, unknown>;
  // Classes the addon's rewritten styles answer to, set on the story root
  // (`pseudo-hover-all`: every element as if hovered).
  pseudo: string[];
};

export const NO_LAYER: StateLayer = { args: {}, pseudo: [] };

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// What `state` adds to `base` (the component's Default story), or null when
// it renders differently.
export const layerOf = (
  state: StoryFacts,
  base: StoryFacts
): StateLayer | null => {
  if (state.originalStoryFn !== base.originalStoryFn) return null;
  const from = base.initialArgs ?? {};
  const args: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(state.initialArgs ?? {})) {
    if (!same(v, from[k])) args[k] = v;
  }
  const pseudo = Object.entries(state.parameters?.pseudo ?? {})
    .filter(([k, v]) => k !== 'rootSelector' && !!v)
    .map(([k]) => `pseudo-${kebab(k)}-all`);
  return { args, pseudo };
};

// `components-actions-button--hover` -> `hover`, the hash's `state`.
export const stateKey = (storyId: string) => storyId.split('--').pop() ?? '';
