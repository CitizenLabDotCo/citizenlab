import React from 'react';

import { IAreaWithProjectCounts } from 'api/areas/types';

import useLocalize from 'hooks/useLocalize';

import BaseUpdateFollowArea from './BaseUpdateFollowArea';

interface Props {
  area: IAreaWithProjectCounts;
}

const UpdateFollowAreaWithProjects = ({ area }: Props) => {
  const localize = useLocalize();

  return (
    <BaseUpdateFollowArea area={area}>
      {`${localize(area.attributes.title_multiloc)} (${
        area.attributes.visible_projects_count
      })`}
    </BaseUpdateFollowArea>
  );
};

export default UpdateFollowAreaWithProjects;
