import { SerializedNodes } from '@craftjs/core';

import {
  BODY_NODE_ID,
  defaultCustomPageLayout,
  normalizeCustomPageLayout,
} from './defaultLayout';

const textNode = (parent: string) =>
  ({
    type: { resolvedName: 'TextMultiloc' },
    nodes: [],
    props: { text: { en: '<p>Hi</p>' } },
    custom: {},
    hidden: false,
    parent,
    isCanvas: false,
    displayName: 'TextMultiloc',
    linkedNodes: {},
  } as unknown as SerializedNodes[string]);

const rootOnlyLayout = (): SerializedNodes => {
  const layout = defaultCustomPageLayout();
  delete layout[BODY_NODE_ID];
  layout.ROOT = { ...layout.ROOT, nodes: ['TXT'] };
  layout.TXT = textNode('ROOT');
  return layout;
};

describe('normalizeCustomPageLayout', () => {
  it('returns the default scaffold when there is no stored layout', () => {
    expect(normalizeCustomPageLayout(undefined)).toEqual(
      defaultCustomPageLayout()
    );
  });

  it('returns the default scaffold when the stored layout has no ROOT', () => {
    expect(normalizeCustomPageLayout({})).toEqual(defaultCustomPageLayout());
  });

  it('leaves a well-formed layout intact', () => {
    const nodes = {
      ...defaultCustomPageLayout(),
      TXT: textNode(BODY_NODE_ID),
    } as SerializedNodes;
    nodes[BODY_NODE_ID].nodes = ['TXT'];

    const result = normalizeCustomPageLayout(nodes);

    expect(result.ROOT.nodes).toEqual([BODY_NODE_ID]);
    expect(result[BODY_NODE_ID].nodes).toEqual(['TXT']);
    expect(result.TXT.parent).toBe(BODY_NODE_ID);
  });

  it('adopts ROOT children into a body when the layout has none', () => {
    const result = normalizeCustomPageLayout(rootOnlyLayout());

    expect(result.ROOT.nodes).toEqual([BODY_NODE_ID]);
    expect(result[BODY_NODE_ID].nodes).toEqual(['TXT']);
    expect(result.TXT.parent).toBe(BODY_NODE_ID);
  });

  // A ROOT that arrives without a children array must be repaired, not thrown on:
  // normalising exists precisely to survive a malformed stored graph.
  it('survives a ROOT with no children array', () => {
    const result = normalizeCustomPageLayout({
      ROOT: {},
    } as unknown as SerializedNodes);

    expect(result.ROOT.nodes).toEqual([BODY_NODE_ID]);
    expect(result[BODY_NODE_ID].nodes).toEqual([]);
  });

  it('re-parents a child that points somewhere other than the body', () => {
    const nodes = {
      ...defaultCustomPageLayout(),
      TXT: textNode('SOMEWHERE_ELSE'),
    } as SerializedNodes;
    nodes[BODY_NODE_ID].nodes = ['TXT'];

    expect(normalizeCustomPageLayout(nodes).TXT.parent).toBe(BODY_NODE_ID);
  });
});
