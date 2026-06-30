import { SerializedNodes } from '@craftjs/core';

import {
  ensureLockedHeaderNodes,
  BANNER_NODE_ID,
  TITLE_NODE_ID,
  BODY_NODE_ID,
  INPUT_FEED_NODE_ID,
  TIMELINE_NODE_ID,
  EVENTS_NODE_ID,
} from './defaultLayout';
import widgetMessages from './Widgets/messages';

// A layout shaped like the output of the project_page migration rake task: the
// locked header, then a body of timeline → migrated description content →
// (locked) input feed → events. No TwoColumn/AboutBox is seeded.
const migratedLayout = (): SerializedNodes =>
  ({
    ROOT: {
      type: { resolvedName: 'ProjectPageRoot' },
      nodes: [BANNER_NODE_ID, TITLE_NODE_ID, BODY_NODE_ID],
      props: {},
      custom: { region: true },
      hidden: false,
      isCanvas: true,
      displayName: 'ProjectPageRoot',
      linkedNodes: {},
    },
    [BANNER_NODE_ID]: {
      type: { resolvedName: 'ProjectBanner' },
      nodes: [],
      props: { image: {}, alt: {} },
      custom: {
        title: widgetMessages.bannerWidgetTitle,
        locked: true,
        noPointerEvents: true,
      },
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'ProjectBanner',
      linkedNodes: {},
    },
    [TITLE_NODE_ID]: {
      type: { resolvedName: 'ProjectTitle' },
      nodes: [],
      props: {},
      custom: {
        title: widgetMessages.titleWidgetTitle,
        locked: true,
        noPointerEvents: true,
      },
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'ProjectTitle',
      linkedNodes: {},
    },
    [BODY_NODE_ID]: {
      type: { resolvedName: 'ProjectPageBody' },
      nodes: [TIMELINE_NODE_ID, 'd_txt1', INPUT_FEED_NODE_ID, EVENTS_NODE_ID],
      props: {},
      custom: { region: true },
      hidden: false,
      parent: 'ROOT',
      isCanvas: true,
      displayName: 'ProjectPageBody',
      linkedNodes: {},
    },
    [TIMELINE_NODE_ID]: {
      type: { resolvedName: 'TimelineWidget' },
      nodes: [],
      props: {},
      custom: {
        title: widgetMessages.timelineWidgetTitle,
        noPointerEvents: true,
      },
      hidden: false,
      parent: BODY_NODE_ID,
      isCanvas: false,
      displayName: 'TimelineWidget',
      linkedNodes: {},
    },
    d_txt1: {
      type: { resolvedName: 'TextMultiloc' },
      nodes: [],
      props: { text: { en: '<p>Hello</p>' } },
      custom: {},
      hidden: false,
      parent: BODY_NODE_ID,
      isCanvas: false,
      displayName: 'TextMultiloc',
      linkedNodes: {},
    },
    [INPUT_FEED_NODE_ID]: {
      type: { resolvedName: 'InputFeed' },
      nodes: [],
      props: {},
      custom: {
        title: widgetMessages.inputFeedWidgetTitle2,
        locked: true,
        noPointerEvents: true,
      },
      hidden: false,
      parent: BODY_NODE_ID,
      isCanvas: false,
      displayName: 'InputFeed',
      linkedNodes: {},
    },
    [EVENTS_NODE_ID]: {
      type: { resolvedName: 'EventsWidget' },
      nodes: [],
      props: {},
      custom: {
        title: widgetMessages.eventsWidgetTitle,
        noPointerEvents: true,
      },
      hidden: false,
      parent: BODY_NODE_ID,
      isCanvas: false,
      displayName: 'EventsWidget',
      linkedNodes: {},
    },
  } as unknown as SerializedNodes);

describe('ensureLockedHeaderNodes', () => {
  it('leaves a migrated layout unchanged (fixed point)', () => {
    const layout = migratedLayout();

    expect(ensureLockedHeaderNodes(layout)).toEqual(layout);
  });

  it('keeps the migrated description content in place between timeline and input feed', () => {
    const result = ensureLockedHeaderNodes(migratedLayout());

    expect(result[BODY_NODE_ID].nodes).toEqual([
      TIMELINE_NODE_ID,
      'd_txt1',
      INPUT_FEED_NODE_ID,
      EVENTS_NODE_ID,
    ]);
  });

  it('strips DescriptionBuilder-only widgets that crash the resolver', () => {
    const layout = migratedLayout();
    layout[BODY_NODE_ID].nodes = [
      TIMELINE_NODE_ID,
      'stray',
      INPUT_FEED_NODE_ID,
      EVENTS_NODE_ID,
    ];
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

    const result = ensureLockedHeaderNodes(layout);

    expect(result.stray).toBeUndefined();
    expect(result[BODY_NODE_ID].nodes).not.toContain('stray');
  });
});
