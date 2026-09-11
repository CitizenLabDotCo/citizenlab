import { SerializedNodes } from '@craftjs/core';

import {
  BODY_NODE_ID,
  defaultCustomPageLayout,
  layoutHasContent,
  layoutStartsWithBanner,
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

const titleNode = (showTitle: boolean) => ({
  type: { resolvedName: 'CustomPageTitle' },
  nodes: [],
  props: { showTitle },
  custom: {},
  hidden: false,
  parent: 'ROOT',
  isCanvas: false,
  displayName: 'CustomPageTitle',
  linkedNodes: {},
});

const bannerNode = () => ({
  type: { resolvedName: 'CustomPageBanner' },
  nodes: [],
  props: {},
  custom: {},
  hidden: false,
  parent: BODY_NODE_ID,
  isCanvas: false,
  displayName: 'CustomPageBanner',
  linkedNodes: {},
});

const pageWith = (showTitle: boolean, bodyIds: string[]) =>
  ({
    ROOT: {
      ...defaultCustomPageLayout().ROOT,
      nodes: ['CUSTOM_PAGE_TITLE', BODY_NODE_ID],
    },
    CUSTOM_PAGE_TITLE: titleNode(showTitle),
    [BODY_NODE_ID]: {
      ...defaultCustomPageLayout()[BODY_NODE_ID],
      nodes: bodyIds,
    },
    banner: bannerNode(),
    txt: textNode(BODY_NODE_ID),
  } as unknown as SerializedNodes);

describe('layoutStartsWithBanner', () => {
  it('is true when the title is hidden and the body opens with a banner', () => {
    expect(layoutStartsWithBanner(pageWith(false, ['banner', 'txt']))).toBe(
      true
    );
  });

  // A shown title renders above the body, so the banner is not what sits under the nav bar.
  it('is false when the title is shown', () => {
    expect(layoutStartsWithBanner(pageWith(true, ['banner', 'txt']))).toBe(
      false
    );
  });

  // An admin can move the banner anywhere, as on the homepage; only a leading one is flush.
  it('is false when the banner sits further down the body', () => {
    expect(layoutStartsWithBanner(pageWith(false, ['txt', 'banner']))).toBe(
      false
    );
  });

  it('is false without a banner or without a layout', () => {
    expect(layoutStartsWithBanner(pageWith(false, ['txt']))).toBe(false);
    expect(layoutStartsWithBanner(undefined)).toBe(false);
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
