import React from 'react';

import { Multiloc } from 'typings';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
  adminPublicationIds: string[];
}

const Selection = (_props: Props) => {
  return <></>;
};

Selection.craft = {
  related: {
    settings: Settings,
  },
};

export const selectionTitle = messages.selectionTitle;

export default Selection;
