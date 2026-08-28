import { SerializedNodes } from '@craftjs/core';

import {
  BODY_NODE_ID,
  defaultCustomPageLayout,
  layoutHasContent,
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

const titleNode = (parent: string) =>
  ({
    type: { resolvedName: 'CustomPageTitle' },
    nodes: [],
    props: {},
    custom: {},
    hidden: false,
    parent,
    isCanvas: false,
    displayName: 'CustomPageTitle',
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

  // Normalising exists to survive a malformed stored graph, not to throw on one.
  it('survives a ROOT with no children array', () => {
    const result = normalizeCustomPageLayout({
      ROOT: {},
    } as unknown as SerializedNodes);

    expect(result.ROOT.nodes).toEqual([BODY_NODE_ID]);
    expect(result[BODY_NODE_ID].nodes).toEqual([]);
  });

  // The banner and title slots will sit here; rebuilding ROOT from the body alone drops them.
  it('keeps a pinned sibling of the body on ROOT', () => {
    const nodes = {
      ...defaultCustomPageLayout(),
      BANNER: textNode('ROOT'),
    } as SerializedNodes;
    nodes.ROOT = { ...nodes.ROOT, nodes: ['BANNER', BODY_NODE_ID] };

    const result = normalizeCustomPageLayout(nodes);

    expect(result.ROOT.nodes).toEqual(['BANNER', BODY_NODE_ID]);
    expect(result.BANNER).toBeDefined();
  });

  // The toolbox is the only way back once the title is deleted, and CustomPageRoot refuses
  // drops — so without hoisting it would be stranded in the body wherever it landed.
  it('hoists a title dropped into the body back onto ROOT', () => {
    const nodes = {
      ...defaultCustomPageLayout(),
      TXT: textNode(BODY_NODE_ID),
      TITLE: titleNode(BODY_NODE_ID),
    } as SerializedNodes;
    nodes[BODY_NODE_ID].nodes = ['TXT', 'TITLE'];

    const result = normalizeCustomPageLayout(nodes);

    expect(result.ROOT.nodes).toEqual(['TITLE', BODY_NODE_ID]);
    expect(result.TITLE.parent).toBe('ROOT');
    expect(result[BODY_NODE_ID].nodes).toEqual(['TXT']);
  });

  it('leaves a title that is already on ROOT in place', () => {
    const nodes = {
      ...defaultCustomPageLayout(),
      TITLE: titleNode('ROOT'),
    } as SerializedNodes;
    nodes.ROOT = { ...nodes.ROOT, nodes: ['TITLE', BODY_NODE_ID] };

    const result = normalizeCustomPageLayout(nodes);

    expect(result.ROOT.nodes).toEqual(['TITLE', BODY_NODE_ID]);
  });

  // A page with a banner has no title node, and normalising must not invent one.
  it('does not create a title that was never there', () => {
    const result = normalizeCustomPageLayout(defaultCustomPageLayout());

    expect(result.ROOT.nodes).toEqual([BODY_NODE_ID]);
  });

  it('drops a ROOT child that has no node in the graph', () => {
    const nodes = { ...defaultCustomPageLayout() } as SerializedNodes;
    nodes.ROOT = { ...nodes.ROOT, nodes: ['GHOST', BODY_NODE_ID] };

    expect(normalizeCustomPageLayout(nodes).ROOT.nodes).toEqual([BODY_NODE_ID]);
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

describe('layoutHasContent', () => {
  it('is false for a layout that holds only the scaffold', () => {
    expect(layoutHasContent(defaultCustomPageLayout())).toBe(false);
  });

  it('is false when there is no layout', () => {
    expect(layoutHasContent(undefined)).toBe(false);
  });

  it('is true when the body region holds a widget', () => {
    const nodes = {
      ...defaultCustomPageLayout(),
      TXT: textNode(BODY_NODE_ID),
    } as SerializedNodes;
    nodes[BODY_NODE_ID].nodes = ['TXT'];

    expect(layoutHasContent(nodes)).toBe(true);
  });

  // A graph saved before the body region existed keeps its widgets on ROOT.
  it('is true when ROOT holds the widgets and there is no body', () => {
    expect(layoutHasContent(rootOnlyLayout())).toBe(true);
  });
});
