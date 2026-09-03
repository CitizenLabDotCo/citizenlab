import { Placement, ROOT_NODE } from '@craftjs/core';
import { MessageDescriptor } from 'react-intl';

import messages from './messages';

const BODY_REGION = 'ProjectPageBody';

// craft.js fills `indicator.error` with an internal English sentence
// ("Parent node cannot accept incoming node") that is never meant for users,
// so the refused placement is requalified from the spot it targets.
const getRefusalMessage = (placement: Placement): MessageDescriptor => {
  if (placement.parent.id !== ROOT_NODE) return messages.cannotDropHere;

  // The root holds the project image, the title and the page body, in that
  // order. Everything lands on the root once it leaves the body, so the two
  // ways out of it need telling apart: past the bottom of the body, the header
  // has nothing to do with the refusal.
  const belowPageContent =
    placement.currentNode?.data.name === BODY_REGION &&
    placement.where === 'after';

  return belowPageContent
    ? messages.cannotDropBelowPageContent
    : messages.cannotDropInFixedHeader;
};

export default getRefusalMessage;
