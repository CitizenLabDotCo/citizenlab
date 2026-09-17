import { SerializedNodes } from '@craftjs/core';

import { getTitleDraft } from './titleDraft';

const nodesWithTitle = (props: Record<string, unknown>) =>
  ({
    ROOT: { type: { resolvedName: 'CustomPageRoot' }, nodes: ['T'] },
    T: { type: { resolvedName: 'CustomPageTitle' }, nodes: [], props },
  } as unknown as SerializedNodes);

describe('getTitleDraft', () => {
  // title_multiloc is the page name, so a blanked title would leave the page unnamed.
  it('refuses a title emptied in every locale', () => {
    expect(
      getTitleDraft(nodesWithTitle({ title: { en: '  ', nl: '' } }))
    ).toBeUndefined();
  });
});
