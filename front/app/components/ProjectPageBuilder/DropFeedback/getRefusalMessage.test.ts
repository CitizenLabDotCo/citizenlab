import { Placement, ROOT_NODE } from '@craftjs/core';

import getRefusalMessage from './getRefusalMessage';
import messages from './messages';

const placement = (
  parentId: string,
  currentNodeName: string,
  where: 'before' | 'after'
) =>
  ({
    parent: { id: parentId },
    index: 0,
    where,
    currentNode: { data: { name: currentNodeName } },
  } as unknown as Placement);

describe('getRefusalMessage', () => {
  it('explains the fixed header when the drop aims above the page body', () => {
    expect(
      getRefusalMessage(placement(ROOT_NODE, 'ProjectTitle', 'before'))
    ).toBe(messages.cannotDropInFixedHeader);
  });

  it('still explains the fixed header on the edge just above the page body', () => {
    expect(
      getRefusalMessage(placement(ROOT_NODE, 'ProjectPageBody', 'before'))
    ).toBe(messages.cannotDropInFixedHeader);
  });

  it('names the page content when the drop slips past its bottom edge', () => {
    expect(
      getRefusalMessage(placement(ROOT_NODE, 'ProjectPageBody', 'after'))
    ).toBe(messages.cannotDropBelowPageContent);
  });

  it('falls back to a generic reason for any other parent', () => {
    expect(
      getRefusalMessage(placement('PROJECT_PAGE_BODY', 'PhasesWidget', 'after'))
    ).toBe(messages.cannotDropHere);
  });
});
