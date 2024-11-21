import React from 'react';

import { Multiloc } from 'typings';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const Published = (_props: Props) => {
  return <></>;
};

Published.craft = {
  related: {
    settings: Settings,
  },
};

export const publishedTitle = messages.publishedTitle;

export default Published;
