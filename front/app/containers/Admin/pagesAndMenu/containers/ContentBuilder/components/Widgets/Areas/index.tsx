import React from 'react';

import { Multiloc } from 'typings';

import useAreas from 'api/areas/useAreas';

import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const Areas = (_props: Props) => {
  const { data: areas, isLoading } = useAreas({
    sort: 'projects_count',
  });

  console.log({ areas, isLoading });

  return <></>;
};

Areas.craft = {
  related: {
    settings: Settings,
  },
};

export const areasTitle = messages.areasTitle;

export default Areas;
