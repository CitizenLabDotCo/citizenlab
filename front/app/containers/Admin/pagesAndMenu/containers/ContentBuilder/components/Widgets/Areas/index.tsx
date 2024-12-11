import React from 'react';

import { Multiloc } from 'typings';

import useAreas from 'api/areas/useAreas';

import useLocalize from 'hooks/useLocalize';

import AreaSelection from './AreaSelection';
import messages from './messages';
import Settings from './Settings';

interface Props {
  titleMultiloc: Multiloc;
}

const Areas = ({ titleMultiloc }: Props) => {
  const localize = useLocalize();
  const { data: areas, isLoading } = useAreas({
    sort: 'projects_count',
  });

  if (isLoading) {
    return null; // TODO?
  }

  if (!areas) return null;

  const hasFollowPreferences = areas.data.some(
    (area) => !!area.relationships.user_follower.data?.id
  );

  const title = localize(titleMultiloc);

  if (!hasFollowPreferences) {
    return <AreaSelection title={title} />;
  }

  // Render the carrousel
  return <></>;
};

Areas.craft = {
  related: {
    settings: Settings,
  },
};

export const areasTitle = messages.areasTitle;

export default Areas;
