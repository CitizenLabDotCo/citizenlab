import React, { ReactNode } from 'react';

import Button from 'design-system/Button';
import Disclosure from 'design-system/Disclosure';

interface Props {
  title: ReactNode;
  actionLabel: string;
  // What to do first, shown on the disabled button.
  reason: string;
}

// A setting whose action needs a saved phase. Until the first save its button
// stays disabled, and its tooltip says to save first.
const SaveFirstCard = ({ title, actionLabel, reason }: Props) => (
  <Disclosure
    header="static"
    title={title}
    actions={
      <Button
        variant="secondary"
        size={28}
        disabledReason={reason}
      >
        {actionLabel}
      </Button>
    }
  />
);

export default SaveFirstCard;
