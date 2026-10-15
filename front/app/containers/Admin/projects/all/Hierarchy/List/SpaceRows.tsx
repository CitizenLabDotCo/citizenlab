import React from 'react';

import { Spaces } from 'api/spaces/types';

import useArrangeGroup, {
  ArrangeGroupContext,
} from '../Arrange/useArrangeGroup';

import { ColumnKey } from './columns';
import SpaceRow from './SpaceRow';
import useManagers from './useManagers';

interface Props {
  spaces: Spaces;
  columns: ColumnKey[];
  arrangeable: boolean;
}

const SpaceRows = ({ spaces, columns, arrangeable }: Props) => {
  const managersOf = useManagers(spaces.included);
  // Every space is loaded at once.
  const { shown, placeOf, group } = useArrangeGroup({
    kind: 'space',
    items: spaces.data,
    hasMore: false,
    arrangeable,
  });

  return (
    <ArrangeGroupContext.Provider value={group}>
      {shown.map((space) => (
        <SpaceRow
          key={space.id}
          space={space}
          columns={columns}
          managers={managersOf(space.relationships.moderators.data)}
          place={placeOf(space)}
        />
      ))}
    </ArrangeGroupContext.Provider>
  );
};

export default SpaceRows;
