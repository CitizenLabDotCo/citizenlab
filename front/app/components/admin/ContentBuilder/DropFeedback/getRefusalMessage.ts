import { Placement, ROOT_NODE } from '@craftjs/core';
import { MessageDescriptor } from 'react-intl';

import messages from './messages';

// craft.js fills `indicator.error` with an internal English sentence
// ("Parent node cannot accept incoming node") that is never meant for users,
// so the refused placement is requalified from the spot it targets.
const getRefusalMessage = (placement: Placement): MessageDescriptor => {
  if (placement.parent.id !== ROOT_NODE) return messages.cannotDropHere;

  // The root holds any fixed header regions and then the page body, last.
  // Everything lands on the root once it leaves the body, so the ways out of
  // it need telling apart: past the bottom of the body, the header has nothing
  // to do with the refusal.
  const rootChildIds = placement.parent.data.nodes;
  const bodyId = rootChildIds[rootChildIds.length - 1];
  const belowPageContent =
    placement.currentNode?.id === bodyId && placement.where === 'after';

  if (belowPageContent) return messages.cannotDropBelowPageContent;

  return rootChildIds.length > 1
    ? messages.cannotDropInFixedHeader
    : messages.cannotDropHere;
};

export default getRefusalMessage;
