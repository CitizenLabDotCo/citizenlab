import { SerializedNodes } from '@craftjs/core';

import {
  BODY_NODE_ID,
  defaultCustomPageLayout,
  layoutHasBanner,
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

describe('normalizeCustomPageLayout header hoisting', () => {
  const headerNodes = () => ({
    ROOT: {
      ...defaultCustomPageLayout().ROOT,
      nodes: ['CUSTOM_PAGE_TITLE', 'CUSTOM_PAGE_BODY'],
    },
    CUSTOM_PAGE_TITLE: {
      type: { resolvedName: 'CustomPageTitle' },
      nodes: [],
      props: {},
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'CustomPageTitle',
      linkedNodes: {},
    },
    CUSTOM_PAGE_BODY: {
      ...defaultCustomPageLayout().CUSTOM_PAGE_BODY,
      nodes: ['txt', 'banner'],
    },
    txt: {
      type: { resolvedName: 'TextMultiloc' },
      nodes: [],
      props: {},
      custom: {},
      hidden: false,
      parent: 'CUSTOM_PAGE_BODY',
      isCanvas: false,
      displayName: 'TextMultiloc',
      linkedNodes: {},
    },
    banner: {
      type: { resolvedName: 'CustomPageBanner' },
      nodes: [],
      props: {},
      custom: {},
      hidden: false,
      parent: 'CUSTOM_PAGE_BODY',
      isCanvas: false,
      displayName: 'CustomPageBanner',
      linkedNodes: {},
    },
  });

  // CustomPageRoot refuses drops, so a banner from the toolbox lands in the body.
  it('hoists a banner dropped in the body to ROOT, above the title', () => {
    const result = normalizeCustomPageLayout(headerNodes());

    expect(result.ROOT.nodes).toEqual([
      'banner',
      'CUSTOM_PAGE_TITLE',
      'CUSTOM_PAGE_BODY',
    ]);
    expect(result.banner.parent).toBe('ROOT');
    expect(result.CUSTOM_PAGE_BODY.nodes).toEqual(['txt']);
  });

  it('puts a banner stored after the title back above it', () => {
    const nodes = headerNodes();
    nodes.ROOT.nodes = ['CUSTOM_PAGE_TITLE', 'banner', 'CUSTOM_PAGE_BODY'];
    nodes.CUSTOM_PAGE_BODY.nodes = ['txt'];
    nodes.banner.parent = 'ROOT';

    expect(normalizeCustomPageLayout(nodes).ROOT.nodes).toEqual([
      'banner',
      'CUSTOM_PAGE_TITLE',
      'CUSTOM_PAGE_BODY',
    ]);
  });
});

describe('layoutHasBanner', () => {
  it('is true only when the layout holds a banner widget', () => {
    expect(layoutHasBanner(defaultCustomPageLayout())).toBe(false);
    expect(layoutHasBanner(undefined)).toBe(false);
    expect(
      layoutHasBanner({
        ...defaultCustomPageLayout(),
        banner: {
          type: { resolvedName: 'CustomPageBanner' },
          nodes: [],
          props: {},
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'CustomPageBanner',
          linkedNodes: {},
        },
      })
    ).toBe(true);
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
