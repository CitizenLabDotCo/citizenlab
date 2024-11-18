import React from 'react';

import { Multiloc } from 'typings';

import { FinishedOrArchived as FinishedOrArchivedType } from 'api/projects_mini/types';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  filterBy: FinishedOrArchivedType['filter_by'];
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
