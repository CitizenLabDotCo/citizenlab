import React from 'react';

import { IAreaWithProjectCounts } from 'api/areas/types';

import useLocalize from 'hooks/useLocalize';

import BaseUpdateFollowArea from './BaseUpdateFollowArea';

interface Props {
  area: IAreaWithProjectCounts;
  hideButtonIcon?: boolean;
}

const UpdateFollowAreaWithProjects = ({ area, hideButtonIcon }: Props) => {
  const localize = useLocalize();

  return (
    <BaseUpdateFollowArea area={area} hideButtonIcon={hideButtonIcon}>
      {`${localize(area.attributes.title_multiloc)} (${
        area.attributes.visible_projects_count
      })`}
    </BaseUpdateFollowArea>
  );
};

export default UpdateFollowAreaWithProjects;
