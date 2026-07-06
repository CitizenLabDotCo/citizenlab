import { SerializedNodes } from '@craftjs/core';

import {
  ensureLockedHeaderNodes,
  defaultProjectPageLayout,
  BANNER_NODE_ID,
  TITLE_NODE_ID,
  BODY_NODE_ID,
  DESCRIPTION_NODE_ID,
  INPUT_FEED_NODE_ID,
  TIMELINE_NODE_ID,
  EVENTS_NODE_ID,
} from './defaultLayout';
import widgetMessages from './Widgets/messages';

const CANONICAL_BODY = [
  DESCRIPTION_NODE_ID,
  TIMELINE_NODE_ID,
  INPUT_FEED_NODE_ID,
  EVENTS_NODE_ID,
];

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
  it('freezes the body to description → timeline → input feed → events', () => {
    const layout = defaultProjectPageLayout();

    expect(layout.ROOT.nodes).toEqual([
      BANNER_NODE_ID,
      TITLE_NODE_ID,
      BODY_NODE_ID,
    ]);
    expect(layout[BODY_NODE_ID].nodes).toEqual(CANONICAL_BODY);
  });
});

describe('ensureLockedHeaderNodes', () => {
  it('returns the default layout when there is no stored layout', () => {
    expect(ensureLockedHeaderNodes(undefined)).toEqual(
      defaultProjectPageLayout()
    );
    expect(ensureLockedHeaderNodes({})).toEqual(defaultProjectPageLayout());
  });

  it('leaves a migrated layout unchanged (fixed point)', () => {
    const layout = migratedLayout();

    expect(ensureLockedHeaderNodes(layout)).toEqual(layout);
  });

  it('adopts loose body content into the description section', () => {
    // A layout saved before the description section existed: the description
    // content sits directly in the body.
    const layout = defaultProjectPageLayout();
    delete layout[DESCRIPTION_NODE_ID];
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: [TIMELINE_NODE_ID, 'd_txt1', INPUT_FEED_NODE_ID, EVENTS_NODE_ID],
    };
    layout.d_txt1 = textNode(BODY_NODE_ID);

    const result = ensureLockedHeaderNodes(layout);

    expect(result[BODY_NODE_ID].nodes).toEqual(CANONICAL_BODY);
    expect(result[DESCRIPTION_NODE_ID].nodes).toEqual(['d_txt1']);
    expect(result.d_txt1.parent).toBe(DESCRIPTION_NODE_ID);
  });

  it('enforces the canonical body order', () => {
    const layout = migratedLayout();
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: [
        EVENTS_NODE_ID,
        TIMELINE_NODE_ID,
        DESCRIPTION_NODE_ID,
        INPUT_FEED_NODE_ID,
      ],
    };

    expect(ensureLockedHeaderNodes(layout)[BODY_NODE_ID].nodes).toEqual(
      CANONICAL_BODY
    );
  });

  it('creates missing fixed sections', () => {
    const layout = migratedLayout();
    delete layout[TIMELINE_NODE_ID];
    delete layout[EVENTS_NODE_ID];
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: [DESCRIPTION_NODE_ID, INPUT_FEED_NODE_ID],
    };

    const result = ensureLockedHeaderNodes(layout);

    expect(result[BODY_NODE_ID].nodes).toEqual(CANONICAL_BODY);
    expect(result[TIMELINE_NODE_ID]).toBeDefined();
    expect(result[EVENTS_NODE_ID]).toBeDefined();
  });

  it('re-stamps the lock flags on the fixed sections', () => {
    const layout = migratedLayout();
    layout[TIMELINE_NODE_ID] = {
      ...layout[TIMELINE_NODE_ID],
      custom: { title: widgetMessages.timelineWidgetTitle },
    };

    const result = ensureLockedHeaderNodes(layout);

    expect(result[TIMELINE_NODE_ID].custom).toMatchObject({ locked: true });
  });

  it('nests top-level user content of an old flat layout into the description section', () => {
    const layout: SerializedNodes = {
      ROOT: {
        type: { resolvedName: 'div' },
        nodes: ['txt1'],
        props: {},
        custom: {},
        hidden: false,
        isCanvas: true,
        displayName: 'div',
        linkedNodes: {},
      } as unknown as SerializedNodes[string],
      txt1: textNode('ROOT'),
    };

    const result = ensureLockedHeaderNodes(layout);

    expect(result.ROOT.nodes).toEqual([
      BANNER_NODE_ID,
      TITLE_NODE_ID,
      BODY_NODE_ID,
    ]);
    expect(result[BODY_NODE_ID].nodes).toEqual(CANONICAL_BODY);
    expect(result[DESCRIPTION_NODE_ID].nodes).toEqual(['txt1']);
    expect(result.txt1.parent).toBe(DESCRIPTION_NODE_ID);
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

    const result = ensureLockedHeaderNodes(layout);

    expect(result.stray).toBeUndefined();
    expect(result[DESCRIPTION_NODE_ID].nodes).toEqual(['d_txt1']);
  });
});
