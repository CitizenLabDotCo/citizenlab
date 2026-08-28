import { SerializedNodes } from '@craftjs/core';

import {
  extractCustomPageAttributeDrafts,
  hasCustomPageAttributeDrafts,
  stripCustomPageAttributeDrafts,
} from './customPageAttributeDrafts';

const nodesWithBanner = (props: Record<string, unknown>) =>
  ({
    ROOT: { type: { resolvedName: 'CustomPageRoot' }, nodes: ['B'] },
    B: { type: { resolvedName: 'CustomPageBanner' }, nodes: [], props },
  } as unknown as SerializedNodes);

const nodesWithTitle = (props: Record<string, unknown>) =>
  ({
    ROOT: { type: { resolvedName: 'CustomPageRoot' }, nodes: ['T'] },
    T: { type: { resolvedName: 'CustomPageTitle' }, nodes: [], props },
  } as unknown as SerializedNodes);

describe('customPageAttributeDrafts', () => {
  it('extracts an edited title', () => {
    const drafts = extractCustomPageAttributeDrafts(
      nodesWithTitle({ title: { en: 'About us' } })
    );

    expect(drafts.titleMultiloc).toEqual({ en: 'About us' });
    expect(hasCustomPageAttributeDrafts(drafts)).toBe(true);
  });

  // The widget renders the page's own title when it has no draft, so an untouched
  // widget must not send the page an update on every save.
  it('reports no drafts when the title was never edited', () => {
    const drafts = extractCustomPageAttributeDrafts(nodesWithTitle({}));

    expect(hasCustomPageAttributeDrafts(drafts)).toBe(false);
  });

  // title_multiloc is the page name, so a blanked title would leave the page unnamed.
  it('refuses a title emptied in every locale', () => {
    const drafts = extractCustomPageAttributeDrafts(
      nodesWithTitle({ title: { en: '  ', nl: '' } })
    );

    expect(hasCustomPageAttributeDrafts(drafts)).toBe(false);
  });

  // The page record is the source of truth; a copy in the layout would go stale.
  it('strips the draft before the layout is stored', () => {
    const stripped = stripCustomPageAttributeDrafts(
      nodesWithTitle({ title: { en: 'About us' } })
    );

    expect(stripped.T.props).toEqual({});
  });

  it('leaves a layout without a title widget alone', () => {
    const nodes = {
      ROOT: { type: { resolvedName: 'CustomPageRoot' }, nodes: [] },
    } as unknown as SerializedNodes;

    expect(stripCustomPageAttributeDrafts(nodes)).toEqual(nodes);
    expect(
      hasCustomPageAttributeDrafts(extractCustomPageAttributeDrafts(nodes))
    ).toBe(false);
  });

  it('extracts edited banner settings', () => {
    const drafts = extractCustomPageAttributeDrafts(
      nodesWithBanner({ draft: { banner_layout: 'two_row_layout' } })
    );

    expect(drafts.banner).toEqual({ banner_layout: 'two_row_layout' });
    expect(hasCustomPageAttributeDrafts(drafts)).toBe(true);
  });

  // An untouched banner must not send the page an update on every save.
  it('reports no drafts for a banner that was never edited', () => {
    expect(
      hasCustomPageAttributeDrafts(
        extractCustomPageAttributeDrafts(nodesWithBanner({}))
      )
    ).toBe(false);
    expect(
      hasCustomPageAttributeDrafts(
        extractCustomPageAttributeDrafts(nodesWithBanner({ draft: {} }))
      )
    ).toBe(false);
  });

  // A removed image is a real change, and null is what tells the API to clear it.
  it('keeps a removed image in the draft', () => {
    const drafts = extractCustomPageAttributeDrafts(
      nodesWithBanner({ draft: { header_bg: null } })
    );

    expect(drafts.banner).toEqual({ header_bg: null });
  });

  it('strips the banner draft before the layout is stored', () => {
    const stripped = stripCustomPageAttributeDrafts(
      nodesWithBanner({ draft: { banner_layout: 'two_row_layout' } })
    );

    expect(stripped.B.props).toEqual({});
  });
});
