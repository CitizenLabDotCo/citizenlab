import { SerializedNodes, SerializedNode } from '@craftjs/core';

import {
  normalizeProjectPageLayout,
  defaultProjectPageLayout,
  BANNER_NODE_ID,
  TITLE_NODE_ID,
  BODY_NODE_ID,
  PHASES_NODE_ID,
  EVENTS_NODE_ID,
} from './defaultLayout';
import widgetMessages from './Widgets/messages';

const DESCRIPTION_NODE_ID = 'PROJECT_PAGE_DESCRIPTION';

const textNode = (parent: string) =>
  ({
    type: { resolvedName: 'TextMultiloc' },
    nodes: [],
    props: { text: { en: '<p>Hello</p>' } },
    custom: {},
    hidden: false,
    parent,
    isCanvas: false,
    displayName: 'TextMultiloc',
    linkedNodes: {},
  } as unknown as SerializedNodes[string]);

// A layout in the unlocked (flat) shape, with description content directly in
// the body.
const flatLayout = (): SerializedNodes => {
  const layout = defaultProjectPageLayout();
  layout[BODY_NODE_ID] = {
    ...layout[BODY_NODE_ID],
    nodes: ['txt1', PHASES_NODE_ID, EVENTS_NODE_ID],
  };
  layout.txt1 = textNode(BODY_NODE_ID);
  return layout;
};

// A layout in the transitional locked shape: the description content wrapped
// in the (since removed) locked description section.
const legacyLayout = (): SerializedNodes => {
  const layout = defaultProjectPageLayout();
  layout[BODY_NODE_ID] = {
    ...layout[BODY_NODE_ID],
    nodes: [DESCRIPTION_NODE_ID, PHASES_NODE_ID, EVENTS_NODE_ID],
  };
  layout[DESCRIPTION_NODE_ID] = {
    type: { resolvedName: 'ProjectDescriptionSection' },
    nodes: ['d_txt1'],
    props: {},
    custom: { title: { id: 'x', defaultMessage: 'Description' }, locked: true },
    hidden: false,
    parent: BODY_NODE_ID,
    isCanvas: true,
    displayName: 'ProjectDescriptionSection',
    linkedNodes: {},
  } as unknown as SerializedNode;
  layout.d_txt1 = textNode(DESCRIPTION_NODE_ID);
  return layout;
};

describe('defaultProjectPageLayout', () => {
  it('places phases and events directly in the body', () => {
    const layout = defaultProjectPageLayout();

    expect(layout.ROOT.nodes).toEqual([
      BANNER_NODE_ID,
      TITLE_NODE_ID,
      BODY_NODE_ID,
    ]);
    expect(layout[BODY_NODE_ID].nodes).toEqual([
      PHASES_NODE_ID,
      EVENTS_NODE_ID,
    ]);
  });
});

describe('normalizeProjectPageLayout', () => {
  it('returns the default layout when there is no stored layout', () => {
    expect(normalizeProjectPageLayout(undefined)).toEqual(
      defaultProjectPageLayout()
    );
    expect(normalizeProjectPageLayout({})).toEqual(defaultProjectPageLayout());
  });

  it('leaves a flat layout unchanged (fixed point)', () => {
    const layout = flatLayout();

    expect(normalizeProjectPageLayout(layout)).toEqual(layout);
  });

  it('unwraps the transitional description section into the body', () => {
    const result = normalizeProjectPageLayout(legacyLayout());

    expect(result[DESCRIPTION_NODE_ID]).toBeUndefined();
    expect(result[BODY_NODE_ID].nodes).toEqual([
      'd_txt1',
      PHASES_NODE_ID,
      EVENTS_NODE_ID,
    ]);
    expect(result.d_txt1.parent).toBe(BODY_NODE_ID);
  });

  it('preserves a rearranged body order', () => {
    const layout = flatLayout();
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: [PHASES_NODE_ID, 'txt1', EVENTS_NODE_ID],
    };

    expect(normalizeProjectPageLayout(layout)[BODY_NODE_ID].nodes).toEqual([
      PHASES_NODE_ID,
      'txt1',
      EVENTS_NODE_ID,
    ]);
  });

  it('does not resurrect deleted phases and events widgets', () => {
    const layout = flatLayout();
    delete layout[PHASES_NODE_ID];
    delete layout[EVENTS_NODE_ID];
    layout[BODY_NODE_ID] = { ...layout[BODY_NODE_ID], nodes: ['txt1'] };

    const result = normalizeProjectPageLayout(layout);

    expect(result[PHASES_NODE_ID]).toBeUndefined();
    expect(result[EVENTS_NODE_ID]).toBeUndefined();
    expect(result[BODY_NODE_ID].nodes).toEqual(['txt1']);
  });

  it('supports multiple phases and events widgets', () => {
    const layout = flatLayout();
    layout.phases2 = { ...layout[PHASES_NODE_ID] };
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: [PHASES_NODE_ID, 'txt1', 'phases2', EVENTS_NODE_ID],
    };

    const result = normalizeProjectPageLayout(layout);

    expect(result[BODY_NODE_ID].nodes).toEqual([
      PHASES_NODE_ID,
      'txt1',
      'phases2',
      EVENTS_NODE_ID,
    ]);
  });

  it('creates missing header regions', () => {
    const layout = flatLayout();
    delete layout[BANNER_NODE_ID];
    delete layout[TITLE_NODE_ID];
    layout.ROOT = { ...layout.ROOT, nodes: [BODY_NODE_ID] };

    const result = normalizeProjectPageLayout(layout);

    expect(result.ROOT.nodes).toEqual([
      BANNER_NODE_ID,
      TITLE_NODE_ID,
      BODY_NODE_ID,
    ]);
    expect(result[BANNER_NODE_ID]).toBeDefined();
    expect(result[TITLE_NODE_ID]).toBeDefined();
  });

  it('re-stamps the canonical custom flags, clearing stale locks', () => {
    const layout = flatLayout();
    layout[PHASES_NODE_ID] = {
      ...layout[PHASES_NODE_ID],
      custom: { title: widgetMessages.phasesWidgetTitle, locked: true },
    };

    const result = normalizeProjectPageLayout(layout);

    expect(result[PHASES_NODE_ID].custom).toEqual({
      title: widgetMessages.phasesWidgetTitle,
      noPointerEvents: true,
    });
    expect(result[BANNER_NODE_ID].custom).toMatchObject({ locked: true });
    expect(result[TITLE_NODE_ID].custom).toMatchObject({ locked: true });
  });

  it('strips DescriptionBuilder-only widgets that crash the resolver', () => {
    const layout = flatLayout();
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: ['txt1', 'stray', PHASES_NODE_ID, EVENTS_NODE_ID],
    };
    layout.stray = {
      type: { resolvedName: 'Published' },
      nodes: [],
      props: {},
      custom: {},
      hidden: false,
      parent: BODY_NODE_ID,
      isCanvas: false,
      displayName: 'Published',
      linkedNodes: {},
    } as unknown as SerializedNodes[string];

    const result = normalizeProjectPageLayout(layout);

    expect(result.stray).toBeUndefined();
    expect(result[BODY_NODE_ID].nodes).toEqual([
      'txt1',
      PHASES_NODE_ID,
      EVENTS_NODE_ID,
    ]);
  });

  it('strips the whole subtree of a removed widget, including linked nodes', () => {
    const layout = flatLayout();
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: ['txt1', 'stray', PHASES_NODE_ID, EVENTS_NODE_ID],
    };
    layout.stray = {
      ...textNode(BODY_NODE_ID),
      type: { resolvedName: 'Spotlight' },
      displayName: 'Spotlight',
      nodes: ['stray_child'],
      linkedNodes: { slot: 'stray_linked' },
    } as SerializedNodes[string];
    layout.stray_child = textNode('stray');
    layout.stray_linked = textNode('stray');
    layout.txt1 = {
      ...layout.txt1,
      linkedNodes: { slot: 'stray' },
    };

    const result = normalizeProjectPageLayout(layout);

    expect(result.stray).toBeUndefined();
    expect(result.stray_child).toBeUndefined();
    expect(result.stray_linked).toBeUndefined();
    expect(result[BODY_NODE_ID].nodes).toEqual([
      'txt1',
      PHASES_NODE_ID,
      EVENTS_NODE_ID,
    ]);
    expect(result.txt1.linkedNodes).toEqual({});
  });
});
