import React from 'react';

import { IAreaData } from 'api/areas/types';

import T from 'components/T';

import BaseUpdateFollowArea from './BaseUpdateFollowArea';

interface Props {
  area: IAreaData;
}

const UpdateFollowArea = ({ area }: Props) => {
  return (
    <BaseUpdateFollowArea area={area}>
      <T value={area.attributes.title_multiloc} />
    </BaseUpdateFollowArea>
  );
};

export default UpdateFollowArea;
