import { SerializedNodes } from '@craftjs/core';

import {
  normalizeProjectPageLayout,
  defaultProjectPageLayout,
  BANNER_NODE_ID,
  TITLE_NODE_ID,
  BODY_NODE_ID,
  DESCRIPTION_NODE_ID,
  PHASES_NODE_ID,
  EVENTS_NODE_ID,
} from './defaultLayout';
import widgetMessages from './Widgets/messages';

const CANONICAL_BODY = [DESCRIPTION_NODE_ID, PHASES_NODE_ID, EVENTS_NODE_ID];

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

// The output of the project_page migration: the canonical frozen structure with
// the migrated description content inside the description section.
const migratedLayout = (): SerializedNodes => {
  const layout = defaultProjectPageLayout();
  layout[DESCRIPTION_NODE_ID] = {
    ...layout[DESCRIPTION_NODE_ID],
    nodes: ['d_txt1'],
  };
  layout.d_txt1 = textNode(DESCRIPTION_NODE_ID);
  return layout;
};

describe('defaultProjectPageLayout', () => {
  it('freezes the body to description → phases → events', () => {
    const layout = defaultProjectPageLayout();

    expect(layout.ROOT.nodes).toEqual([
      BANNER_NODE_ID,
      TITLE_NODE_ID,
      BODY_NODE_ID,
    ]);
    expect(layout[BODY_NODE_ID].nodes).toEqual(CANONICAL_BODY);
  });
});

describe('normalizeProjectPageLayout', () => {
  it('returns the default layout when there is no stored layout', () => {
    expect(normalizeProjectPageLayout(undefined)).toEqual(
      defaultProjectPageLayout()
    );
    expect(normalizeProjectPageLayout({})).toEqual(defaultProjectPageLayout());
  });

  it('leaves a migrated layout unchanged (fixed point)', () => {
    const layout = migratedLayout();

    expect(normalizeProjectPageLayout(layout)).toEqual(layout);
  });

  it('enforces the canonical body order', () => {
    const layout = migratedLayout();
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: [EVENTS_NODE_ID, PHASES_NODE_ID, DESCRIPTION_NODE_ID],
    };

    expect(normalizeProjectPageLayout(layout)[BODY_NODE_ID].nodes).toEqual(
      CANONICAL_BODY
    );
  });

  it('creates missing fixed sections', () => {
    const layout = migratedLayout();
    delete layout[PHASES_NODE_ID];
    delete layout[EVENTS_NODE_ID];
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: [DESCRIPTION_NODE_ID],
    };

    const result = normalizeProjectPageLayout(layout);

    expect(result[BODY_NODE_ID].nodes).toEqual(CANONICAL_BODY);
    expect(result[PHASES_NODE_ID]).toBeDefined();
    expect(result[EVENTS_NODE_ID]).toBeDefined();
  });

  it('re-stamps the lock flags on the fixed sections', () => {
    const layout = migratedLayout();
    layout[PHASES_NODE_ID] = {
      ...layout[PHASES_NODE_ID],
      custom: { title: widgetMessages.phasesWidgetTitle },
    };

    const result = normalizeProjectPageLayout(layout);

    expect(result[PHASES_NODE_ID].custom).toMatchObject({ locked: true });
  });

  it('strips DescriptionBuilder-only widgets that crash the resolver', () => {
    const layout = migratedLayout();
    layout[DESCRIPTION_NODE_ID] = {
      ...layout[DESCRIPTION_NODE_ID],
      nodes: ['d_txt1', 'stray'],
    };
    layout.stray = {
      type: { resolvedName: 'Published' },
      nodes: [],
      props: {},
      custom: {},
      hidden: false,
      parent: DESCRIPTION_NODE_ID,
      isCanvas: false,
      displayName: 'Published',
      linkedNodes: {},
    } as unknown as SerializedNodes[string];

    const result = normalizeProjectPageLayout(layout);

    expect(result.stray).toBeUndefined();
    expect(result[DESCRIPTION_NODE_ID].nodes).toEqual(['d_txt1']);
  });

  it('strips the whole subtree of a removed widget, including linked nodes', () => {
    const layout = migratedLayout();
    layout[DESCRIPTION_NODE_ID] = {
      ...layout[DESCRIPTION_NODE_ID],
      nodes: ['d_txt1', 'stray'],
    };
    layout.stray = {
      ...textNode(DESCRIPTION_NODE_ID),
      type: { resolvedName: 'Spotlight' },
      displayName: 'Spotlight',
      nodes: ['stray_child'],
      linkedNodes: { slot: 'stray_linked' },
    } as SerializedNodes[string];
    layout.stray_child = textNode('stray');
    layout.stray_linked = textNode('stray');
    layout.d_txt1 = {
      ...layout.d_txt1,
      linkedNodes: { slot: 'stray' },
    };

    const result = normalizeProjectPageLayout(layout);

    expect(result.stray).toBeUndefined();
    expect(result.stray_child).toBeUndefined();
    expect(result.stray_linked).toBeUndefined();
    expect(result[DESCRIPTION_NODE_ID].nodes).toEqual(['d_txt1']);
    expect(result.d_txt1.linkedNodes).toEqual({});
  });
});
