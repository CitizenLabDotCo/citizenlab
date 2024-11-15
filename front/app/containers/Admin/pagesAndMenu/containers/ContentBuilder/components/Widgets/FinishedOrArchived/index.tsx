import React from 'react';

import messages from './messages';
import Settings from './Settings';

const FinishedOrArchived = () => {
  return <></>;
};

FinishedOrArchived.craft = {
  related: {
    settings: Settings,
  },
};

export const finishedOrArchivedTitle = messages.finishedOrArchivedTitle;

export default FinishedOrArchived;
