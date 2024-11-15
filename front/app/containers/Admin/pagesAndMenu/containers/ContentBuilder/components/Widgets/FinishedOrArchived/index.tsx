import React from 'react';

import { Multiloc } from 'typings';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  finished: boolean;
  archived: boolean;
}

const FinishedOrArchived = (_props: Props) => {
  return <></>;
};

FinishedOrArchived.craft = {
  related: {
    settings: Settings,
  },
};

export const finishedOrArchivedTitle = messages.finishedOrArchivedTitle;

export default FinishedOrArchived;
