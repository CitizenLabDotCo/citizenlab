import { Placement, ROOT_NODE } from '@craftjs/core';

import getRefusalMessage from './getRefusalMessage';
import messages from './messages';

const PROJECT_ROOT_CHILDREN = ['BANNER', 'TITLE', 'BODY'];
const CUSTOM_ROOT_CHILDREN = ['BODY'];

const placement = (
  parentId: string,
  parentChildIds: string[],
  currentNodeId: string,
  where: 'before' | 'after'
) =>
  ({
    parent: { id: parentId, data: { nodes: parentChildIds } },
    index: 0,
    where,
    currentNode: { id: currentNodeId },
  } as unknown as Placement);

describe('getRefusalMessage', () => {
  it('explains the fixed header when the drop aims above the page body', () => {
    expect(
      getRefusalMessage(
        placement(ROOT_NODE, PROJECT_ROOT_CHILDREN, 'TITLE', 'before')
      )
    ).toBe(messages.cannotDropInFixedHeader);
  });

  it('still explains the fixed header on the edge just above the page body', () => {
    expect(
      getRefusalMessage(
        placement(ROOT_NODE, PROJECT_ROOT_CHILDREN, 'BODY', 'before')
      )
    ).toBe(messages.cannotDropInFixedHeader);
  });

  it('names the page content when the drop slips past its bottom edge', () => {
    expect(
      getRefusalMessage(
        placement(ROOT_NODE, PROJECT_ROOT_CHILDREN, 'BODY', 'after')
      )
    ).toBe(messages.cannotDropBelowPageContent);
  });

  it('names the page content below a body that has no header above it', () => {
    expect(
      getRefusalMessage(
        placement(ROOT_NODE, CUSTOM_ROOT_CHILDREN, 'BODY', 'after')
      )
    ).toBe(messages.cannotDropBelowPageContent);
  });

  it('does not mention a header when there is none above the body', () => {
    expect(
      getRefusalMessage(
        placement(ROOT_NODE, CUSTOM_ROOT_CHILDREN, 'BODY', 'before')
      )
    ).toBe(messages.cannotDropHere);
  });

  it('falls back to a generic reason for any other parent', () => {
    expect(
      getRefusalMessage(
        placement('PROJECT_PAGE_BODY', ['PHASES'], 'PHASES', 'after')
      )
    ).toBe(messages.cannotDropHere);
  });
});
