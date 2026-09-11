import { SerializedNodes } from '@craftjs/core';

import {
  extractCustomPageAttributeDrafts,
  hasCustomPageAttributeDrafts,
} from './customPageAttributeDrafts';

const nodesWithTitle = (props: Record<string, unknown>) =>
  ({
    ROOT: { type: { resolvedName: 'CustomPageRoot' }, nodes: ['T'] },
    T: { type: { resolvedName: 'CustomPageTitle' }, nodes: [], props },
  } as unknown as SerializedNodes);

describe('customPageAttributeDrafts', () => {
  // title_multiloc is the page name, so a blanked title would leave the page unnamed.
  it('refuses a title emptied in every locale', () => {
    const drafts = extractCustomPageAttributeDrafts(
      nodesWithTitle({ title: { en: '  ', nl: '' } })
    );

    expect(hasCustomPageAttributeDrafts(drafts)).toBe(false);
  });
});
